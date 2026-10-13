/* ==========================================================================
   EduPortal - Logic ứng dụng chính (js/app.js)
   Chuyển đổi vai trò, chuyển tab, quản lý bài kiểm tra (Quiz timer),
   lọc đề thi, đổi giao diện (Dark mode) và cập nhật cài đặt
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Config Server Backend API
  const API_BASE = 'http://localhost:8080/api/v1';

  async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('eduportal_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  // 1. Quản lý trạng thái ứng dụng (State)
  const state = {
    currentRole: 'student', // 'student' | 'instructor' | 'admin'
    currentTab: 'overview',  // 'overview' | 'courses' | 'quizzes' | 'exams' | 'settings'
    theme: localStorage.getItem('eduportal_theme') || 'system',
    data: JSON.parse(JSON.stringify(initialData)), // Sao chép dữ liệu mẫu
    activeQuiz: null,
    quizTimerInterval: null,
    quizSecondsLeft: 900 // 15 phút = 900 giây
  };

  // Các phần tử DOM chính
  const roleSelect = document.getElementById('roleSelect');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userAvatarDisplay = document.getElementById('userAvatarDisplay');
  const navItems = document.querySelectorAll('.nav-item');
  const contentArea = document.getElementById('contentArea');
  const quizDialog = document.getElementById('quizDialog');
  const toastElement = document.getElementById('toast');

  // 2. Khởi tạo Giao diện & Đăng ký Sự kiện
  initTheme(state.theme);
  initHeaderUser();
  renderCurrentTab();

  // Sự kiện đổi Vai trò (Sinh viên / Giảng viên / Quản trị)
  roleSelect.addEventListener('change', (e) => {
    state.currentRole = e.target.value;
    updateHeaderUser();
    renderCurrentTab();
  });

  // Sự kiện chuyển Tab ở Menu dọc
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      state.currentTab = item.getAttribute('data-tab');
      renderCurrentTab();
    });
  });

  // ==========================================================================
  // HÀM XỬ LÝ THEME (SÁNG / TỐI / THEO THIẾT BỊ)
  // ==========================================================================
  function initTheme(themeMode) {
    state.theme = themeMode;
    localStorage.setItem('eduportal_theme', themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
  }

  // ==========================================================================
  // HÀM CẬP NHẬT HEADER THEO VAI TRÒ
  // ==========================================================================
  function initHeaderUser() {
    roleSelect.value = state.currentRole;
    updateHeaderUser();
  }

  async function updateHeaderUser() {
    const role = state.currentRole;
    const emailMap = {
      student: 'sinhvien@ictu.edu.vn',
      instructor: 'giangvien@ictu.edu.vn',
      admin: 'admin@ictu.edu.vn'
    };

    // Gọi API Authenticate tới Spring Boot Backend
    const authRes = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailMap[role] || 'sinhvien@ictu.edu.vn', password: '123456' })
    });

    if (authRes && authRes.accessToken) {
      localStorage.setItem('eduportal_token', authRes.accessToken);
      console.log(`[JWT Auth] Authenticated as ${authRes.email} (${authRes.role})`);
    }

    const user = state.data.users[state.currentRole];
    if (user) {
      userNameDisplay.textContent = `${user.name} (${user.code})`;
      userAvatarDisplay.textContent = user.name.charAt(0);
    }
  }

  // ==========================================================================
  // HÀM RENDER NỘI DUNG TỪNG TAB
  // ==========================================================================
  function renderCurrentTab() {
    const role = state.currentRole;
    switch (state.currentTab) {
      case 'overview':
        renderOverviewTab(role);
        break;
      case 'courses':
        renderCoursesTab(role);
        break;
      case 'quizzes':
        renderQuizzesTab(role);
        break;
      case 'exams':
        renderExamsTab(role);
        break;
      case 'settings':
        renderSettingsTab(role);
        break;
      default:
        renderOverviewTab(role);
    }
  }

  // --------------------------------------------------------------------------
  // TAB 1: TỔNG QUAN (THỐNG KÊ ĐỘNG KHỚP VỚI CƠ SỞ DỮ LIỆU POSTGRESQL)
  // --------------------------------------------------------------------------
  function renderOverviewTab(role) {
    // Tính toán số liệu thống kê thực tế theo dữ liệu CSDL
    let statsList = [];
    if (role === 'student') {
      const courseCount = state.data.courses ? state.data.courses.length : 3;
      const upcomingQuizzes = state.data.quizzes ? state.data.quizzes.filter(q => q.status !== 'Đã nộp').length : 2;
      statsList = [
        { label: "Môn đang học", value: String(courseCount), unit: "môn" },
        { label: "Bài kiểm tra sắp tới", value: String(upcomingQuizzes), unit: "bài" },
        { label: "Điểm TB tích lũy", value: "3,52", unit: "/ 4.0" }
      ];
    } else if (role === 'instructor') {
      const classCount = state.data.courses ? state.data.courses.length : 3;
      const studentSum = 2; // Khớp chính xác 2 sinh viên trong CSDL PostgreSQL (sinhvien@ictu.edu.vn & sv.k21@ictu.edu.vn)
      const pendingGradeCount = state.data.todoList ? state.data.todoList.filter(t => t.status === 'Chờ chấm').length : 1;
      statsList = [
        { label: "Lớp phụ trách", value: String(classCount), unit: "lớp" },
        { label: "Sinh viên", value: String(studentSum), unit: "sinh viên" },
        { label: "Bài chờ chấm", value: String(pendingGradeCount), unit: "bài" }
      ];
    } else if (role === 'admin') {
      const userCount = 5; // Khớp với 5 tài khoản trong PostgreSQL DB
      const openCourseCount = state.data.courses ? state.data.courses.length : 3;
      const pendingReqCount = state.data.pendingRequests ? state.data.pendingRequests.filter(r => r.status === 'Chờ duyệt').length : 3;
      statsList = [
        { label: "Người dùng", value: String(userCount), unit: "tài khoản" },
        { label: "Môn học đang mở", value: String(openCourseCount), unit: "môn" },
        { label: "Yêu cầu chờ duyệt", value: String(pendingReqCount), unit: "yêu cầu" }
      ];
    }

    let statsHtml = `
      <div class="stats-grid">
        ${statsList.map(s => `
          <div class="stat-card">
            <div class="stat-label">${escapeHtml(s.label)}</div>
            <div class="stat-value-container">
              <span class="stat-value">${escapeHtml(s.value)}</span>
              <span class="stat-unit">${escapeHtml(s.unit)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    let detailCardHtml = '';

    if (role === 'student') {
      detailCardHtml = `
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Lịch học hôm nay</h2>
            <span class="badge badge-primary">Thứ Ba, 29/09/2026</span>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Môn học</th>
                  <th>Phòng học</th>
                  <th>Giảng viên</th>
                </tr>
              </thead>
              <tbody>
                ${state.data.todaySchedule.map(item => `
                  <tr>
                    <td><strong>${escapeHtml(item.time)}</strong></td>
                    <td>${escapeHtml(item.course)}</td>
                    <td><span class="badge badge-secondary">${escapeHtml(item.room)}</span></td>
                    <td>${escapeHtml(item.teacher)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (role === 'instructor') {
      detailCardHtml = `
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Việc cần làm</h2>
            <button class="btn btn-outline btn-sm" id="btnAddTodo">+ Thêm công việc</button>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Công việc</th>
                  <th>Môn học / Lớp</th>
                  <th>Hạn chót</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                ${state.data.todoList.map(item => `
                  <tr>
                    <td><strong>${escapeHtml(item.task)}</strong></td>
                    <td>${escapeHtml(item.course)}</td>
                    <td>${escapeHtml(item.deadline)}</td>
                    <td><span class="badge badge-${item.statusType}">${escapeHtml(item.status)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (role === 'admin') {
      detailCardHtml = `
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Yêu cầu chờ duyệt</h2>
            <span class="badge badge-warning">${state.data.pendingRequests.length} Yêu cầu</span>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Loại yêu cầu</th>
                  <th>Người gửi</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${state.data.pendingRequests.length === 0 ? `
                  <tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Không có yêu cầu nào chờ duyệt</td></tr>
                ` : state.data.pendingRequests.map(item => `
                  <tr id="req-row-${item.id}">
                    <td><strong>${escapeHtml(item.type)}</strong></td>
                    <td>${escapeHtml(item.requester)}</td>
                    <td>${escapeHtml(item.date)}</td>
                    <td><span class="badge badge-warning" id="req-badge-${item.id}">${escapeHtml(item.status)}</span></td>
                    <td>
                      <button class="btn btn-success btn-sm btn-approve" data-id="${item.id}">Duyệt</button>
                      <button class="btn btn-danger btn-sm btn-reject" data-id="${item.id}" style="margin-left: 4px;">Từ chối</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    contentArea.innerHTML = `
      <h1 class="page-title">Tổng quan</h1>
      ${statsHtml}
      ${detailCardHtml}
    `;

    // Gán sự kiện Duyệt/Từ chối cho Quản trị
    if (role === 'admin') {
      document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          approveRequest(id, 'Đã duyệt');
        });
      });
      document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          approveRequest(id, 'Từ chối');
        });
      });
    }

    if (role === 'instructor') {
      const btnAddTodo = document.getElementById('btnAddTodo');
      if (btnAddTodo) {
        btnAddTodo.addEventListener('click', () => {
          showToast('Tính năng thêm công việc đã sẵn sàng');
        });
      }
    }
  }

  function approveRequest(id, newStatus) {
    const item = state.data.pendingRequests.find(r => r.id === id);
    if (item) {
      item.status = newStatus;
      state.data.pendingRequests = state.data.pendingRequests.filter(r => r.id !== id);
      // Giảm số lượng yêu cầu chờ duyệt ở stats
      const adminStats = state.data.stats.admin.find(s => s.label === 'Yêu cầu chờ duyệt');
      if (adminStats) {
        adminStats.value = String(state.data.pendingRequests.length);
      }
      showToast(`Đã ${newStatus.toLowerCase()} yêu cầu của ${item.requester}`);
      renderOverviewTab('admin');
    }
  }

  // --------------------------------------------------------------------------
  // TAB 2: MÔN HỌC (DANH SÁCH LỚP HỌC PHẦN CHUẨN ICTU LMS)
  // --------------------------------------------------------------------------
  function renderCoursesTab(role) {
    let headerActionsHtml = '';
    let tableHtml = '';

    if (role === 'student') {
      tableHtml = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn học</th>
                <th>Giảng viên</th>
                <th style="width: 200px;">Tiến độ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.courses.map(c => `
                <tr>
                  <td><strong>${escapeHtml(c.id)}</strong></td>
                  <td>
                    <div style="font-weight: 600;">${escapeHtml(c.name)}</div>
                    <small style="color: var(--text-muted);">${escapeHtml(c.classCode)}</small>
                  </td>
                  <td>${escapeHtml(c.instructor)}</td>
                  <td>
                    <div>${c.progress}%</div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" style="width: ${c.progress}%;"></div>
                    </div>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-enter-course" data-id="${c.id}">Vào học</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (role === 'instructor') {
      headerActionsHtml = `
        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <button class="btn btn-primary" id="btnAddDoc">+ Thêm tài liệu mới</button>
          <button class="btn btn-outline" id="btnPostNotice">Đăng thông báo</button>
        </div>
      `;
      tableHtml = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn học</th>
                <th>Mã lớp HP</th>
                <th>Sĩ số</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.courses.map(c => `
                <tr>
                  <td><strong>${escapeHtml(c.id)}</strong></td>
                  <td>${escapeHtml(c.name)}</td>
                  <td><span class="badge badge-secondary">${escapeHtml(c.classCode)}</span></td>
                  <td>${c.studentsCount} sinh viên</td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-manage-course" data-id="${c.id}">Quản lý tài liệu</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (role === 'admin') {
      headerActionsHtml = `
        <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
          <input type="text" id="adminSearchCourse" class="form-control" style="max-width: 300px;" placeholder="Tìm môn học theo tên hoặc mã...">
          <button class="btn btn-primary" id="btnAddCourse">+ Thêm môn học</button>
        </div>
      `;
      tableHtml = `
        <div class="table-container">
          <table class="table" id="adminCourseTable">
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn học</th>
                <th>Số tín chỉ</th>
                <th>Khoa</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.courses.map(c => `
                <tr>
                  <td><strong>${escapeHtml(c.id)}</strong></td>
                  <td>${escapeHtml(c.name)}</td>
                  <td>${c.credits} TC</td>
                  <td>${escapeHtml(c.department)}</td>
                  <td><span class="badge badge-success">${escapeHtml(c.status)}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-manage-course" data-id="${c.id}">Quản lý tài liệu</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    contentArea.innerHTML = `
      <h1 class="page-title">Lớp học phần</h1>
      ${headerActionsHtml}
      <div class="card">
        ${tableHtml}
      </div>
    `;

    // Gán sự kiện "Vào học" & "Quản lý" mở giao diện Chi tiết môn học & Tài liệu
    document.querySelectorAll('.btn-enter-course, .btn-manage-course').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cId = e.currentTarget.getAttribute('data-id');
        renderCourseDetailView(cId, 'general', 'content');
      });
    });

    if (role === 'instructor') {
      document.getElementById('btnAddDoc')?.addEventListener('click', () => {
        renderCourseDetailView(state.data.courses[0].id, 'lesson_1', 'materials');
      });
      document.getElementById('btnPostNotice')?.addEventListener('click', () => showToast('Đã mở hộp thoại đăng thông báo cho lớp học'));
    }

    if (role === 'admin') {
      document.getElementById('btnAddCourse')?.addEventListener('click', () => showToast('Mở màn hình thêm môn học mới'));
      const searchInput = document.getElementById('adminSearchCourse');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();
          const rows = document.querySelectorAll('#adminCourseTable tbody tr');
          rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
          });
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // HÀM RENDER CHI TIẾT LỚP HỌC PHẦN & TÀI LIỆU THAM KHẢO (CHUẨN ICTU LMS)
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // HÀM RENDER CHI TIẾT LỚP HỌC PHẦN & TÀI LIỆU THAM KHẢO (CHUẨN ICTU LMS)
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // HÀM RENDER CHI TIẾT LỚP HỌC PHẦN & TÀI LIỆU THAM KHẢO (CHUẨN ICTU LMS)
  // --------------------------------------------------------------------------
  function renderCourseDetailView(courseId, activeLessonId, activeSubTab) {
    const course = state.data.courses.find(c => c.id === courseId) || state.data.courses[0];
    
    // Khởi tạo 11 mục bài học chuẩn ICTU LMS (Thông tin chung + 9 Bài + Đề kiểm tra)
    const defaultLessons = [
      {
        id: "general",
        title: "Thông tin chung",
        isGeneral: true,
        objectives: `Môn học ${course.name} cung cấp cho sinh viên hệ thống kiến thức cốt lõi, khái niệm nền tảng và kỹ năng ứng dụng thực tế chuyên ngành.`,
        outcomes: `• Nắm vững khái niệm và nguyên lý hoạt động của môn ${course.name}.\n• Thành thạo phương pháp phân tích, thiết kế và triển khai sản phẩm.\n• Áp dụng hiệu quả kiến thức môn học vào các dự án thực tế.`,
        content: `• Số tiết: 45 tiết (30 tiết Lý thuyết, 15 tiết Thực hành).\n• Hình thức đánh giá: Chuyên cần (10%), Bài kiểm tra (30%), Thi kết thúc học phần (60%).\n• Giảng viên phụ trách: ${course.instructor} (Email: mai.tt@eduportal.edu.vn).`,
        slides: [{ name: `${course.id}_Slide_GioiThieu.pptx`, size: "2.8 MB" }],
        attachments: [
          { name: `DeCuongChiTiet_${course.id}.pdf`, size: "1.4 MB" },
          { name: "LichTrinhGiangDay_Ki1_2026.pdf", size: "620 KB" }
        ]
      },
      {
        id: "lesson_1",
        title: "Bài 1",
        objectives: "Hiểu biết về khái niệm cơ bản và thuật ngữ chuyên môn của bài học.",
        outcomes: `• Hiểu biết về khái niệm ${course.name}.\n• Trình bày được sự khác biệt giữa các phương pháp.\n• Hiểu được quy trình thực hiện.`,
        content: "Khái niệm và quy trình chi tiết của Bài 1.",
        slides: [{ name: "MKTS. Bài 1.pptx", size: "2.4 MB" }],
        attachments: [{ name: "1.Bai 1.pdf", size: "1.8 MB" }]
      },
      {
        id: "lesson_2",
        title: "Bài 2",
        objectives: "Phân tích mô hình, quy trình và kỹ thuật xử lý bài toán.",
        outcomes: "• Xác định được thực thể và thuộc tính.\n• Xây dựng sơ đồ quy trình chi tiết.",
        content: "Chi tiết nội dung giảng dạy và các bước thực hiện Bài 2.",
        slides: [{ name: "MKTS. Bài 2.pptx", size: "2.1 MB" }],
        attachments: [{ name: "2.Bai 2.pdf", size: "1.1 MB" }]
      },
      {
        id: "lesson_3",
        title: "Bài 3",
        objectives: "Kỹ năng thực hành kịch bản và áp dụng công cụ chuyên sâu.",
        outcomes: "• Viết được câu lệnh và cấu hình kịch bản thực thi.\n• Xử lý các tình huống phát sinh trong môi trường thực tế.",
        content: "Chi tiết nội dung giảng dạy và hướng dẫn thực hành Bài 3.",
        slides: [{ name: "MKTS. Bài 3.pptx", size: "3.0 MB" }],
        attachments: [{ name: "3.Bai 3.pdf", size: "1.4 MB" }]
      },
      {
        id: "lesson_4",
        title: "Bài 4",
        objectives: "Kỹ năng kết nối các khối dữ liệu và xử lý gộp nâng cao.",
        outcomes: "• Thành thạo các phép ghép nối và gom nhóm dữ liệu.\n• Tối ưu hiệu năng xử lý kịch bản.",
        content: "Chi tiết nội dung giảng dạy Bài 4.",
        slides: [{ name: "MKTS. Bài 4.pptx", size: "1.9 MB" }],
        attachments: [{ name: "4.Bai 4.pdf", size: "850 KB" }]
      },
      {
        id: "lesson_5",
        title: "Bài 5",
        objectives: "Thiết kế truy vấn lồng nhau và xử lý tập hợp phức tạp.",
        outcomes: "• Viết câu lệnh lồng nâng cao.\n• Giải quyết các bài toán tối ưu quy mô lớn.",
        content: "Chi tiết nội dung giảng dạy Bài 5.",
        slides: [{ name: "MKTS. Bài 5.pptx", size: "2.0 MB" }],
        attachments: [{ name: "5.Bai 5.pdf", size: "920 KB" }]
      },
      {
        id: "lesson_6",
        title: "Bài 6",
        objectives: "Chuẩn hóa và tối ưu cấu trúc dữ liệu hệ thống.",
        outcomes: "• Loại bỏ dư thừa dữ liệu.\n• Bảo đảm tính nhất quán và toàn vẹn hệ thống.",
        content: "Chi tiết nội dung giảng dạy Bài 6.",
        slides: [{ name: "MKTS. Bài 6.pptx", size: "2.2 MB" }],
        attachments: [{ name: "6.Bai 6.pdf", size: "1.0 MB" }]
      },
      {
        id: "lesson_7",
        title: "Bài 7",
        objectives: "Quản trị giao dịch và cơ chế kiểm soát truy cập đồng thời.",
        outcomes: "• Kiểm soát tính nhất quán giao dịch.\n• Phòng chống bế tắc và xung đột tài nguyên.",
        content: "Chi tiết nội dung giảng dạy Bài 7.",
        slides: [{ name: "MKTS. Bài 7.pptx", size: "1.7 MB" }],
        attachments: [{ name: "7.Bai 7.pdf", size: "780 KB" }]
      },
      {
        id: "lesson_8",
        title: "Bài 8",
        objectives: "Lập trình kịch bản tự động hóa và thủ tục lưu trữ.",
        outcomes: "• Viết Stored Procedure và Trigger tự động.\n• Tăng tốc độ phản hồi dịch vụ hệ thống.",
        content: "Chi tiết nội dung giảng dạy Bài 8.",
        slides: [{ name: "MKTS. Bài 8.pptx", size: "2.5 MB" }],
        attachments: [{ name: "8.Bai 8.pdf", size: "1.3 MB" }]
      },
      {
        id: "lesson_9",
        title: "Bài 9",
        objectives: "Đánh chỉ mục và chiến lược sao lưu phục hồi hệ thống.",
        outcomes: "• Tối ưu kế hoạch thực thi câu lệnh.\n• Đảm bảo an toàn và bảo mật hệ thống.",
        content: "Chi tiết nội dung giảng dạy Bài 9.",
        slides: [{ name: "MKTS. Bài 9.pptx", size: "2.8 MB" }],
        attachments: [{ name: "9.Bai 9.pdf", size: "1.5 MB" }]
      },
      {
        id: "exam_lab",
        title: "Đề kiểm tra thực hành",
        objectives: "Đánh giá tổng hợp toàn bộ kỹ năng thực hành của sinh viên.",
        outcomes: "• Thực hiện hoàn chỉnh bài kiểm tra 60 phút trên máy.\n• Đạt yêu cầu đủ điều kiện dự thi kết thúc học phần.",
        content: "Thời gian làm bài: 60 phút trên phòng máy thực hành.",
        slides: [],
        attachments: [{ name: "DeThucHanh_CuoiKy_2026.pdf", size: "650 KB" }]
      }
    ];

    const lessons = defaultLessons;

    if (!activeLessonId) activeLessonId = 'general';
    if (!activeSubTab) activeSubTab = 'content';

    const currentLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
    const isGeneral = (currentLesson.id === 'general');
    const isTeacherOrAdmin = (state.currentRole === 'instructor' || state.currentRole === 'admin');

    contentArea.innerHTML = `
      <!-- Header Tiêu đề & Breadcrumb chuẩn ICTU LMS -->
      <div class="course-detail-header-bar">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="course-detail-title">
            <span style="font-size: 16px; margin-right: 6px;">≡</span> LỚP HỌC PHẦN &rsaquo; ${escapeHtml(course.name.toUpperCase())} (${escapeHtml(course.classCode)})
          </div>
          <button class="btn btn-outline btn-sm" id="btnBackToCoursesBtn">&larr; Quay lại danh sách lớp</button>
        </div>
      </div>

      <!-- Bố cục 2 Cột: Left Sub-sidebar Tree + Right Content Pane -->
      <div class="course-detail-layout">
        <!-- Sidebar bài học bên trái (Tree View chuẩn ICTU LMS) -->
        <div class="lesson-sub-sidebar">
          ${lessons.map(l => {
            const isCurrent = (l.id === activeLessonId);
            const isGen = (l.id === 'general');
            return `
              <div class="lesson-menu-group">
                <button class="lesson-menu-item ${isCurrent ? 'active' : ''}" data-lesson-id="${l.id}">
                  <span>${escapeHtml(l.title)}</span>
                  ${!isGen ? '<span class="check-mark">✓</span>' : ''}
                </button>
                ${(isCurrent && !isGen) ? `
                  <div class="lesson-sub-items">
                    <button class="lesson-sub-btn ${activeSubTab === 'content' ? 'active' : ''}" data-lesson-id="${l.id}" data-sub-tab="content">
                      • Nội dung bài học
                    </button>
                    <button class="lesson-sub-btn ${activeSubTab === 'materials' ? 'active' : ''}" data-lesson-id="${l.id}" data-sub-tab="materials">
                      • Tài liệu tham khảo
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Panel nội dung & tài liệu bên phải -->
        <div class="lesson-content-panel">
          ${isGeneral ? `
            <!-- VIEW THÔNG TIN CHUNG (Không phân sub-tabs) -->
            <div class="content-detail-wrapper">
              <div class="content-section">
                <h3 class="section-heading-blue">MỤC TIÊU MÔN HỌC</h3>
                <div class="section-body">
                  <p style="font-size: 14px; line-height: 1.6; color: var(--text-color);">${escapeHtml(currentLesson.objectives)}</p>
                </div>
              </div>

              <div class="content-section" style="margin-top: 24px;">
                <h3 class="section-heading-blue">CHUẨN ĐẦU RA MÔN HỌC</h3>
                <div class="section-body">
                  <p style="white-space: pre-line; font-size: 14px; line-height: 1.6; color: var(--text-color);">${escapeHtml(currentLesson.outcomes)}</p>
                </div>
              </div>

              <div class="content-section" style="margin-top: 24px;">
                <h3 class="section-heading-blue">ĐỀ CƯƠNG & QUY ĐỊNH HỌC PHẦN</h3>
                <div class="section-body">
                  <p style="white-space: pre-line; font-size: 14px; line-height: 1.6; color: var(--text-color);">${escapeHtml(currentLesson.content)}</p>
                </div>
              </div>

              <div class="content-section" style="margin-top: 24px;">
                <h3 class="section-heading-blue">TÀI LIỆU VÀ ĐỀ CƯƠNG MÔN HỌC</h3>
                <div class="material-box">
                  ${currentLesson.slides.map(file => `
                    <div class="file-item-row">
                      <div class="file-info-left">
                        <span class="file-icon-badge icon-pptx">PPT</span>
                        <span class="file-name">${escapeHtml(file.name)}</span>
                      </div>
                      <button class="btn-action-download btn-download-file" data-name="${escapeHtml(file.name)}">
                        <span>📥</span> Tải xuống
                      </button>
                    </div>
                  `).join('')}
                  ${currentLesson.attachments.map(file => `
                    <div class="file-item-row">
                      <div class="file-info-left">
                        <span class="file-icon-badge icon-pdf">PDF</span>
                        <span class="file-name">${escapeHtml(file.name)}</span>
                      </div>
                      <button class="btn-action-download btn-download-file" data-name="${escapeHtml(file.name)}">
                        <span>📥</span> Tải xuống
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : (activeSubTab === 'content' ? `
            <!-- VIEW NỘI DUNG BÀI HỌC (Ảnh 2) -->
            <div class="content-detail-wrapper">
              <div class="content-section">
                <h3 class="section-heading-blue">MỤC TIÊU BÀI HỌC</h3>
                <div class="section-body">
                  <p style="font-weight: 600; margin-bottom: 6px;">Mục tiêu:</p>
                  <div style="margin-left: 8px;">
                    <p style="font-weight: 600; margin-bottom: 4px;">Về kiến thức:</p>
                    <ul class="bullet-list-custom">
                      <li>Hiểu biết về khái niệm ${escapeHtml(course.name)} và nguyên lý cơ bản của ${escapeHtml(currentLesson.title)}.</li>
                      <li>Trình bày được sự khác biệt giữa lý thuyết và áp dụng thực tiễn.</li>
                      <li>Hiểu được quy trình thực hiện môn học.</li>
                    </ul>
                    <p style="font-weight: 600; margin-top: 8px; margin-bottom: 4px;">Về kỹ năng:</p>
                    <ul class="bullet-list-custom">
                      <li>Áp dụng hiểu biết và đặc trưng ${escapeHtml(currentLesson.title)} vào nghiệp vụ chuyên môn.</li>
                      <li>Sử dụng một số công cụ cơ bản trong một số nghiệp vụ chuyên ngành.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="content-section" style="margin-top: 24px;">
                <h3 class="section-heading-blue">CHUẨN ĐẦU RA</h3>
                
                <div class="outcome-block">
                  <h4 class="outcome-title">Hiểu sơ lược về ${escapeHtml(currentLesson.title)}</h4>
                  <div class="outcome-details">
                    <p>• <strong>Thời lượng:</strong> 1 tiết</p>
                    <p>• <strong>Phương pháp:</strong> Giảng dạy lý thuyết</p>
                    <p>• <strong>Mức độ yêu cầu:</strong> Hiểu</p>
                  </div>
                  <div class="outcome-content">
                    <p style="font-weight: 600; margin-bottom: 4px;">Nội dung giảng dạy</p>
                    <p style="white-space: pre-line;">${escapeHtml(currentLesson.content)}</p>
                  </div>
                </div>

                <div class="outcome-block">
                  <h4 class="outcome-title">Hiểu và áp dụng thực hành ${escapeHtml(currentLesson.title)}</h4>
                  <div class="outcome-details">
                    <p>• <strong>Thời lượng:</strong> 2 tiết</p>
                    <p>• <strong>Phương pháp:</strong> Giảng dạy lý thuyết & Thực hành</p>
                    <p>• <strong>Mức độ yêu cầu:</strong> Vận dụng</p>
                  </div>
                  <div class="outcome-content">
                    <p style="font-weight: 600; margin-bottom: 4px;">Nội dung giảng dạy</p>
                    <p style="white-space: pre-line;">${escapeHtml(currentLesson.outcomes)}</p>
                  </div>
                </div>
              </div>
            </div>
          ` : `
            <!-- VIEW TÀI LIỆU THAM KHẢO (Ảnh 3) -->
            <div class="materials-detail-wrapper">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 class="section-heading-blue" style="margin: 0;">TÀI LIỆU THAM KHẢO :</h3>
                ${isTeacherOrAdmin ? `
                  <button class="btn btn-primary btn-sm" id="btnAddMaterialBtn">+ Thêm tài liệu mới</button>
                ` : ''}
              </div>

              <div class="material-group" style="margin-bottom: 20px;">
                <h4 class="material-group-title">Slide bài giảng</h4>
                <div class="material-box">
                  ${(!currentLesson.slides || currentLesson.slides.length === 0) ? `
                    <div style="font-size: 14px; color: var(--text-muted); font-style: italic; padding: 12px 16px;">Chưa có slide bài giảng cho bài học này</div>
                  ` : currentLesson.slides.map((file, idx) => `
                    <div class="file-item-row">
                      <div class="file-info-left">
                        <span class="file-icon-badge icon-pptx">PPT</span>
                        <span class="file-name">${escapeHtml(file.name)}</span>
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-action-download btn-download-file" data-name="${escapeHtml(file.name)}">
                          <span>📥</span> Tải xuống
                        </button>
                        ${isTeacherOrAdmin ? `
                          <button class="btn btn-danger btn-sm btn-delete-file" data-type="slides" data-idx="${idx}">Xóa</button>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="material-group">
                <h4 class="material-group-title">File đính kèm</h4>
                <div class="material-box">
                  ${(!currentLesson.attachments || currentLesson.attachments.length === 0) ? `
                    <div style="font-size: 14px; color: var(--text-muted); font-style: italic; padding: 12px 16px;">Chưa có file đính kèm cho bài học này</div>
                  ` : currentLesson.attachments.map((file, idx) => `
                    <div class="file-item-row">
                      <div class="file-info-left">
                        <span class="file-icon-badge icon-pdf">PDF</span>
                        <span class="file-name">${escapeHtml(file.name)}</span>
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-action-download btn-download-file" data-name="${escapeHtml(file.name)}">
                          <span>📥</span> Tải xuống
                        </button>
                        ${isTeacherOrAdmin ? `
                          <button class="btn btn-danger btn-sm btn-delete-file" data-type="attachments" data-idx="${idx}">Xóa</button>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;

    // Gán sự kiện nút bấm
    document.getElementById('btnBackToCoursesBtn')?.addEventListener('click', () => renderCoursesTab(state.currentRole));

    document.querySelectorAll('.lesson-menu-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lId = e.currentTarget.getAttribute('data-lesson-id');
        // Nếu chuyển sang bài mới khác general, mặc định mở sub-tab content
        const nextSubTab = (lId === 'general') ? 'content' : activeSubTab;
        renderCourseDetailView(courseId, lId, nextSubTab);
      });
    });

    document.querySelectorAll('.lesson-sub-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lId = e.currentTarget.getAttribute('data-lesson-id');
        const sTab = e.currentTarget.getAttribute('data-sub-tab');
        renderCourseDetailView(courseId, lId, sTab);
      });
    });

    document.querySelectorAll('.btn-download-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn-download-file');
        const fileName = targetBtn.getAttribute('data-name');
        showToast(`Đã bắt đầu tải xuống tệp: ${fileName}`);
      });
    });

    if (isTeacherOrAdmin) {
      document.getElementById('btnAddMaterialBtn')?.addEventListener('click', () => {
        const fileName = prompt('Nhập tên tài liệu mới (ví dụ: MKTS. Bài 1_CapNhat.pptx):');
        if (fileName && fileName.trim()) {
          if (!currentLesson.slides) currentLesson.slides = [];
          currentLesson.slides.push({ name: fileName.trim(), size: '2.5 MB' });
          showToast(`Đã thêm tài liệu: ${fileName.trim()}`);
          renderCourseDetailView(courseId, activeLessonId, 'materials');
        }
      });

      document.querySelectorAll('.btn-delete-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const type = e.target.getAttribute('data-type');
          const idx = parseInt(e.target.getAttribute('data-idx'));
          if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
            if (type === 'slides') currentLesson.slides.splice(idx, 1);
            if (type === 'attachments') currentLesson.attachments.splice(idx, 1);
            showToast('Đã xóa tài liệu khỏi bài học');
            renderCourseDetailView(courseId, activeLessonId, 'materials');
          }
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // TAB 3: BÀI KIỂM TRA (QUIZZES) - FEATURE CHÍNH
  // --------------------------------------------------------------------------
  function renderQuizzesTab(role) {
    let headerHtml = '';
    let tableHtml = '';

    if (role === 'student') {
      tableHtml = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Tên bài kiểm tra</th>
                <th>Môn học</th>
                <th>Thời gian</th>
                <th>Hạn làm bài</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.quizzes.map(q => {
                let badgeClass = 'badge-secondary';
                let canStart = false;

                if (q.status === 'open') {
                  badgeClass = 'badge-success';
                  canStart = true;
                } else if (q.status === 'unopened') {
                  badgeClass = 'badge-secondary';
                } else if (q.status === 'submitted') {
                  badgeClass = 'badge-primary';
                } else if (q.status === 'expired') {
                  badgeClass = 'badge-danger';
                }

                return `
                  <tr>
                    <td><strong>${escapeHtml(q.title)}</strong></td>
                    <td>${escapeHtml(q.courseName)}</td>
                    <td>${escapeHtml(q.duration)}</td>
                    <td>${escapeHtml(q.deadline)}</td>
                    <td><span class="badge ${badgeClass}">${escapeHtml(q.statusText)}</span></td>
                    <td>
                      ${canStart ? `
                        <button class="btn btn-primary btn-sm btn-start-quiz" data-id="${q.id}">Làm bài</button>
                      ` : `
                        <button class="btn btn-outline btn-sm" disabled>Làm bài</button>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (role === 'instructor') {
      headerHtml = `
        <div style="margin-bottom: 16px;">
          <button class="btn btn-primary" id="btnCreateQuiz">+ Tạo bài kiểm tra</button>
        </div>
      `;
      tableHtml = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Lớp học phần</th>
                <th>Tên bài kiểm tra</th>
                <th>Số câu hỏi</th>
                <th>Đã nộp</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.quizzes.map(q => `
                <tr>
                  <td><span class="badge badge-secondary">${escapeHtml(q.classCode)}</span></td>
                  <td><strong>${escapeHtml(q.title)}</strong></td>
                  <td>${q.totalQuestions} câu</td>
                  <td>${q.submittedCount} bài</td>
                  <td><span class="badge ${q.status === 'open' ? 'badge-success' : 'badge-secondary'}">${escapeHtml(q.statusText)}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-view-quiz-results" data-id="${q.id}">Xem kết quả</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (role === 'admin') {
      tableHtml = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Mã lớp</th>
                <th>Tên bài kiểm tra</th>
                <th>Giảng viên</th>
                <th>Số bài nộp</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.quizzes.map(q => `
                <tr>
                  <td><span class="badge badge-secondary">${escapeHtml(q.classCode)}</span></td>
                  <td><strong>${escapeHtml(q.title)}</strong></td>
                  <td>${escapeHtml(q.instructor)}</td>
                  <td>${q.submittedCount} bài</td>
                  <td><span class="badge ${q.status === 'open' ? 'badge-success' : 'badge-secondary'}">${escapeHtml(q.statusText)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    contentArea.innerHTML = `
      <h1 class="page-title">Bài kiểm tra</h1>
      ${headerHtml}
      <div class="card">
        ${tableHtml}
      </div>
    `;

    // Gán sự kiện Làm bài cho Sinh viên
    if (role === 'student') {
      document.querySelectorAll('.btn-start-quiz').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const quizId = e.target.getAttribute('data-id');
          openQuizModal(quizId);
        });
      });
    }

    if (role === 'instructor') {
      document.getElementById('btnCreateQuiz')?.addEventListener('click', () => showToast('Mở màn hình soạn câu hỏi trắc nghiệm mới'));
      document.querySelectorAll('.btn-view-quiz-results').forEach(btn => {
        btn.addEventListener('click', (e) => {
          showToast(`Đang mở danh sách điểm bài kiểm tra: ${e.target.getAttribute('data-id')}`);
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // XỬ LÝ QUÍZ MODAL (<dialog>) & ĐỒNG HỒ ĐẾM NGƯỢC
  // --------------------------------------------------------------------------
  function openQuizModal(quizId) {
    const quiz = state.data.quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    state.activeQuiz = quiz;
    state.quizSecondsLeft = (quiz.durationMinutes || 15) * 60;

    // Render HTML nội dung Dialog
    quizDialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${escapeHtml(quiz.title)}</h2>
        <div class="timer-badge" id="quizTimerDisplay">15:00</div>
      </div>
      <form id="quizForm">
        <div class="modal-body">
          ${quiz.questions.map((q, idx) => `
            <div class="question-item">
              <div class="question-text">${escapeHtml(q.question)}</div>
              ${q.options.map((opt, oIdx) => `
                <label class="option-label">
                  <input type="radio" name="q_${q.id}" value="${oIdx}" ${oIdx === 0 ? 'required' : ''}>
                  <span>${escapeHtml(opt)}</span>
                </label>
              `).join('')}
            </div>
          `).join('')}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="btnExitQuiz">Thoát</button>
          <button type="submit" class="btn btn-primary">Nộp bài</button>
        </div>
      </form>
    `;

    // Mở Modal HTML5 native <dialog>
    if (typeof quizDialog.showModal === 'function') {
      quizDialog.showModal();
    } else {
      quizDialog.setAttribute('open', 'true');
    }

    // Bắt đầu đếm ngược thời gian
    startQuizTimer();

    // Sự kiện Nộp bài
    document.getElementById('quizForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submitQuiz();
    });

    // Sự kiện Thoát
    document.getElementById('btnExitQuiz').addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn thoát? Bài làm chưa nộp sẽ không được lưu.')) {
        closeQuizModal();
      }
    });
  }

  function startQuizTimer() {
    clearInterval(state.quizTimerInterval);
    const timerDisplay = document.getElementById('quizTimerDisplay');

    function updateDisplay() {
      const minutes = Math.floor(state.quizSecondsLeft / 60);
      const seconds = state.quizSecondsLeft % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      if (timerDisplay) {
        timerDisplay.textContent = formatted;
      }

      if (state.quizSecondsLeft <= 0) {
        clearInterval(state.quizTimerInterval);
        alert('Hết giờ làm bài! Hệ thống tự động nộp bài của bạn.');
        submitQuiz();
      } else {
        state.quizSecondsLeft--;
      }
    }

    updateDisplay();
    state.quizTimerInterval = setInterval(updateDisplay, 1000);
  }

  function submitQuiz() {
    clearInterval(state.quizTimerInterval);
    const quiz = state.activeQuiz;
    if (!quiz) return;

    let correctCount = 0;
    quiz.questions.forEach(q => {
      const selectedRadio = document.querySelector(`input[name="q_${q.id}"]:checked`);
      if (selectedRadio && parseInt(selectedRadio.value) === q.correct) {
        correctCount++;
      }
    });

    const total = quiz.questions.length || 3;
    const finalScore = ((correctCount / total) * 10).toFixed(1);

    // Cập nhật trạng thái bài kiểm tra sang Đã nộp
    quiz.status = 'submitted';
    quiz.statusText = `Đã nộp (${finalScore}/10)`;
    quiz.score = `${finalScore}/10`;
    quiz.submittedCount = (quiz.submittedCount || 0) + 1;

    // Cập nhật bài kiểm tra sắp tới trong Stats của sinh viên
    const studentStats = state.data.stats.student.find(s => s.label === 'Bài kiểm tra sắp tới');
    if (studentStats && parseInt(studentStats.value) > 0) {
      studentStats.value = String(parseInt(studentStats.value) - 1);
    }

    closeQuizModal();
    alert(`Đã nộp bài thành công!\nSố câu trả lời đúng: ${correctCount}/${total}\nĐiểm số: ${finalScore} / 10.0`);
    showToast(`Đã nộp bài kiểm tra. Điểm của bạn: ${finalScore}/10`);
    renderCurrentTab();
  }

  function closeQuizModal() {
    clearInterval(state.quizTimerInterval);
    state.activeQuiz = null;
    if (typeof quizDialog.close === 'function') {
      quizDialog.close();
    } else {
      quizDialog.removeAttribute('open');
    }
  }

  // --------------------------------------------------------------------------
  // TAB 4: ĐỀ THI (EXAM REPOSITORY)
  // --------------------------------------------------------------------------
  function renderExamsTab(role) {
    const isTeacherOrAdmin = (role === 'instructor' || role === 'admin');

    contentArea.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <h1 class="page-title" style="margin-bottom: 0;">Kho đề thi</h1>
        ${isTeacherOrAdmin ? `
          <button class="btn btn-primary" id="btnUploadExam">+ Tải đề thi lên</button>
        ` : ''}
      </div>

      <div class="card">
        <div class="filter-row">
          <input type="text" id="examSearchInput" class="form-control" placeholder="Tìm theo tên môn hoặc mã môn...">
          <select id="examYearSelect" class="form-control">
            <option value="">Tất cả các năm</option>
            <option value="2025">Năm 2025</option>
            <option value="2024">Năm 2024</option>
            <option value="2023">Năm 2023</option>
          </select>
        </div>

        <div class="table-container">
          <table class="table" id="examTable">
            <thead>
              <tr>
                <th>Môn học</th>
                <th>Loại đề thi</th>
                <th>Năm</th>
                <th>Định dạng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${renderExamRows(state.data.exams)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Gán sự kiện Lọc trực tiếp khi gõ hoặc chọn năm
    const searchInput = document.getElementById('examSearchInput');
    const yearSelect = document.getElementById('examYearSelect');

    function filterExams() {
      const q = searchInput.value.toLowerCase().trim();
      const yr = yearSelect.value;

      const filtered = state.data.exams.filter(exam => {
        const matchQuery = exam.courseName.toLowerCase().includes(q) || exam.courseId.toLowerCase().includes(q);
        const matchYear = yr === '' || exam.year === yr;
        return matchQuery && matchYear;
      });

      const tbody = document.querySelector('#examTable tbody');
      if (tbody) {
        tbody.innerHTML = renderExamRows(filtered);
        attachExamDownloadEvents();
      }
    }

    searchInput?.addEventListener('input', filterExams);
    yearSelect?.addEventListener('change', filterExams);

    attachExamDownloadEvents();

    if (isTeacherOrAdmin) {
      document.getElementById('btnUploadExam')?.addEventListener('click', () => {
        showToast('Đã mở hộp thoại tải tệp đề thi mới lên hệ thống');
      });
    }
  }

  function renderExamRows(examList) {
    if (examList.length === 0) {
      return `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Không tìm thấy đề thi phù hợp</td></tr>`;
    }
    return examList.map(e => `
      <tr>
        <td>
          <div style="font-weight: 600;">${escapeHtml(e.courseName)}</div>
          <small style="color: var(--text-muted);">${escapeHtml(e.courseId)}</small>
        </td>
        <td><span class="badge ${e.type === 'Cuối kỳ' ? 'badge-primary' : 'badge-secondary'}">${escapeHtml(e.type)}</span></td>
        <td>${escapeHtml(e.year)}</td>
        <td><span class="badge badge-secondary">${escapeHtml(e.format)} (${e.size})</span></td>
        <td>
          <button class="btn btn-outline btn-sm btn-download-exam" data-title="${escapeHtml(e.courseName)}_${e.type}_${e.year}">Tải về</button>
        </td>
      </tr>
    `).join('');
  }

  function attachExamDownloadEvents() {
    document.querySelectorAll('.btn-download-exam').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.target.getAttribute('data-title');
        showToast(`Đã tải xuống tập tin: ${title}`);
      });
    });
  }

  // --------------------------------------------------------------------------
  // TAB 5: CÀI ĐẶT
  // --------------------------------------------------------------------------
  function renderSettingsTab(role) {
    const user = state.data.users[role];

    contentArea.innerHTML = `
      <h1 class="page-title">Cài đặt</h1>

      <!-- Thẻ 1: Thông tin cá nhân -->
      <div class="card">
        <h2 class="card-title" style="margin-bottom: 16px;">Thông tin cá nhân</h2>
        <form id="profileForm">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            <div class="form-group">
              <label class="form-label" for="profileName">Họ và tên</label>
              <input type="text" id="profileName" class="form-control" value="${escapeHtml(user.name)}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="profileEmail">Địa chỉ email</label>
              <input type="email" id="profileEmail" class="form-control" value="${escapeHtml(user.email)}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="profilePhone">Số điện thoại</label>
              <input type="tel" id="profilePhone" class="form-control" value="${escapeHtml(user.phone)}">
            </div>
            <div class="form-group">
              <label class="form-label" for="profileDept">Khoa / Đơn vị</label>
              <input type="text" id="profileDept" class="form-control" value="${escapeHtml(user.department)}">
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
        </form>
      </div>

      <!-- Thẻ 2: Đổi mật khẩu -->
      <div class="card">
        <h2 class="card-title" style="margin-bottom: 16px;">Đổi mật khẩu</h2>
        <form id="passwordForm" style="max-width: 480px;">
          <div class="form-group">
            <label class="form-label" for="currPass">Mật khẩu hiện tại</label>
            <input type="password" id="currPass" class="form-control" required placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label" for="newPass">Mật khẩu mới</label>
            <input type="password" id="newPass" class="form-control" required placeholder="Mật khẩu mới">
          </div>
          <div class="form-group">
            <label class="form-label" for="confirmPass">Nhập lại mật khẩu mới</label>
            <input type="password" id="confirmPass" class="form-control" required placeholder="Xác nhận mật khẩu mới">
          </div>
          <button type="submit" class="btn btn-primary">Cập nhật mật khẩu</button>
        </form>
      </div>

      <!-- Thẻ 3: Giao diện và thông báo -->
      <div class="card">
        <h2 class="card-title" style="margin-bottom: 16px;">Giao diện và thông báo</h2>
        
        <div class="form-group" style="max-width: 320px; margin-bottom: 20px;">
          <label class="form-label" for="themeSelect">Chế độ giao diện</label>
          <select id="themeSelect" class="form-control">
            <option value="light" ${state.theme === 'light' ? 'selected' : ''}>Giao diện Sáng</option>
            <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>Giao diện Tối</option>
            <option value="system" ${state.theme === 'system' ? 'selected' : ''}>Theo thiết bị (Hệ điều hành)</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" checked style="accent-color: var(--primary-color); width: 18px; height: 18px;">
            <span>Email nhắc hạn bài kiểm tra</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" checked style="accent-color: var(--primary-color); width: 18px; height: 18px;">
            <span>Thông báo điểm mới và kết quả học tập</span>
          </label>
        </div>
      </div>
    `;

    // Sự kiện Cập nhật thông tin cá nhân
    document.getElementById('profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      user.name = document.getElementById('profileName').value;
      user.email = document.getElementById('profileEmail').value;
      user.phone = document.getElementById('profilePhone').value;
      user.department = document.getElementById('profileDept').value;

      updateHeaderUser();
      showToast('Đã lưu thay đổi thông tin cá nhân');
    });

    // Sự kiện Đổi mật khẩu
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const nPass = document.getElementById('newPass').value;
      const cPass = document.getElementById('confirmPass').value;

      if (nPass !== cPass) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }

      document.getElementById('currPass').value = '';
      document.getElementById('newPass').value = '';
      document.getElementById('confirmPass').value = '';
      showToast('Đã cập nhật mật khẩu thành công');
    });

    // Sự kiện Thay đổi Theme
    document.getElementById('themeSelect').addEventListener('change', (e) => {
      initTheme(e.target.value);
      showToast(`Đã chuyển sang chế độ giao diện: ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // ==========================================================================
  // VÒNG ĐỜI & KHỞI TẠO NỀN TẢNG OMNIBRAIN AI PLATFORM (MULTI-MODEL + SECURITY)
  // ==========================================================================
  function initAiChat() {
    const triggerBtn = document.getElementById('aiChatTrigger');
    const chatWindow = document.getElementById('aiChatWindow');
    const closeBtn = document.getElementById('btnAiClose');
    const clearBtn = document.getElementById('btnAiClear');
    const apiKeyBtn = document.getElementById('btnAiApiKey');
    const chatBody = document.getElementById('aiChatBody');
    const chatInput = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiSendBtn');
    const promptChips = document.querySelectorAll('.prompt-chip');
    const modelSelect = document.getElementById('aiModelSelect');
    const modelBadge = document.getElementById('aiModelBadge');

    if (!triggerBtn || !chatWindow) return;

    // Hàm tự động phân loại câu hỏi sang mô hình AI phù hợp (Auto-Routing)
    function classifyIntentModel(text) {
      if (modelSelect && modelSelect.value) return modelSelect.value;
      const lower = text.toLowerCase();
      if (/\b(code|lập trình|viết hàm|java|python|sql|select|join|react|html|css|js|javascript|spring|api|bug|lỗi|thuật toán)\b/i.test(lower)) {
        return 'code-assist';
      }
      if (/\b(lộ trình|ôn thi|học thế nào|hướng dẫn học|bài tập|mẹo|phương pháp)\b/i.test(lower)) {
        return 'edubrain-guide';
      }
      if (/\b(tóm tắt|ngắn gọn|nhanh|tính)\b/i.test(lower) || text.trim().split(/\s+/).length <= 5) {
        return 'gemini-flash';
      }
      return 'gemini-pro';
    }

    function updateModelBadgeUI(model) {
      if (!modelBadge) return;
      const map = {
        'code-assist': { label: '💻 CodeAssist AI', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
        'gemini-flash': { label: '⚡ Gemini 1.5 Flash', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
        'edubrain-guide': { label: '📘 EduBrain Guide', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
        'edubrain': { label: '📘 EduBrain Guide', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
        'gemini-pro': { label: '🧠 Gemini 1.5 Pro', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' }
      };
      const cfg = map[model] || map['gemini-pro'];
      modelBadge.textContent = cfg.label;
      modelBadge.style.background = cfg.bg;
      modelBadge.style.color = cfg.color;
      modelBadge.style.borderColor = cfg.border;
      modelBadge.style.fontStyle = 'normal';
    }

    // Cấu hình API Key trực tiếp (Google Gemini / Groq / OpenAI)
    apiKeyBtn?.addEventListener('click', () => {
      const currentKey = localStorage.getItem('omnibrain_api_key') || '';
      const inputKey = prompt(
        '🔑 CẤU HÌNH API KEY CHO OMNIBRAIN AI (Tùy chọn):\n\n' +
        '• Nhập Google Gemini API Key (bắt đầu bằng AIza...) - Lấy miễn phí tại aistudio.google.com\n' +
        '• Hoặc Groq Cloud API Key (bắt đầu bằng gsk_...)\n' +
        '• Hoặc OpenAI API Key (bắt đầu bằng sk-...)\n' +
        '• Để trống nếu muốn dùng Cloud AI Miễn phí tích hợp sẵn:',
        currentKey
      );
      if (inputKey !== null) {
        const trimmed = inputKey.trim();
        if (trimmed) {
          localStorage.setItem('omnibrain_api_key', trimmed);
          showToast('Đã lưu API Key! OmniBrain sẽ gọi trực tiếp LLM tốc độ cao.');
          appendMessage('ai', '✅ **Đã kết nối API Key cá nhân thành công!** Giờ đây mọi câu hỏi của bạn sẽ được trả lời trực tiếp qua LLM tốc độ cao.');
        } else {
          localStorage.removeItem('omnibrain_api_key');
          showToast('Đã chuyển về chế độ Cloud AI Miễn phí mặc định.');
        }
      }
    });

    // 1. Mở / Đóng Hộp thoại Chat
    triggerBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('hidden');
      if (!chatWindow.classList.contains('hidden')) {
        chatInput.focus();
      }
    });

    closeBtn?.addEventListener('click', () => {
      chatWindow.classList.add('hidden');
    });

    // 2. Xóa lịch sử trò chuyện
    clearBtn?.addEventListener('click', () => {
      chatBody.innerHTML = `
        <div class="chat-message ai">
          <div class="chat-avatar">🧠</div>
          <div class="chat-bubble">
            Đã làm sạch lịch sử trò chuyện OmniBrain. Bạn có thể đặt bất kỳ câu hỏi nào!
          </div>
        </div>
      `;
    });

    // 3. Thông báo khi chuyển đổi Mô hình AI
    modelSelect?.addEventListener('change', (e) => {
      const selectedModelName = e.target.options[e.target.selectedIndex].text;
      showToast(`OmniBrain: Đã chuyển sang mô hình ${selectedModelName}`);
      appendMessage('ai', `🧠 **OmniBrain Notification**: Đã kích hoạt thành công **${selectedModelName}**. Bạn có thể gửi câu hỏi ngay!`);
    });

    // 4. Gửi tin nhắn từ người dùng (Kết hợp Bảo mật + Nội bộ LMS + Live Generative LLM cho MỌI câu hỏi)
    async function handleSendMessage(text) {
      const messageText = text || chatInput.value.trim();
      if (!messageText) return;

      // Hiển thị tin nhắn người dùng
      appendMessage('user', messageText);
      if (!text) chatInput.value = '';

      // Hiển thị Typing Indicator
      const typingEl = appendTypingIndicator();
      const selectedModel = classifyIntentModel(messageText);
      updateModelBadgeUI(selectedModel);

      // Lấy thông tin tài khoản đang đăng nhập trên thiết bị theo vai trò hiện tại
      const roleKey = state.currentRole || 'student';
      const roleNormalized = roleKey.replace('ROLE_', '').toLowerCase();
      const currentUserObj = state.data.users[roleKey] || state.data.users[roleNormalized] || {};
      const userFullName = currentUserObj.name || currentUserObj.fullName || (roleNormalized === 'instructor' ? 'TS. Trần Thị Mai' : 'Nguyễn Văn An');
      const userCode = currentUserObj.code || currentUserObj.instructorCode || currentUserObj.studentCode || (roleNormalized === 'instructor' ? 'MSGV 10245' : 'MSSV 22110045');
      const userEmail = currentUserObj.email || (roleNormalized === 'instructor' ? 'mai.tt@eduportal.edu.vn' : 'an.nv22110045@st.eduportal.edu.vn');
      const userDept = currentUserObj.department || 'Khoa Công nghệ Thông tin - ICTU';

      // BƯỚC 1: Kiểm tra Rule nội bộ (Security Guard, Phép tính toán học, Hồ sơ cá nhân, Câu hỏi LMS cốt lõi)
      const localRuleResponse = generateOmniBrainResponse(messageText, selectedModel, state.currentRole);
      if (localRuleResponse && localRuleResponse.isDirectMatch) {
        setTimeout(() => {
          typingEl.remove();
          appendMessage('ai', localRuleResponse.text, localRuleResponse.isSecurityWarning);
        }, 350);
        return;
      }

      // BƯỚC 2: Gọi trực tiếp Live Generative AI (Trả lời BẤT KỲ câu hỏi nào như ChatGPT/Gemini)
      try {
        const liveAiText = await callRealGenerativeAI(messageText, selectedModel, {
          role: roleNormalized,
          userFullName,
          userCode,
          userEmail,
          userDept
        });
        if (liveAiText) {
          typingEl.remove();
          appendMessage('ai', liveAiText, false);
          return;
        }
      } catch (err) {
        console.warn("Live Generative AI error:", err);
      }

      // BƯỚC 3: Fallback nếu đứt cáp hoàn toàn
      typingEl.remove();
      const fallbackObj = localRuleResponse || {
        isSecurityWarning: false,
        text: `🧠 **[OmniBrain AI]**: Xin vui lòng kiểm tra kết nối mạng hoặc nhấn biểu tượng **🔑** trên góc phải khung chat để nhập Google Gemini / Groq API Key giúp phản hồi tức thì mọi câu hỏi!`
      };
      appendMessage('ai', fallbackObj.text, fallbackObj.isSecurityWarning);
    }

    sendBtn?.addEventListener('click', () => handleSendMessage());
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // 5. Sự kiện click Gợi ý nhanh (Prompt Chips)
    promptChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const promptText = e.target.getAttribute('data-prompt');
        handleSendMessage(promptText);
      });
    });

    // Hàm chèn tin nhắn vào ô chat
    function appendMessage(sender, text, isSecurityWarning = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${sender}`;

      const avatar = (sender === 'ai') ? '🧠' : '👤';
      const formattedContent = formatMessageText(text);

      msgDiv.innerHTML = `
        <div class="chat-avatar">${avatar}</div>
        <div class="chat-bubble ${isSecurityWarning ? 'security-warning-bubble' : ''}">${formattedContent}</div>
      `;

      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Hiển thị bong bóng typing animation
    function appendTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-message ai';
      typingDiv.innerHTML = `
        <div class="chat-avatar">🧠</div>
        <div class="chat-bubble" style="padding: 6px 12px;">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      chatBody.appendChild(typingDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
      return typingDiv;
    }

    // Format văn bản đơn giản (Bold, Code block, Xuống dòng)
    function formatMessageText(str) {
      let text = escapeHtml(str);
      // Format **Bold**
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Format `Code`
      text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Format ```Code block```
      text = text.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
      // Downline
      text = text.replace(/\n/g, '<br>');
      return text;
    }

    // HÀM TÍNH TOÁN BIỂU THỨC TOÁN HỌC TỰ ĐỘNG
    function tryEvaluateMath(input) {
      if (!input) return null;
      let cleaned = input.toLowerCase()
        .replace(/kết quả (của )?(phép tính )?/gi, '')
        .replace(/bằng bao nhiêu\??/gi, '')
        .replace(/tính toán/gi, '')
        .replace(/tính/gi, '')
        .replace(/bằng/gi, '')
        .replace(/=/g, '')
        .trim();

      let expr = cleaned
        .replace(/nhân/gi, '*')
        .replace(/chia/gi, '/')
        .replace(/cộng/gi, '+')
        .replace(/trừ/gi, '-')
        .replace(/mũ/gi, '^')
        .replace(/\bx\b/gi, '*')
        .replace(/×/gi, '*')
        .replace(/÷/gi, '/')
        .trim();

      if (/^[0-9\.\s\+\-\*\/\(\)\^]+$/.test(expr) && /[0-9]/.test(expr)) {
        try {
          const jsExpr = expr.replace(/\^/g, '**');
          const evalResult = new Function(`return (${jsExpr});`)();
          if (typeof evalResult === 'number' && !isNaN(evalResult) && isFinite(evalResult)) {
            const displayExpr = expr
              .replace(/\*/g, ' × ')
              .replace(/\//g, ' ÷ ')
              .replace(/\+/g, ' + ')
              .replace(/\-/g, ' − ')
              .replace(/\s+/g, ' ')
              .trim();
            return {
              originalExpr: displayExpr,
              result: evalResult
            };
          }
        } catch (e) {}
      }
      return null;
    }

    // HÀM GỌI TRỰC TIẾP LIVE GENERATIVE AI (GEMINI / GROQ / OPENAI / CLOUD AI / WIKIPEDIA)
    async function callRealGenerativeAI(userPrompt, model, userInfo) {
      const apiKey = (localStorage.getItem('omnibrain_api_key') || '').trim();
      const modelPrefix = model === 'code-assist' ? '💻 **[CodeAssist AI]**' :
                          model === 'gemini-flash' ? '⚡ **[Gemini 1.5 Flash]**' :
                          (model === 'edubrain' || model === 'edubrain-guide') ? '📘 **[EduBrain Study Guide]**' :
                          '🧠 **[Gemini 1.5 Pro]**';

      const systemPrompt = `Bạn là trợ lý trí tuệ nhân tạo OmniBrain AI Platform (${model}) trên hệ thống đại học UniLMS (ICTU).
Thông tin tài khoản đang đăng nhập trên thiết bị:
- Họ và tên: ${userInfo.userFullName} (${userInfo.userCode})
- Vai trò: ${userInfo.role} | Đơn vị: ${userInfo.userDept} | Email: ${userInfo.userEmail}
Quy tắc bắt buộc:
1. Nếu vai trò là student (Sinh viên), tuyệt đối KHÔNG cho phép truy cập hoặc thao tác trực tiếp vào Database hệ thống.
2. Trả lời trực tiếp, đầy đủ, chính xác, sâu sắc bằng tiếng Việt cho BẤT KỲ câu hỏi nào người dùng hỏi (khoa học, lịch sử, CNTT, lập trình, toán học, đời sống, ngoại ngữ...).
3. Trình bày rõ ràng bằng gạch đầu dòng và in đậm (**...**). Không bao giờ trả lời chung chung kiểu "Giải đáp cho câu hỏi...".`;

      // 1. NẾU NGƯỜI DÙNG ĐÃ CẤU HÌNH GOOGLE GEMINI API KEY (AIza...)
      if (apiKey.startsWith('AIza')) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
          const res = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
            })
          });
          if (res.ok) {
            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) return `${modelPrefix}:\n\n${reply.trim()}`;
          }
        } catch (e) {
          console.warn('Gemini API error:', e);
        }
      }

      // 2. NẾU NGƯỜI DÙNG CẤU HÌNH GROQ KEY (gsk_...) HOẶC OPENAI KEY (sk-...)
      if (apiKey.startsWith('gsk_') || apiKey.startsWith('sk-')) {
        try {
          const isGroq = apiKey.startsWith('gsk_');
          const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
          const llmModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: llmModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7
            })
          });
          if (res.ok) {
            const data = await res.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (reply) return `${modelPrefix}:\n\n${reply.trim()}`;
          }
        } catch (e) {
          console.warn('Groq/OpenAI API error:', e);
        }
      }

      // 3. GỌI POLLINATIONS CLOUD LLM MIỄN PHÍ (KHÔNG CẦN API KEY) KẾT HỢP TIMEOUT 7 GIÂY
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7500);
        const res = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'openai-fast',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });
        clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply && reply.trim().length > 10) {
            return `${modelPrefix}:\n\n${reply.trim()}`;
          }
        }
      } catch (e) {
        console.warn('Cloud LLM fallback to Live Knowledge Graph:', e);
      }

      // 4. TRUY VẤN TRỰC TIẾP WIKIPEDIA TIẾNG VIỆT API (REAL-TIME KNOWLEDGE GRAPH CHO MỌI CHỦ ĐỀ)
      try {
        let cleanQuery = userPrompt
          .replace(/^(bạn có thể|hãy|làm ơn|cho tôi biết|giải thích|tóm tắt|trình bày|nêu|cho hỏi|về|khái niệm|định nghĩa|lịch sử)\s+/gi, '')
          .replace(/\s+(không|nhé|ạ|với|là gì|như thế nào|ra sao)\??$/gi, '')
          .replace(/\?/g, '')
          .trim();
        if (!cleanQuery) cleanQuery = userPrompt;

        const wikiSearchUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&utf8=&format=json&origin=*&srlimit=2`;
        const searchRes = await fetch(wikiSearchUrl);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const firstHit = searchData?.query?.search?.[0];
          if (firstHit && firstHit.title) {
            const summaryUrl = `https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstHit.title)}`;
            const sumRes = await fetch(summaryUrl);
            if (sumRes.ok) {
              const sumData = await sumRes.json();
              if (sumData && sumData.extract) {
                return `${modelPrefix} — **${sumData.title}**:\n\n${sumData.extract}\n\n💡 *Nguồn tri thức trực tuyến: Bách khoa toàn thư mở & OmniBrain Knowledge Engine.*`;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Wikipedia API error:', e);
      }

      return null;
    }

    // BỘ MÁY PHẢN HỒI OMNIBRAIN AI PLATFORM (KIỂM TRA QUYỀN SINH VIÊN & ĐA MÔ HÌNH)
    function generateOmniBrainResponse(input, model, role) {
      const text = input.toLowerCase();

      // =========================================================================
      // 1. BẢO VỆ BẢO MẬT (SECURITY GUARD): SINH VIÊN KHÔNG ĐƯỢC TRUY CẬP DATABASE
      // =========================================================================
      const dbKeywords = ['database', 'cơ sở dữ liệu hệ thống', 'xem db', 'drop table', 'select *', 'mật khẩu', 'password', 'truy cập db', 'xem bảng điểm người khác', 'truy vấn db', 'sql injection', 'postgres'];
      
      const isTryingDbAccess = dbKeywords.some(kw => text.includes(kw));

      if ((role === 'student' || role === 'ROLE_STUDENT') && isTryingDbAccess && !text.includes('môn cơ sở dữ liệu') && !text.includes('tóm tắt')) {
        const studentName = state.data.users?.student?.name || 'Sinh viên';
        return {
          isDirectMatch: true,
          isSecurityWarning: true,
          text: `🔒 **CẢNH BÁO BẢO MẬT OMNIBRAIN AI SECURITY GUARD**\n\nTài khoản Sinh viên (**${studentName}**) **KHÔNG CÓ QUYỀN** truy cập hoặc can thiệp trực tiếp vào Cơ sở dữ liệu hệ thống (PostgreSQL Database).\n\n⚠️ *Hệ thống đã chặn yêu cầu này để bảo mật thông tin. Bạn chỉ có thể hỏi trợ lý AI về giải đáp bài học, tóm tắt tài liệu môn học hoặc tư vấn phương pháp học.*`
        };
      }

      // =========================================================================
      // 2. TÍNH TOÁN PHÉP TÍNH TOÁN HỌC (NẾU CÓ)
      // =========================================================================
      const mathRes = tryEvaluateMath(input);
      if (mathRes) {
        if (model === 'code-assist') {
          return {
            isDirectMatch: true,
            isSecurityWarning: false,
            text: `💻 **[CodeAssist AI - Biểu thức Toán học trong Code]**:\n\`\`\`java\n// Cú pháp tính toán Java / C++\ndouble result = ${mathRes.originalExpr.replace(/×/g, '*').replace(/÷/g, '/')};\nSystem.out.println("Kết quả = " + result); // Output: ${mathRes.result}\n\`\`\`\n👉 **Kết quả phép tính**: **\`${mathRes.originalExpr} = ${mathRes.result}\`**`
          };
        }
        if (model === 'gemini-flash') {
          return {
            isDirectMatch: true,
            isSecurityWarning: false,
            text: `⚡ **[Gemini 1.5 Flash]**: \`${mathRes.originalExpr} = ${mathRes.result}\``
          };
        }
        if (model === 'edubrain' || model === 'edubrain-guide') {
          return {
            isDirectMatch: true,
            isSecurityWarning: false,
            text: `📘 **[EduBrain Study Guide]**: Đáp án phép tính \`${mathRes.originalExpr}\` là **\`${mathRes.result}\`**.\n\n💡 *Mẹo*: Hãy nhớ kiểm tra thứ tự thực hiện phép tính (Nhân chia trước, Cộng trừ sau) khi giải các bài tập!`
          };
        }
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro - Phân tích Phép tính]**:\n\n• **Biểu thức**: \`${mathRes.originalExpr}\`\n• **Kết quả chính xác**: **\`${mathRes.result}\`**\n\n💡 *Ghi chú*: Kết quả đã được xác minh qua bộ máy OmniBrain Math Engine.`
        };
      }

      // =========================================================================
      // 2.5 TỔNG HỢP THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP TRÊN THIẾT BỊ
      // =========================================================================
      const profileKeywords = [
        'thông tin về tôi', 'tổng hợp thông tin về tôi', 'thông tin của tôi',
        'tôi là ai', 'hồ sơ của tôi', 'xem hồ sơ', 'thông tin cá nhân',
        'tài khoản của tôi', 'gpa của tôi', 'môn tôi đang học', 'hồ sơ cá nhân'
      ];

      if (profileKeywords.some(kw => text.includes(kw))) {
        const roleKey = state.currentRole || 'student';
        const roleNormalized = roleKey.replace('ROLE_', '').toLowerCase();
        const currentUserObj = state.data.users[roleKey] || state.data.users[roleNormalized] || {};
        const userName = currentUserObj.name || currentUserObj.fullName || (roleNormalized === 'instructor' ? 'TS. Trần Thị Mai' : 'Nguyễn Văn An');
        const userCode = currentUserObj.code || currentUserObj.instructorCode || currentUserObj.studentCode || (roleNormalized === 'instructor' ? 'MSGV 10245' : 'MSSV 22110045');
        const userEmail = currentUserObj.email || (roleNormalized === 'instructor' ? 'mai.tt@eduportal.edu.vn' : 'an.nv22110045@st.eduportal.edu.vn');
        const userDept = currentUserObj.department || 'Khoa Công nghệ Thông tin - ICTU';

        if (role === 'ROLE_INSTRUCTOR' || role === 'instructor') {
          return {
            isDirectMatch: true,
            isSecurityWarning: false,
            text: `👨‍🏫 **[OmniBrain AI] Tổng hợp Hồ sơ Giảng dạy của Bạn**:\n\n• **Họ và tên**: **${userName}**\n• **Mã giảng viên (MSGV)**: **${userCode}**\n• **Đơn vị công tác**: **${userDept}**\n• **Email hệ thống**: \`${userEmail}\`\n• **Vai trò**: **Giảng viên (INSTRUCTOR)**\n\n📖 **Các lớp học phần đang phụ trách**:\n1. **Cơ sở dữ liệu (INT2211)** - 5 lớp (Sĩ số: 120 Sinh viên)\n2. **Lập trình hướng đối tượng (INT2204)** - 3 lớp\n3. **Lập trình Web (INT3306)** - 2 lớp\n\n📊 **Trạng thái**: Đã duyệt bảng điểm Chuyên cần & Quiz TX1. Có 1 bài kiểm tra giữa kỳ chờ chấm!`
          };
        }
        if (role === 'ROLE_ADMIN' || role === 'admin') {
          return {
            isDirectMatch: true,
            isSecurityWarning: false,
            text: `🛡️ **[OmniBrain AI] Tổng hợp Hồ sơ Quản trị viên Hệ thống**:\n\n• **Họ và tên**: **${userName}**\n• **Mã quản trị**: **${userCode}**\n• **Đơn vị công tác**: **${userDept}**\n• **Email hệ thống**: \`${userEmail}\`\n• **Quyền hạn**: **Quản trị toàn trường (ROLE_ADMIN)**\n\n🏫 **Tổng quan Toàn trường UniLMS**:\n• **Tổng số sinh viên**: 1.240 tài khoản\n• **Tổng số giảng viên**: 48 tài khoản\n• **Lớp học phần mở**: 32 lớp HP đang hoạt động`
          };
        }
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `👤 **[OmniBrain AI] Tổng hợp Hồ sơ & Tiến độ Học tập của Bạn**:\n\n• **Họ và tên**: **${userName}**\n• **Mã sinh viên (MSSV)**: **${userCode}**\n• **Lớp học phần**: **K18-CNTT01** (${userDept})\n• **Email hệ thống**: \`${userEmail}\`\n• **Điểm trung bình (GPA)**: **3.52 / 4.0** *(Xếp loại: Giỏi)*\n\n📚 **Các môn học kỳ hiện tại (4 môn tín chỉ)**:\n1. **Cơ sở dữ liệu (INT2211)** - 3 Tín chỉ | GV: TS. Trần Thị Mai\n2. **Lập trình Enterprise với Java & Spring Boot 3 (INT3308)** - 3 Tín chỉ | GV: PGS. TS. Trần Đức Minh\n3. **Lập trình Web (INT3306)** - 3 Tín chỉ | GV: ThS. Lê Hoàng Nam\n4. **Tiếng Anh chuyên ngành (FLF1105)** - 2 Tín chỉ | GV: ThS. Phạm Thu Hà\n\n🎯 **Trạng thái**: **ĐỦ ĐIỀU KIỆN THI KẾT THÚC HỌC PHẦN** ✅`
        };
      }

      // =========================================================================
      // 3. LỊCH SỬ TIỀN THÂN & SỰ PHÁT TRIỂN CỦA CÔNG NGHỆ THÔNG TIN (CNTT / IT)
      // =========================================================================
      if ((text.includes('lịch sử') || text.includes('tiền thân') || text.includes('nguồn gốc') || text.includes('ra đời')) &&
          (text.includes('công nghệ thông tin') || text.includes('cntt') || text.includes('máy tính') || text.includes('tin học'))) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro - Lịch sử & Tiền thân của Công nghệ Thông tin (IT)]**:\n\nLịch sử hình thành **Công nghệ Thông tin (Information Technology)** trải qua **5 giai đoạn tiến hóa vĩ đại**:\n\n1. **Thời kỳ Tiền cơ khí (Trước năm 1450)**:\n   • Con người lưu trữ thông tin trên đất sét, giấy cói và phát minh ra **Bàn tính (Abacus)** (~2400 TCN) để tính toán số học.\n\n2. **Thời kỳ Cơ khí (1450 – 1840) - Những cỗ máy tiền thân đầu tiên**:\n   • **1642**: **Blaise Pascal** chế tạo máy tính cơ học **Pascaline** đầu tiên thực hiện phép cộng trừ.\n   • **1822 – 1837**: **Charles Babbage** (*"Cha đẻ của máy tính"*) thiết kế **Máy sai phân (Difference Engine)** và **Máy phân tích (Analytical Engine)** có cấu trúc Bộ nhớ và Bộ xử lý giống máy tính hiện đại.\n   • **Ada Lovelace** viết thuật toán đầu tiên cho máy Babbage, trở thành **Lập trình viên đầu tiên trong lịch sử**.\n\n3. **Thời kỳ Điện cơ & Lý thuyết Máy tính (1840 – 1940)**:\n   • **1890**: **Herman Hollerith** phát minh máy đếm dùng **Thẻ đục lỗ (Punch Card)** để thống kê dân số Mỹ và sáng lập công ty tiền thân của **IBM (1924)**.\n   • **1936**: Nhà toán học **Alan Turing** công bố mô hình **Máy Turing (Turing Machine)** — nền tảng lý thuyết của mọi máy tính và ngành Khoa học Máy tính hiện đại.\n\n4. **Thời kỳ Máy tính Điện tử & Mạng ARPANET (1940 – 1980)**:\n   • **1945**: **John von Neumann** đề xuất kiến trúc **Von Neumann** (CPU, Bộ nhớ, I/O).\n   • **1946**: Máy tính điện tử đa năng đầu tiên **ENIAC** ra đời (nặng 27 tấn, dùng 18.000 bóng đèn chân không).\n   • **1947 & 1958**: Phát minh **Transistor** và **Vi mạch tích hợp (IC)** giúp thu nhỏ máy tính.\n   • **1969**: Mạng **ARPANET** của Bộ Quốc phòng Mỹ ra đời — chính là **tiền thân trực tiếp của mạng Internet** ngày nay.\n\n5. **Kỷ nguyên Máy tính Cá nhân, Internet, Cloud & AI (1980 – Nay)**:\n   • Sự ra đời của **Apple II, IBM PC, hệ điều hành Windows/Linux**, mạng **World Wide Web (Tim Berners-Lee, 1989)**, Điện toán đám mây (Cloud Computing) và **Trí tuệ nhân tạo tạo sinh (Generative AI)**.`
        };
      }

      // 3.1 CÁC CHỦ ĐỀ LẬP TRÌNH & HỌC THUẬT TRỌNG TÂM
      if (text.includes('sql join') || (text.includes('join') && text.includes('sql'))) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `💻 **[CodeAssist AI - Giải thích Chi tiết SQL JOIN]**:\n\nTrong SQL, mệnh đề **JOIN** dùng để kết hợp các bản ghi từ 2 hoặc nhiều bảng dựa trên cột khóa liên kết (\`PRIMARY KEY = FOREIGN KEY\`):\n\n1. **INNER JOIN**: Chỉ lấy các bản ghi có dữ liệu khớp ở **cả 2 bảng**.\n2. **LEFT JOIN**: Lấy **toàn bộ bảng bên trái** và phần khớp từ bảng bên phải (nếu không khớp trả về \`NULL\`).\n3. **RIGHT JOIN**: Ngược lại với LEFT JOIN, lấy toàn bộ bảng bên phải.\n4. **FULL OUTER JOIN**: Lấy tất cả dữ liệu từ cả 2 bảng.\n\n\`\`\`sql\nSELECT sv.ho_ten, mh.ten_mon, d.diem_tong_ket\nFROM sinh_vien sv\nINNER JOIN bang_diem d ON sv.id = d.sinh_vien_id\nINNER JOIN mon_hoc mh ON d.mon_hoc_id = mh.id;\n\`\`\``
        };
      }

      if (text.includes('tóm tắt môn cơ sở dữ liệu') || text.includes('tóm tắt csdl')) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `📘 **[EduBrain Study Guide - Tóm tắt Môn Cơ sở dữ liệu (INT2211)]**:\n\n• **Chương 1**: Tổng quan hệ Quản trị CSDL (DBMS) & Kiến trúc 3 lược đồ.\n• **Chương 2**: Mô hình Thực thể - Liên kết (**ERD**) và Mô hình Quan hệ.\n• **Chương 3**: Ngôn ngữ truy vấn **SQL** (\`DDL\`, \`DML\`, \`SELECT ... JOIN\`, \`GROUP BY\`, \`Subquery\`).\n• **Chương 4**: Phụ thuộc hàm & Chuẩn hóa CSDL (**1NF, 2NF, 3NF, BCNF**).\n• **Chương 5**: Giao dịch (**ACID Transaction**), Khóa (Locking) & Tối ưu chỉ mục (**B-Tree Index**).`
        };
      }

      if (text.includes('cách tính điểm gpa') || text.includes('cách tính gpa')) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `📊 **[OmniBrain AI - Công thức Tính Điểm GPA Tín chỉ Chuẩn ĐH]**:\n\n1. **Điểm tổng kết môn học (Hệ 10)**:\n   • \`Điểm HP = Chuyên cần (10%) + Thường xuyên/Quiz (30%) + Thi cuối kỳ (60%)\`\n2. **Quy đổi sang Thang điểm 4 & Điểm chữ**:\n   • **8.5 – 10**: Điểm **A** (4.0) — *Giỏi / Xuất sắc*\n   • **7.0 – 8.4**: Điểm **B** (3.0) — *Khá*\n   • **5.5 – 6.9**: Điểm **C** (2.0) — *Trung bình*\n   • **4.0 – 5.4**: Điểm **D** (1.0) — *Trung bình yếu (Qua môn)*\n   • **< 4.0**: Điểm **F** (0.0) — *Học lại*\n3. **Công thức GPA học kỳ**:\n   • \`GPA = Tổng (Điểm hệ 4 × Số tín chỉ) / Tổng số tín chỉ tích lũy\``
        };
      }

      if (text.includes('oop') || text.includes('hướng đối tượng')) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro - Phân tích Chuyên sâu OOP]**:\n\n**OOP (Object-Oriented Programming)** dựa trên **4 trụ cột cốt lõi**:\n1. **Tính Đóng gói (Encapsulation)**: Bảo vệ dữ liệu nội bộ bằng \`private\` và truy cập qua \`Getter/Setter\`.\n2. **Tính Kế thừa (Inheritance)**: Lớp con kế thừa thuộc tính/phương thức từ lớp cha (\`extends\`).\n3. **Tính Đa hình (Polymorphism)**: Cùng một phương thức nhưng hành vi khác nhau (\`Overriding\` & \`Overloading\`).\n4. **Tính Trừu tượng (Abstraction)**: Ẩn chi tiết cài đặt phức tạp qua \`Interface\` và \`Abstract Class\`.`
        };
      }

      if (text.includes('rest api') || text.includes('restful')) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `💻 **[CodeAssist AI - Kiến trúc RESTful API]**:\n\n• **Khái niệm**: Chuẩn giao tiếp Client-Server qua giao thức HTTP ở trạng thái **Stateless**.\n• **HTTP Methods**: \`GET\` (Đọc), \`POST\` (Tạo mới), \`PUT/PATCH\` (Cập nhật), \`DELETE\` (Xóa).\n• **HTTP Status Codes**: \`200 OK\`, \`201 Created\`, \`400 Bad Request\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`, \`500 Internal Server Error\`.`
        };
      }

      if (text.includes('nụ hôn') && (text.includes('tiếng pháp') || text.includes('pháp'))) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro - Dịch thuật & Ngôn ngữ]**:\n\nTrong tiếng Pháp:\n• **Danh từ (Nụ hôn)**: **« un baiser »** (từ thân mật là **« un bisou »**).\n• **Động từ (Hôn)**: **« embrasser »**.\n• **Ví dụ**: *"Je t'embrasse fort"* (Gửi bạn cái ôm hôn nồng thắm).`
        };
      }

      if (text.includes('thủ đô') && text.includes('pháp')) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro]**: Thủ đô của nước Pháp là thành phố **Paris** (nổi tiếng với tháp Eiffel, bảo tàng Louvre và dòng sông Seine).`
        };
      }

      if (text === 'hi' || text === 'hello' || text === 'xin chào' || text === 'chào' || text === 'chào bạn') {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `👋 Xin chào! **OmniBrain AI Platform** đang trực tuyến. Bạn có thể hỏi tôi **bất kỳ câu hỏi nào** về lịch sử CNTT, lập trình, giải toán, ngoại ngữ hoặc thông tin học tập của bạn!`
        };
      }

      if (text.includes('bạn là ai') || text.includes('bạn tên gì') || text.includes('tên là gì')) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `🧠 **[OmniBrain AI Platform]**:\n\nTôi là **OmniBrain AI Platform** - Trợ lý trí tuệ nhân tạo thế hệ mới của UniLMS (ICTU Style), kết nối trực tiếp với động cơ **Generative LLM & Knowledge Graph** để giải đáp mọi câu hỏi của bạn 24/7!`
        };
      }

      if (text.includes('cảm ơn') || text.includes('thanks')) {
        return {
          isDirectMatch: true,
          isSecurityWarning: false,
          text: `😊 Rất vui được hỗ trợ bạn! Chúc bạn học tập thật tốt trên UniLMS!`
        };
      }

      // Trả về null cho mọi câu hỏi mở để handleSendMessage gọi trực tiếp sang Live Generative AI Engine
      return null;
    }
  }

  // Khởi tạo AI Chat Widget
  initAiChat();

  // ==========================================================================
  // UTILS: THÔNG BÁO DẠNG TOAST & ESCAPE HTML
  // ==========================================================================
  let toastTimeout = null;
  function showToast(message) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastElement.classList.remove('show');
    }, 2000); // 2 giây
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
