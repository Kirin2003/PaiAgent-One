package com.paiagent.one.engine.executors;

import com.alibaba.dashscope.aigc.multimodalconversation.AudioParameters;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversation;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationParam;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationResult;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.exception.UploadFileException;
import com.alibaba.dashscope.utils.Constants;
import com.paiagent.one.engine.ExecutionContext;
import com.paiagent.one.engine.NodeExecutor;
import com.paiagent.one.model.dto.NodeDTO;
import com.paiagent.one.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AudioSynthExecutor implements NodeExecutor {

    private final MinioService minioService;

    @Override
    public String getType() {
        return "audio_synth";
    }

    @Override
    public void execute(NodeDTO node, List<String> upstreamNodeIds, ExecutionContext context) throws Exception {
        // Get config from node
        Map<String, Object> config = node.getData() != null && node.getData().getConfig() != null
                ? node.getData().getConfig() : Collections.emptyMap();

        // Get API Key from node config
        String apiKey = config.get("apiKey") != null && !config.get("apiKey").toString().isEmpty()
                ? config.get("apiKey").toString()
                : System.getenv("DASHSCOPE_API_KEY");

        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("API Key is required for AudioSynth node. Please configure it in node settings or set DASHSCOPE_API_KEY environment variable.");
        }

        // Get model from node config, default to qwen3-tts-instruct-flash
        String model = config.getOrDefault("model", "qwen3-tts-instruct-flash").toString();

        // Get voice from node config, default to Cherry
        String voiceStr = config.getOrDefault("voice", "Cherry").toString();
        AudioParameters.Voice voice = parseVoice(voiceStr);

        // Get language type from node config, default to Auto
        String languageType = config.getOrDefault("languageType", "Auto").toString();

        // Get text from input params
        String text = resolveText(config, upstreamNodeIds, context);

        if (text == null || text.isEmpty()) {
            throw new RuntimeException("Text input is required for AudioSynth node.");
        }

        log.info("AudioSynth: Original text length: {} characters", text.length());

        // Truncate text - API limit is likely by tokens, not characters
        // For Chinese text: roughly 1 character ≈ 2-3 tokens
        // To be safe, limit to 200 characters (approximately 400-600 tokens)
        final int MAX_TEXT_LENGTH = 200;
        if (text.length() > MAX_TEXT_LENGTH) {
            log.warn("AudioSynth: Text length {} exceeds {}, truncating...", text.length(), MAX_TEXT_LENGTH);
            text = text.substring(0, MAX_TEXT_LENGTH);
        }

        log.info("AudioSynth: Calling TTS API with model={}, voice={}, languageType={}, textLength={}",
                model, voiceStr, languageType, text.length());
        log.debug("AudioSynth: Text content: {}", text);

        // Set DashScope API URL (Beijing region)
        Constants.baseHttpApiUrl = "https://dashscope.aliyuncs.com/api/v1";

        // Call TTS API
        String audioUrl = callTtsApi(apiKey, model, text, voice, languageType);

        log.info("AudioSynth: Generated audio URL from TTS: {}", audioUrl);

        // Upload to MinIO
        String minioUrl = minioService.uploadAudioFromUrl(audioUrl, "tts_audio.wav");

        log.info("AudioSynth: Uploaded to MinIO: {}", minioUrl);

        // Set output with voice_url (MinIO URL)
        Map<String, Object> output = new HashMap<>();
        output.put("voice_url", minioUrl);
        output.put("text", text);

        context.setNodeOutput(node.getId(), output);
    }

    private String callTtsApi(String apiKey, String model, String text,
                              AudioParameters.Voice voice, String languageType)
            throws ApiException, NoApiKeyException, UploadFileException {

        MultiModalConversation conv = new MultiModalConversation();

        MultiModalConversationParam param = MultiModalConversationParam.builder()
                .apiKey(apiKey)
                .model(model)
                .text(text)
                .voice(voice)
                .build();

        MultiModalConversationResult result = conv.call(param);

        return result.getOutput().getAudio().getUrl();
    }

    private AudioParameters.Voice parseVoice(String voiceStr) {
        return switch (voiceStr) {
            case "Serena" -> AudioParameters.Voice.SERENA;
            case "Ethan" -> AudioParameters.Voice.ETHAN;
            default -> AudioParameters.Voice.CHERRY;
        };
    }

    private String resolveText(Map<String, Object> config, List<String> upstreamNodeIds, ExecutionContext context) {
        // Get input params configuration
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> inputParams = config.get("inputParams") != null
                ? (List<Map<String, Object>>) config.get("inputParams")
                : Collections.emptyList();

        // Find text input parameter
        for (Map<String, Object> param : inputParams) {
            String name = (String) param.get("name");
            String type = (String) param.get("type");
            String value = (String) param.get("value");

            if ("text".equals(name)) {
                if ("reference".equals(type) && value != null && !value.isEmpty()) {
                    // Parse reference: "nodeId.outputKey"
                    String[] parts = value.split("\\.");
                    String refNodeId = parts[0];
                    Object nodeOutput = context.getNodeOutput(refNodeId);
                    if (nodeOutput != null) {
                        return nodeOutput.toString();
                    }
                } else if ("input".equals(type) && value != null) {
                    return value;
                }
            }
        }

        // Fallback: get text from upstream node output
        for (String upstreamId : upstreamNodeIds) {
            Object upstreamOutput = context.getNodeOutput(upstreamId);
            if (upstreamOutput != null) {
                return upstreamOutput.toString();
            }
        }

        return null;
    }
}
