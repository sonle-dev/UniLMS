-- Update seed accounts password hash to BCrypt "123456" ($2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a or BCrypt standard)
UPDATE users 
SET password_hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a' 
WHERE email IN ('admin@ictu.edu.vn', 'giangvien@ictu.edu.vn', 'nam.nh@ictu.edu.vn', 'sinhvien@ictu.edu.vn', 'sv.k21@ictu.edu.vn');
