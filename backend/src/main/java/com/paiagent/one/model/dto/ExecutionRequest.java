package com.paiagent.one.model.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ExecutionRequest {
    private Map<String, Object> inputs;
}
