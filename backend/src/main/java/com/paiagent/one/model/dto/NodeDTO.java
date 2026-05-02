package com.paiagent.one.model.dto;

import lombok.Data;
import java.util.Map;

@Data
public class NodeDTO {
    private String id;
    private String type;
    private Position position;
    private NodeData data;

    @Data
    public static class Position {
        private double x;
        private double y;
    }

    @Data
    public static class NodeData {
        private String label;
        private Map<String, Object> config;
    }
}
