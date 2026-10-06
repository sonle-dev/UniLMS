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
        if (lower.contains("thống kê toàn trường") || lower.contains("số môn học hệ thống")) {
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
        // 3.5 USER ACCOUNT & PERSONAL PROFILE SUMMARY ENGINE
        // =========================================================================
        List<String> profileKeywords = Arrays.asList(
                "thông tin về tôi", "tổng hợp thông tin về tôi", "thông tin của tôi",
                "tôi là ai", "hồ sơ của tôi", "xem hồ sơ", "thông tin cá nhân",
                "tài khoản của tôi", "gpa của tôi", "môn tôi đang học", "hồ sơ cá nhân"
        );

        if (profileKeywords.stream().anyMatch(lower::contains)) {
            String name = (request.getUserFullName() != null && !request.getUserFullName().isEmpty()) 
                    ? request.getUserFullName() 
                    : ("ROLE_INSTRUCTOR".equalsIgnoreCase(role) || "instructor".equalsIgnoreCase(role) ? "TS. Trần Thị Mai" : "Nguyễn Văn An");
            String code = (request.getUserCode() != null && !request.getUserCode().isEmpty()) 
                    ? request.getUserCode() 
                    : ("ROLE_INSTRUCTOR".equalsIgnoreCase(role) || "instructor".equalsIgnoreCase(role) ? "MSGV 10245" : "MSSV 22110045");
            String email = (request.getUserEmail() != null && !request.getUserEmail().isEmpty()) 
                    ? request.getUserEmail() 
                    : ("ROLE_INSTRUCTOR".equalsIgnoreCase(role) || "instructor".equalsIgnoreCase(role) ? "mai.tt@eduportal.edu.vn" : "an.nv22110045@st.eduportal.edu.vn");
            String dept = (request.getDepartment() != null && !request.getDepartment().isEmpty()) 
                    ? request.getDepartment() 
                    : "Khoa Công nghệ Thông tin - ICTU";

            String profileText;
            if ("ROLE_INSTRUCTOR".equalsIgnoreCase(role) || "instructor".equalsIgnoreCase(role)) {
                profileText = "👨‍🏫 **[OmniBrain AI] Tổng hợp Hồ sơ Giảng dạy của Bạn**:\n\n" +
                        "• **Họ và tên**: **" + name + "**\n" +
                        "• **Mã giảng viên (MSGV)**: **" + code + "**\n" +
                        "• **Đơn vị công tác**: **" + dept + "**\n" +
                        "• **Email hệ thống**: `" + email + "`\n" +
                        "• **Vai trò**: **Giảng viên (INSTRUCTOR)**\n\n" +
                        "📖 **Các lớp học phần đang phụ trách**:\n" +
                        "1. **Cơ sở dữ liệu (INT2211)** - 5 lớp (Sĩ số: 120 Sinh viên)\n" +
                        "2. **Lập trình hướng đối tượng (INT2204)** - 3 lớp\n" +
                        "3. **Lập trình Web (INT3306)** - 2 lớp\n\n" +
                        "📊 **Trạng thái**: Đã duyệt bảng điểm Chuyên cần & Quiz TX1. Có 1 bài kiểm tra giữa kỳ chờ chấm!";
            } else if ("ROLE_ADMIN".equalsIgnoreCase(role) || "admin".equalsIgnoreCase(role)) {
                profileText = "🛡️ **[OmniBrain AI] Tổng hợp Hồ sơ Quản trị viên Hệ thống**:\n\n" +
                        "• **Họ và tên**: **" + name + "**\n" +
                        "• **Mã quản trị**: **" + code + "**\n" +
                        "• **Email hệ thống**: `" + email + "`\n" +
                        "• **Quyền hạn**: **Quản trị toàn trường (ROLE_ADMIN)**\n\n" +
                        "🏫 **Tổng quan Toàn trường UniLMS**:\n" +
                        "• **Tổng số sinh viên**: 1.240 tài khoản\n" +
                        "• **Tổng số giảng viên**: 48 tài khoản\n" +
                        "• **Lớp học phần mở**: 32 lớp HP đang hoạt động";
            } else {
                profileText = "👤 **[OmniBrain AI] Tổng hợp Hồ sơ & Tiến độ Học tập của Bạn**:\n\n" +
                        "• **Họ và tên**: **" + name + "**\n" +
                        "• **Mã sinh viên (MSSV)**: **" + code + "**\n" +
                        "• **Lớp học phần**: **K18-CNTT01** (" + dept + ")\n" +
                        "• **Email hệ thống**: `" + email + "`\n" +
                        "• **Điểm trung bình (GPA)**: **3.52 / 4.0** *(Xếp loại: Giỏi)*\n\n" +
                        "📚 **Các môn học kỳ hiện tại (4 môn tín chỉ)**:\n" +
                        "1. **Cơ sở dữ liệu (INT2211)** - 3 Tín chỉ | GV: TS. Trần Thị Mai\n" +
                        "2. **Lập trình Enterprise với Java & Spring Boot 3 (INT3308)** - 3 Tín chỉ | GV: PGS. TS. Trần Đức Minh\n" +
                        "3. **Lập trình Web (INT3306)** - 3 Tín chỉ | GV: ThS. Lê Hoàng Nam\n" +
                        "4. **Tiếng Anh chuyên ngành (FLF1105)** - 2 Tín chỉ | GV: ThS. Phạm Thu Hà\n\n" +
                        "🎯 **Trạng thái**: **ĐỦ ĐIỀU KIỆN THI KẾT THÚC HỌC PHẦN** ✅";
            }

            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response(profileText)
                    .build();
        }

        // =========================================================================
        // 4. OPEN THEORY & NATURAL LANGUAGE KNOWLEDGE ENGINE (ALL MODELS SUPPORTED)
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

        // 1. LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)
        if (lower.contains("oop") || lower.contains("hướng đối tượng")) {
            if ("gemini-flash".equals(model)) {
                return "⚡ **[Gemini 1.5 Flash - Tóm tắt OOP Nhanh]**:\n\n" +
                       "• **Khái niệm**: OOP (Lập trình hướng đối tượng) tổ chức mã nguồn theo Đối tượng (Object).\n" +
                       "• **4 Trụ cột chính**:\n" +
                       "  1. **Đóng gói (Encapsulation)**: Che giấu dữ liệu qua private & Getter/Setter.\n" +
                       "  2. **Kế thừa (Inheritance)**: Tái sử dụng code từ lớp cha (`extends`).\n" +
                       "  3. **Đa hình (Polymorphism)**: Overriding (Ghi đè) & Overloading (Nạp chồng).\n" +
                       "  4. **Trừu tượng (Abstraction)**: Định nghĩa bộ khung qua Interface & Abstract Class.";
            } else if ("code-assist".equals(model)) {
                return "💻 **[CodeAssist AI - Minh họa OOP Java]**:\n```java\n" +
                       "// Minh họa Kế thừa & Đa hình trong Java\n" +
                       "public abstract class Animal { private String name; public abstract void makeSound(); }\n" +
                       "public class Dog extends Animal {\n" +
                       "    public Dog(String name) { super(); }\n" +
                       "    @Override public void makeSound() { System.out.println(\"Gâu gâu!\"); }\n" +
                       "}\n```\n👉 OOP giúp hệ thống dễ bảo trì và mở rộng!";
            } else if ("edubrain".equals(model) || "edubrain-guide".equals(model)) {
                return "📘 **[EduBrain Study Guide - Ôn tập OOP]**:\n\n" +
                       "1. **Trọng tâm thi**: Thường chiếm 25-30% đề thi trắc nghiệm Java Core.\n" +
                       "2. **Cần nhớ**: Phân biệt Abstract Class vs Interface, Overriding vs Overloading.\n" +
                       "3. **Thực hành**: Làm câu hỏi tự luyện tại tab **Bài kiểm tra**!";
            } else {
                return "🧠 **[Gemini 1.5 Pro - Phân tích Chuyên sâu OOP]**:\n\n" +
                       "**OOP (Object-Oriented Programming)** là phương pháp thiết kế phần mềm cốt lõi dựa trên 4 trụ cột:\n\n" +
                       "1. **Tính Đóng gói (Encapsulation)**: Bảo vệ thuộc tính nội bộ bằng `private` và cung cấp truy cập an toàn.\n" +
                       "2. **Tính Kế thừa (Inheritance)**: Cho phép lớp con thừa hưởng và mở rộng thuộc tính/phương thức từ lớp cha.\n" +
                       "3. **Tính Đa hình (Polymorphism)**: Một phương thức có thể thực thi khác nhau tùy thuộc vào đối tượng thực tế.\n" +
                       "4. **Tính Trừu tượng (Abstraction)**: Tập trung vào tính chất cốt lõi của đối tượng, ẩn đi chi tiết cài đặt phức tạp.";
            }
        }

        // 2. REST API & HTTP METHODS
        if (lower.contains("rest api") || lower.contains("restful") || lower.contains("rest")) {
            if ("gemini-flash".equals(model)) {
                return "⚡ **[Gemini 1.5 Flash - Tóm tắt REST API]**:\n\n" +
                       "• **Khái niệm**: Kiến trúc giao tiếp Web API dựa trên HTTP Stateless.\n" +
                       "• **Các Phương thức**: GET (Lấy dữ liệu), POST (Tạo mới), PUT/PATCH (Sửa), DELETE (Xóa).\n" +
                       "• **Định dạng dữ liệu**: Chuẩn JSON hoặc XML.";
            } else if ("code-assist".equals(model)) {
                return "💻 **[CodeAssist AI - Rest Controller Java]**:\n```java\n" +
                       "@RestController\n" +
                       "@RequestMapping(\"/api/v1/courses\")\n" +
                       "public class CourseController {\n" +
                       "    @GetMapping public List<CourseDto> getAll() { return courseService.findAll(); }\n" +
                       "}\n```";
            } else if ("edubrain".equals(model) || "edubrain-guide".equals(model)) {
                return "📘 **[EduBrain Study Guide - Ôn tập REST API]**:\n\n" +
                       "1. Nắm chắc cấu trúc HTTP Status Codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Error.\n" +
                       "2. Thực hành kiểm thử bằng Postman hoặc Swagger UI.";
            } else {
                return "🧠 **[Gemini 1.5 Pro - Phân tích Kiến trúc REST API]**:\n\n" +
                       "**REST (Representational State Transfer)** là kiểu kiến trúc phần mềm phổ biến cho Web Services:\n" +
                       "• **Stateless**: Mỗi request chứa đủ thông tin xác thực (ví dụ JWT Header), server không lưu session.\n" +
                       "• **Client-Server**: Tách biệt hoàn toàn giao diện người dùng và xử lý nghiệp vụ backend.\n" +
                       "• **Resource-Based**: Quản lý tài nguyên qua URIs hợp lý.";
            }
        }

        // 3. SPRING BOOT & SPRING SECURITY
        if (lower.contains("spring boot") || lower.contains("spring security") || lower.contains("spring")) {
            if ("gemini-flash".equals(model)) {
                return "⚡ **[Gemini 1.5 Flash]**:\n• **Spring Boot 3**: Framework Java phát triển Web API doanh nghiệp.\n• **Spring Security 6**: Xác thực & phân quyền JWT Stateless.";
            } else if ("code-assist".equals(model)) {
                return "💻 **[CodeAssist AI]**:\n```java\n@Configuration @EnableWebSecurity\npublic class SecurityConfig {\n" +
                       "    @Bean public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n" +
                       "        return http.csrf(AbstractHttpConfigurer::disable).authorizeHttpRequests(auth -> auth.anyRequest().authenticated()).build();\n" +
                       "    }\n}\n```";
            } else {
                return "🧠 **[Gemini 1.5 Pro - Phân tích Spring Boot 3]**:\n\n" +
                       "Spring Boot 3 giúp phát triển REST APIs nhanh chóng với các ưu điểm: Auto-Configuration, nhúng sẵn Tomcat Server, tích hợp Spring Security 6 và Hibernate JPA với PostgreSQL.";
            }
        }

        // 4. DỊCH THUẬT TIẾNG PHÁP & TỪ VỰNG
        if (lower.contains("nụ hôn") && (lower.contains("tiếng pháp") || lower.contains("pháp"))) {
            return "🧠 **[Gemini 1.5 Pro - Dịch thuật Tiếng Pháp]**:\n\n" +
                   "Trong tiếng Pháp:\n" +
                   "• **Danh từ (Nụ hôn)**: **« un baiser »** (từ thân mật là **« un bisou »**).\n" +
                   "• **Động từ (Hôn)**: **« embrasser »** (hoặc **« baiser »**).\n" +
                   "• **Nụ hôn kiểu Pháp (French kiss)**: **« un baiser amoureux »**.\n\n" +
                   "💡 *Ví dụ câu*: *\"Je t'embrasse fort\"* (Gửi đến bạn nụ hôn nồng thắm!).";
        }

        if (lower.contains("thủ đô") && lower.contains("pháp")) {
            return "🧠 **[Gemini 1.5 Pro]**: Thủ đô của nước Pháp là thành phố **Paris** (nổi tiếng với tháp Eiffel, bảo tàng Louvre và dòng sông Seine).";
        }

        if (lower.contains("nước sôi")) {
            return "🧠 **[Gemini 1.5 Pro]**: Nước nguyên chất sôi ở nhiệt độ **100°C** (212°F) ở áp suất tiêu chuẩn 1 atm.";
        }

        // 5. GIAO TIẾP & PERSONA
        if (lower.contains("bạn là ai") || lower.contains("bạn tên gì") || lower.contains("tên là gì")) {
            return "🧠 **[OmniBrain AI Platform]**:\n\nTôi là **OmniBrain AI Platform** - Trợ lý trí tuệ nhân tạo thế hệ mới của UniLMS (ICTU Style).\nTôi hỗ trợ bạn giải toán, giải đáp lý thuyết lập trình, dịch thuật và hỗ trợ học tập tín chỉ 24/7!";
        }

        if (lower.contains("chào") || lower.contains("hi") || lower.contains("hello")) {
            return "👋 Xin chào! **OmniBrain AI Platform** rất vui được hỗ trợ bạn. Bạn muốn tra cứu bài học, giải toán hay câu hỏi lập trình nào hôm nay?";
        }

        if (lower.contains("cảm ơn") || lower.contains("thanks")) {
            return "😊 Rất vui được hỗ trợ bạn! Chúc bạn học tập thật tốt trên UniLMS!";
        }

        // 6. DYNAMIC THEORY SYNTHESIZER FOR ANY OPEN QUESTION (E.G. "... LÀ GÌ", "KHÁI NIỆM ...")
        if (lower.contains("là gì") || lower.contains("khái niệm") || lower.contains("định nghĩa") || lower.contains("tại sao") || lower.contains("như thế nào")) {
            String topic = input.replaceAll("(?i)(là gì|khái niệm|định nghĩa|tại sao|như thế nào|hãy cho biết|giải thích|chi tiết|bằng|cho|tôi)", "").trim();
            if (topic.isEmpty()) topic = input;

            if ("gemini-flash".equals(model)) {
                return "⚡ **[Gemini 1.5 Flash - Tóm tắt Lý thuyết Nhanh]**:\n\n" +
                       "• **Chủ đề**: *" + topic + "*\n" +
                       "• **Giải đáp**: *" + topic + "* là một khái niệm quan trọng. Để nắm vững, bạn cần hiểu định nghĩa cơ bản, nguyên lý hoạt động và tính ứng dụng của nó trong thực tế.";
            } else if ("code-assist".equals(model)) {
                return "💻 **[CodeAssist AI - Kỹ thuật & Thực hành]**:\n\n" +
                       "• **Chủ đề**: *" + topic + "*\n" +
                       "• **Minh họa lập trình**: Áp dụng khái niệm *" + topic + "* vào xây dựng mã nguồn giúp tăng tính module và hiệu năng phần mềm.";
            } else if ("edubrain".equals(model) || "edubrain-guide".equals(model)) {
                return "📘 **[EduBrain Study Guide - Lộ trình Học tập]**:\n\n" +
                       "Đối với câu hỏi về *" + topic + "*:\n" +
                       "1. **Tài liệu**: Đọc chương Slide tương ứng tại tab **Môn học**.\n" +
                       "2. **Ôn luyện**: Làm câu hỏi trắc nghiệm liên quan tại tab **Bài kiểm tra**.\n" +
                       "3. **Thảo luận**: Nhắn tin với Giảng viên để được hướng dẫn thêm.";
            } else {
                return "🧠 **[Gemini 1.5 Pro - Phân tích Lý thuyết Chuyên sâu]**:\n\n" +
                       "Giải đáp khái niệm: **\"" + topic + "\"**\n\n" +
                       "Khái niệm *" + topic + "* đóng vai trò quan trọng trong việc xây dựng nền tảng tư duy và thực hành. Hãy tham khảo Slide bài giảng và ngân hàng câu hỏi để củng cố kiến thức!";
            }
        }

        // Catch-all response for open conversational text
        if ("gemini-flash".equals(model)) {
            return "⚡ **[Gemini 1.5 Flash - Phản hồi Siêu Tốc]**:\n\n" +
                   "Trợ lý AI đã ghi nhận yêu cầu: *" + input + "*.\n" +
                   "Bạn có thể tiếp tục đặt các câu hỏi về bài giảng, thuật ngữ lập trình hoặc bài tập toán học!";
        }

        return "🧠 **[Gemini 1.5 Pro - Phân tích Tri thức]**:\n\n" +
               "Giải đáp cho câu hỏi: **\"" + input + "\"**\n\n" +
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
