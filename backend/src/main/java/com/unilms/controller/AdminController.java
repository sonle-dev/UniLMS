package com.unilms.controller;

import com.unilms.domain.entity.User;
import com.unilms.domain.enums.UserRole;
import com.unilms.repository.CourseRepository;
import com.unilms.repository.StudentProfileRepository;
import com.unilms.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final StudentProfileRepository studentProfileRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getSystemStats() {
        long totalUsers = userRepository.count();
        long activeStudents = userRepository.countByRole(UserRole.ROLE_STUDENT);
        long instructors = userRepository.countByRole(UserRole.ROLE_INSTRUCTOR);
        long openCourses = courseRepository.count();

        return ResponseEntity.ok(AdminStatsResponse.builder()
                .totalAccounts(totalUsers)
                .activeStudents(activeStudents)
                .totalInstructors(instructors)
                .openCourses(openCourses)
                .build());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> dtos = users.stream().map(u -> UserResponse.builder()
                .id(u.getId().toString())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .role(u.getRole().name())
                .isActive(u.getIsActive() != null ? u.getIsActive() : true)
                .avatarUrl(u.getAvatarUrl())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @Data
    @Builder
    public static class AdminStatsResponse {
        private long totalAccounts;
        private long activeStudents;
        private long totalInstructors;
        private long openCourses;
    }

    @Data
    @Builder
    public static class UserResponse {
        private String id;
        private String email;
        private String fullName;
        private String role;
        private boolean isActive;
        private String avatarUrl;
    }
}
