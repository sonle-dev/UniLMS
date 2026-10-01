package com.unilms.controller;

import com.unilms.dto.CourseDto.*;
import com.unilms.security.UserPrincipal;
import com.unilms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseSummaryResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllPublishedCourses());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CourseDetailResponse> getCourseBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(courseService.getCourseTreeBySlug(slug, principal != null ? principal.getId() : null));
    }
}
