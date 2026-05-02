package com.paiagent.one.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paiagent.one.config.OpenAIConfig;
import com.paiagent.one.engine.ExecutionContext;
import com.paiagent.one.engine.NodeExecutor;
import com.paiagent.one.model.dto.NodeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class LLMExecutor implements NodeExecutor {

    private final OpenAIConfig openAIConfig;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String getType() {
        return "llm";
    }

    @Override
    public void execute(NodeDTO node, List<String> upstreamNodeIds, ExecutionContext context) throws Exception {
        // Get config from node
        Map<String, Object> config = node.getData() != null && node.getData().getConfig() != null
                ? node.getData().getConfig() : Collections.emptyMap();

        // Get model config from node or fallback to global config
        String model = config.getOrDefault("model", openAIConfig.getModel()) != null
                ? config.get("model").toString()
                : openAIConfig.getModel();

        // Get baseUrl from node config or fallback to global config
        String baseUrl = config.get("baseUrl") != null && !config.get("baseUrl").toString().isEmpty()
                ? config.get("baseUrl").toString()
                : openAIConfig.getBaseUrl();

        // Get apiKey from node config or fallback to global config
        String apiKey = config.get("apiKey") != null && !config.get("apiKey").toString().isEmpty()
                ? config.get("apiKey").toString()
                : openAIConfig.getApiKey();

        // Get temperature from node config
        double temperature = config.get("temperature") != null
                ? Double.parseDouble(config.get("temperature").toString())
                : 0.7;

        // Get user prompt from node config
        String userPrompt = config.getOrDefault("userPrompt",
                "You are a helpful AI assistant.").toString();

        // Get input params configuration
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> inputParams = config.get("inputParams") != null
                ? (List<Map<String, Object>>) config.get("inputParams")
                : Collections.emptyList();

        // Build user message by resolving input params
        String userMessage = resolveInputParams(userPrompt, inputParams, upstreamNodeIds, context);

        // Build OpenAI-compatible request
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", temperature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // Construct API URL
        String apiUrl = baseUrl;
        if (!apiUrl.endsWith("/v1/chat/completions")) {
            if (apiUrl.endsWith("/")) {
                apiUrl = apiUrl + "v1/chat/completions";
            } else if (apiUrl.endsWith("/v1")) {
                apiUrl = apiUrl + "/chat/completions";
            } else {
                apiUrl = apiUrl + "/v1/chat/completions";
            }
        }

        HttpEntity<String> entity = new HttpEntity<>(
                objectMapper.writeValueAsString(requestBody), headers);

        log.info("Calling LLM API: {} with model: {}", apiUrl, model);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

        JsonNode responseJson = objectMapper.readTree(response.getBody());
        String assistantMessage = responseJson
                .path("choices").get(0)
                .path("message").path("content").asText();

        context.setNodeOutput(node.getId(), assistantMessage);
    }

    private String resolveInputParams(String prompt, List<Map<String, Object>> inputParams,
                                      List<String> upstreamNodeIds, ExecutionContext context) {
        String result = prompt;

        for (Map<String, Object> param : inputParams) {
            String name = (String) param.get("name");
            String type = (String) param.get("type");
            String value = (String) param.get("value");

            if (name == null || name.isEmpty()) continue;

            String resolvedValue = "";

            if ("reference".equals(type) && value != null && !value.isEmpty()) {
                // Parse reference: "nodeId.outputKey"
                String[] parts = value.split("\\.");
                String refNodeId = parts[0];

                // Get output from referenced node
                Object nodeOutput = context.getNodeOutput(refNodeId);
                if (nodeOutput != null) {
                    resolvedValue = nodeOutput.toString();
                }
            } else if ("input".equals(type) && value != null) {
                resolvedValue = value;
            }

            // Replace {{paramName}} with resolved value
            result = result.replace("{{" + name + "}}", resolvedValue);
        }

        return result;
    }
}
