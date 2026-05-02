package com.paiagent.one.controller;

import com.paiagent.one.model.dto.ExecutionRequest;
import com.paiagent.one.service.ExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @PostMapping("/workflows/{id}/execute")
    public SseEmitter executeWorkflow(@PathVariable Long id,
                                       @RequestBody ExecutionRequest request) {
        SseEmitter emitter = new SseEmitter(300_000L); // 5 min timeout

        emitter.onTimeout(emitter::complete);
        emitter.onError(e -> emitter.complete());

        executionService.executeWorkflow(id, request.getInputs(), emitter);

        return emitter;
    }

    @GetMapping("/mock/audio/{filename}")
    public ResponseEntity<Resource> getMockAudio(@PathVariable String filename) {
        Resource resource = new ClassPathResource("mock/" + filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
