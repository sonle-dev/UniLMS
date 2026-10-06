package com.unilms.controller;

import com.unilms.dto.AiDto;
import com.unilms.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AiDto.ChatResponse> chat(@RequestBody AiDto.ChatRequest request) {
        AiDto.ChatResponse response = aiService.processChat(request);
        return ResponseEntity.ok(response);
    }
}
