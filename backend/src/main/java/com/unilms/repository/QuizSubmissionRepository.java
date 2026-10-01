package com.unilms.repository;

import com.unilms.domain.entity.QuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, UUID> {
    List<QuizSubmission> findByQuizIdAndUserIdOrderBySubmittedAtDesc(UUID quizId, UUID userId);
    Optional<QuizSubmission> findFirstByQuizIdAndUserIdAndIsPassedTrue(UUID quizId, UUID userId);
}
