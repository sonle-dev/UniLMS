# UniLMS - Rules & Context cho AI Assistant (Antigravity)

Tệp này chứa thông tin ngữ cảnh chính của dự án UniLMS để AI Assistant tự động đọc và hiểu ngay khi khởi động phiên làm việc.

---

## 📌 1. Thông tin chung
* **Tên dự án**: UniLMS (Enterprise Learning Management System - ICTU Style)
* **Đối tượng**: Hệ thống quản lý học tập tích hợp cho các trường đại học / cơ sở giáo dục tại Việt Nam (theo chuẩn lms.ictu.edu.vn).
* **Mô hình chuẩn hóa (Single Source of Truth)**: Monorepo gồm 2 phân hệ chính thức: `backend` (Spring Boot) và `frontend` (React + Vite).
* **Lưu trữ lịch sử**: Các bản prototype tĩnh ban đầu (HTML/CSS/JS thuần `EduPortal`) đã được dọn dẹp và lưu trữ trong `archive/legacy_eduportal/` nhằm tránh nhầm lẫn.

---

## 🏗 2. Kiến trúc & Công nghệ

### 🔹 Backend (`/backend`)
* **Core**: Java 17/23, Spring Boot 3.2.3, Maven multi-module root `pom.xml`.
* **Database & Migration**: PostgreSQL 15+, Flyway (`backend/src/main/resources/db/migration/`):
  * `V1__initial_lms_schema.sql`: Cấu trúc cơ sở dữ liệu ban đầu.
  * `V2__add_is_published_to_courses.sql`: Bổ sung cột `is_published` cho bảng `courses`.
  * `V3__align_schema_with_entities.sql`: Đồng bộ cột `question_text`, `options`, `correct_option` cho `quiz_questions`.
  * `V4__enterprise_lms_production_schema.sql`: Master Schema Enterprise PostgreSQL (PL/pgSQL Trigger tự động `updated_at`, Lớp học phần `course_sections`, Bảng điểm `student_grades`, Audit logs `audit_logs`, Index B-Tree / GIN JSONB, và Seed Data Master chuẩn ICTU).
  * `V5__convert_user_role_to_varchar.sql`: Chuyển đổi enum `user_role` thành VARCHAR(50) tương thích JPA/Hibernate 6.
  * `V6__update_seed_passwords.sql`: Cập nhật mật khẩu mã hóa BCrypt cho các tài khoản seed chính.
  * `V7__add_50_student_users.sql`: Thêm 50 tài khoản sinh viên chuẩn ICTU kèm hồ sơ cá nhân (`student_profiles`), đăng ký môn học (`enrollments`) và bảng điểm đầy đủ các đầu điểm (`student_grades`).
  * `V8__add_instructors_and_admins.sql`: Thêm 10 tài khoản Giảng viên chuẩn ICTU kèm hồ sơ giảng viên (`instructor_profiles`) và 3 tài khoản Quản trị viên hệ thống (`ROLE_ADMIN`).
  * `V9__create_course_materials_table.sql`: Tạo bảng `course_materials` lưu trữ danh mục tài liệu & bài giảng do Giảng viên và Quản trị viên đăng tải.
  * `V10__add_3_remaining_courses_and_sync_all_students_enrollments.sql`: Bổ sung 3 môn học còn thiếu vào DB (`c-103`, `c-104`, `c-105`), tạo các Lớp học phần (`course_sections`), đồng bộ tất cả 54 sinh viên vào đầy đủ 5 môn học kèm bảng điểm chi tiết, và phân công mỗi Giảng viên phụ trách đúng 1 môn học.
