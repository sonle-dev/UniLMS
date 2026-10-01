package com.unilms.controller;

import com.unilms.domain.entity.User;
import com.unilms.dto.ProgressDto.*;
import com.unilms.repository.UserRepository;
import com.unilms.security.UserPrincipal;
import com.unilms.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final UserRepository userRepository;

    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<EnrollmentProgressResponse> enrollInCourse(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User userRef = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(progressService.enrollInCourse(principal.getId(), courseId, userRef));
    }

    @PostMapping("/courses/{courseId}/update")
    public ResponseEntity<EnrollmentProgressResponse> updateProgress(
            @PathVariable UUID courseId,
            @RequestBody UpdateProgressRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(progressService.updateLessonProgress(principal.getId(), courseId, request));
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<List<EnrollmentProgressResponse>> getMyEnrollments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(progressService.getUserEnrollments(principal.getId()));
    }
}
