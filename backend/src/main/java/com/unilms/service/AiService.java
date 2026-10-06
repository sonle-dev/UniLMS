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
        if (lower.contains("thống kê") || lower.contains("số môn") || lower.contains("tổng số môn")) {
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
        // 4. NATURAL LANGUAGE KNOWLEDGE & CONVERSATIONAL NLP ENGINE
        // =========================================================================
        String nlpResponse = resolveKnowledgeAnswer(input, model);

        return AiDto.ChatResponse.builder()
                .isSecurityWarning(false)
                .model(model)
                .timestamp(timeStr)
                .response(nlpResponse)
                .build();
    }

    private String resolveKnowledgeAnswer(String input, String model) {
        String lower = input.toLowerCase();

        // 1. Dịch thuật & Ngôn ngữ (Tiếng Pháp, Tiếng Anh, Từ vựng)
        if (lower.contains("nụ hôn") && (lower.contains("tiếng pháp") || lower.contains("pháp"))) {
            return "🧠 **[Gemini 1.5 Pro - Dịch thuật & Ngôn ngữ]**:\n\n" +
                   "Trong tiếng Pháp:\n" +
                   "• **Danh từ (Nụ hôn)**: **« un baiser »** (hoặc từ thân mật là **« un bisou »**).\n" +
                   "• **Động từ (Hôn)**: **« embrasser »** (hoặc **« baiser »**).\n" +
                   "• **Nụ hôn kiểu Pháp (French kiss)**: **« un baiser amoureux »**.\n\n" +
                   "💡 *Ví dụ câu*: *\"Je t'embrasse fort\"* (Gửi đến bạn nụ hôn nồng thắm!).";
        }

        if (lower.contains("cảm ơn") && lower.contains("tiếng pháp")) {
            return "🧠 **[Gemini 1.5 Pro]**: Trong tiếng Pháp, **Cảm ơn** là **« Merci »** (hoặc **« Merci beaucoup »** - Cảm ơn rất nhiều!).";
        }

        if (lower.contains("tiếng pháp") || lower.contains("tiếng anh") || lower.contains("dịch")) {
            return "🧠 **[Gemini 1.5 Pro - Trợ lý Ngôn ngữ]**:\n\n" +
                   "Trợ lý AI đã phân tích yêu cầu từ vựng: *\"" + input + "\"*.\n" +
                   "OmniBrain AI hỗ trợ dịch thuật tiếng Pháp, tiếng Anh chuyên ngành CNTT và thuật ngữ lập trình!";
        }

        // 2. Tri thức chung & Địa lý / Khoa học
        if (lower.contains("thủ đô") && lower.contains("pháp")) {
            return "🧠 **[Gemini 1.5 Pro]**: Thủ đô của nước Pháp là thành phố **Paris** (nổi tiếng với tháp Eiffel, bảo tàng Louvre và dòng sông Seine).";
        }

        if (lower.contains("thủ đô") && lower.contains("việt nam")) {
            return "🧠 **[Gemini 1.5 Pro]**: Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố **Hà Nội**.";
        }

        if (lower.contains("nước sôi") || lower.contains("sôi ở bao nhiêu")) {
            return "🧠 **[Gemini 1.5 Pro]**: Nước nguyên chất sôi ở nhiệt độ **100°C** (hoặc **212°F**) ở áp suất khí quyển tiêu chuẩn (1 atm).";
        }

        // 3. Công nghệ thông tin & Lập trình (OOP, REST API, Spring Boot, SQL, PostgreSQL, Git)
        if (lower.contains("oop") || lower.contains("hướng đối tượng")) {
            return "🧠 **[Gemini 1.5 Pro - Phân tích Lập trình]**:\n\n" +
                   "**OOP (Object-Oriented Programming)** là phương pháp lập trình hướng đối tượng dựa trên 4 trụ cột chính:\n" +
                   "1. **Tính Đóng gói (Encapsulation)**: Che giấu thuộc tính qua `private` và cung cấp Getter/Setter.\n" +
                   "2. **Tính Kế thừa (Inheritance)**: Lớp con tái sử dụng đặc tính từ lớp cha (`extends`).\n" +
                   "3. **Tính Đa hình (Polymorphism)**: Nạp chồng (`Overloading`) và Ghi đè (`Overriding`).\n" +
                   "4. **Tính Trừu tượng (Abstraction)**: Ẩn chi tiết cài đặt qua `interface` và `abstract class`.";
        }

        if (lower.contains("rest api") || lower.contains("restful")) {
            return "🧠 **[Gemini 1.5 Pro - Kiến thức RESTful Web API]**:\n\n" +
                   "**REST API** là chuẩn kiến trúc mạng giao tiếp HTTP giữa Client & Server sử dụng định dạng JSON/XML Stateless:\n" +
                   "• `GET`: Lấy dữ liệu.\n" +
                   "• `POST`: Tạo tài nguyên mới.\n" +
                   "• `PUT / PATCH`: Cập nhật dữ liệu.\n" +
                   "• `DELETE`: Xóa dữ liệu.";
        }

        if (lower.contains("spring boot") || lower.contains("spring")) {
            return "🧠 **[Gemini 1.5 Pro - Backend Framework]**:\n\n" +
                   "**Spring Boot 3** là framework Java doanh nghiệp hàng đầu giúp xây dựng REST APIs & Microservices nhanh chóng với các ưu điểm: Auto-configuration, nhúng Tomcat Server, Spring Security 6 và Hibernate ORM.";
        }

        if (lower.contains("gpa") || lower.contains("điểm")) {
            return "🧠 **[Gemini 1.5 Pro] Hệ thống Tính điểm GPA ICTU**:\n" +
                   "• **Tỷ trọng**: Chuyên cần (10%) + Quiz/Thường xuyên (30%) + Thi học kỳ (60%).\n" +
                   "• **Quy đổi Thang 4**: A (8.5-10) = 4.0 | B (7.0-8.4) = 3.0 | C (5.5-6.9) = 2.0 | D (4.0-5.4) = 1.0.";
        }

        if (lower.contains("lịch thi") || lower.contains("thời khóa biểu")) {
            return "📅 **[Gemini 1.5 Pro] Lịch thi Học phần Tín chỉ**:\n\n" +
                   "• **Môn**: Lập trình Enterprise với Java & Spring Boot 3\n" +
                   "• **Phòng thi**: Lab 3 (A101)\n" +
                   "• **Thời gian**: 08:00 AM - 15/10/2026\n" +
                   "• **Hình thức**: Trắc nghiệm 45 câu trên QuizEngine.";
        }

        // 4. Giao tiếp & Persona Trợ lý OmniBrain AI
        if (lower.contains("bạn là ai") || lower.contains("bạn tên gì") || lower.contains("tên là gì")) {
            return "🧠 **[OmniBrain AI Platform]**:\n\n" +
                   "Tôi là **OmniBrain AI Platform** - Trợ lý trí tuệ nhân tạo thế hệ mới của UniLMS (ICTU Style).\n" +
                   "Tôi có thể hỗ trợ bạn giải bài tập số học, dịch thuật ngôn ngữ, giải đáp kiến thức học tập, viết code Java/SQL và hướng dẫn lộ trình ôn thi 24/7!";
        }

        if (lower.contains("chào") || lower.contains("hi") || lower.contains("hello")) {
            return "👋 Xin chào! **OmniBrain AI Platform** rất vui được hỗ trợ bạn. Hôm nay bạn muốn giải toán, tra cứu từ vựng hay hỏi đáp môn học?";
        }

        if (lower.contains("cảm ơn") || lower.contains("thanks") || lower.contains("cám ơn")) {
            return "😊 Rất vui được hỗ trợ bạn! Chúc bạn có những giờ học tập hiệu quả tại **UniLMS**!";
        }

        // 5. Tổng hợp phản hồi linh hoạt cho các câu hỏi mở bất kỳ
        if ("code-assist".equals(model)) {
            return "💻 **[CodeAssist AI - Phân tích Yêu cầu]**:\n\n" +
                   "Đã ghi nhận yêu cầu: *\"" + input + "\"*.\n" +
                   "Bạn có thể yêu cầu sinh mẫu code Java Spring Boot, React JSX hoặc SQL query liên quan đến chủ đề này!";
        }

        if ("edubrain".equals(model) || "edubrain-guide".equals(model)) {
            return "📘 **[EduBrain Study Guide - Hướng dẫn Ôn tập]**:\n\n" +
                   "Đối với thắc mắc: *\"" + input + "\"*\n" +
                   "1. **Tài liệu tham khảo**: Tra cứu bài giảng Slide liên quan tại tab Môn học.\n" +
                   "2. **Thực hành**: Làm bài tập trắc nghiệm tự luyện tại tab Bài kiểm tra.\n" +
                   "3. **Tương tác**: Gửi ticket kỹ thuật hoặc hỏi Giảng viên để được giải đáp chi tiết.";
        }

        if ("gemini-flash".equals(model)) {
            return "⚡ **[Gemini 1.5 Flash - Trả lời Nhanh]**:\n\n" +
                   "• **Yêu cầu**: \"" + input + "\"\n" +
                   "• **Giải đáp**: Trợ lý AI đã ghi nhận và phản hồi câu hỏi giao tiếp của bạn. Hãy tiếp tục đặt câu hỏi!";
        }

        return "🧠 **[Gemini 1.5 Pro - Phân tích Tri thức]**:\n\n" +
               "Giải đáp về câu hỏi: **\"" + input + "\"**\n\n" +
               "OmniBrain AI sẵn sàng hỗ trợ giải đáp chi tiết các kiến thức chuyên ngành, bài tập toán học, thuật ngữ tiếng Pháp/Anh và hướng dẫn lập trình!";
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
