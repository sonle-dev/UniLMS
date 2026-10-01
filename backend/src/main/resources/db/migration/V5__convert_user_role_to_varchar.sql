-- Migrate user_role enum to VARCHAR(50) for seamless JPA/Hibernate 6 compatibility
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::text;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'ROLE_STUDENT';
DROP TYPE IF EXISTS user_role CASCADE;
