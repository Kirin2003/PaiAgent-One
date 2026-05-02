package com.paiagent.one.engine;

import com.paiagent.one.model.dto.EdgeDTO;
import com.paiagent.one.model.dto.ExecutionEvent;
import com.paiagent.one.model.dto.NodeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowEngine {

    private final List<NodeExecutor> executors;

    public void execute(List<NodeDTO> nodes, List<EdgeDTO> edges,
                        Map<String, Object> inputs, SseEmitter emitter) {
        try {
            Map<String, NodeExecutor> executorMap = executors.stream()
                    .collect(Collectors.toMap(NodeExecutor::getType, Function.identity()));

            Map<String, NodeDTO> nodeMap = nodes.stream()
                    .collect(Collectors.toMap(NodeDTO::getId, Function.identity()));

            // Build adjacency list and in-degree map
            Map<String, List<String>> adjacency = new HashMap<>();
            Map<String, List<String>> reverseAdj = new HashMap<>();
            Map<String, Integer> inDegree = new HashMap<>();

            for (NodeDTO node : nodes) {
                adjacency.put(node.getId(), new ArrayList<>());
                reverseAdj.put(node.getId(), new ArrayList<>());
                inDegree.put(node.getId(), 0);
            }

            for (EdgeDTO edge : edges) {
                adjacency.get(edge.getSource()).add(edge.getTarget());
                reverseAdj.get(edge.getTarget()).add(edge.getSource());
                inDegree.merge(edge.getTarget(), 1, Integer::sum);
            }

            // Kahn's topological sort
            Queue<String> queue = new LinkedList<>();
            for (Map.Entry<String, Integer> entry : inDegree.entrySet()) {
                if (entry.getValue() == 0) {
                    queue.add(entry.getKey());
                }
            }

            List<String> executionOrder = new ArrayList<>();
            while (!queue.isEmpty()) {
                String nodeId = queue.poll();
                executionOrder.add(nodeId);
                for (String neighbor : adjacency.get(nodeId)) {
                    inDegree.merge(neighbor, -1, Integer::sum);
                    if (inDegree.get(neighbor) == 0) {
                        queue.add(neighbor);
                    }
                }
            }

            if (executionOrder.size() != nodes.size()) {
                sendError(emitter, null, "Workflow contains a cycle");
                emitter.complete();
                return;
            }

            // Execute nodes in topological order
            ExecutionContext context = new ExecutionContext();
            context.set("inputs", inputs);
            if (inputs != null && inputs.containsKey("text")) {
                context.set("userInput", inputs.get("text").toString());
            }

            for (String nodeId : executionOrder) {
                NodeDTO node = nodeMap.get(nodeId);
                String nodeType = node.getType().toLowerCase();

                // Emit node-start
                sendEvent(emitter, ExecutionEvent.builder()
                        .event("node-start")
                        .nodeId(nodeId)
                        .nodeType(nodeType)
                        .label(node.getData() != null ? node.getData().getLabel() : nodeType)
                        .build());

                try {
                    NodeExecutor executor = executorMap.get(nodeType);
                    if (executor == null) {
                        throw new RuntimeException("No executor found for node type: " + nodeType);
                    }

                    List<String> upstreamNodeIds = reverseAdj.getOrDefault(nodeId, Collections.emptyList());
                    executor.execute(node, upstreamNodeIds, context);

                    Object output = context.getNodeOutput(nodeId);

                    // Emit node-complete
                    sendEvent(emitter, ExecutionEvent.builder()
                            .event("node-complete")
                            .nodeId(nodeId)
                            .nodeType(nodeType)
                            .output(output)
                            .build());

                } catch (Exception e) {
                    log.error("Node execution failed: {} - {}", nodeId, e.getMessage(), e);
                    sendError(emitter, nodeId, e.getMessage());
                    emitter.complete();
                    return;
                }
            }

            // Emit workflow-complete
            Object finalOutput = context.get("finalOutput");
            sendEvent(emitter, ExecutionEvent.builder()
                    .event("workflow-complete")
                    .output(finalOutput)
                    .build());

            emitter.complete();

        } catch (Exception e) {
            log.error("Workflow execution failed", e);
            try {
                sendError(emitter, null, e.getMessage());
                emitter.complete();
            } catch (Exception ignored) {}
        }
    }

    private void sendEvent(SseEmitter emitter, ExecutionEvent event) {
        try {
            emitter.send(SseEmitter.event()
                    .name(event.getEvent())
                    .data(event));
        } catch (Exception e) {
            log.warn("Failed to send SSE event", e);
        }
    }

    private void sendError(SseEmitter emitter, String nodeId, String error) {
        try {
            emitter.send(SseEmitter.event()
                    .name("node-error")
                    .data(ExecutionEvent.builder()
                            .event("node-error")
                            .nodeId(nodeId)
                            .error(error)
                            .build()));
        } catch (Exception e) {
            log.warn("Failed to send SSE error event", e);
        }
    }
}
