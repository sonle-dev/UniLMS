-- Migration V3: Align DB Schema with Spring Boot JPA Entity Specifications

-- 1. Update quiz_questions table to include direct question content fields
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_text TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS correct_option VARCHAR(50);
ALTER TABLE quiz_questions ALTER COLUMN question_id DROP NOT NULL;

-- 2. Create quiz_submissions table required by QuizSubmission entity
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    raw_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    answers_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Adjust lesson_progress table for enrollment-based relationship
ALTER TABLE lesson_progress ALTER COLUMN user_id DROP NOT NULL;
