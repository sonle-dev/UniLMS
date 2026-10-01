-- =============================================================================
-- UNILMS ENTERPRISE DATABASE ARCHITECTURE (V4 PRODUCTION MASTER SCHEMA)
-- Database Engine: PostgreSQL 15+
-- High Performance, Clean 3NF Normalization, JSONB Telemetry & Indexes
-- Author: Senior PostgreSQL Architect (UniLMS Core Team)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. AUTOMATED PL/PGSQL TRIGGER FUNCTIONS FOR TIMESTAMP MANAGEMENT
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Attach update_updated_at_column trigger to dynamic entities
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
        CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_courses_updated_at') THEN
        CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lessons_updated_at') THEN
        CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_quizzes_updated_at') THEN
        CREATE TRIGGER trg_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. ACADEMIC & SECTION MANAGEMENT MODULE (LỚP HỌC PHẦN ICTU)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., '2025-2026'
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    semester_code VARCHAR(20) NOT NULL, -- e.g., 'HK1', 'HK2'
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_year_semester UNIQUE(academic_year_id, semester_code)
);

CREATE TABLE IF NOT EXISTS course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    semester_id UUID REFERENCES semesters(id) ON DELETE RESTRICT,
    section_code VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'CNTT.K22B.D1.K2.N01'
    section_name VARCHAR(255) NOT NULL,
    room VARCHAR(100) DEFAULT 'Phòng A2.301',
    schedule_text VARCHAR(255) DEFAULT 'Thứ 2 (07:00 - 09:25)',
    max_capacity INT DEFAULT 60,
    current_enrolled INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- -----------------------------------------------------------------------------
-- 3. ICTU GRADEBOOK & EVALUATION ENGINE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    attendance_score NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    quiz_score NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    tx1 NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    tx2 NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    tx3 NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    tx4 NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    midterm_score NUMERIC(4, 2) DEFAULT 0.00,
    final_score NUMERIC(4, 2) DEFAULT 0.00,
    tbc_score NUMERIC(4, 2) DEFAULT 0.00,
    is_eligible_for_exam BOOLEAN NOT NULL DEFAULT TRUE,
    remarks TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_section_student UNIQUE (section_id, student_id)
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_grades_updated_at') THEN
        CREATE TRIGGER trg_grades_updated_at BEFORE UPDATE ON student_grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. SECURITY & AUDIT TELEMETRY LOGGING
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g., 'AUTH_LOGIN', 'GRADE_UPDATE', 'QUIZ_SUBMIT'
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    client_ip VARCHAR(50),
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. ADVANCED INDEXING STRATEGY
-- -----------------------------------------------------------------------------
-- Partial Indexes for Active (Non-deleted) Records
CREATE INDEX IF NOT EXISTS idx_users_active_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_active_slug ON courses(slug) WHERE deleted_at IS NULL;

