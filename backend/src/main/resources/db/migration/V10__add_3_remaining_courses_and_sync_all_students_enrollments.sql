-- =============================================================================
-- UNILMS ENTERPRISE DATABASE MIGRATION (V10: ADD 3 COURSES & SYNC 5 COURSES FOR ALL STUDENTS)
-- Database Engine: PostgreSQL 15+
-- =============================================================================

-- 1. Ensure instructor TS. Trần Thị Mai has academic title TS.
UPDATE users SET full_name = 'TS. Trần Thị Mai' WHERE id = '70000000-0000-0000-0000-000000000003';
UPDATE instructor_profiles SET academic_title = 'TS.' WHERE user_id = '70000000-0000-0000-0000-000000000003';

-- 2. Insert the 3 remaining master courses (Courses 3, 4, 5)
INSERT INTO courses (id, instructor_id, title, slug, summary, description, thumbnail_url, price, status, is_published)
VALUES 
    (
        'c3333333-3333-3333-3333-333333333333', 
        '70000000-0000-0000-0000-000000000003', 
        'Phương pháp phát triển phần mềm hướng đối tượng-2-25', 
        'phuong-phap-phat-trien-phan-mem-huong-doi-tuong', 
        'Phân tích & Thiết kế hệ thống hướng đối tượng chuẩn UML và Design Patterns', 
        'Nắm vững các nguyên lý OOP, OOA/OOD, kiến trúc phần mềm, mẫu thiết kế Gang of Four và kỹ thuật Refactoring.', 
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', 
        0.00, 
        'PUBLISHED', 
        TRUE
    ),
    (
        'c4444444-4444-4444-4444-444444444444', 
        '70000000-0000-0000-0000-000000000002', 
        'Quản lý dự án CNTT-2-25', 
        'quan-ly-du-an-cntt', 
        'Quy trình quản lý dự án công nghệ thông tin theo khung Agile, Scrum và Kanban', 
        'Khóa học trang bị kỹ năng lập kế hoạch dự án, ước lượng chi phí, quản trị rủi ro, kiểm soát chất lượng và sử dụng Jira/GitLab.', 
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', 
        0.00, 
        'PUBLISHED', 
        TRUE
    ),
    (
        'c5555555-5555-5555-5555-555555555555', 
        '70000000-0000-0000-0000-000000000001', 
        'Quản trị hệ thống-2-25', 
        'quan-tri-he-thong', 
        'Quản trị máy chủ Linux Enterprise, dịch vụ mạng và an ninh hệ thống', 
        'Thực hành triển khai hệ điều hành Linux Server, quản trị tài khoản, phân quyền tập tin, cấu hình DNS, DHCP, Web Nginx và Docker.', 
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', 
        0.00, 
        'PUBLISHED', 
        TRUE
    )
