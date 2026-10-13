# 🎓 UniLMS - Enterprise Learning Management System (ICTU Style)

UniLMS là hệ thống quản lý học tập tích hợp (Enterprise LMS) dành cho các trường đại học và cơ sở giáo dục tại Việt Nam (theo chuẩn `lms.ictu.edu.vn`), bao gồm đầy đủ phân hệ cho Sinh viên, Giảng viên và Quản trị viên, tích hợp trợ lý AI OmniBrain, theo dõi tiến độ học tập, bảng điểm tín chỉ và cấp chứng chỉ.

---

## 🏛 Kiến trúc Chuẩn hóa (Single Source of Truth)

Dự án được chuẩn hóa duy nhất thành mô hình Monorepo với 2 phân hệ hoạt động chính thức:
* **Frontend**: Single Page Application hiện đại (React 18 + Vite + Tailwind CSS).
* **Backend**: Enterprise REST API (Spring Boot 3.2.3 + PostgreSQL 15+ + Spring Security JWT).

*(Ghi chú: Bản giao diện tĩnh thử nghiệm sơ khai bằng HTML/CSS thuần `EduPortal` trước đây đã được lưu trữ trong thư mục `archive/legacy_eduportal/` nhằm phục vụ việc tham khảo lịch sử phát triển).*

---

## 📁 Cấu trúc Thư mục Dự án

```text
UniLMS/
├── GEMINI.md                   # File cấu hình & ngữ cảnh AI Assistant (Antigravity)
├── README.md                   # Tài liệu hướng dẫn & kiến trúc hệ thống
├── run_backend.bat             # Script khởi chạy nhanh backend Spring Boot
├── backend/                    # Mã nguồn Backend (Spring Boot 3.2.3, Java 17/23)
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/unilms/
│           │   ├── controller/ # Auth, Course, CourseMaterial, Progress, Quiz, Certificate, Ai Controllers
│           │   ├── domain/     # JPA Entities & Enums
│           │   ├── dto/        # Data Transfer Objects
│           │   ├── repository/ # Spring Data JPA Repositories
│           │   └── security/   # Spring Security 6 & JWT Configuration
│           └── resources/
│               ├── application.yml
│               └── db/migration/ # Flyway SQL migrations (V1 -> V9)
├── frontend/                   # Mã nguồn Frontend CHÍNH THỨC (React 18, Vite, Tailwind CSS)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── components/         # Header, Sidebar, OmniBrainChat, ChangePasswordModal, Toast...
│       └── pages/              # Phân hệ Sinh viên, Giảng viên (instructor/), Quản trị viên (admin/)
└── archive/                    # Thư mục lưu trữ lịch sử
    ├── legacy_eduportal/       # Bản mẫu tĩnh thử nghiệm sơ khai (HTML/CSS/JS thuần EduPortal)
    └── test_payloads/          # Payload JSON phục vụ kiểm thử API cURL
```

---

## ⚡ Hướng dẫn Khởi chạy Hệ thống

### 1. Yêu cầu Môi trường (Prerequisites)
* **Java**: 17+ (Temurin / OpenJDK) & Maven
* **Node.js**: 18+ & npm
* **PostgreSQL**: Cổng 5432 (Database: `unilms_db`, User: `postgres`, Pass: `123`)

### 2. Khởi chạy Backend (Port 8080)
* Mở terminal hoặc chạy script [run_backend.bat](file:///d:/UniLMS/run_backend.bat)
* Hoặc chạy lệnh:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
* API Base URL: `http://localhost:8080/api/v1`

### 3. Khởi chạy Frontend (Port 5173)
* Mở terminal mới:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
* Truy cập Web: `http://localhost:5173`

---

## 👥 Tài khoản Mẫu Trải nghiệm Hệ thống

| Phân hệ / Vai trò | Tên đăng nhập (Username / MSSV) | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `admin123` |
| **Giảng viên (Instructor)** | `instructor_cntt` | `gv123` |
| **Sinh viên (Student)** | `DTC2051220001` (hoặc `student`) | `sv123` (hoặc `password`) |

---

## 🛠 Công nghệ Sử dụng
* **Backend**: Spring Boot 3.2.3, Spring Data JPA, Spring Security 6, JWT Auth, Flyway Database Migration, PostgreSQL 15+.
* **Frontend**: React 18, Vite 5, Tailwind CSS v3, Lucide Icons.
* **AI Engine**: OmniBrain AI Platform (Tích hợp Live Gemini & LLM Engine, bảo mật OmniBrain Security Guard).
