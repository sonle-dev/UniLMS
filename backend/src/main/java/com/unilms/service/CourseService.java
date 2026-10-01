package com.unilms.service;

import com.unilms.domain.entity.*;
import com.unilms.dto.CourseDto.*;
import com.unilms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;

    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> getAllPublishedCourses() {
        List<Course> courses = courseRepository.findByIsPublishedTrueAndDeletedAtIsNull();
        
        return courses.stream().map(course -> {
            List<ModuleEntity> modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(course.getId());
            int totalLessons = modules.stream()
                    .mapToInt(m -> lessonRepository.findByModuleIdAndDeletedAtIsNullOrderByOrderIndexAsc(m.getId()).size())
                    .sum();

            return CourseSummaryResponse.builder()
                    .id(course.getId())
                    .title(course.getTitle())
                    .slug(course.getSlug())
                    .summary(course.getSummary())
                    .thumbnailUrl(course.getThumbnailUrl())
                    .price(course.getPrice())
                    .instructorName(course.getInstructor() != null ? course.getInstructor().getFullName() : "Giảng viên UniLMS")
                    .totalModules(modules.size())
                    .totalLessons(totalLessons)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "course_tree", key = "#slug", unless = "#result == null")
    public CourseDetailResponse getCourseTreeBySlug(String slug, UUID userId) {
        Course course = courseRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new RuntimeException("Course not found with slug: " + slug));

        List<ModuleEntity> modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(course.getId());

        List<ModuleDtoResponse> moduleDtos = modules.stream().map(module -> {
            List<Lesson> lessons = lessonRepository.findByModuleIdAndDeletedAtIsNullOrderByOrderIndexAsc(module.getId());

            List<LessonDtoResponse> lessonDtos = lessons.stream().map(lesson -> {
                Boolean isCompleted = false;
                if (userId != null) {
                    // Check completion if user is logged in
                    isCompleted = false; // Resolved dynamically in progress service if needed
                }

                return LessonDtoResponse.builder()
                        .id(lesson.getId())
                        .title(lesson.getTitle())
                        .contentType(lesson.getContentType())
                        .contentPayload(lesson.getContentPayload())
                        .durationSeconds(lesson.getDurationSeconds())
                        .orderIndex(lesson.getOrderIndex())
                        .isCompleted(isCompleted)
                        .build();
            }).collect(Collectors.toList());

            return ModuleDtoResponse.builder()
                    .id(module.getId())
                    .title(module.getTitle())
                    .orderIndex(module.getOrderIndex())
                    .lessons(lessonDtos)
                    .build();
        }).collect(Collectors.toList());

        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .summary(course.getSummary())
                .thumbnailUrl(course.getThumbnailUrl())
                .price(course.getPrice())
                .instructorName(course.getInstructor() != null ? course.getInstructor().getFullName() : "Giảng viên UniLMS")
                .modules(moduleDtos)
                .build();
    }
}
