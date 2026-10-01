package com.unilms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unilms.domain.entity.*;
import com.unilms.dto.QuizDto.*;
import com.unilms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public QuizDetailResponse getQuizByLessonId(UUID lessonId) {
        Quiz quiz = quizRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new RuntimeException("Quiz not found for lesson: " + lessonId));

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quiz.getId());

        List<QuestionResponse> questionDtos = questions.stream().map(q -> QuestionResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .optionsJson(q.getOptions())
                .points(q.getPoints())
                .build()
        ).collect(Collectors.toList());

        return QuizDetailResponse.builder()
                .quizId(quiz.getId())
                .lessonId(quiz.getLesson().getId())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passingScore(quiz.getPassingScore())
                .questions(questionDtos)
                .build();
    }

    @Transactional
    public QuizResultResponse submitQuiz(UUID quizId, UUID userId, SubmitQuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);
        Map<UUID, String> submittedAnswers = request.getAnswers() != null ? request.getAnswers() : new HashMap<>();

        BigDecimal totalEarnedPoints = BigDecimal.ZERO;
        BigDecimal totalMaxPoints = BigDecimal.ZERO;

        List<Map<String, Object>> snapshotList = new ArrayList<>();

        for (QuizQuestion q : questions) {
            totalMaxPoints = totalMaxPoints.add(q.getPoints());
            String chosenOption = submittedAnswers.get(q.getId());
            boolean isCorrect = chosenOption != null && chosenOption.equalsIgnoreCase(q.getCorrectOption());

            if (isCorrect) {
                totalEarnedPoints = totalEarnedPoints.add(q.getPoints());
            }

            Map<String, Object> questionSnapshot = new HashMap<>();
            questionSnapshot.put("questionId", q.getId().toString());
            questionSnapshot.put("questionText", q.getQuestionText());
            questionSnapshot.put("options", q.getOptions());
            questionSnapshot.put("correctOption", q.getCorrectOption());
            questionSnapshot.put("chosenOption", chosenOption != null ? chosenOption : "");
            questionSnapshot.put("isCorrect", isCorrect);
            questionSnapshot.put("points", q.getPoints());

            snapshotList.add(questionSnapshot);
        }

        BigDecimal rawScore = BigDecimal.ZERO;
        if (totalMaxPoints.compareTo(BigDecimal.ZERO) > 0) {
            rawScore = totalEarnedPoints.multiply(BigDecimal.valueOf(100))
                    .divide(totalMaxPoints, 2, RoundingMode.HALF_UP);
        }

        boolean isPassed = rawScore.compareTo(quiz.getPassingScore()) >= 0;

        String snapshotJson;
        try {
            snapshotJson = objectMapper.writeValueAsString(snapshotList);
        } catch (Exception e) {
            snapshotJson = "[]";
        }

        QuizSubmission submission = QuizSubmission.builder()
                .quiz(quiz)
                .user(user)
                .rawScore(rawScore)
                .isPassed(isPassed)
                .answersSnapshot(snapshotJson)
                .build();

        QuizSubmission saved = quizSubmissionRepository.save(submission);

        return QuizResultResponse.builder()
                .submissionId(saved.getId())
                .score(saved.getRawScore())
                .isPassed(saved.getIsPassed())
                .answersSnapshotJson(saved.getAnswersSnapshot())
                .submittedAt(saved.getSubmittedAt())
                .build();
    }
}
