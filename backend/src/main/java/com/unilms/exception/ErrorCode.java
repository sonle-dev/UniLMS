package com.unilms.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // ==========================================
    // 1. AUTHENTICATION & SECURITY (AUTH-1xxx)
    // ==========================================
    AUTH_INVALID_CREDENTIALS("AUTH_1001", HttpStatus.UNAUTHORIZED, "Tên đăng nhập hoặc mật khẩu không chính xác"),
    AUTH_EMAIL_ALREADY_EXISTS("AUTH_1002", HttpStatus.BAD_REQUEST, "Địa chỉ email đã tồn tại trên hệ thống"),
    AUTH_ACCOUNT_LOCKED("AUTH_1003", HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị tạm khóa do vi phạm chính sách"),
    AUTH_TOKEN_EXPIRED("AUTH_1004", HttpStatus.UNAUTHORIZED, "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại"),
    AUTH_TOKEN_INVALID("AUTH_1005", HttpStatus.UNAUTHORIZED, "Mã xác thực JWT không hợp lệ hoặc đã bị thay đổi"),
    AUTH_ACCESS_DENIED("AUTH_1006", HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập vào tài nguyên này"),
    AUTH_OLD_PASSWORD_MISMATCH("AUTH_1007", HttpStatus.BAD_REQUEST, "Mật khẩu cũ nhập vào không chính xác"),

    // ==========================================
    // 2. USER & PROFILE MANAGEMENT (USER-2xxx)
    // ==========================================
    USER_NOT_FOUND("USER_2001", HttpStatus.NOT_FOUND, "Không tìm thấy thông tin người dùng trong hệ thống"),
    USER_STUDENT_CODE_EXISTS("USER_2002", HttpStatus.BAD_REQUEST, "Mã sinh viên đã tồn tại trên hệ thống"),
    USER_INSTRUCTOR_CODE_EXISTS("USER_2003", HttpStatus.BAD_REQUEST, "Mã giảng viên đã tồn tại trên hệ thống"),
    USER_PROFILE_INCOMPLETE("USER_2004", HttpStatus.BAD_REQUEST, "Hồ sơ cá nhân chưa hoàn thiện thông tin bắt buộc"),
    USER_INVALID_ROLE("USER_2005", HttpStatus.BAD_REQUEST, "Vai trò người dùng chỉ định không hợp lệ"),

    // ==========================================
    // 3. COURSE & LESSON MANAGEMENT (COURSE-3xxx)
    // ==========================================
    COURSE_NOT_FOUND("COURSE_3001", HttpStatus.NOT_FOUND, "Không tìm thấy môn học hoặc lớp học phần"),
    COURSE_SECTION_NOT_FOUND("COURSE_3002", HttpStatus.NOT_FOUND, "Không tìm thấy lớp học phần chỉ định"),
    COURSE_ALREADY_ENROLLED("COURSE_3003", HttpStatus.CONFLICT, "Sinh viên đã đăng ký tham gia lớp học phần này"),
    COURSE_ENROLLMENT_CLOSED("COURSE_3004", HttpStatus.BAD_REQUEST, "Đã hết thời hạn đăng ký / rút học phần theo quy định"),
    COURSE_CAPACITY_EXCEEDED("COURSE_3005", HttpStatus.BAD_REQUEST, "Lớp học phần đã đủ sĩ số tối đa"),
    LESSON_NOT_FOUND("LESSON_3006", HttpStatus.NOT_FOUND, "Không tìm thấy bài học hoặc tài liệu bài giảng"),
    LESSON_PREREQUISITE_NOT_MET("LESSON_3007", HttpStatus.FORBIDDEN, "Bạn cần hoàn thành bài học tiên quyết trước khi tiếp tục"),

    // ==========================================
    // 4. QUIZ & EXAMINATION (QUIZ-4xxx)
    // ==========================================
    QUIZ_NOT_FOUND("QUIZ_4001", HttpStatus.NOT_FOUND, "Không tìm thấy bài kiểm tra trắc nghiệm"),
    QUIZ_ALREADY_SUBMITTED("QUIZ_4002", HttpStatus.BAD_REQUEST, "Bài kiểm tra trắc nghiệm này đã được nộp trước đó"),
    QUIZ_TIME_EXPIRED("QUIZ_4003", HttpStatus.BAD_REQUEST, "Đã hết thời gian làm bài trắc nghiệm"),
    QUIZ_ATTEMPTS_EXCEEDED("QUIZ_4004", HttpStatus.BAD_REQUEST, "Bạn đã vượt quá số lần làm bài trắc nghiệm cho phép"),
    QUIZ_NOT_PUBLISHED("QUIZ_4005", HttpStatus.BAD_REQUEST, "Bài kiểm tra chưa được giảng viên kích hoạt mở đề"),
    QUIZ_INVALID_SUBMISSION("QUIZ_4006", HttpStatus.BAD_REQUEST, "Dữ liệu câu trả lời gửi lên không hợp lệ"),

    // ==========================================
    // 5. ACADEMIC GRADES (GRADE-5xxx)
    // ==========================================
    GRADE_NOT_FOUND("GRADE_5001", HttpStatus.NOT_FOUND, "Không tìm thấy dữ liệu điểm số của sinh viên"),
    GRADE_LOCKED("GRADE_5002", HttpStatus.FORBIDDEN, "Bảng điểm lớp học phần đã bị khóa và duyệt chính thức"),
    GRADE_INVALID_RANGE("GRADE_5003", HttpStatus.BAD_REQUEST, "Điểm số phải nằm trong thang điểm từ 0.0 đến 10.0"),
    GRADE_EXAM_INELIGIBLE("GRADE_5004", HttpStatus.FORBIDDEN, "Sinh viên không đủ điều kiện chuyên cần để dự thi kết thúc học phần"),

    // ==========================================
    // 6. CERTIFICATE & PROGRESS (CERT-6xxx)
    // ==========================================
    CERTIFICATE_NOT_FOUND("CERT_6001", HttpStatus.NOT_FOUND, "Mã tra cứu chứng chỉ không tồn tại hoặc đã bị thu hồi"),
    CERTIFICATE_NOT_ELIGIBLE("CERT_6002", HttpStatus.BAD_REQUEST, "Sinh viên chưa đạt đủ điều kiện hoàn thành khóa học để cấp chứng chỉ"),

    // ==========================================
    // 7. OMNIBRAIN AI ASSISTANT (AI-7xxx)
    // ==========================================
    AI_SERVICE_UNAVAILABLE("AI_7001", HttpStatus.SERVICE_UNAVAILABLE, "Trợ lý AI OmniBrain tạm thời gián đoạn kết nối"),
    AI_SECURITY_GUARD_VIOLATION("AI_7002", HttpStatus.FORBIDDEN, "Yêu cầu bị chặn bởi OmniBrain Security Guard do vi phạm quyền bảo mật"),
    AI_QUOTA_EXCEEDED("AI_7003", HttpStatus.TOO_MANY_REQUESTS, "Bạn đã vượt quá hạn ngạch gửi câu hỏi AI trong ngày"),

    // ==========================================
    // 8. SYSTEM & INFRASTRUCTURE (SYS-9xxx)
    // ==========================================
    INTERNAL_SERVER_ERROR("SYS_9001", HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống nội bộ. Vui lòng liên hệ quản trị viên"),
    INVALID_INPUT_PARAMETER("SYS_9002", HttpStatus.BAD_REQUEST, "Tham số dữ liệu đầu vào không hợp lệ"),
    FILE_UPLOAD_FAILED("SYS_9003", HttpStatus.INTERNAL_SERVER_ERROR, "Tải lên tệp tài liệu / video bài giảng thất bại"),
    FILE_FORMAT_NOT_SUPPORTED("SYS_9004", HttpStatus.BAD_REQUEST, "Định dạng tệp tin tải lên không được hỗ trợ");

    private final String code;
    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(String code, HttpStatus httpStatus, String defaultMessage) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
