package com.unilms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CourseMaterialDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MaterialResponse {
        private UUID id;
        private UUID courseId;
        private String moduleId;
        private String title;
        private String fileName;
        private String fileType;
        private String fileSize;
        private String fileUrl;
        private String downloadUrl;
        private Boolean allowDownload;
        private UUID uploadedBy;
        private String uploadedByName;
        private OffsetDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateMaterialRequest {
        private String title;
        private UUID courseId;
        private String moduleId;
        private String fileType;
        private Boolean allowDownload;
    }
}
