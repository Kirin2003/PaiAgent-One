package com.paiagent.one.model.dto;

import lombok.Data;

@Data
public class EdgeDTO {
    private String id;
    private String source;
    private String target;
    private String sourceHandle;
    private String targetHandle;
}
