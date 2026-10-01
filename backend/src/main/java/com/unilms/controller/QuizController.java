package com.unilms.controller;

import com.unilms.dto.QuizDto.*;
import com.unilms.security.UserPrincipal;
import com.unilms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<QuizDetailResponse> getQuizByLesson(@PathVariable UUID lessonId) {
        return ResponseEntity.ok(quizService.getQuizByLessonId(lessonId));
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            @PathVariable UUID quizId,
            @RequestBody SubmitQuizRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(quizService.submitQuiz(quizId, principal.getId(), request));
    }
}
