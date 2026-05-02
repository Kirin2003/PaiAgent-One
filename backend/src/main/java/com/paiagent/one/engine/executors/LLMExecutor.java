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

        String model = config.getOrDefault("model", openAIConfig.getModel()).toString();
        String systemPrompt = config.getOrDefault("systemPrompt",
                "You are a helpful AI assistant.").toString();

        // Get input from upstream node
        String userMessage = "";
        for (String upstreamId : upstreamNodeIds) {
            Object upstreamOutput = context.getNodeOutput(upstreamId);
            if (upstreamOutput != null) {
                userMessage = upstreamOutput.toString();
                break;
            }
        }

        // Build OpenAI-compatible request
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAIConfig.getApiKey());

        String url = openAIConfig.getBaseUrl() + "/v1/chat/completions";

        HttpEntity<String> entity = new HttpEntity<>(
                objectMapper.writeValueAsString(requestBody), headers);

        log.info("Calling LLM API: {} with model: {}", url, model);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        JsonNode responseJson = objectMapper.readTree(response.getBody());
        String assistantMessage = responseJson
                .path("choices").get(0)
                .path("message").path("content").asText();

        context.setNodeOutput(node.getId(), assistantMessage);
    }
}
