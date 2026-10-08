-- =============================================================================
-- UNILMS ENTERPRISE DATABASE MIGRATION (V8: 10 INSTRUCTORS & 3 ADMIN ACCOUNTS)
-- Database Engine: PostgreSQL 15+
-- Password for all seed accounts: 123456
-- =============================================================================

-- 1. INSERT 10 INSTRUCTOR USERS
INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, is_active)
VALUES
    ('70000000-0000-0000-0000-000000000001', 'gv.nguyenvanhoc@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'PGS. TS. Nguyễn Văn Học', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250001', TRUE),
    ('70000000-0000-0000-0000-000000000002', 'gv.phamdinhlam@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'TS. Phạm Đình Lâm', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250002', TRUE),
    ('70000000-0000-0000-0000-000000000003', 'gv.tranthimai@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ThS. Trần Thị Mai', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250003', TRUE),
    ('70000000-0000-0000-0000-000000000004', 'gv.hoangquocbao@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'TS. Hoàng Quốc Bảo', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250004', TRUE),
    ('70000000-0000-0000-0000-000000000005', 'gv.leminhduc@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ThS. Lê Minh Đức', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250005', TRUE),
    ('70000000-0000-0000-0000-000000000006', 'gv.vuthihoa@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'PGS. TS. Vũ Thị Hoa', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250006', TRUE),
    ('70000000-0000-0000-0000-000000000007', 'gv.dohoanggiang@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'TS. Đỗ Hoàng Giang', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250007', TRUE),
    ('70000000-0000-0000-0000-000000000008', 'gv.trinhvanhai@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ThS. Trịnh Văn Hải', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250008', TRUE),
    ('70000000-0000-0000-0000-000000000009', 'gv.nguyenthiyen@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'TS. Nguyễn Thị Yến', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV2250009', TRUE),
    ('70000000-0000-0000-0000-000000000010', 'gv.buidangkhoa@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ThS. Bùi Đăng Khoa', 'ROLE_INSTRUCTOR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=GV22500010', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 2. INSERT 10 INSTRUCTOR PROFILES
INSERT INTO instructor_profiles (user_id, instructor_code, academic_title, department, bio)
VALUES
    ('70000000-0000-0000-0000-000000000001', 'GV2250001', 'PGS. TS.', 'Khoa Công nghệ Thông tin', 'Chuyên gia Điện toán Đám mây & Hệ thống Phân tán với 15+ năm kinh nghiệm giảng dạy.'),
    ('70000000-0000-0000-0000-000000000002', 'GV2250002', 'TS.', 'Khoa Kỹ thuật Phần mềm', 'Trưởng bộ môn Công nghệ Phần mềm, nghiên cứu về Domain-Driven Design & Microservices.'),
    ('70000000-0000-0000-0000-000000000003', 'GV2250003', 'ThS.', 'Khoa An toàn Thông tin', 'Giảng viên chuyên sâu về Cryptography, Web Security & Pen-testing chuẩn ISO 27001.'),
    ('70000000-0000-0000-0000-000000000004', 'GV2250004', 'TS.', 'Khoa Khoa học Máy tính', 'Nghiên cứu về Trí tuệ Nhân tạo, Machine Learning & Xử lý Ngôn ngữ Tự nhiên (NLP).'),
    ('70000000-0000-0000-0000-000000000005', 'GV2250005', 'ThS.', 'Khoa Kỹ thuật Phần mềm', 'Chuyên gia Lập trình Fullstack React & Spring Boot, Cố vấn CLB Lập trình ICTU.'),
    ('70000000-0000-0000-0000-000000000006', 'GV2250006', 'PGS. TS.', 'Khoa Hệ thống Thông tin', 'Trưởng khoa Hệ thống Thông tin, tác giả 30+ bài báo quốc tế về Big Data Telemetry.'),
    ('70000000-0000-0000-0000-000000000007', 'GV2250007', 'TS.', 'Khoa Công nghệ Thông tin', 'Phụ trách môn Kiến trúc Máy tính, Hệ điều hành & Cơ sở Dữ liệu Nâng cao.'),
    ('70000000-0000-0000-0000-000000000008', 'GV2250008', 'ThS.', 'Khoa An toàn Thông tin', 'Chuyên gia An ninh Mạng, Giám sát SOC & Điều tra Dấu vết Số (Digital Forensics).'),
    ('70000000-0000-0000-0000-000000000009', 'GV2250009', 'TS.', 'Khoa Hệ thống Thông tin', 'Nghiên cứu Quản trị Dự án Công nghệ Thông tin, ERP Enterprise & BI Dashboards.'),
    ('70000000-0000-0000-0000-000000000010', 'GV22500010', 'ThS.', 'Khoa Khoa học Máy tính', 'Giảng viên Lập trình Thiết bị Di động Android/iOS, Flutter & Cloud Server Operations.')
ON CONFLICT (user_id) DO NOTHING;

-- 3. INSERT 3 ADMIN USERS
INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, is_active)
VALUES
    ('80000000-0000-0000-0000-000000000001', 'admin.daotao@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Quản trị viên Phòng Đào tạo', 'ROLE_ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_ictu_1', TRUE),
    ('80000000-0000-0000-0000-000000000002', 'admin.ktdb@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Quản trị viên Trung tâm Khảo thí & ĐBCL', 'ROLE_ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_ictu_2', TRUE),
    ('80000000-0000-0000-0000-000000000003', 'admin.cntt@ictu.edu.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Quản trị viên Hệ thống CNTT & LMS', 'ROLE_ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_ictu_3', TRUE)
ON CONFLICT (email) DO NOTHING;
