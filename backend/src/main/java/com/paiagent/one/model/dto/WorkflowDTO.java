package com.paiagent.one.model.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkflowDTO {
    private Long id;
    private String name;
    private List<NodeDTO> nodes;
    private List<EdgeDTO> edges;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
