package com.unilms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class QuizDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizDetailResponse {
        private UUID quizId;
        private UUID lessonId;
        private Integer timeLimitMinutes;
        private BigDecimal passingScore;
        private List<QuestionResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private UUID id;
        private String questionText;
        private String optionsJson; // [{"id":"A","text":"..."}, ...]
        private BigDecimal points;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitQuizRequest {
        private Map<UUID, String> answers; // Question UUID -> Chosen Option ID ("A", "B", etc.)
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizResultResponse {
        private UUID submissionId;
        private BigDecimal score;
        private Boolean isPassed;
        private String answersSnapshotJson;
        private OffsetDateTime submittedAt;
    }
}
