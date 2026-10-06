package com.unilms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AiDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatRequest {
        private String message;
        private String model;      // e.g. "gemini-pro", "gemini-flash", "code-assist", "edubrain-guide"
        private String activeTab;  // e.g. "dashboard", "courses", "grades"
        private String role;       // e.g. "ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_ADMIN"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatResponse {
        private String response;
        private String model;
        private boolean isSecurityWarning;
        private String timestamp;
    }
}
