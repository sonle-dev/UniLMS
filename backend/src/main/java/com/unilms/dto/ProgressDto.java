package com.unilms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class ProgressDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProgressRequest {
        private UUID lessonId;
        private Boolean isCompleted;
        private Integer lastWatchedSecond;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollmentProgressResponse {
        private UUID enrollmentId;
        private UUID courseId;
        private String courseTitle;
        private BigDecimal progressPercent;
        private Long completedLessonsCount;
        private Long totalLessonsCount;
    }
}
