package com.unilms.service;

import com.unilms.domain.entity.*;
import com.unilms.dto.ProgressDto.*;
import com.unilms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final CertificateRepository certificateRepository;

    @Transactional
    public EnrollmentProgressResponse enrollInCourse(UUID userId, UUID courseId, User userRef) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Optional<Enrollment> existingOpt = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        Enrollment enrollment;

        if (existingOpt.isPresent()) {
            enrollment = existingOpt.get();
        } else {
            enrollment = Enrollment.builder()
                    .user(userRef)
                    .course(course)
                    .progressPercent(BigDecimal.ZERO)
                    .build();
            enrollment = enrollmentRepository.save(enrollment);
        }

        long totalLessons = lessonRepository.countByModuleCourseIdAndDeletedAtIsNull(courseId);
        long completedLessons = lessonProgressRepository.countByEnrollmentIdAndIsCompletedTrue(enrollment.getId());

        return EnrollmentProgressResponse.builder()
                .enrollmentId(enrollment.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .progressPercent(enrollment.getProgressPercent())
                .completedLessonsCount(completedLessons)
                .totalLessonsCount(totalLessons)
                .build();
    }

    @Transactional
    public EnrollmentProgressResponse updateLessonProgress(UUID userId, UUID courseId, UpdateProgressRequest request) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found for course"));

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        LessonProgress progress = lessonProgressRepository
                .findByEnrollmentIdAndLessonId(enrollment.getId(), lesson.getId())
                .orElseGet(() -> LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .isCompleted(false)
                        .lastWatchedSecond(0)
                        .build());

        if (request.getIsCompleted() != null) {
            progress.setIsCompleted(request.getIsCompleted());
            if (request.getIsCompleted() && progress.getCompletedAt() == null) {
                progress.setCompletedAt(OffsetDateTime.now());
            }
        }

        if (request.getLastWatchedSecond() != null) {
            progress.setLastWatchedSecond(request.getLastWatchedSecond());
        }

        lessonProgressRepository.save(progress);

        // Recalculate progress percent on enrollments table
        long totalLessons = lessonRepository.countByModuleCourseIdAndDeletedAtIsNull(courseId);
        long completedLessons = lessonProgressRepository.countByEnrollmentIdAndIsCompletedTrue(enrollment.getId());

        BigDecimal newProgressPercent = BigDecimal.ZERO;
        if (totalLessons > 0) {
            newProgressPercent = BigDecimal.valueOf(completedLessons)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalLessons), 2, RoundingMode.HALF_UP);
        }

        enrollment.setProgressPercent(newProgressPercent);

        if (newProgressPercent.compareTo(new BigDecimal("100.00")) >= 0 && enrollment.getCompletedAt() == null) {
            enrollment.setCompletedAt(OffsetDateTime.now());

            // Auto-issue Certificate if not already issued
            if (certificateRepository.findByEnrollmentId(enrollment.getId()).isEmpty()) {
                String certCode = "UNI-CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Certificate cert = Certificate.builder()
                        .certificateCode(certCode)
                        .enrollment(enrollment)
                        .build();
                certificateRepository.save(cert);
            }
        }

        enrollmentRepository.save(enrollment);

        return EnrollmentProgressResponse.builder()
                .enrollmentId(enrollment.getId())
                .courseId(courseId)
                .courseTitle(enrollment.getCourse().getTitle())
                .progressPercent(newProgressPercent)
                .completedLessonsCount(completedLessons)
                .totalLessonsCount(totalLessons)
                .build();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentProgressResponse> getUserEnrollments(UUID userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);

        return enrollments.stream().map(e -> {
            long totalLessons = lessonRepository.countByModuleCourseIdAndDeletedAtIsNull(e.getCourse().getId());
            long completedLessons = lessonProgressRepository.countByEnrollmentIdAndIsCompletedTrue(e.getId());

            return EnrollmentProgressResponse.builder()
                    .enrollmentId(e.getId())
                    .courseId(e.getCourse().getId())
                    .courseTitle(e.getCourse().getTitle())
                    .progressPercent(e.getProgressPercent())
                    .completedLessonsCount(completedLessons)
                    .totalLessonsCount(totalLessons)
                    .build();
        }).collect(Collectors.toList());
    }
}
