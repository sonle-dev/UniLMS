-- =============================================================================
-- V9: CREATE COURSE MATERIALS & LECTURE DOCUMENTS TABLE
-- Enterprise LMS Document & Lecture File Repository
-- =============================================================================

CREATE TABLE IF NOT EXISTS course_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID,
    module_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL DEFAULT 'DOCUMENT',
    file_size VARCHAR(50),
    file_url TEXT NOT NULL,
    download_url TEXT,
    allow_download BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_by UUID,
    uploaded_by_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materials_course ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_created ON course_materials(created_at DESC);
