/* ==========================================================================
   EduPortal - Dữ liệu mẫu hệ thống (js/data.js)
   Chứa thông tin người dùng, số liệu thống kê, môn học, bài kiểm tra, đề thi
   ========================================================================== */

const initialData = {
  // Thông tin người dùng ứng với 3 vai trò
  users: {
    student: {
      name: "Nguyễn Văn An",
      code: "MSSV 22110045",
      email: "an.nv22110045@st.eduportal.edu.vn",
      phone: "0912 345 678",
      department: "Công nghệ Thông tin",
      role: "student"
    },
    instructor: {
      name: "TS. Trần Thị Mai",
      code: "MSGV 10245",
      email: "mai.tt@eduportal.edu.vn",
      phone: "0987 654 321",
      department: "Khoa Công nghệ Thông tin",
      role: "instructor"
    },
    admin: {
      name: "Quản trị viên Hệ thống",
      code: "ADM 001",
      email: "admin@eduportal.edu.vn",
      phone: "024 3825 9999",
      department: "Phòng Máy tính & CNTT",
      role: "admin"
    }
  },

  // 3 Thẻ thống kê theo vai trò (Đồng bộ chuẩn theo dữ liệu PostgreSQL)
  stats: {
    student: [
      { label: "Môn đang học", value: "3", unit: "môn" },
      { label: "Bài kiểm tra sắp tới", value: "2", unit: "bài" },
      { label: "Điểm TB tích lũy", value: "3,52", unit: "/ 4.0" }
    ],
    instructor: [
      { label: "Lớp phụ trách", value: "3", unit: "lớp" },
      { label: "Sinh viên", value: "2", unit: "sinh viên" },
      { label: "Bài chờ chấm", value: "1", unit: "bài" }
    ],
    admin: [
      { label: "Người dùng", value: "5", unit: "tài khoản" },
      { label: "Môn học đang mở", value: "3", unit: "môn" },
      { label: "Yêu cầu chờ duyệt", value: "3", unit: "yêu cầu" }
    ]
  },

  // Bảng phụ Tổng quan: Lịch học hôm nay (Sinh viên)
  todaySchedule: [
    { time: "07:00 - 09:15", course: "Cơ sở dữ liệu (INT2211)", room: "A2-301", teacher: "TS. Trần Thị Mai" },
    { time: "09:30 - 11:45", course: "Lập trình Web (INT3306)", room: "B1-205", teacher: "ThS. Lê Hoàng Nam" },
    { time: "13:00 - 15:15", course: "Tiếng Anh chuyên ngành (FLF1105)", room: "C3-102", teacher: "ThS. Phạm Thu Hà" }
  ],

  // Bảng phụ Tổng quan: Việc cần làm (Giảng viên)
  todoList: [
    { task: "Chấm bài kiểm tra giữa kỳ", course: "Cơ sở dữ liệu (INT2211)", deadline: "30/09/2026", status: "Chờ chấm", statusType: "warning" },
    { task: "Duyệt danh sách sinh viên dự thi", course: "Lập trình hướng đối tượng (INT2204)", deadline: "02/10/2026", status: "Đã hoàn thành", statusType: "success" },
    { task: "Cập nhật tài liệu tuần 5", course: "Lập trình Web (INT3306)", deadline: "05/10/2026", status: "Chưa làm", statusType: "danger" }
  ],

  // Bảng phụ Tổng quan: Yêu cầu chờ duyệt (Quản trị)
  pendingRequests: [
    { id: 1, type: "Tạo môn học mới", requester: "TS. Trần Thị Mai", date: "28/09/2026", status: "Chờ duyệt" },
    { id: 2, type: "Mở rộng sĩ số lớp Lập trình Web", requester: "ThS. Lê Hoàng Nam", date: "27/09/2026", status: "Chờ duyệt" },
    { id: 3, type: "Cấp quyền giảng viên thỉnh giảng", requester: "ThS. Phạm Thu Hà", date: "25/09/2026", status: "Chờ duyệt" }
  ],

  // Danh sách môn học chuẩn ICTU LMS kèm chi tiết bài học & tài liệu
  courses: [
    {
      id: "INT2211",
      name: "Cơ sở dữ liệu",
      instructor: "TS. Trần Thị Mai",
      credits: 3,
      department: "CNTT",
      progress: 75,
      classCode: "INT2211-1 (CNTT.K22B.D1.K2.N01)",
      studentsCount: 45,
      status: "Đang mở",
      weeksCount: 9,
      missedCount: 0,
      phone: "0915.122.722",
      lessons: [
        {
          id: "general",
          title: "Thông tin chung môn học",
          objectives: "Môn học cung cấp cho sinh viên kiến thức cốt lõi về hệ quản trị cơ sở dữ liệu quan hệ, mô hình thực thể ERD, ngôn ngữ SQL và các dạng chuẩn hóa.",
          outcomes: "Sinh viên có khả năng thiết kế cơ sở dữ liệu chuẩn 3NF và tối ưu các truy vấn dữ liệu thực tế.",
          content: "Số tiết: 45 tiết (30 tiết Lý thuyết, 15 tiết Thực hành). Hình thức đánh giá: Chuyên cần (10%), Trắc nghiệm/Thực hành (30%), Thi cuối kỳ (60%).",
          slides: [{ name: "GioiThieuMonHoc_CSDL.pptx", size: "1.5 MB" }],
          attachments: [{ name: "DeCuongChiTiet_CSDL.pdf", size: "820 KB" }]
        },
        {
          id: "lesson_1",
          title: "Bài 1: Giới thiệu Cơ sở dữ liệu & Mô hình Quan hệ",
          objectives: "Hiểu biết về khái niệm CSDL, Hệ quản trị CSDL (DBMS) và sự khác biệt giữa lưu trữ tệp truyền thống với CSDL.",
          outcomes: "• Hiểu biết về khái niệm CSDL quan hệ.\n• Trình bày được sự khác biệt giữa marketing truyền thống và CSDL.\n• Hiểu được quy trình thực hiện mô hình hóa.",
          content: "Nội dung giảng dạy:\n- Khái niệm CSDL và DBMS\n- Bản chất và quy trình của mô hình dữ liệu quan hệ\n- Khóa chính (Primary Key) và Khóa ngoại (Foreign Key)",
          slides: [{ name: "CSDL_Bai1_TongQuan.pptx", size: "2.4 MB" }],
          attachments: [
            { name: "1.Bai 1_CSDL.pdf", size: "1.8 MB" },
            { name: "BaiTap_ThucHanh_Bai1.pdf", size: "650 KB" }
          ]
        },
        {
          id: "lesson_2",
          title: "Bài 2: Mô hình Thực thể Liên kết (ERD)",
          objectives: "Thành thạo kỹ năng phân tích yêu cầu bài toán thực tế và vẽ sơ đồ ERD.",
          outcomes: "• Xác định được Thực thể, Thuộc tính và Mối quan hệ 1-1, 1-N, N-M.",
          content: "Nội dung giảng dạy:\n- Các ký hiệu trong sơ đồ ERD\n- Chuyển đổi sơ đồ ERD sang mô hình quan hệ bảng (Tables)",
          slides: [{ name: "CSDL_Bai2_MoHinhERD.pptx", size: "3.1 MB" }],
          attachments: [{ name: "HuongDan_Ve_ERD_DrawIO.pdf", size: "1.2 MB" }]
        },
        {
          id: "lesson_3",
          title: "Bài 3: Ngôn ngữ Truy vấn SQL (SELECT, JOIN)",
          objectives: "Viết được các câu lệnh SQL từ cơ bản đến phức tạp.",
          outcomes: "• Sử dụng thành thạo các mệnh đề SELECT, WHERE, GROUP BY, HAVING, ORDER BY.\n• Thành thạo các phép nối INNER JOIN, LEFT JOIN.",
          content: "Nội dung giảng dạy:\n- Cú pháp lệnh SELECT chuẩn SQL-92/SQL-99\n- Gom nhóm dữ liệu với GROUP BY và các hàm gộp COUNT, SUM, AVG",
          slides: [{ name: "CSDL_Bai3_SQL_Query.pptx", size: "4.2 MB" }],
          attachments: [{ name: "KichBan_ThucHanh_PostgreSQL.sql", size: "45 KB" }]
        },
        {
          id: "exam_lab",
          title: "Đề kiểm tra thực hành",
          objectives: "Đánh giá năng lực thiết kế CSDL và viết câu lệnh SQL.",
          outcomes: "• Đạt từ 5.0 điểm trở lên bài kiểm tra thực hành trên máy.",
          content: "Thời gian làm bài: 60 phút trên phòng máy thực hành.",
          slides: [],
          attachments: [{ name: "DeThiThucHanh_Mau_2026.pdf", size: "950 KB" }]
        }
      ]
    },
    {
      id: "INT3306",
      name: "Lập trình Web",
      instructor: "ThS. Lê Hoàng Nam",
      credits: 3,
      department: "CNTT",
      progress: 60,
      classCode: "INT3306-2 (CNTT.K22B.D1.K2.N02)",
      studentsCount: 40,
      status: "Đang mở",
      weeksCount: 9,
      missedCount: 0,
      phone: "0912.662.003",
      lessons: [
        {
          id: "general",
          title: "Thông tin chung môn học",
          objectives: "Nắm vững kiến thức phát triển ứng dụng Web Frontend & Backend.",
          outcomes: "Xây dựng website hoàn chỉnh HTML5/CSS3/JavaScript thuần.",
          content: "Môn học gồm HTML5, CSS3, ES6+, Responsive Design và RESTful API.",
          slides: [{ name: "Web_TongQuan.pptx", size: "2.1 MB" }],
          attachments: [{ name: "DeCuong_LapTrinhWeb.pdf", size: "500 KB" }]
        },
        {
          id: "lesson_1",
          title: "Bài 1: Tổng quan HTML5 & Thẻ Ngữ nghĩa (Semantic HTML)",
          objectives: "Hiểu cấu trúc trang web và các thẻ semantic.",
          outcomes: "Sử dụng header, nav, main, section, footer đúng chuẩn.",
          content: "Khái niệm Web Client-Server, HTTP protocol, HTML5 tags.",
          slides: [{ name: "Web_Bai1_HTML5.pptx", size: "1.9 MB" }],
          attachments: [{ name: "HTML5_CheatSheet.pdf", size: "400 KB" }]
        }
      ]
    },
    {
      id: "FLF1105",
      name: "Tiếng Anh chuyên ngành",
      instructor: "ThS. Phạm Thu Hà",
      credits: 2,
      department: "Ngoại ngữ",
      progress: 40,
      classCode: "FLF1105-1",
      studentsCount: 35,
      status: "Đang mở",
      weeksCount: 9,
      missedCount: 0,
      phone: "0968.550.888",
      lessons: []
    },
    {
      id: "MAT1093",
      name: "Đại số tuyến tính",
      instructor: "TS. Nguyễn Văn Bình",
      credits: 3,
      department: "Toán tin",
      progress: 85,
      classCode: "MAT1093-3",
      studentsCount: 50,
      status: "Đang mở",
      weeksCount: 9,
      missedCount: 0,
      phone: "0989.090.832",
      lessons: []
    },
    {
      id: "INT2204",
      name: "Lập trình hướng đối tượng",
      instructor: "TS. Trần Thị Mai",
      credits: 3,
      department: "CNTT",
      progress: 90,
      classCode: "INT2204-1",
      studentsCount: 42,
      status: "Đang mở",
      weeksCount: 9,
      missedCount: 0,
      phone: "0942.818.822",
      lessons: []
    }
  ],

  // Danh sách Bài kiểm tra (Feature chính)
  quizzes: [
    {
      id: "Q01",
      title: "Kiểm tra giữa kỳ Cơ sở dữ liệu",
      courseId: "INT2211",
      courseName: "Cơ sở dữ liệu",
      duration: "15:00",
      durationMinutes: 15,
      deadline: "30/09/2026 23:59",
      status: "open", // open, unopened, submitted, expired
      statusText: "Đang mở",
      score: null,
      submittedCount: 38,
      totalQuestions: 3,
      classCode: "INT2211-1",
      instructor: "TS. Trần Thị Mai",
      questions: [
        {
          id: 1,
          question: "Câu 1: Trong mô hình cơ sở dữ liệu quan hệ, khóa chính (Primary Key) có đặc điểm gì?",
          options: [
            "A. Có thể chứa giá trị NULL và trùng lặp",
            "B. Duy nhất và không chứa giá trị NULL",
            "C. Chỉ chứa số nguyên tăng dần",
            "D. Có thể thay đổi giá trị liên tục"
          ],
          correct: 1
        },
        {
          id: 2,
          question: "Câu 2: Lệnh SQL nào dùng để truy vấn dữ liệu từ bảng?",
          options: [
            "A. UPDATE",
            "B. INSERT INTO",
            "C. SELECT",
            "D. DELETE FROM"
          ],
          correct: 2
        },
        {
          id: 3,
          question: "Câu 3: Mối quan hệ 1-N (One-to-Many) được cài đặt bằng cách nào trong DB quan hệ?",
          options: [
            "A. Đặt khóa ngoại ở bảng bên N trỏ về khóa chính ở bảng bên 1",
            "B. Tạo bảng trung gian nối 2 bảng lại",
            "C. Đặt khóa ngoại ở bảng bên 1 trỏ về bảng bên N",
            "D. Gộp 2 bảng lại thành 1 bảng duy nhất"
          ],
          correct: 0
        }
      ]
    },
    {
      id: "Q02",
      title: "Trắc nghiệm HTML5 & CSS3 Cơ bản",
      courseId: "INT3306",
      courseName: "Lập trình Web",
      duration: "15:00",
      durationMinutes: 15,
      deadline: "05/10/2026 23:59",
      status: "unopened",
      statusText: "Chưa mở",
      score: null,
      submittedCount: 0,
      totalQuestions: 3,
      classCode: "INT3306-2",
      instructor: "ThS. Lê Hoàng Nam",
      questions: []
    },
    {
      id: "Q03",
      title: "Kiểm tra từ vựng Chuyên ngành CNTT",
      courseId: "FLF1105",
      courseName: "Tiếng Anh chuyên ngành",
      duration: "15:00",
      durationMinutes: 15,
      deadline: "20/09/2026 17:00",
      status: "submitted",
      statusText: "Đã nộp (9.0/10)",
      score: "9.0/10",
      submittedCount: 35,
      totalQuestions: 3,
      classCode: "FLF1105-1",
      instructor: "ThS. Phạm Thu Hà",
      questions: []
    },
    {
      id: "Q04",
      title: "Bài tập Ma trận & Hệ phương trình",
      courseId: "MAT1093",
      courseName: "Đại số tuyến tính",
      duration: "15:00",
      durationMinutes: 15,
      deadline: "15/09/2026 23:59",
      status: "expired",
      statusText: "Quá hạn",
      score: null,
      submittedCount: 48,
      totalQuestions: 3,
      classCode: "MAT1093-3",
      instructor: "TS. Nguyễn Văn Bình",
      questions: []
    }
  ],

  // Kho đề thi các năm
  exams: [
    { id: 1, courseId: "INT2211", courseName: "Cơ sở dữ liệu", type: "Cuối kỳ", year: "2024", format: "PDF", size: "1.2 MB" },
    { id: 2, courseId: "INT2211", courseName: "Cơ sở dữ liệu", type: "Giữa kỳ", year: "2023", format: "DOCX", size: "850 KB" },
    { id: 3, courseId: "INT3306", courseName: "Lập trình Web", type: "Cuối kỳ", year: "2025", format: "PDF", size: "2.1 MB" },
    { id: 4, courseId: "INT3306", courseName: "Lập trình Web", type: "Giữa kỳ", year: "2024", format: "PDF", size: "1.5 MB" },
    { id: 5, courseId: "FLF1105", courseName: "Tiếng Anh chuyên ngành", type: "Cuối kỳ", year: "2023", format: "PDF", size: "980 KB" },
    { id: 6, courseId: "MAT1093", courseName: "Đại số tuyến tính", type: "Cuối kỳ", year: "2024", format: "PDF", size: "1.8 MB" },
    { id: 7, courseId: "INT2204", courseName: "Lập trình hướng đối tượng", type: "Giữa kỳ", year: "2025", format: "DOCX", size: "1.1 MB" },
    { id: 8, courseId: "INT2204", courseName: "Lập trình hướng đối tượng", type: "Cuối kỳ", year: "2023", format: "PDF", size: "2.4 MB" }
  ]
};
