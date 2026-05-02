package com.paiagent.one.engine.executors;

import com.paiagent.one.engine.ExecutionContext;
import com.paiagent.one.engine.NodeExecutor;
import com.paiagent.one.model.dto.NodeDTO;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class EndExecutor implements NodeExecutor {

    @Override
    public String getType() {
        return "end";
    }

    @Override
    public void execute(NodeDTO node, List<String> upstreamNodeIds, ExecutionContext context) {
        // Collect all upstream outputs into the final output
        Map<String, Object> finalOutput = new HashMap<>();

        for (String upstreamId : upstreamNodeIds) {
            Object output = context.getNodeOutput(upstreamId);
            if (output instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mapOutput = (Map<String, Object>) output;
                finalOutput.putAll(mapOutput);
            } else if (output != null) {
                finalOutput.put("text", output.toString());
            }
        }

        context.setNodeOutput(node.getId(), finalOutput);
        context.set("finalOutput", finalOutput);
    }
}
