package com.unilms.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "quiz_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "options", nullable = false, columnDefinition = "jsonb")
    private String options; // JSON array of options: [{"id": "A", "text": "..."}, ...]

    @Column(name = "correct_option", nullable = false, length = 10)
    private String correctOption;

    @Column(precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal points = BigDecimal.ONE;
}
