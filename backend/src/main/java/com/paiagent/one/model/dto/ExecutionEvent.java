package com.paiagent.one.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionEvent {
    private String event;
    private String nodeId;
    private String nodeType;
    private String label;
    private Object output;
    private String error;
}
