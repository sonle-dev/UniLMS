# UniLMS - Rules & Context cho AI Assistant (Antigravity)

Tệp này chứa thông tin ngữ cảnh chính của dự án UniLMS để AI Assistant tự động đọc và hiểu ngay khi khởi động phiên làm việc.

---

## 📌 1. Thông tin chung
* **Tên dự án**: UniLMS (Enterprise Learning Management System - ICTU Style)
* **Đối tượng**: Hệ thống quản lý học tập tích hợp cho các trường đại học / cơ sở giáo dục tại Việt Nam (theo chuẩn lms.ictu.edu.vn).
* **Mô hình**: Monorepo gồm 2 phân hệ chính: `backend` và `frontend`.

---

## 🏗 2. Kiến trúc & Công nghệ

### 🔹 Backend (`/backend`)
* **Core**: Java 17/23, Spring Boot 3.2.3, Maven multi-module root `pom.xml`.
* **Database & Migration**: PostgreSQL 15+, Flyway (`backend/src/main/resources/db/migration/`):
  * `V1__initial_lms_schema.sql`: Cấu trúc cơ sở dữ liệu ban đầu.
  * `V2__add_is_published_to_courses.sql`: Bổ sung cột `is_published` cho bảng `courses`.
  * `V3__align_schema_with_entities.sql`: Đồng bộ cột `question_text`, `options`, `correct_option` cho `quiz_questions`.
  * `V4__enterprise_lms_production_schema.sql`: Master Schema Enterprise PostgreSQL (PL/pgSQL Trigger tự động `updated_at`, Lớp học phần `course_sections`, Bảng điểm `student_grades`, Audit logs `audit_logs`, Index B-Tree / GIN JSONB, và Seed Data Master chuẩn ICTU).
* **Cache**: Redis (`spring-boot-starter-data-redis`).
* **Security & Auth**: Spring Security 6, JWT (`io.jsonwebtoken 0.11.5`), CORS.
* **API Base Path**: `/api/v1` (Port 8080).
* **Cấu trúc Package (`com.unilms`)**:
  * `controller`: [AuthController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/AuthController.java), [CourseController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/CourseController.java), [ProgressController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/ProgressController.java), [QuizController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/QuizController.java), [CertificateController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/CertificateController.java).
  * `domain/entity`: `User`, `StudentProfile`, `Course`, `ModuleEntity`, `Lesson`, `LessonProgress`, `Quiz`, `QuizQuestion`, `QuizSubmission`, `Certificate`.
  * `domain/enums`: `UserRole` (`ADMIN`, `INSTRUCTOR`, `STUDENT`), `ContentType`.
  * `dto`: `AuthDto`, `CourseDto`, `ProgressDto`, `QuizDto`, `CertificateDto`.
  * `repository`: Các interface `JpaRepository`.
  * `security`: `SecurityConfig`, `JwtAuthenticationFilter`, `JwtTokenProvider`, `CustomUserDetailsService`, `UserPrincipal`.

