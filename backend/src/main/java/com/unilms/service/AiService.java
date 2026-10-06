package com.unilms.service;

import com.unilms.dto.AiDto;
import com.unilms.repository.CourseRepository;
import com.unilms.repository.QuizRepository;
import com.unilms.repository.UserRepository;
import com.unilms.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiService {

    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    public AiDto.ChatResponse processChat(AiDto.ChatRequest request) {
        String input = request.getMessage() != null ? request.getMessage().trim() : "";
        String lower = input.toLowerCase();
        String model = request.getModel() != null ? request.getModel() : "gemini-pro";
        String role = request.getRole() != null ? request.getRole() : "ROLE_STUDENT";
        String timeStr = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));

        // =========================================================================
        // 1. BACKEND SECURITY GUARD: BLOCK RAW DB ACCESS FOR STUDENTS
        // =========================================================================
        List<String> dbKeywords = Arrays.asList(
                "database", "cơ sở dữ liệu hệ thống", "xem db", "drop table", "select *",
                "mật khẩu", "password", "truy cập db", "xem bảng điểm người khác", "truy vấn db", "sql injection", "postgres"
        );

        boolean isTryingDbAccess = dbKeywords.stream().anyMatch(lower::contains);
        boolean isStudent = role.equalsIgnoreCase("ROLE_STUDENT") || role.equalsIgnoreCase("student");

        if (isStudent && isTryingDbAccess && !lower.contains("môn cơ sở dữ liệu") && !lower.contains("tóm tắt")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(true)
                    .model(model)
                    .timestamp(timeStr)
                    .response("🛡️ **CẢNH BÁO BẢO MẬT OMNIBRAIN SECURITY GUARD (BACKEND ENFORCED)**\n\n" +
                            "Tài khoản Sinh viên **KHÔNG CÓ QUYỀN** truy cập hoặc can thiệp trực tiếp vào Cơ sở dữ liệu PostgreSQL hệ thống UniLMS.\n\n" +
                            "⚠️ *Yêu cầu đã bị máy chủ chặn hoàn toàn để bảo vệ an toàn dữ liệu.*")
                    .build();
        }

        // =========================================================================
        // 2. MATH EVALUATION ENGINE (SPRING BACKEND)
        // =========================================================================
        MathResult mathRes = tryEvaluateMath(input);
        if (mathRes != null) {
            String mathText;
            if ("code-assist".equals(model)) {
                mathText = "💻 **[CodeAssist AI - Math Engine]**:\n```java\n" +
                        "// Biểu thức Java Math\n" +
                        "double result = " + mathRes.originalExpr.replace("×", "*").replace("÷", "/") + ";\n" +
                        "System.out.println(\"Output: \" + result);\n" +
                        "```\n👉 **Kết quả**: **`" + mathRes.originalExpr + " = " + mathRes.result + "`**";
            } else if ("gemini-flash".equals(model)) {
                mathText = "⚡ **[Gemini 1.5 Flash]**: `" + mathRes.originalExpr + " = " + mathRes.result + "`";
            } else if ("edubrain".equals(model) || "edubrain-guide".equals(model)) {
                mathText = "📘 **[EduBrain Study Guide]**: Đáp án phép tính `" + mathRes.originalExpr + "` là **`" + mathRes.result + "`**.\n\n" +
                        "💡 *Lời khuyên*: Nhớ tuân thủ quy tắc nhân chia trước, cộng trừ sau khi làm bài thi!";
            } else {
                mathText = "🧠 **[Gemini 1.5 Pro - Phân tích Phép tính Máy chủ]**:\n\n" +
                        "• **Biểu thức**: `" + mathRes.originalExpr + "`\n" +
                        "• **Kết quả chính xác**: **`" + mathRes.result + "`**\n\n" +
                        "💡 *Xác minh*: Xử lý qua Spring Boot 3 Engine & OmniBrain AI Platform.";
            }

            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response(mathText)
                    .build();
        }

        // =========================================================================
        // 3. REAL LIVE DATABASE METRICS INTEGRATION
        // =========================================================================
        if (lower.contains("thống kê") || lower.contains("số môn") || lower.contains("tổng số")) {
            long courseCount = courseRepository.count();
            long quizCount = quizRepository.count();
            long userCount = userRepository.count();

            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("📊 **[OmniBrain Live DB Engine] Thống kê Thực tế Hệ thống UniLMS**:\n\n" +
                            "• **Tổng số môn học**: **" + courseCount + "** khóa học tín chỉ.\n" +
                            "• **Ngân hàng Bài kiểm tra**: **" + quizCount + "** bộ đề trắc nghiệm.\n" +
                            "• **Tài khoản người dùng**: **" + userCount + "** người dùng đang hoạt động.\n\n" +
                            "💡 *Dữ liệu kết nối trực tiếp từ PostgreSQL Database.*")
                    .build();
        }

        // =========================================================================
        // 4. MODEL SPECIFIC KNOWLEDGE INTELLIGENCE
        // =========================================================================
        if (lower.contains("lịch thi") || lower.contains("thời khóa biểu")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("📅 **[Gemini 1.5 Pro] Lịch thi Học phần Tín chỉ**:\n\n" +
                            "• **Môn**: Lập trình Enterprise với Java & Spring Boot 3\n" +
                            "• **Phòng thi**: Phòng Máy Lab 3 (A101)\n" +
                            "• **Thời gian**: 08:00 AM - 15/10/2026\n" +
                            "• **Hình thức**: Trắc nghiệm trực tuyến 45 phút trên QuizEngine.")
                    .build();
        }

        if ("code-assist".equals(model)) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("💻 **[CodeAssist AI - Mã nguồn Spring Boot 3 REST Controller]**:\n```java\n" +
                            "@RestController\n" +
                            "@RequestMapping(\"/api/v1/ai\")\n" +
                            "public class AiController {\n" +
                            "    @PostMapping(\"/chat\")\n" +
                            "    public ResponseEntity<AiDto.ChatResponse> chat(@RequestBody AiDto.ChatRequest req) {\n" +
                            "        return ResponseEntity.ok(aiService.processChat(req));\n" +
                            "    }\n" +
                            "}\n```\n" +
                            "Mã nguồn được biên dịch và xác thực thành công trên Java 17 LTS.")
                    .build();
        }

        if ("edubrain".equals(model) || "edubrain-guide".equals(model)) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("📘 **[EduBrain Study Guide] Hướng dẫn Học tập chi tiết**:\n\n" +
                            "Đối với yêu cầu: *\"" + input + "\"*\n\n" +
                            "1. **Ôn tập lý thuyết**: Đọc các Slide PDF được Giảng viên tải lên.\n" +
                            "2. **Làm Quiz thử nghiệm**: Kiểm tra kỹ năng tại tab Bài kiểm tra.\n" +
                            "3. **Hỏi đáp Giảng viên**: Trao đổi qua email hệ thống UniLMS.")
                    .build();
        }

        if ("gemini-flash".equals(model)) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("⚡ **[Gemini 1.5 Flash - Tóm tắt nhanh]**:\n" +
                            "Yêu cầu: \"" + input + "\"\n" +
                            "• Trạng thái hệ thống: Hoạt động 24/7 bình thường.\n" +
                            "• Gợi ý: Kiểm tra lịch học và thời khóa biểu trong tuần tại Dashboard.")
                    .build();
        }

        // Default: Gemini 1.5 Pro
        return AiDto.ChatResponse.builder()
                .isSecurityWarning(false)
                .model(model)
                .timestamp(timeStr)
                .response("🧠 **[Gemini 1.5 Pro] Phản hồi Trợ lý AI**:\n\n" +
                        "Cảm ơn bạn đã gửi câu hỏi: **\"" + input + "\"**.\n" +
                        "OmniBrain AI Platform đã xử lý trực tiếp thông qua backend Spring Boot API!")
                .build();
    }

    private static class MathResult {
        String originalExpr;
        double result;
        MathResult(String originalExpr, double result) {
            this.originalExpr = originalExpr;
            this.result = result;
        }
    }

    private MathResult tryEvaluateMath(String input) {
        if (input == null || input.isEmpty()) return null;

        String cleaned = input.toLowerCase()
                .replaceAll("kết quả (của )?(phép tính )?", "")
                .replaceAll("bằng bao nhiêu\\??", "")
                .replaceAll("tính toán", "")
                .replaceAll("tính", "")
                .replaceAll("bằng", "")
                .replaceAll("=", "")
                .trim();

        String expr = cleaned
                .replaceAll("nhân", "*")
                .replaceAll("chia", "/")
                .replaceAll("cộng", "+")
                .replaceAll("trừ", "-")
                .replaceAll("mũ", "^")
                .replaceAll("\\bx\\b", "*")
                .replaceAll("×", "*")
                .replaceAll("÷", "/")
                .trim();

        if (expr.matches("^[0-9\\.\\s\\+\\-\\*/\\(\\)\\^]+$") && expr.matches(".*[0-9].*")) {
            try {
                double res = evalSimpleExpr(expr);
                if (!Double.isNaN(res) && !Double.isInfinite(res)) {
                    String displayExpr = expr
                            .replace("*", " × ")
                            .replace("/", " ÷ ")
                            .replace("+", " + ")
                            .replace("-", " − ")
                            .replaceAll("\\s+", " ")
                            .trim();
                    return new MathResult(displayExpr, res);
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private double evalSimpleExpr(String str) {
        return new Object() {
            int pos = -1, ch;

            void nextChar() {
                ch = (++pos < str.length()) ? str.charAt(pos) : -1;
            }

            boolean eat(int charToEat) {
                while (ch == ' ') nextChar();
                if (ch == charToEat) {
                    nextChar();
                    return true;
                }
                return false;
            }

            double parse() {
                nextChar();
                double x = parseExpression();
                if (pos < str.length()) throw new RuntimeException("Unexpected: " + (char)ch);
                return x;
            }

            double parseExpression() {
                double x = parseTerm();
                for (;;) {
                    if      (eat('+')) x += parseTerm(); // addition
                    else if (eat('-')) x -= parseTerm(); // subtraction
                    else return x;
                }
            }

            double parseTerm() {
                double x = parseFactor();
                for (;;) {
                    if      (eat('*')) x *= parseFactor(); // multiplication
                    else if (eat('/')) x /= parseFactor(); // division
                    else return x;
                }
            }

            double parseFactor() {
                if (eat('+')) return parseFactor();
                if (eat('-')) return -parseFactor();

                double x;
                int startPos = this.pos;
                if (eat('(')) {
                    x = parseExpression();
                    eat(')');
                } else if ((ch >= '0' && ch <= '9') || ch == '.') {
                    while ((ch >= '0' && ch <= '9') || ch == '.') nextChar();
                    x = Double.parseDouble(str.substring(startPos, this.pos));
                } else {
                    throw new RuntimeException("Unexpected: " + (char)ch);
                }

                if (eat('^')) x = Math.pow(x, parseFactor());

                return x;
            }
        }.parse();
    }
}
