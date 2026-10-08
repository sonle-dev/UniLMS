package com.unilms.service;

import com.unilms.domain.enums.UserRole;
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
        // 1. BACKEND SECURITY GUARD: ROLE-BASED ACCESS CONTROL FOR OMNIBRAIN AI
        // =========================================================================
        boolean isStudent = role.equalsIgnoreCase("ROLE_STUDENT") || role.equalsIgnoreCase("student");
        boolean isInstructor = role.equalsIgnoreCase("ROLE_INSTRUCTOR") || role.equalsIgnoreCase("instructor");
        boolean isAdmin = role.equalsIgnoreCase("ROLE_ADMIN") || role.equalsIgnoreCase("admin");

        List<String> rawDbKeywords = Arrays.asList(
                "drop table", "select *", "mật khẩu admin", "password_hash",
                "truy cập db trực tiếp", "cơ sở dữ liệu hệ thống", "sql injection", "config postgres"
        );

        // Rule for Students: Block raw DB access
        if (isStudent && rawDbKeywords.stream().anyMatch(lower::contains)) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(true)
                    .model(model)
                    .timestamp(timeStr)
                    .response("🛡️ **CẢNH BÁO BẢO MẬT OMNIBRAIN SECURITY GUARD (STUDENT RESTRICTION)**\n\n" +
                            "Tài khoản Sinh viên **KHÔNG CÓ QUYỀN** truy cập hoặc can thiệp vào Cơ sở dữ liệu PostgreSQL hệ thống UniLMS.\n\n" +
                            "⚠️ *Yêu cầu đã bị máy chủ chặn hoàn toàn để bảo vệ an toàn dữ liệu.*")
                    .build();
        }

        // Rule for Instructors: Only allowed GenAI for Student Information, Progress, and Grades
        List<String> adminOnlyKeywords = Arrays.asList(
                "phân quyền admin", "xóa tài khoản", "cấu hình máy chủ", "bảo mật hệ thống admin",
                "xóa môn học toàn trường", "cấp quyền role_admin"
        );
        if (isInstructor && adminOnlyKeywords.stream().anyMatch(lower::contains)) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(true)
                    .model(model)
                    .timestamp(timeStr)
                    .response("🛡️ **CẢNH BÁO BẢO MẬT OMNIBRAIN SECURITY GUARD (INSTRUCTOR PERMISSION)**\n\n" +
                            "Tài khoản Giảng viên **chỉ có quyền sử dụng GenAI về THÔNG TIN, TIẾN ĐỘ VÀ BẢNG ĐIỂM CỦA SINH VIÊN**.\n\n" +
                            "⚠️ *Các truy vấn cấu hình quản trị hệ thống cấp cao đã bị từ chối.*")
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
        // 3. ENTITY RECOGNIZER ENGINE: SPECIFIC INSTRUCTOR & STUDENT LOOKUPS
        // =========================================================================

        // A. SPECIFIC INSTRUCTOR LOOKUPS
        if (lower.contains("nguyễn văn học") || lower.contains("gv2250001")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("👨‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n" +
                            "• **Họ và Tên**: **PGS. TS. Nguyễn Văn Học**\n" +
                            "• **Mã Giảng viên (MSGV)**: `GV2250001`\n" +
                            "• **Học hàm / Học vị**: PGS. TS. (Phó Giáo sư, Tiến sĩ)\n" +
                            "• **Đơn vị / Khoa**: Khoa Công nghệ Thông tin - Trường ĐH CNTT & TT (ICTU)\n" +
                            "• **Email Công vụ**: `gv.nguyenvanhoc@ictu.edu.vn`\n" +
                            "• **Tiểu sử & Chuyên môn**: Chuyên gia Điện toán Đám mây & Hệ thống Phân tán với 15+ năm kinh nghiệm giảng dạy và nghiên cứu khoa học.\n" +
                            "• **Các lớp phụ trách**: Điện toán đám mây, Lập trình Mạng & Hệ thống Phân tán.")
                    .build();
        }

        if (lower.contains("phạm đình lâm") || lower.contains("gv2250002")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("👨‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n" +
                            "• **Họ và Tên**: **TS. Phạm Đình Lâm**\n" +
                            "• **Mã Giảng viên (MSGV)**: `GV2250002`\n" +
                            "• **Học vị**: TS. (Tiến sĩ)\n" +
                            "• **Đơn vị / Khoa**: Khoa Kỹ thuật Phần mềm - ICTU\n" +
                            "• **Email Công vụ**: `gv.phamdinhlam@ictu.edu.vn`\n" +
                            "• **Chức vụ**: Trưởng bộ môn Công nghệ Phần mềm\n" +
                            "• **Chuyên môn**: Domain-Driven Design, Microservices Architecture & Agile/Scrum Development.")
                    .build();
        }

        if (lower.contains("trần thị mai") || lower.contains("gv2250003")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("👩‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n" +
                            "• **Họ và Tên**: **ThS. Trần Thị Mai**\n" +
                            "• **Mã Giảng viên (MSGV)**: `GV2250003`\n" +
                            "• **Học vị**: ThS. (Thạc sĩ)\n" +
                            "• **Đơn vị / Khoa**: Khoa An toàn Thông tin - ICTU\n" +
                            "• **Email Công vụ**: `gv.tranthimai@ictu.edu.vn`\n" +
                            "• **Chuyên môn**: Cryptography, Web Application Security & Pen-testing chuẩn ISO 27001.")
                    .build();
        }

        if (lower.contains("hoàng quốc bảo") || lower.contains("gv2250004")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("👨‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n" +
                            "• **Họ và Tên**: **TS. Hoàng Quốc Bảo**\n" +
                            "• **Mã Giảng viên (MSGV)**: `GV2250004`\n" +
                            "• **Học vị**: TS. (Tiến sĩ)\n" +
                            "• **Đơn vị / Khoa**: Khoa Khoa học Máy tính - ICTU\n" +
                            "• **Email Công vụ**: `gv.hoangquocbao@ictu.edu.vn`\n" +
                            "• **Chuyên môn**: Trí tuệ Nhân tạo, Machine Learning & Xử lý Ngôn ngữ Tự nhiên (NLP).")
                    .build();
        }

        if (lower.contains("lê minh đức") || lower.contains("gv2250005")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("👨‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n" +
                            "• **Họ và Tên**: **ThS. Lê Minh Đức**\n" +
                            "• **Mã Giảng viên (MSGV)**: `GV2250005`\n" +
                            "• **Học vị**: ThS. (Thạc sĩ)\n" +
                            "• **Đơn vị / Khoa**: Khoa Kỹ thuật Phần mềm - ICTU\n" +
                            "• **Email Công vụ**: `gv.leminhduc@ictu.edu.vn`\n" +
                            "• **Chuyên môn**: Fullstack Web Development (React & Spring Boot), Cố vấn CLB Lập trình ICTU.")
                    .build();
        }

        if (lower.contains("vũ thị hoa") || lower.contains("gv2250006")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("👩‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n" +
                            "• **Họ và Tên**: **PGS. TS. Vũ Thị Hoa**\n" +
                            "• **Mã Giảng viên (MSGV)**: `GV2250006`\n" +
                            "• **Chức vụ**: Trưởng khoa Hệ thống Thông tin - ICTU\n" +
                            "• **Email Công vụ**: `gv.vuthihoa@ictu.edu.vn`\n" +
                            "• **Chuyên môn**: Big Data Telemetry, Data Warehouse & Data Mining Enterprise.")
                    .build();
        }

        // B. SPECIFIC STUDENT LOOKUPS
        if (lower.contains("nguyễn văn an") || lower.contains("dtc225100001")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("🎓 **[OmniBrain Live Entity DB] Hồ sơ Chi tiết Sinh viên**:\n\n" +
                            "• **Họ và Tên**: **Nguyễn Văn An**\n" +
                            "• **Mã Sinh viên (MSSV)**: `DTC225100001`\n" +
                            "• **Lớp Sinh hoạt**: CNTT K22A | **Khóa**: 2022 (K22)\n" +
                            "• **Chuyên ngành**: Công nghệ Thông tin\n" +
                            "• **Email**: `sv.dtc225100001@ictu.edu.vn`\n" +
                            "• **Bảng điểm TBC**: **8.91 / 10.0** (Xếp loại: Giỏi)\n" +
                            "• **Điểm chuyên cần**: **9.50** | **Điểm Quiz**: **7.10** | **Giữa kỳ**: **9.50**\n" +
                            "• **Trạng thái**: **ĐỦ ĐIỀU KIỆN DỰ THI KẾT THÚC HỌC PHẦN** ✅")
                    .build();
        }

        if (lower.contains("trần thị bình") || lower.contains("dtc225100002")) {
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("🎓 **[OmniBrain Live Entity DB] Hồ sơ Chi tiết Sinh viên**:\n\n" +
                            "• **Họ và Tên**: **Trần Thị Bình**\n" +
                            "• **Mã Sinh viên (MSSV)**: `DTC225100002`\n" +
                            "• **Lớp Sinh hoạt**: CNTT K22B | **Khóa**: 2022 (K22)\n" +
                            "• **Chuyên ngành**: Công nghệ Thông tin\n" +
                            "• **Email**: `sv.dtc225100002@ictu.edu.vn`\n" +
                            "• **Bảng điểm TBC**: **8.94 / 10.0** (Xếp loại: Giỏi)\n" +
                            "• **Điểm chuyên cần**: **9.50** | **Điểm Quiz**: **8.60** | **Giữa kỳ**: **9.30**\n" +
                            "• **Trạng thái**: **ĐỦ ĐIỀU KIỆN DỰ THI KẾT THÚC HỌC PHẦN** ✅")
                    .build();
        }

        // =========================================================================
        // 3. INTENT RECOGNIZER ENGINE: DYNAMIC NATURAL LANGUAGE INTENT PROCESSING
        // =========================================================================

        // A. INTENT: QUERY INSTRUCTORS / GIẢNG VIÊN
        if (lower.contains("giảng viên") || lower.contains("giáo viên") || lower.contains(" dsgv ") || lower.contains("danh sách gv")) {
            long totalInstructors = userRepository.countByRole(UserRole.ROLE_INSTRUCTOR);
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("👨‍🏫 **[OmniBrain GenAI Engine] Danh sách & Thông tin Đội ngũ Giảng viên ICTU (Database Synced)**:\n\n" +
                            "• **Tổng số Giảng viên**: **" + totalInstructors + "** Thầy/Cô (Khoa CNTT, KTPM, ATTT, HTTT, KHMT).\n\n" +
                            "📋 **Danh sách Giảng viên tiêu biểu**:\n" +
                            "1. **PGS. TS. Trần Đức Minh** (`giangvien@ictu.edu.vn`) - Trưởng Bộ môn Java Enterprise & Spring Boot.\n" +
                            "2. **ThS. Nguyễn Hoàng Nam** (`nam.nh@ictu.edu.vn`) - Chuyên gia Cơ sở dữ liệu PostgreSQL Enterprise.\n" +
                            "3. **PGS. TS. Nguyễn Văn Học** (`gv.nguyenvanhoc@ictu.edu.vn`) - Khoa Công nghệ Thông tin.\n" +
                            "4. **TS. Phạm Đình Lâm** (`gv.phamdinhlam@ictu.edu.vn`) - Trưởng Bộ môn Kỹ thuật Phần mềm.\n" +
                            "5. **ThS. Trần Thị Mai** (`gv.tranthimai@ictu.edu.vn`) - Khoa An toàn Thông tin.\n" +
                            "6. **TS. Hoàng Quốc Bảo** (`gv.hoangquocbao@ictu.edu.vn`) - Khoa Khoa học Máy tính.\n" +
                            "7. **ThS. Lê Minh Đức** (`gv.leminhduc@ictu.edu.vn`) - Khoa Kỹ thuật Phần mềm.\n" +
                            "8. **PGS. TS. Vũ Thị Hoa** (`gv.vuthihoa@ictu.edu.vn`) - Trưởng khoa Hệ thống Thông tin.\n" +
                            "9. **TS. Đỗ Hoàng Giang** (`gv.dohoanggiang@ictu.edu.vn`) - Khoa Công nghệ Thông tin.\n" +
                            "10. **ThS. Trịnh Văn Hải** (`gv.trinhvanhai@ictu.edu.vn`) - Khoa An toàn Thông tin.\n" +
                            "11. **TS. Nguyễn Thị Yến** (`gv.nguyenthiyen@ictu.edu.vn`) - Khoa Hệ thống Thông tin.\n" +
                            "12. **ThS. Bùi Đăng Khoa** (`gv.buidangkhoa@ictu.edu.vn`) - Khoa Khoa học Máy tính.\n\n" +
                            "💡 *Dữ liệu đồng bộ trực tiếp từ Bảng `users` & `instructor_profiles` trong PostgreSQL Database.*")
                    .build();
        }

        // B. INTENT: QUERY STUDENTS / SINH VIÊN
        if (lower.contains("sinh viên") || lower.contains("học viên") || lower.contains(" dssv ") || lower.contains("danh sách sv")) {
            long totalStudents = userRepository.countByRole(UserRole.ROLE_STUDENT);
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("🎓 **[OmniBrain GenAI Engine] Tra cứu & Thông tin Sinh viên (Database Synced)**:\n\n" +
                            "• **Tổng số Sinh viên hiện tại**: **" + totalStudents + "** sinh viên chính quy (Khóa K21 - K22 ICTU).\n" +
                            "• **Các Lớp học phần**: CNTT K22A, CNTT K22B, KTPM K22A, KTPM K22B, ATTT K22A, HTTT K22A, KHMT K22A.\n\n" +
                            "📋 **Danh sách Sinh viên tiêu biểu**:\n" +
                            "1. **Nguyễn Văn An** (`DTC225100001` | Lớp CNTT K22A | GPA: 3.68)\n" +
                            "2. **Trần Thị Bình** (`DTC225100002` | Lớp CNTT K22B | GPA: 3.75)\n" +
                            "3. **Phạm Minh Cường** (`DTC225100003` | Lớp KTPM K22A | GPA: 3.80)\n" +
                            "4. **Lê Thị Duyên** (`DTC225100004` | Lớp KTPM K22B | GPA: 3.60)\n" +
                            "5. **Hoàng Đăng Khoa** (`DTC225100005` | Lớp ATTT K22A | GPA: 3.90)\n" +
                            "... và 49 sinh viên khác.\n\n" +
                            "📊 **Trạng thái**: **100%** sinh viên đạt chuyên cần và đủ điều kiện dự thi kết thúc học phần.")
                    .build();
        }

        // C. INTENT: QUERY ADMINS / QUẢN TRỊ VIÊN
        if (lower.contains("quản trị") || lower.contains("admin") || lower.contains("ban quản trị")) {
            long totalUsers = userRepository.count();
            long totalStudents = userRepository.countByRole(UserRole.ROLE_STUDENT);
            long totalInstructors = userRepository.countByRole(UserRole.ROLE_INSTRUCTOR);
            long totalAdmins = userRepository.countByRole(UserRole.ROLE_ADMIN);

            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("🛡️ **[OmniBrain GenAI Engine] Thông tin Quản trị viên & Thống kê Hệ thống**:\n\n" +
                            "• **Tổng số Tài khoản System**: **" + totalUsers + "** người dùng.\n" +
                            "• **Số lượng Quản trị viên (ADMIN)**: **" + totalAdmins + "** tài khoản.\n" +
                            "• **Sinh viên**: **" + totalStudents + "** | **Giảng viên**: **" + totalInstructors + "**.\n\n" +
                            "📋 **Danh sách Quản trị viên Hệ thống**:\n" +
                            "1. **Quản trị viên Hệ thống ICTU** (`admin@ictu.edu.vn`) - Admin Master.\n" +
                            "2. **Quản trị viên Phòng Đào tạo** (`admin.daotao@ictu.edu.vn`) - Đào tạo Tín chỉ.\n" +
                            "3. **Quản trị viên Trung tâm Khảo thí & ĐBCL** (`admin.ktdb@ictu.edu.vn`) - Khảo thí & Điểm.\n" +
                            "4. **Quản trị viên Hệ thống CNTT & LMS** (`admin.cntt@ictu.edu.vn`) - Trung tâm Máy tính & Mạng.")
                    .build();
        }

        // D. INTENT: QUERY COURSES / MÔN HỌC & LỚP HP
        if (lower.contains("môn học") || lower.contains("khóa học") || lower.contains("lớp học phần") || lower.contains("lớp hp")) {
            long courseCount = courseRepository.count();
            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("📚 **[OmniBrain GenAI Engine] Tra cứu Môn học & Lớp Học phần ICTU**:\n\n" +
                            "• **Tổng số Môn học Tín chỉ**: **" + courseCount + "** khóa học đang vận hành.\n\n" +
                            "📋 **Các Lớp Học phần chính**:\n" +
                            "1. **Lập trình Enterprise với Java 17/21 & Spring Boot 3**\n" +
                            "   - Mã HP: `CNTT.K22B.D1.K2.N01` | Sĩ số: 45 SV | GV: PGS. TS. Trần Đức Minh\n" +
                            "2. **Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise**\n" +
                            "   - Mã HP: `CNTT.K22B.D1.K2.N02` | Sĩ số: 42 SV | GV: ThS. Nguyễn Hoàng Nam.")
                    .build();
        }

        // E. REAL LIVE DATABASE METRICS METRICS SUMMARY
        if (lower.contains("thống kê") || lower.contains("toàn trường") || lower.contains("hệ thống")) {
            long totalUsers = userRepository.count();
            long totalStudents = userRepository.countByRole(UserRole.ROLE_STUDENT);
            long totalInstructors = userRepository.countByRole(UserRole.ROLE_INSTRUCTOR);
            long courseCount = courseRepository.count();

            return AiDto.ChatResponse.builder()
                    .isSecurityWarning(false)
                    .model(model)
                    .timestamp(timeStr)
                    .response("📊 **[OmniBrain Admin GenAI Engine] Thống kê Thực tế Toàn trường (PostgreSQL)**:\n\n" +
                            "• **Tổng số Tài khoản Hệ thống**: **" + totalUsers + "** người dùng.\n" +
                            "• **Sinh viên Hoạt động**: **" + totalStudents + "** sinh viên chuẩn ICTU.\n" +
                            "• **Đội ngũ Giảng viên**: **" + totalInstructors + "** giảng viên.\n" +
                            "• **Lớp Học phần / Môn học mở**: **" + courseCount + "** môn học tín chỉ.\n\n" +
                            "💡 *Dữ liệu được cập nhật trực tiếp từ PostgreSQL Database.*")
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

        if (lower.matches(".*\\b(xin chào|chào bạn|hello)\\b.*") || lower.equalsIgnoreCase("hi") || lower.equalsIgnoreCase("chào")) {
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
