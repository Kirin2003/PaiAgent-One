package com.paiagent.one.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paiagent.one.model.dto.EdgeDTO;
import com.paiagent.one.model.dto.NodeDTO;
import com.paiagent.one.model.dto.WorkflowDTO;
import com.paiagent.one.model.entity.WorkflowEntity;
import com.paiagent.one.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository repository;
    private final ObjectMapper objectMapper;

    public List<WorkflowDTO> listAll() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    public WorkflowDTO getById(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + id));
    }

    public WorkflowDTO create(WorkflowDTO dto) {
        WorkflowEntity entity = new WorkflowEntity();
        entity.setName(dto.getName());
        entity.setDefinition(serializeDefinition(dto.getNodes(), dto.getEdges()));
        entity = repository.save(entity);
        return toDTO(entity);
    }

    public WorkflowDTO update(Long id, WorkflowDTO dto) {
        WorkflowEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + id));
        entity.setName(dto.getName());
        entity.setDefinition(serializeDefinition(dto.getNodes(), dto.getEdges()));
        entity = repository.save(entity);
        return toDTO(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    private WorkflowDTO toDTO(WorkflowEntity entity) {
        WorkflowDTO dto = new WorkflowDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> def = objectMapper.readValue(entity.getDefinition(), Map.class);
            dto.setNodes(objectMapper.convertValue(def.get("nodes"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, NodeDTO.class)));
            dto.setEdges(objectMapper.convertValue(def.get("edges"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, EdgeDTO.class)));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse workflow definition", e);
        }
        return dto;
    }

    private String serializeDefinition(List<NodeDTO> nodes, List<EdgeDTO> edges) {
        try {
            Map<String, Object> def = new HashMap<>();
            def.put("nodes", nodes);
            def.put("edges", edges);
            return objectMapper.writeValueAsString(def);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize workflow definition", e);
        }
    }
}
