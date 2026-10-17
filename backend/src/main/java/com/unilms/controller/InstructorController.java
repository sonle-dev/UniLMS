package com.unilms.controller;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/api/v1/instructor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstructorController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/grades")
    public ResponseEntity<List<StudentGradeDto>> getStudentGrades(
            @RequestParam(value = "sectionCode", required = false, defaultValue = "CNTT.K22B.D1.K2.N03") String sectionCode) {

        String sql = """
            SELECT 
                u.id AS student_id,
                u.full_name,
                COALESCE(sp.student_code, 'DTC' || SUBSTRING(REPLACE(u.id::text, '-', ''), 1, 8)) AS student_code,
                u.email,
                COALESCE(sp.class_name, 'CNTT-K22B') AS class_name,
                cs.section_code,
                c.title AS course_title,
                sg.attendance_score,
                sg.quiz_score,
                sg.tx1,
                sg.tx2,
                sg.tx3,
                sg.tx4,
                sg.tbc_score,
                sg.is_eligible_for_exam
            FROM student_grades sg
            JOIN users u ON sg.student_id = u.id
            JOIN course_sections cs ON sg.section_id = cs.id
            JOIN courses c ON cs.course_id = c.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE cs.section_code = ?
            ORDER BY u.full_name ASC
        """;

        List<StudentGradeDto> result = jdbcTemplate.query(sql, (rs, rowNum) -> {
            double att = rs.getBigDecimal("attendance_score") != null ? rs.getBigDecimal("attendance_score").doubleValue() : 10.0;
            double quiz = rs.getBigDecimal("quiz_score") != null ? rs.getBigDecimal("quiz_score").doubleValue() : 8.0;
            double tx1 = rs.getBigDecimal("tx1") != null ? rs.getBigDecimal("tx1").doubleValue() : 8.0;
            double tx2 = rs.getBigDecimal("tx2") != null ? rs.getBigDecimal("tx2").doubleValue() : 8.0;
            double tx3 = rs.getBigDecimal("tx3") != null ? rs.getBigDecimal("tx3").doubleValue() : 8.0;
            double tx4 = rs.getBigDecimal("tx4") != null ? rs.getBigDecimal("tx4").doubleValue() : 8.0;
            double tbc = rs.getBigDecimal("tbc_score") != null ? rs.getBigDecimal("tbc_score").doubleValue() : ((att * 0.1) + (quiz * 0.2) + ((tx1 + tx2 + tx3 + tx4) / 4.0 * 0.7));
            boolean eligible = rs.getBoolean("is_eligible_for_exam");

            // Format to 1 decimal place
            BigDecimal bdTbc = BigDecimal.valueOf(tbc).setScale(1, RoundingMode.HALF_UP);

            return StudentGradeDto.builder()
                    .id(rs.getString("student_id"))
                    .code(rs.getString("student_code"))
                    .name(rs.getString("full_name"))
                    .email(rs.getString("email"))
                    .className(rs.getString("class_name"))
                    .sectionCode(rs.getString("section_code"))
                    .courseTitle(rs.getString("course_title"))
                    .attendance(att)
                    .quiz(quiz)
                    .tx1(tx1)
                    .tx2(tx2)
                    .tx3(tx3)
                    .tx4(tx4)
                    .tbc(bdTbc.doubleValue())
                    .status(eligible ? "ELIGIBLE" : "WARNING")
                    .build();
        }, sectionCode);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentRosterDto>> getStudentRoster(
            @RequestParam(value = "sectionCode", required = false, defaultValue = "CNTT.K22B.D1.K2.N03") String sectionCode) {

        String sql = """
            SELECT 
                u.id AS student_id,
                u.full_name,
                COALESCE(sp.student_code, 'DTC' || SUBSTRING(REPLACE(u.id::text, '-', ''), 1, 8)) AS student_code,
                u.email,
                COALESCE(sp.class_name, 'CNTT-K22B') AS class_name,
                cs.section_code,
                sg.attendance_score,
                sg.is_eligible_for_exam,
                sg.tbc_score
            FROM student_grades sg
            JOIN users u ON sg.student_id = u.id
            JOIN course_sections cs ON sg.section_id = cs.id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE cs.section_code = ?
            ORDER BY u.full_name ASC
        """;

        List<StudentRosterDto> result = jdbcTemplate.query(sql, (rs, rowNum) -> {
            double att = rs.getBigDecimal("attendance_score") != null ? rs.getBigDecimal("attendance_score").doubleValue() : 10.0;
            double tbc = rs.getBigDecimal("tbc_score") != null ? rs.getBigDecimal("tbc_score").doubleValue() : 8.0;
            boolean eligible = rs.getBoolean("is_eligible_for_exam");

            int progressPercent = (int) Math.min(100, Math.round(tbc * 10.0 + (att > 8 ? 5 : 0)));
            String status = eligible ? "GOOD" : "WARNING";

            return StudentRosterDto.builder()
                    .id(rs.getString("student_id"))
                    .code(rs.getString("student_code"))
                    .fullName(rs.getString("full_name"))
                    .email(rs.getString("email"))
                    .className(rs.getString("class_name"))
                    .progressPercent(progressPercent)
                    .attendanceScore(att)
                    .quizzesCompleted("3/3")
                    .status(status)
                    .lastActive("1 giờ trước")
                    .build();
        }, sectionCode);

        return ResponseEntity.ok(result);
    }

    @PutMapping("/grades")
    public ResponseEntity<String> updateGrade(@RequestBody UpdateGradeRequest req) {
        String sql = """
            UPDATE student_grades
            SET attendance_score = ?, quiz_score = ?, tx1 = ?, tx2 = ?, tx3 = ?, tx4 = ?, tbc_score = ?, is_eligible_for_exam = ?, updated_at = CURRENT_TIMESTAMP
            WHERE student_id = ?::uuid AND section_id = (SELECT id FROM course_sections WHERE section_code = ?)
        """;

        boolean isEligible = "ELIGIBLE".equalsIgnoreCase(req.getStatus());
        double avgTx = (req.getTx1() + req.getTx2() + req.getTx3() + req.getTx4()) / 4.0;
        double tbc = (req.getAttendance() * 0.1) + (req.getQuiz() * 0.2) + (avgTx * 0.7);

        int updated = jdbcTemplate.update(sql,
                BigDecimal.valueOf(req.getAttendance()),
                BigDecimal.valueOf(req.getQuiz()),
                BigDecimal.valueOf(req.getTx1()),
                BigDecimal.valueOf(req.getTx2()),
                BigDecimal.valueOf(req.getTx3()),
                BigDecimal.valueOf(req.getTx4()),
                BigDecimal.valueOf(tbc).setScale(2, RoundingMode.HALF_UP),
                isEligible,
                req.getStudentId(),
                req.getSectionCode()
        );

        return ResponseEntity.ok("Updated " + updated + " student grade records.");
    }

    @Data
    @Builder
    public static class StudentGradeDto {
        private String id;
        private String code;
        private String name;
        private String email;
        private String className;
        private String sectionCode;
        private String courseTitle;
        private double attendance;
        private double quiz;
        private double tx1;
        private double tx2;
        private double tx3;
        private double tx4;
        private double tbc;
        private String status;
    }

    @Data
    @Builder
    public static class StudentRosterDto {
        private String id;
        private String code;
        private String fullName;
        private String email;
        private String className;
        private int progressPercent;
        private double attendanceScore;
        private String quizzesCompleted;
        private String status;
        private String lastActive;
    }

    @Data
    public static class UpdateGradeRequest {
        private String studentId;
        private String sectionCode;
        private double attendance;
        private double quiz;
        private double tx1;
        private double tx2;
        private double tx3;
        private double tx4;
        private String status;
    }
}
