package com.unilms.repository;

import com.unilms.domain.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    Optional<LessonProgress> findByEnrollmentIdAndLessonId(UUID enrollmentId, UUID lessonId);
    List<LessonProgress> findByEnrollmentId(UUID enrollmentId);
    long countByEnrollmentIdAndIsCompletedTrue(UUID enrollmentId);
}