-- Section & Grade Indexes
CREATE INDEX IF NOT EXISTS idx_sections_course ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_sections_instructor ON course_sections(instructor_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_section ON student_grades(section_id);

-- GIN Indexes for JSONB Payload Queries
CREATE INDEX IF NOT EXISTS idx_lessons_content_payload_gin ON lessons USING gin (content_payload);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_options_gin ON quiz_questions USING gin (options);
CREATE INDEX IF NOT EXISTS idx_submissions_answers_snapshot_gin ON quiz_submissions USING gin (answers_snapshot);
CREATE INDEX IF NOT EXISTS idx_audit_details_gin ON audit_logs USING gin (details);

-- Audit Telemetry Time-Series Index
CREATE INDEX IF NOT EXISTS idx_audit_user_created ON audit_logs(user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 6. PRODUCTION SEED DATA INJECTION (ICTU LMS STANDARD DEMO DATA)
-- BCrypt password for all seed users: 123456 ($2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a)
-- -----------------------------------------------------------------------------

-- Seed Primary Users
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Quản trị viên Hệ thống ICTU', 'ROLE_ADMIN', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'giangvien@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'PGS. TS. Trần Đức Minh', 'ROLE_INSTRUCTOR', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'nam.nh@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ThS. Nguyễn Hoàng Nam', 'ROLE_INSTRUCTOR', TRUE),
    ('44444444-4444-4444-4444-444444444444', 'sinhvien@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Lê Văn Nam', 'ROLE_STUDENT', TRUE),
    ('55555555-5555-5555-5555-555555555555', 'sv.k21@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Trần Thị Bình', 'ROLE_STUDENT', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed Student Profiles
INSERT INTO student_profiles (user_id, student_code, class_name, major, admission_year)
VALUES 
    ('44444444-4444-4444-4444-444444444444', 'DTC225100888', 'CNTT K22B', 'Công nghệ Thông tin', 2022),
    ('55555555-5555-5555-5555-555555555555', 'DTC215654321', 'KTPM K21A', 'Kỹ thuật Phần mềm', 2021)
ON CONFLICT (user_id) DO NOTHING;

-- Seed Academic Years & Semesters
INSERT INTO academic_years (id, year_code, name, start_date, end_date, is_current)
VALUES ('a1111111-1111-1111-1111-111111111111', '2025-2026', 'Năm học 2025 - 2026', '2025-09-01', '2026-06-30', TRUE)
ON CONFLICT (year_code) DO NOTHING;

INSERT INTO semesters (id, academic_year_id, semester_code, name, start_date, end_date, is_current)
VALUES ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'HK2', 'Học kỳ 2 (2025-2026)', '2026-01-15', '2026-06-15', TRUE)
ON CONFLICT (academic_year_id, semester_code) DO NOTHING;

-- Seed Master Courses
INSERT INTO courses (id, instructor_id, title, slug, summary, description, thumbnail_url, price, status, is_published)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Lập trình Enterprise với Java 17/21 & Spring Boot 3', 'lap-trinh-java-spring-boot-3', 'Khóa học lập trình Spring Boot 3 chuẩn Doanh nghiệp', 'Kiến thức chuyên sâu về Spring Data JPA, Spring Security, JWT, Redis Cache và Microservices Architecture.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', 0.00, 'PUBLISHED', TRUE),
    ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise', 'postgresql-enterprise-optimization', 'Tối ưu Indexing, Query Performance, Partitioning và PL/pgSQL Triggers', 'Nắm vững kỹ thuật lập trình cơ sở dữ liệu nâng cao, tối ưu hóa truy vấn hàng triệu bản ghi và vận hành PostgreSQL.', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80', 0.00, 'PUBLISHED', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Seed Course Modules
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
    ('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Chương 1: Tổng quan Kiến trúc Spring Boot 3 & Maven Multi-module', 'Tìm hiểu Spring Context, Dependency Injection và cấu hình Maven', 1),
    ('f2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Chương 2: Spring Data JPA, Hibernate & Flyway Database Migration', 'Thiết kế Entity, Repository và viết kịch bản Migration chuẩn 3NF', 2)
ON CONFLICT (id) DO NOTHING;

-- Seed Lessons
INSERT INTO lessons (id, module_id, title, slug, content_type, content_payload, duration_seconds, order_index, is_preview)
VALUES 
    ('d1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Bài 1: Giới thiệu Spring Boot 3 & JDK 17 Environment', 'bai-1-gioi-thieu-spring-boot-3', 'VIDEO', '{"video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "doc_url": "https://docs.spring.io/spring-boot/docs/3.2.3/reference/html/"}', 1200, 1, TRUE),
    ('d2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'Bài 2: Thực hành Flyway Migration & PostgreSQL Indexing', 'bai-2-flyway-migration-postgresql', 'DOCUMENT', '{"markdown": "# Hướng dẫn Flyway Migration\\nViết file V1, V2, V3, V4 theo chuẩnFlyway SQL rules."}', 900, 2, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Seed Course Sections (Lớp học phần ICTU)
INSERT INTO course_sections (id, course_id, instructor_id, semester_id, section_code, section_name, room, schedule_text, max_capacity, current_enrolled)
VALUES 
    ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'CNTT.K22B.D1.K2.N01', 'Lập trình Java Enterprise - Nhóm 01', 'Phòng A2.301 - Tòa nhà A2', 'Thứ 2: 07:00 - 09:25 (Tiết 1-3)', 60, 45),
    ('e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'CNTT.K22B.D1.K2.N02', 'Cơ sở dữ liệu PostgreSQL Enterprise - Nhóm 02', 'Phòng B1.102 - Tòa nhà B1', 'Thứ 4: 13:00 - 15:25 (Tiết 7-9)', 60, 42)
ON CONFLICT (section_code) DO NOTHING;

-- Seed Student Gradebook Records
INSERT INTO student_grades (section_id, student_id, attendance_score, quiz_score, tx1, tx2, tx3, tx4, midterm_score, final_score, tbc_score, is_eligible_for_exam, remarks)
VALUES 
    ('e1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 10.00, 9.50, 8.50, 9.00, 9.50, 9.00, 8.80, 0.00, 9.04, TRUE, 'Chuyên cần xuất sắc, tham gia phát biểu tích cực'),
    ('e1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 9.00, 8.00, 7.50, 8.00, 8.50, 8.00, 8.00, 0.00, 8.10, TRUE, 'Đạt điều kiện dự thi tốt')
ON CONFLICT (section_id, student_id) DO NOTHING;

-- Seed Audit Telemetry Event
INSERT INTO audit_logs (user_id, action_type, entity_name, entity_id, client_ip, details)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'SYSTEM_MIGRATION', 'FlywayMigration', 'V4', '127.0.0.1', '{"status": "SUCCESS", "message": "UniLMS Production Master Schema V4 applied successfully"}'::jsonb);

-- =============================================================================
-- END OF V4 MASTER SCHEMA MIGRATION
-- =============================================================================