* **Cache**: Redis (`spring-boot-starter-data-redis`).
* **Security & Auth**: Spring Security 6, JWT (`io.jsonwebtoken 0.11.5`), CORS.
* **API Base Path**: `/api/v1` (Port 8080).
* **Cấu trúc Package (`com.unilms`)**:
  * `controller`: [AuthController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/AuthController.java), [CourseController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/CourseController.java), [CourseMaterialController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/CourseMaterialController.java), [ProgressController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/ProgressController.java), [QuizController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/QuizController.java), [CertificateController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/CertificateController.java), [AiController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/AiController.java), [AdminController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/AdminController.java), [InstructorController](file:///d:/UniLMS/backend/src/main/java/com/unilms/controller/InstructorController.java).
  * `domain/entity`: `User`, `StudentProfile`, `Course`, `ModuleEntity`, `Lesson`, `LessonProgress`, `CourseMaterial`, `Quiz`, `QuizQuestion`, `QuizSubmission`, `Certificate`.
  * `domain/enums`: `UserRole` (`ADMIN`, `INSTRUCTOR`, `STUDENT`), `ContentType`.
  * `dto`: `AuthDto`, `CourseDto`, `CourseMaterialDto`, `ProgressDto`, `QuizDto`, `CertificateDto`, `AiDto`.
  * `repository`: Các interface `JpaRepository` (bao gồm `CourseMaterialRepository`).
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
  * [OmniBrainChat.jsx](file:///d:/UniLMS/frontend/src/components/OmniBrainChat.jsx): OmniBrain AI Platform chat widget đa mô hình (Gemini 1.5 Pro, Flash, CodeAssist, EduBrain) kết nối trực tiếp với **OmniBrain AI Platform Local Orchestrator (`http://127.0.0.1:8000`)** ưu tiên chạy qua **Ollama Local Engine (`http://127.0.0.1:11434`)** (Qwen 2.5 7B, DeepSeek-R1 8B, LLaMA 3), tự động kiểm duyệt bảo mật qua OmniBrain Security Guard (RBAC). Tích hợp **Trình làm bài test thích ứng AI (Adaptive Quiz Card)** trực tiếp ngay trong luồng chat: kích hoạt qua nút bấm `[📝 Làm bài test thích ứng]` hoặc chat tự nhiên (có bộ lọc 3 lớp chống trùng từ khóa lý thuyết CNTT), chấm điểm tự động, giải thích chi tiết và đưa ra **Đánh giá & Nhận xét lộ trình cải thiện**, tự động đồng bộ kết quả sang [SkillsView.jsx](file:///d:/UniLMS/frontend/src/pages/SkillsView.jsx).
  * [ChangePasswordModal.jsx](file:///d:/UniLMS/frontend/src/components/ChangePasswordModal.jsx): Pop-up modal đổi mật khẩu có validation.
  * [Toast.jsx](file:///d:/UniLMS/frontend/src/components/Toast.jsx): Thông báo dạng nổi góc màn hình.
  * `Footer.jsx`, `AuthModal.jsx`, `Breadcrumbs.jsx`, `SkeletonLoader.jsx`.

### 🔹 AI Platform Orchestrator (`D:\OmniBrain AI Platform`)
* **Công nghệ**: Python 3.13, FastAPI (Port 8000), LiteLLM, NetworkX GraphRAG, Semantic Cache.
* **Mô hình cục bộ**: Ollama (Port 11434) chạy các model `qwen2.5:7b`, `deepseek-r1:8b`, `llama3:latest`.
* **Cơ chế điều phối**: Master Orchestrator ưu tiên xử lý qua Ollama Local -> Fallback Cloud LLM (Gemini/OpenRouter). Tích hợp đồng bộ dữ liệu LMS qua Tool Calling & REST API (`/api/v1/chat/completions`).
* **Kho tri thức Giáo trình 3 Tập (Train / Validation / Holdout Test) & Mesh GraphRAG**:
  * **Phân chia 3 tập chuẩn khoa học từ 814 chunks gốc (45 bài giảng x 5 môn)**:
    * **Tập 1 - Train Set (Tập Huấn Luyện - 568 chunks ~69.8%)**: Lưu trữ tại `benchmark_data/train_dataset.json`, được nạp trực tiếp vào GraphRAG Knowledge Base để mô hình AI học và nắm vững kiến thức.
    * **Tập 2 - Validation Set (Tập Xác Thực - 123 chunks ~15.1%)**: Lưu trữ tại `benchmark_data/val_dataset.json`, dùng để cân chỉnh tham số tìm kiếm, prompt tuning và xếp hạng độ liên quan.
    * **Tập 3 - Holdout Test Set (Tập Kiểm Thử Độc Lập - 123 chunks ~15.1% + 123 câu hỏi Benchmark)**: Lưu tại `benchmark_data/test_holdout/test_dataset_holdout.json` và `test_qa_benchmark.json`. **HOÀN TOÀN CÔ LẬP KHỎI KHO TRI THỨC (Không bị rò rỉ dữ liệu - Zero Data Leakage)**, chỉ dùng để chạy kiểm thử đánh giá cuối cùng qua `run_benchmark_test.py`.
  * **Cấu trúc Đồ thị Tri thức Đan Lưới (Full Mesh Knowledge Graph)**:
    * Đã tái tạo lại toàn bộ kho tri thức GraphRAG (`c-101` đến `c-105` và `lms`) chỉ sử dụng Tập 1 & Tập 2 (tổng 691 chunks):
      * `c-101`: 60 nodes, 1,018 edges, 79 chunks.
      * `c-102`: 34 nodes, 1,632 edges, 153 chunks.
      * `c-103`: 34 nodes, 1,510 edges, 153 chunks.
      * `c-104`: 32 nodes, 1,282 edges, 153 chunks.
      * `c-105`: 45 nodes, 3,391 edges, 153 chunks.
      * `lms`: **182 nodes, 8,838 edges, 691 chunks**.
    * **Mắc nối 3 chiều**: (1) Chuỗi bài học tuần tự (Session 1 $\rightarrow$ 9); (2) Đan lưới liên kết khái niệm đồng xuất hiện (Concept $\leftrightarrow$ Concept); (3) Cầu nối liên môn giữa 5 học phần (Java $\leftrightarrow$ PostgreSQL $\leftrightarrow$ Clean Architecture $\leftrightarrow$ Docker Linux $\leftrightarrow$ Agile Scrum).
  * **Cơ chế Tự động Đồng bộ (Auto-Sync)**: Khi Giảng viên tải tài liệu mới qua Web UniLMS (`CourseMaterialService.java`), Spring Boot tự động gửi bất đồng bộ (`CompletableFuture.runAsync`) sang OmniBrain `/api/v1/graph-rag/upload` để nạp tri thức vào kho kiến thức.
  * **Tích hợp Tự động làm giàu Ngữ cảnh (Chat Context Enrichment)**: Bộ lọc `_enrich_lms_context` trong `chat.py` tự động nhận diện câu hỏi học thuật/giáo trình, truy vấn đúng phân vùng môn học trong GraphRAG và đưa trích dẫn bài giảng vào System Prompt để AI trả lời chuẩn xác theo đúng giáo trình của trường.

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

### OmniBrain AI Platform (Orchestrator + Ollama)
```bash
# Cách 1: Sử dụng script bat 1-click
d:\UniLMS\run_omnibrain.bat

# Cách 2: Chạy trực tiếp từ thư mục OmniBrain
cd "D:\OmniBrain AI Platform"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install   # nếu chưa cài node_modules
npm run dev   # Chạy dev server tại http://localhost:5173
```

### ⚡ Khởi Động Toàn Bộ Hệ Thống (1-Click All-In-One)
```bash
# Khởi động cùng lúc Backend + OmniBrain AI + Frontend trong 3 cửa sổ độc lập:
d:\UniLMS\run_all.bat
```

### 🌐 Đưa Hệ Thống Lên Mạng Internet (Public Cloudflare Tunnel)
Để mở link public HTTPS cho toàn bộ hệ thống (Web + Backend + AI) ra ngoài Internet mà không cần mở port modem hay thuê VPS:
```bash
# Cách 1: Chạy file script 1-click tại thư mục gốc UniLMS
d:\UniLMS\run_public_internet.bat

# Cách 2: Chạy trực tiếp qua cloudflared CLI
& "d:\UniLMS\tools\cloudflared.exe" tunnel --url http://localhost:5173
```
*Cơ chế Gateway thống nhất qua Vite Proxy*:
* `http://localhost:5173/api` $\rightarrow$ Proxy tới Spring Boot Backend (Port 8080).
* `http://localhost:5173/ai-gateway` $\rightarrow$ Proxy tới OmniBrain AI Orchestrator (Port 8000).
* Chỉ cần mở 1 đường hầm Tunnel tới cổng 5173 là toàn bộ hệ thống (Web, DB, và Não AI Local Qwen/DeepSeek) chạy thông suốt trên Internet với chứng chỉ SSL HTTPS hoàn toàn miễn phí.

### 🎓 Bộ Tài Liệu Bảo Vệ Đồ Án Capstone (Group 2 - Lê Hồng Sơn)
Toàn bộ tài liệu chuẩn bị bảo vệ đồ án đã được khởi tạo hoàn tất tại `D:\Capstone-Project_latex\Bao_Ve_Do_An`:
1. `Kich_Ban_Thuyet_Trinh_Capstone_Group2.docx`: Kịch bản thuyết trình chi tiết 13 phút (kèm hành động bấm slide và lời thoại).
2. `So_Tay_Kien_Thuc_Co_Ban_Va_Bo_Cau_Hoi_Hoi_Dong.docx`: Sổ tay kiến thức từ căn bản (Token, RAG, 3NF, GGUF) đến bộ 15 câu hỏi phản biện của hội đồng.
3. `Slide_Thuyet_Trinh_Capstone_Group2.pptx`: Slide thuyết trình chuẩn Samsung Innovation Campus (18 slide widescreen 16:9).

---

## 📝 4. Quy tắc lập trình & Lưu ý đối với AI Assistant
1. **Tự động Đọc & Cập nhật KI File (`GEMINI.md`)**: Đầu mỗi phiên làm việc luôn tự đọc file `GEMINI.md` để nắm ngữ cảnh. Sau mỗi thay đổi kiến trúc/tính năng mới, tự động cập nhật lại file này.
2. **Luôn giữ nguyên contract API giữa Frontend và Backend**: Đường dẫn API prefix `/api/v1`.
3. **Quy định Phân quyền**: ADMIN, INSTRUCTOR, STUDENT. Tuân thủ phân quyền theo JWT.
4. **Database Schema**: Tất cả thay đổi liên quan đến cấu trúc DB phải tạo thêm file migration trong `backend/src/main/resources/db/migration/` (ví dụ `V4__...sql`).
5. **Không viết lại từ đầu**: Khi sửa code, luôn bảo toàn comment và logic hiện có trừ khi được chỉ định.
6. **Tự động Commit & Push GitHub khi có thay đổi quan trọng**: Mỗi khi có cập nhật lớn (thêm tính năng mới, bổ sung Flyway migration, sửa đổi kiến trúc/API hoặc cập nhật cơ sở dữ liệu), tự động thực hiện `git add`, `git commit` kèm message mô tả rõ ràng và `git push` lên GitHub repository.