### 🔹 Frontend (`/frontend`)
* **Core**: React 18, Vite 5, JSX, ES Modules.
* **Styling**: Tailwind CSS v3, PostCSS, Lucide Icons (`lucide-react`).
* **Trang chính (`frontend/src/pages/`)**:
  * **Phân hệ Sinh viên**:
    * [StudentDashboard.jsx](file:///d:/UniLMS/frontend/src/pages/StudentDashboard.jsx): Dashboard học viên (Banner Mobile App QR Code + Lớp học phần kỳ hiện tại).
    * [ScheduleView.jsx](file:///d:/UniLMS/frontend/src/pages/ScheduleView.jsx): Thời khóa biểu tuần 7 ngày với bộ lọc năm học/học kỳ.
    * [SkillsView.jsx](file:///d:/UniLMS/frontend/src/pages/SkillsView.jsx): Lịch sử kiểm tra kỹ năng (Lưu kết quả tự động từ QuizEngine).
    * [ProjectsView.jsx](file:///d:/UniLMS/frontend/src/pages/ProjectsView.jsx): Bảng danh sách dự án môn học, nhóm & số điện thoại Giảng viên.
    * [GradesView.jsx](file:///d:/UniLMS/frontend/src/pages/GradesView.jsx): Tra cứu bảng điểm chi tiết (Điểm danh, Quiz, TX1-4, TBC & Đủ điều kiện thi).
    * [ProfileView.jsx](file:///d:/UniLMS/frontend/src/pages/ProfileView.jsx): Hồ sơ cá nhân sinh viên & thông báo tạm khóa chuẩn ICTU LMS.
    * [SettingsView.jsx](file:///d:/UniLMS/frontend/src/pages/SettingsView.jsx): Cấu hình hệ thống (Giao diện Sáng/Tối, Thông báo Email/Thi, Ngôn ngữ).
    * [HelpView.jsx](file:///d:/UniLMS/frontend/src/pages/HelpView.jsx): Trung tâm trợ giúp kỹ thuật ICTU & Form gửi ticket online.
  * **Phân hệ Giảng viên (`frontend/src/pages/instructor/`)**:
    * [InstructorDashboard.jsx](file:///d:/UniLMS/frontend/src/pages/instructor/InstructorDashboard.jsx): Dashboard giảng dạy, số SV & bài trắc nghiệm cần chấm.
    * [CourseManagementView.jsx](file:///d:/UniLMS/frontend/src/pages/instructor/CourseManagementView.jsx): Quản lý nội dung bài giảng, Pop-up Upload tài liệu/video bài giảng & ngân hàng câu hỏi trắc nghiệm.
    * [StudentRosterView.jsx](file:///d:/UniLMS/frontend/src/pages/instructor/StudentRosterView.jsx): Quản lý danh sách sinh viên lớp HP, tiến độ học bài (%), chuyên cần & gửi email nhắc nhở.
    * [GradeManagementView.jsx](file:///d:/UniLMS/frontend/src/pages/instructor/GradeManagementView.jsx): Nhập & duyệt điểm chuyên cần, quiz, TX1-4 của lớp HP.
  * **Phân hệ Quản trị viên (`frontend/src/pages/admin/`)**:
    * [AdminDashboard.jsx](file:///d:/UniLMS/frontend/src/pages/admin/AdminDashboard.jsx): Thống kê tổng quan toàn trường (Tài khoản, SV, GV, Lớp HP mở).
    * [UserManagementView.jsx](file:///d:/UniLMS/frontend/src/pages/admin/UserManagementView.jsx): Quản lý tài khoản người dùng, phân quyền, Thêm thủ công & Import hàng loạt từ file Excel/CSV, khóa/mở tài khoản.
    * [CourseAdminView.jsx](file:///d:/UniLMS/frontend/src/pages/admin/CourseAdminView.jsx): Quản lý môn học tín chỉ & mở Lớp học phần theo kỳ.
* **Components (`frontend/src/components/`)**:
  * [Header.jsx](file:///d:/UniLMS/frontend/src/components/Header.jsx): Topbar cố định với nút Hamburger, Role Switcher (Sinh viên, Giảng viên, Admin) & Tiêu đề trang.
  * [Sidebar.jsx](file:///d:/UniLMS/frontend/src/components/Sidebar.jsx): Left Sidebar linh hoạt thay đổi Menu theo Vai trò người dùng.
  * [OmniBrainChat.jsx](file:///d:/UniLMS/frontend/src/components/OmniBrainChat.jsx): OmniBrain AI Platform chat widget đa mô hình (Gemini 1.5 Pro, Flash, CodeAssist, EduBrain) với cơ chế OmniBrain Security Guard tự động chặn Sinh viên truy cập DB hệ thống.
  * [ChangePasswordModal.jsx](file:///d:/UniLMS/frontend/src/components/ChangePasswordModal.jsx): Pop-up modal đổi mật khẩu có validation.
  * [Toast.jsx](file:///d:/UniLMS/frontend/src/components/Toast.jsx): Thông báo dạng nổi góc màn hình.
  * `Footer.jsx`, `AuthModal.jsx`, `Breadcrumbs.jsx`, `SkeletonLoader.jsx`.

---

## 🚀 3. Hướng dẫn Chạy ứng dụng

### Backend
```bash
# Cách 1: Sử dụng Maven (nếu mvn đã có trong PATH hoặc Maven IntelliJ)
cd backend
& "D:\Idea\DATA IDEA\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run

# Cách 2: Sử dụng script bat ở thư mục gốc
d:\UniLMS\run_backend.bat
```
*Lưu ý*: Cần cài đặt và bật dịch vụ PostgreSQL (DB: `unilms_db`, User: `postgres`, Pass: `123`) và Redis (Host: `localhost:6379`).

### Frontend
```bash
cd frontend
npm install   # nếu chưa cài node_modules
npm run dev   # Chạy dev server tại http://localhost:5173
```

---

## 📝 4. Quy tắc lập trình & Lưu ý đối với AI Assistant
1. **Tự động Đọc & Cập nhật KI File (`GEMINI.md`)**: Đầu mỗi phiên làm việc luôn tự đọc file `GEMINI.md` để nắm ngữ cảnh. Sau mỗi thay đổi kiến trúc/tính năng mới, tự động cập nhật lại file này.
2. **Luôn giữ nguyên contract API giữa Frontend và Backend**: Đường dẫn API prefix `/api/v1`.
3. **Quy định Phân quyền**: ADMIN, INSTRUCTOR, STUDENT. Tuân thủ phân quyền theo JWT.
4. **Database Schema**: Tất cả thay đổi liên quan đến cấu trúc DB phải tạo thêm file migration trong `backend/src/main/resources/db/migration/` (ví dụ `V4__...sql`).
5. **Không viết lại từ đầu**: Khi sửa code, luôn bảo toàn comment và logic hiện có trừ khi được chỉ định.

