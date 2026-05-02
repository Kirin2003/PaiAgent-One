package com.paiagent.one.service;

import com.paiagent.one.engine.WorkflowEngine;
import com.paiagent.one.model.dto.WorkflowDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final WorkflowService workflowService;
    private final WorkflowEngine workflowEngine;

    @Async("workflowExecutor")
    public void executeWorkflow(Long workflowId, Map<String, Object> inputs, SseEmitter emitter) {
        try {
            WorkflowDTO workflow = workflowService.getById(workflowId);
            log.info("Starting workflow execution: {} ({})", workflow.getName(), workflowId);
            workflowEngine.execute(workflow.getNodes(), workflow.getEdges(), inputs, emitter);
        } catch (Exception e) {
            log.error("Workflow execution failed", e);
            try {
                emitter.completeWithError(e);
            } catch (Exception ignored) {}
        }
    }
}
