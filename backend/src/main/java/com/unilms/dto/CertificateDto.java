package com.unilms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CertificateDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CertificateDetailResponse {
        private UUID id;
        private String certificateCode;
        private String studentName;
        private String studentCode;
        private String courseTitle;
        private OffsetDateTime issuedAt;
    }
}
