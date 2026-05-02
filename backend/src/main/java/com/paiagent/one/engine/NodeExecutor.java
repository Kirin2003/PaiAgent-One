package com.paiagent.one.engine;

import com.paiagent.one.model.dto.NodeDTO;

import java.util.List;

public interface NodeExecutor {
    String getType();
    void execute(NodeDTO node, List<String> upstreamNodeIds, ExecutionContext context) throws Exception;
}