ON CONFLICT (slug) DO UPDATE SET 
    instructor_id = EXCLUDED.instructor_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- 3. Insert Modules for Courses 3, 4, 5
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
    ('f3333333-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', 'Chương 1: Phân tích & Đặc tả Yêu cầu Hướng đối tượng', 'Khảo sát quy trình phân tích ca sử dụng (Use Case) và mô hình hóa domain', 1),
    ('f3333333-3333-3333-3333-333333333332', 'c3333333-3333-3333-3333-333333333333', 'Chương 2: Thiết kế Mẫu (GoF Patterns) & Biểu đồ UML', 'Áp dụng Factory, Singleton, Strategy và Observer trong phát triển phần mềm', 2),
    ('f4444444-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', 'Chương 1: Tổng quan Khung Quản lý Dự án Agile / Scrum', 'Hiểu vai trò Product Owner, Scrum Master và quy trình Sprint Planning', 1),
    ('f4444444-4444-4444-4444-444444444442', 'c4444444-4444-4444-4444-444444444444', 'Chương 2: Lập Kế hoạch Tiến độ & Quản trị Rủi ro Dự án', 'Phương pháp đường găng CPM, phân rã công việc WBS và ma trận rủi ro', 2),
    ('f5555555-5555-5555-5555-555555555551', 'c5555555-5555-5555-5555-555555555555', 'Chương 1: Quản trị Hệ điều hành Linux Server & Shell Script', 'Quản lý tiến trình, người dùng, phân quyền chmod/chown và tự động hóa Bash', 1),
    ('f5555555-5555-5555-5555-555555555552', 'c5555555-5555-5555-5555-555555555555', 'Chương 2: Triển khai Dịch vụ Mạng, Web Server Nginx & Firewall', 'Cấu hình tường lửa iptables/ufw, chứng chỉ SSL Let''s Encrypt và Reverse Proxy', 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Lessons for Courses 3, 4, 5
INSERT INTO lessons (id, module_id, title, slug, content_type, content_payload, duration_seconds, order_index, is_preview)
VALUES 
    ('d3333333-3333-3333-3333-333333333331', 'f3333333-3333-3333-3333-333333333331', 'Bài 1: Nguyên lý SOLID trong Thiết kế Phần mềm', 'bai-1-nguyen-ly-solid', 'VIDEO', '{"video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}', 1800, 1, TRUE),
    ('d3333333-3333-3333-3333-333333333332', 'f3333333-3333-3333-3333-333333333332', 'Bài 2: Thực hành vẽ Biểu đồ Lớp & Tuần tự (Class/Sequence Diagram)', 'bai-2-thuc-hanh-uml', 'DOCUMENT', '{"markdown": "# Hướng dẫn vẽ biểu đồ UML chuẩn hóa\\nSử dụng PlantUML hoặc StarUML để mô hình hóa."}', 1500, 2, FALSE),
    ('d4444444-4444-4444-4444-444444444441', 'f4444444-4444-4444-4444-444444444441', 'Bài 1: Thiết lập Backlog, User Story & Sprint trên Jira', 'bai-1-thiet-lap-jira-scrum', 'VIDEO', '{"video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}', 1600, 1, TRUE),
    ('d4444444-4444-4444-4444-444444444442', 'f4444444-4444-4444-4444-444444444442', 'Bài 2: Quản lý Ngân sách & Tiến độ Dự án Thực tế', 'bai-2-quan-ly-ngan-sach-tien-do', 'DOCUMENT', '{"markdown": "# Phương pháp Earned Value Management (EVM)\\nTính toán CPI, SPI và dự báo thời gian hoàn thành."}', 1400, 2, FALSE),
    ('d5555555-5555-5555-5555-555555555551', 'f5555555-5555-5555-5555-555555555551', 'Bài 1: Quản trị phân quyền Linux & SSH Hardening', 'bai-1-quan-tri-phan-quyen-linux', 'VIDEO', '{"video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}', 1800, 1, TRUE),
    ('d5555555-5555-5555-5555-555555555552', 'f5555555-5555-5555-5555-555555555552', 'Bài 2: Triển khai Nginx Reverse Proxy & Docker Container', 'bai-2-trien-khai-nginx-docker', 'DOCUMENT', '{"markdown": "# Cấu hình Nginx Reverse Proxy\\nTriển khai ứng dụng Web an toàn, cân bằng tải."}', 2000, 2, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Course Sections for Courses 3, 4, 5
INSERT INTO course_sections (id, course_id, instructor_id, semester_id, section_code, section_name, room, schedule_text, max_capacity, current_enrolled)
VALUES 
    (
        'e3333333-3333-3333-3333-333333333333', 
        'c3333333-3333-3333-3333-333333333333', 
        '70000000-0000-0000-0000-000000000003', -- TS. Trần Thị Mai
        'b1111111-1111-1111-1111-111111111111', 
        'CNTT.K22B.D1.K2.N03', 
        'Phương pháp phát triển phần mềm hướng đối tượng - Nhóm 03', 
        'Phòng C1.205 - Tòa nhà C1', 
        'Thứ 3: 07:00 - 09:25 (Tiết 1-3)', 
        60, 
        52
    ),
    (
        'e4444444-4444-4444-4444-444444444444', 
        'c4444444-4444-4444-4444-444444444444', 
        '70000000-0000-0000-0000-000000000002', -- TS. Phạm Đình Lâm
        'b1111111-1111-1111-1111-111111111111', 
        'CNTT.K22B.D1.K2.N04', 
        'Quản lý dự án CNTT - Nhóm 04', 
        'Phòng C2.304 - Tòa nhà C2', 
        'Thứ 5: 09:35 - 12:00 (Tiết 4-6)', 
        60, 
        52
    ),
    (
        'e5555555-5555-5555-5555-555555555555', 
        'c5555555-5555-5555-5555-555555555555', 
        '70000000-0000-0000-0000-000000000001', -- PGS. TS. Nguyễn Văn Học
        'b1111111-1111-1111-1111-111111111111', 
        'CNTT.K22B.D1.K2.N05', 
        'Quản trị hệ thống - Nhóm 05', 
        'Phòng A1.402 - Tòa nhà A1', 
        'Thứ 6: 13:00 - 15:25 (Tiết 7-9)', 
        60, 
        52
    )
ON CONFLICT (section_code) DO NOTHING;

-- 6. SYNC ALL 52 STUDENTS INTO ALL 5 COURSES (ENROLLMENTS)
INSERT INTO enrollments (id, user_id, course_id, status, progress_percent, enrolled_at)
SELECT 
    uuid_generate_v4(),
    u.id,
    c.id,
    'ACTIVE'::enrollment_status,
    ROUND((60 + (RANDOM() * 35))::numeric, 2),
    CURRENT_TIMESTAMP
FROM users u
CROSS JOIN courses c
WHERE u.role = 'ROLE_STUDENT' AND u.deleted_at IS NULL
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 7. SYNC ALL 52 STUDENTS INTO ALL 5 COURSE SECTIONS (STUDENT_GRADES)
INSERT INTO student_grades (
    id, section_id, student_id, 
    attendance_score, quiz_score, tx1, tx2, tx3, tx4, 
    midterm_score, final_score, tbc_score, is_eligible_for_exam, remarks
)
SELECT 
    uuid_generate_v4(),
    s.id,
    u.id,
    -- Attendance (9.0 - 10.0)
    ROUND((9.00 + (RANDOM() * 1.00))::numeric, 2),
    -- Quiz score (7.0 - 9.8)
    ROUND((7.00 + (RANDOM() * 2.80))::numeric, 2),
    -- TX1 (7.5 - 9.5)
    ROUND((7.50 + (RANDOM() * 2.00))::numeric, 2),
    -- TX2 (7.5 - 9.5)
    ROUND((7.50 + (RANDOM() * 2.00))::numeric, 2),
    -- TX3 (8.0 - 10.0)
    ROUND((8.00 + (RANDOM() * 2.00))::numeric, 2),
    -- TX4 (8.0 - 9.8)
    ROUND((8.00 + (RANDOM() * 1.80))::numeric, 2),
    -- Midterm (7.5 - 9.5)
    ROUND((7.50 + (RANDOM() * 2.00))::numeric, 2),
    -- Final (chờ thi = 0.0)
    0.00,
    -- TBC Score (7.8 - 9.5)
    ROUND((7.80 + (RANDOM() * 1.70))::numeric, 2),
    TRUE,
    'Chuyên cần tốt, làm bài tập đầy đủ, đủ điều kiện dự thi KTHP'
FROM users u
CROSS JOIN course_sections s
WHERE u.role = 'ROLE_STUDENT' AND u.deleted_at IS NULL
ON CONFLICT (section_id, student_id) DO NOTHING;

-- 8. UPDATE CURRENT_ENROLLED COUNT ON ALL SECTIONS
UPDATE course_sections
SET current_enrolled = (
    SELECT COUNT(*) FROM student_grades WHERE section_id = course_sections.id
);
