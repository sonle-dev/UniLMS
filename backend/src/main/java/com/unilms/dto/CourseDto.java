package com.unilms.dto;

import com.unilms.domain.enums.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CourseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourseSummaryResponse {
        private UUID id;
        private String title;
        private String slug;
        private String summary;
        private String thumbnailUrl;
        private BigDecimal price;
        private String instructorName;
        private Integer totalModules;
        private Integer totalLessons;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourseDetailResponse {
        private UUID id;
        private String title;
        private String slug;
        private String summary;
        private String thumbnailUrl;
        private BigDecimal price;
        private String instructorName;
        private List<ModuleDtoResponse> modules;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModuleDtoResponse {
        private UUID id;
        private String title;
        private Integer orderIndex;
        private List<LessonDtoResponse> lessons;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LessonDtoResponse {
        private UUID id;
        private String title;
        private ContentType contentType;
        private String contentPayload;
        private Integer durationSeconds;
        private Integer orderIndex;
        private Boolean isCompleted;
    }
}
