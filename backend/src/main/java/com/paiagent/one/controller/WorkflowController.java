package com.paiagent.one.controller;

import com.paiagent.one.model.dto.WorkflowDTO;
import com.paiagent.one.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public List<WorkflowDTO> listAll() {
        return workflowService.listAll();
    }

    @GetMapping("/{id}")
    public WorkflowDTO getById(@PathVariable Long id) {
        return workflowService.getById(id);
    }

    @PostMapping
    public WorkflowDTO create(@RequestBody WorkflowDTO dto) {
        return workflowService.create(dto);
    }

    @PutMapping("/{id}")
    public WorkflowDTO update(@PathVariable Long id, @RequestBody WorkflowDTO dto) {
        return workflowService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workflowService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
