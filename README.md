# 🎓 UniLMS - Enterprise Learning Management System

UniLMS là hệ thống quản lý học tập (LMS) dành cho các trường đại học và cơ sở giáo dục tại Việt Nam, bao gồm đầy đủ các tính năng quản lý khóa học, bài học, làm bài trắc nghiệm, theo dõi tiến độ và cấp chứng chỉ.

---

## 📁 Thư mục Dự án

```text
UniLMS/
├── GEMINI.md             # File cấu hình ghi nhớ ngữ cảnh cho AI Assistant (Antigravity)
├── README.md             # Tài liệu dự án dành cho lập trình viên
├── run_backend.bat       # Script khởi chạy nhanh backend Spring Boot
├── backend/              # Mã nguồn Backend (Spring Boot 3.2.3, Java 17)
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/unilms/
│           │   ├── controller/      # Auth, Course, Progress, Quiz, Certificate Controllers
│           │   ├── domain/          # Entities & Enums
│           │   ├── dto/             # Data Transfer Objects
│           │   ├── repository/      # Spring Data JPA Repositories
│           │   └── security/        # Spring Security & JWT Configuration
│           └── resources/
│               ├── application.yml
│               └── db/migration/    # Flyway SQL scripts (V1__initial_lms_schema.sql)
└── frontend/             # Mã nguồn Frontend (React 18, Vite, Tailwind CSS)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── components/   # Header, Footer, AuthModal, Breadcrumbs, SkeletonLoader
        └── pages/        # Dashboard, CourseCatalog, CourseDetail, LessonPlayer, QuizEngine, CertificateView
```

---

## ⚡ Hướng dẫn Khởi chạy Dự án

### 1. Yêu cầu Tiền đề (Prerequisites)
* Java 17+ & Maven
* Node.js 18+ & npm
* PostgreSQL (Cơ sở dữ liệu: `unilms_db`)
* Redis (Cổng mặc định: 6379)

### 2. Chạy Backend
* Mở terminal hoặc chạy tệp [run_backend.bat](file:///d:/UniLMS/run_backend.bat)
* Hoặc chạy lệnh:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
* Backend sẽ khởi chạy tại: `http://localhost:8080/api/v1`

### 3. Chạy Frontend
* Mở terminal mới:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
* Frontend sẽ khởi chạy tại: `http://localhost:5173`

---

## 🛠 Công nghệ Sử dụng
* **Backend**: Spring Boot 3.2.3, Spring Data JPA, Spring Security, JWT Auth, Flyway, PostgreSQL, Redis.
* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
