package com.paiagent.one.engine.executors;

import com.paiagent.one.engine.ExecutionContext;
import com.paiagent.one.engine.NodeExecutor;
import com.paiagent.one.model.dto.NodeDTO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserInputExecutor implements NodeExecutor {

    @Override
    public String getType() {
        return "user_input";
    }

    @Override
    public void execute(NodeDTO node, List<String> upstreamNodeIds, ExecutionContext context) {
        String userInput = context.getString("userInput");
        if (userInput == null) {
            userInput = "";
        }
        context.setNodeOutput(node.getId(), userInput);
    }
}
