import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import StudentDashboard from './pages/StudentDashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import QuizEngine from './pages/QuizEngine';
import CertificateView from './pages/CertificateView';
import ScheduleView from './pages/ScheduleView';
import SkillsView from './pages/SkillsView';
import ProjectsView from './pages/ProjectsView';
import GradesView from './pages/GradesView';
import ProfileView from './pages/ProfileView';
import SettingsView from './pages/SettingsView';
import HelpView from './pages/HelpView';
import ChangePasswordModal from './components/ChangePasswordModal';
import Toast from './components/Toast';
import OmniBrainChat from './components/OmniBrainChat';
import ErrorBoundary from './components/ErrorBoundary';

// Instructor Views
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseManagementView from './pages/instructor/CourseManagementView';
import GradeManagementView from './pages/instructor/GradeManagementView';
import StudentRosterView from './pages/instructor/StudentRosterView';

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementView from './pages/admin/UserManagementView';
import CourseAdminView from './pages/admin/CourseAdminView';

export default function App() {
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      return localStorage.getItem('unilms_role') || 'ROLE_STUDENT';
    } catch (e) {
      return 'ROLE_STUDENT';
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    const savedRole = localStorage.getItem('unilms_role');
    if (savedRole === 'ROLE_INSTRUCTOR') return 'instructor-dashboard';
    if (savedRole === 'ROLE_ADMIN') return 'admin-dashboard';
    return 'dashboard';
  });

  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem('unilms_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('unilms_theme', themeMode);
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [themeMode]);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState('lap-trinh-java-spring-boot-3');
  const [selectedLessonId, setSelectedLessonId] = useState('l-101');
  const [activeCertCode, setActiveCertCode] = useState('UNI-CERT-2026-JAVA88');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Track live uploaded course & lecture materials
  const [uploadedMaterials, setUploadedMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem('unilms_uploaded_materials');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'mat-1',
        courseId: 'c-101',
        title: 'Giáo trình Bài giảng Spring Security 6 & JWT Stateless Architecture',
        fileName: 'Giao_trinh_Spring_Security_6_Stateless.pdf',
        fileType: 'DOCUMENT',
        fileSize: '4.8 MB',
        downloadUrl: '/api/v1/materials/download/Giao_trinh_Spring_Security_6_Stateless.pdf',
        uploadedByName: 'PGS. TS. Trần Đức Minh (Giảng viên)',
        createdAt: new Date().toISOString(),
        allowDownload: true
      },
      {
        id: 'mat-2',
        courseId: 'c-101',
        title: 'Video Bài giảng: Tối ưu Cơ sở dữ liệu PostgreSQL 15 & GIN Index JSONB',
        fileName: 'Video_PostgreSQL_15_GIN_Index.mp4',
        fileType: 'VIDEO',
        fileSize: '145 MB',
        downloadUrl: '/api/v1/materials/download/Video_PostgreSQL_15_GIN_Index.mp4',
        uploadedByName: 'Quản trị viên Hệ thống (Admin)',
        createdAt: new Date().toISOString(),
        allowDownload: true
      },
      {
        id: 'mat-3',
        courseId: 'c-102',
        title: 'Tài liệu Hướng dẫn Cấu hình HikariCP Connection Pool Enterprise',
        fileName: 'Huong_dan_HikariCP_Tuning.pdf',
        fileType: 'DOCUMENT',
        fileSize: '2.4 MB',
        downloadUrl: '/api/v1/materials/download/Huong_dan_HikariCP_Tuning.pdf',
        uploadedByName: 'ThS. Nguyễn Hoàng Nam (Giảng viên)',
        createdAt: new Date().toISOString(),
        allowDownload: true
      }
    ];
  });

  useEffect(() => {
    fetch('/api/v1/materials/all')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUploadedMaterials(prev => {
            const merged = [...data, ...prev.filter(p => !data.some(d => d.id === p.id))];
            try {
              localStorage.setItem('unilms_uploaded_materials', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAddMaterial = (newMat) => {
    setUploadedMaterials(prev => {
      const updated = [newMat, ...prev];
      try {
        localStorage.setItem('unilms_uploaded_materials', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteMaterial = (id) => {
    setUploadedMaterials(prev => {
      const updated = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem('unilms_uploaded_materials', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Track live quiz submissions
  const [quizSubmissions, setQuizSubmissions] = useState(() => {
    try {
      const saved = localStorage.getItem('unilms_quiz_submissions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Logged-in user state (null by default if not logged in)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('unilms_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Mock Courses database
  const courses = [
    {
      id: 'c-101',
      title: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
      slug: 'lap-trinh-java-spring-boot-3',
      summary: 'Khóa học chính quy bao quát kiến trúc RESTful APIs, Spring Security 6 JWT, Hibernate, HikariCP và triển khai PostgreSQL production.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
      price: 0,
      instructorName: 'PGS. TS. Trần Đức Minh',
      totalModules: 3,
      totalLessons: 8,
      modules: [
        {
          id: 'm-1',
          title: 'Chương 1: Tổng quan Kiến trúc Spring Boot 3 & Security 6 Stateless',
          lessons: [
            { id: 'l-101', title: 'Bài 01: Giới thiệu Kiến trúc Spring Boot 3 & Java 17/21 LTS', contentType: 'VIDEO', durationSeconds: 900, orderIndex: 1 },
            { id: 'l-102', title: 'Bài 02: Cấu hình Spring Security 6 với Stateless JWT Filter', contentType: 'DOCUMENT', durationSeconds: 600, orderIndex: 2 },
            { id: 'l-103', title: 'Bài 03: Kiểm tra Trắc nghiệm Tín chỉ Chương 1', contentType: 'QUIZ', durationSeconds: 900, orderIndex: 3 }
          ]
        },
        {
          id: 'm-2',
          title: 'Chương 2: Thiết kế Cơ sở dữ liệu PostgreSQL 15 & Flyway Migration',
          lessons: [
            { id: 'l-201', title: 'Bài 04: Thiết kế DDL Schema UUIDv4, Soft Delete & ON DELETE RESTRICT', contentType: 'VIDEO', durationSeconds: 1200, orderIndex: 1 },
            { id: 'l-202', title: 'Bài 05: Lưu trữ Snapshot Bất biến Đề thi với JSONB', contentType: 'DOCUMENT', durationSeconds: 800, orderIndex: 2 }
          ]
        },
        {
          id: 'm-3',
          title: 'Chương 3: Redis Caching & Tối ưu hóa Tiến độ Học tập',
          lessons: [
            { id: 'l-301', title: 'Bài 06: Cấu hình Redis Cache cho Cây Khóa học', contentType: 'VIDEO', durationSeconds: 950, orderIndex: 1 },
            { id: 'l-302', title: 'Bài 07: Tối ưu I/O với Progress Percent Incremental Update', contentType: 'DOCUMENT', durationSeconds: 700, orderIndex: 2 },
            { id: 'l-303', title: 'Bài 08: Thi Kết thúc Học phần Tín chỉ Spring Boot 3', contentType: 'QUIZ', durationSeconds: 900, orderIndex: 3 }
          ]
        }
      ]
    },
    {
      id: 'c-102',
      title: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
      slug: 'postgresql-enterprise-optimization',
      summary: 'Luyện tập đánh chỉ mục Composite Indexing, JSONB queries, Partitioning, HikariCP Connection Pool tuning.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
      price: 0,
      instructorName: 'ThS. Nguyễn Hoàng Nam',
      totalModules: 2,
      totalLessons: 5,
      modules: [
        {
          id: 'm-201',
          title: 'Chương 1: Indexing & Execution Plan Analysis',
          lessons: [
            { id: 'l-401', title: 'Bài 01: Composite Index & EXPLAIN ANALYZE', contentType: 'VIDEO', durationSeconds: 1100, orderIndex: 1 },
            { id: 'l-402', title: 'Bài 02: Tối ưu B-Tree vs GIN Index trên JSONB', contentType: 'DOCUMENT', durationSeconds: 750, orderIndex: 2 }
          ]
        },
        {
          id: 'm-202',
          title: 'Chương 2: Connection Pooling & Performance Tuning',
          lessons: [
            { id: 'l-403', title: 'Bài 03: Cấu hình HikariCP Connection Pool Enterprise', contentType: 'VIDEO', durationSeconds: 1200, orderIndex: 1 },
            { id: 'l-404', title: 'Bài 04: Partitioning Bảng Lớn và Vacuuming', contentType: 'DOCUMENT', durationSeconds: 850, orderIndex: 2 },
            { id: 'l-405', title: 'Bài 05: Đánh giá Năng lực Cơ sở Dữ liệu PostgreSQL', contentType: 'QUIZ', durationSeconds: 900, orderIndex: 3 }
          ]
        }
      ]
    },
    {
      id: 'c-103',
      title: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25',
      slug: 'phuong-phap-phat-trien-phan-mem-huong-doi-tuong',
      summary: 'Phân tích thiết kế hệ thống theo mô hình OOP, UML, Design Patterns (GoF), Clean Architecture và SOLID principles áp dụng cho dự án quy mô lớn.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      price: 0,
      instructorName: 'TS. Trần Thị Mai',
      totalModules: 2,
      totalLessons: 5,
      modules: [
        {
          id: 'm-301',
          title: 'Chương 1: Nguyên lý Hướng đối tượng OOP & SOLID',
          lessons: [
            { id: 'l-501', title: 'Bài 01: 4 Trụ cột OOP & Thiết kế Interface Segregation', contentType: 'VIDEO', durationSeconds: 900, orderIndex: 1 },
            { id: 'l-502', title: 'Bài 02: Áp dụng Dependency Inversion Principle trong dự án lớn', contentType: 'DOCUMENT', durationSeconds: 600, orderIndex: 2 },
            { id: 'l-503', title: 'Bài 03: Bài tập Trắc nghiệm Thiết kế Hướng đối tượng', contentType: 'QUIZ', durationSeconds: 900, orderIndex: 3 }
          ]
        },
        {
          id: 'm-302',
          title: 'Chương 2: Thiết kế Hệ thống với UML & Design Patterns',
          lessons: [
            { id: 'l-504', title: 'Bài 04: Biểu đồ Use Case, Class Diagram và Sequence Diagram', contentType: 'VIDEO', durationSeconds: 1200, orderIndex: 1 },
            { id: 'l-505', title: 'Bài 05: Thực hành Factory, Singleton, Observer Patterns', contentType: 'DOCUMENT', durationSeconds: 800, orderIndex: 2 }
          ]
        }
      ]
    },
    {
      id: 'c-104',
      title: 'Quản lý dự án CNTT-2-25',
      slug: 'quan-ly-du-an-cntt',
      summary: 'Quy trình Agile/Scrum, quản lý phạm vi, lập kế hoạch chi phí, tiến độ, rủi ro dự án CNTT và sử dụng Jira/GitLab trong quản trị dự án.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
      price: 0,
      instructorName: 'TS. Phạm Đình Lâm',
      totalModules: 2,
      totalLessons: 5,
      modules: [
        {
          id: 'm-401',
          title: 'Chương 1: Tổng quan Quản lý Dự án CNTT & Mô hình Agile/Scrum',
          lessons: [
            { id: 'l-601', title: 'Bài 01: Vòng đời dự án phần mềm và Khung làm việc Scrum', contentType: 'VIDEO', durationSeconds: 900, orderIndex: 1 },
            { id: 'l-602', title: 'Bài 02: Quản lý Backlog, Sprint Planning & Burndown Chart', contentType: 'DOCUMENT', durationSeconds: 700, orderIndex: 2 },
            { id: 'l-603', title: 'Bài 03: Kiểm tra Trắc nghiệm Quy trình Scrum Tín chỉ', contentType: 'QUIZ', durationSeconds: 900, orderIndex: 3 }
          ]
        },
        {
          id: 'm-402',
          title: 'Chương 2: Quản trị Rủi ro, Ngân sách và Chất lượng Dự án',
          lessons: [
            { id: 'l-604', title: 'Bài 04: Lập ma trận Đánh giá & Giảm thiểu Rủi ro CNTT', contentType: 'VIDEO', durationSeconds: 1000, orderIndex: 1 },
            { id: 'l-605', title: 'Bài 05: Báo cáo Tiến độ và Đánh giá KPIs thành viên', contentType: 'DOCUMENT', durationSeconds: 750, orderIndex: 2 }
          ]
        }
      ]
    },
    {
      id: 'c-105',
      title: 'Quản trị hệ thống-2-25',
      slug: 'quan-tri-he-thong',
      summary: 'Quản trị Linux Server (Ubuntu/RHEL), cấu hình mạng, DNS, Nginx Reverse Proxy, Docker containerization, giám sát hệ thống Prometheus & Grafana.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      price: 0,
      instructorName: 'PGS. TS. Nguyễn Văn Học',
      totalModules: 2,
      totalLessons: 5,
      modules: [
        {
          id: 'm-501',
          title: 'Chương 1: Quản trị Hệ điều hành Linux Server & Dịch vụ Mạng',
          lessons: [
            { id: 'l-701', title: 'Bài 01: Phân quyền Linux, SSH Keypair & Firewall UFW', contentType: 'VIDEO', durationSeconds: 950, orderIndex: 1 },
            { id: 'l-702', title: 'Bài 02: Cấu hình Web Server Nginx Reverse Proxy & SSL Let\'s Encrypt', contentType: 'DOCUMENT', durationSeconds: 800, orderIndex: 2 },
            { id: 'l-703', title: 'Bài 03: Kiểm tra Trắc nghiệm Quản trị Linux Server', contentType: 'QUIZ', durationSeconds: 900, orderIndex: 3 }
          ]
        },
        {
          id: 'm-502',
          title: 'Chương 2: Containerization với Docker & Giám sát Hệ thống',
          lessons: [
            { id: 'l-704', title: 'Bài 04: Đóng gói ứng dụng với Docker & Docker Compose đa dịch vụ', contentType: 'VIDEO', durationSeconds: 1100, orderIndex: 1 },
            { id: 'l-705', title: 'Bài 05: Thiết lập Giám sát Tải máy chủ với Prometheus và Grafana', contentType: 'DOCUMENT', durationSeconds: 850, orderIndex: 2 }
          ]
        }
      ]
    }
  ];

  // Enrollments tracking state
  const [enrollments, setEnrollments] = useState([
    {
      id: 'e-1',
      courseId: 'c-101',
      title: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
      slug: 'lap-trinh-java-spring-boot-3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
      instructorName: 'PGS. TS. Trần Đức Minh',
      progressPercent: 75.0,
      completedLessons: 6,
      totalLessons: 8
    },
    {
      id: 'e-2',
      courseId: 'c-102',
      title: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
      slug: 'postgresql-enterprise-optimization',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
      instructorName: 'ThS. Nguyễn Hoàng Nam',
      progressPercent: 40.0,
      completedLessons: 2,
      totalLessons: 5
    },
    {
      id: 'e-3',
      courseId: 'c-103',
      title: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25',
      slug: 'phuong-phap-phat-trien-phan-mem-huong-doi-tuong',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      instructorName: 'TS. Trần Thị Mai',
      progressPercent: 60.0,
      completedLessons: 3,
      totalLessons: 5
    },
    {
      id: 'e-4',
      courseId: 'c-104',
      title: 'Quản lý dự án CNTT-2-25',
      slug: 'quan-ly-du-an-cntt',
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
      instructorName: 'TS. Phạm Đình Lâm',
      progressPercent: 80.0,
      completedLessons: 4,
      totalLessons: 5
    },
    {
      id: 'e-5',
      courseId: 'c-105',
      title: 'Quản trị hệ thống-2-25',
      slug: 'quan-tri-he-thong',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      instructorName: 'PGS. TS. Nguyễn Văn Học',
      progressPercent: 50.0,
      completedLessons: 2,
      totalLessons: 5
    }
  ]);

  const [completedLessonsMap, setCompletedLessonsMap] = useState({ 'l-101': true, 'l-102': true });

  const activeCourse = courses.find(c => c.slug === selectedCourseSlug) || courses[0];

  const handleSelectCourse = (slug) => {
    setSelectedCourseSlug(slug);
    setActiveTab('course-detail');
  };

  const handleStartLesson = (lessonId) => {
    if (lessonId) setSelectedLessonId(lessonId);
    setActiveTab('lesson-player');
  };

  const handleOpenQuiz = (lessonId) => {
    if (lessonId) setSelectedLessonId(lessonId);
    setActiveTab('quiz');
  };

  const handleOpenCertificate = (code) => {
    if (code) setActiveCertCode(code);
    setActiveTab('certificate');
  };

  const handleToggleComplete = (lessonId) => {
    setCompletedLessonsMap(prev => {
      const nextState = !prev[lessonId];
      const updated = { ...prev, [lessonId]: nextState };
      
      // Dynamic progress recalculation
      const totalL = activeCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const completedL = activeCourse.modules.reduce((acc, m) => {
        return acc + m.lessons.filter(l => updated[l.id]).length;
      }, 0);
      const percent = Math.min(100, Math.round((completedL / totalL) * 100));

      setEnrollments(prevEns => prevEns.map(e => {
        if (e.slug === activeCourse.slug) {
          return { ...e, progressPercent: percent, completedLessons: completedL, totalLessons: totalL };
        }
        return e;
      }));

      return updated;
    });
  };

  const handleShowToast = (data) => {
    setToast(data);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleDownloadSEB = () => {
    handleShowToast({
      type: 'info',
      title: 'Tải phần mềm SEB',
      message: 'Đang bắt đầu tải xuống Safe Exam Browser 3.7.0 cho Windows...'
    });
  };

  const handleChangeRole = (role) => {
    setCurrentRole(role);
    try {
      localStorage.setItem('unilms_role', role);
    } catch (e) {}

    let roleUser = null;
    if (role === 'ROLE_INSTRUCTOR') {
      roleUser = {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'mai.tt@ictu.edu.vn',
        fullName: 'TS. Trần Thị Mai',
        role: 'ROLE_INSTRUCTOR',
        instructorCode: 'MSGV 10245',
        department: 'Khoa Công nghệ Thông tin - ICTU'
      };
      setActiveTab('instructor-dashboard');
      handleShowToast({
        type: 'success',
        title: 'Chuyển vai trò',
        message: 'Đã chuyển sang phân hệ GIẢNG VIÊN: TS. Trần Thị Mai!'
      });
    } else if (role === 'ROLE_ADMIN') {
      roleUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@ictu.edu.vn',
        fullName: 'Quản trị viên Hệ thống ICTU',
        role: 'ROLE_ADMIN',
        adminCode: 'ADM2026001'
      };
      setActiveTab('admin-dashboard');
      handleShowToast({
        type: 'success',
        title: 'Chuyển vai trò',
        message: 'Đã chuyển sang phân hệ QUẢN TRỊ VIÊN HỆ THỐNG!'
      });
    } else {
      roleUser = {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'sinhvien@ictu.edu.vn',
        fullName: 'Lê Văn Nam',
        role: 'ROLE_STUDENT',
        studentCode: 'DTC225100888',
        className: 'CNTT K22B',
        major: 'Công nghệ Thông tin'
      };
      setActiveTab('dashboard');
      handleShowToast({
        type: 'info',
        title: 'Chuyển vai trò',
        message: 'Đã chuyển sang phân hệ SINH VIÊN: Lê Văn Nam!'
      });
    }

    if (currentUser) {
      setCurrentUser(roleUser);
      localStorage.setItem('unilms_user', JSON.stringify(roleUser));
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${themeMode === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        currentRole={currentRole}
        themeMode={themeMode}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          localStorage.removeItem('unilms_user');
          localStorage.removeItem('unilms_token');
          setCurrentUser(null);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onChangePasswordClick={() => setIsPasswordModalOpen(true)}
        onDownloadSEBClick={handleDownloadSEB}
        onShowToast={handleShowToast}
      />

      {/* Backdrop overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Right Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeTab={activeTab}
          currentUser={currentUser}
          currentRole={currentRole}
          onChangeRole={handleChangeRole}
          themeMode={themeMode}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            localStorage.removeItem('unilms_user');
            localStorage.removeItem('unilms_token');
            setCurrentUser(null);
          }}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ErrorBoundary key={activeTab} onReset={() => setActiveTab(currentRole === 'ROLE_ADMIN' ? 'admin-dashboard' : (currentRole === 'ROLE_INSTRUCTOR' ? 'instructor-dashboard' : 'dashboard'))}>
          {activeTab === 'dashboard' && (
            <StudentDashboard
              enrollments={enrollments}
              onSelectCourse={handleSelectCourse}
              onOpenCertificate={handleOpenCertificate}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'catalog' && (
            <CourseCatalog
              courses={courses}
              onSelectCourse={handleSelectCourse}
            />
          )}

          {activeTab === 'course-detail' && (
            <CourseDetail
              course={activeCourse}
              onStartLesson={handleStartLesson}
              onNavigate={setActiveTab}
              materials={uploadedMaterials.filter(m => !m.courseId || m.courseId === activeCourse?.id || m.courseId === 'c-101')}
            />
          )}

          {activeTab === 'lesson-player' && (
            <LessonPlayer
              course={activeCourse}
              currentLessonId={selectedLessonId}
              onSelectLesson={setSelectedLessonId}
              onOpenQuiz={handleOpenQuiz}
              onNavigate={setActiveTab}
              onToggleComplete={handleToggleComplete}
              isCompleted={!!completedLessonsMap[selectedLessonId]}
              materials={uploadedMaterials.filter(m => !m.courseId || m.courseId === activeCourse?.id || m.courseId === 'c-101')}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizEngine
              onNavigate={setActiveTab}
              onQuizComplete={(res) => {
                if (res.isPassed) {
                  handleToggleComplete(selectedLessonId);
                }
                const newSubmission = {
                  id: 'sub-' + Date.now(),
                  title: 'Bài kiểm tra kỹ năng: ' + (activeCourse?.title || 'Kiểm tra trắc nghiệm'),
                  courseName: activeCourse ? `${activeCourse.title} (CNTT.K22B.D1.K2.N01)` : 'Lập trình Enterprise với Java',
                  score: res.score || 9.0,
                  type: 'Thi trắc nghiệm',
                  submittedAt: new Date().toLocaleString('vi-VN'),
                  status: 'Đã hoàn thành',
                  iconType: 'QUIZ'
                };
                setQuizSubmissions(prev => {
                  const updated = [newSubmission, ...prev];
                  localStorage.setItem('unilms_quiz_submissions', JSON.stringify(updated));
                  return updated;
                });
              }}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsView
              quizSubmissions={quizSubmissions}
              onStartQuiz={handleOpenQuiz}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              onSelectCourse={handleSelectCourse}
            />
          )}

          {activeTab === 'grades' && (
            <GradesView
              onSelectCourse={handleSelectCourse}
            />
          )}

          {/* Instructor Views */}
          {activeTab === 'instructor-dashboard' && (
            <InstructorDashboard
              currentUser={currentUser}
              courses={courses}
              onNavigate={setActiveTab}
              onSelectCourse={handleSelectCourse}
            />
          )}

          {activeTab === 'instructor-courses' && (
            <CourseManagementView
              onShowToast={handleShowToast}
              onAddMaterial={handleAddMaterial}
            />
          )}

          {activeTab === 'instructor-students' && (
            <StudentRosterView
              onShowToast={handleShowToast}
            />
          )}

          {activeTab === 'instructor-grades' && (
            <GradeManagementView
              onShowToast={handleShowToast}
            />
          )}

          {/* Admin Views */}
          {activeTab === 'admin-dashboard' && (
            <AdminDashboard
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'admin-users' && (
            <UserManagementView
              onShowToast={handleShowToast}
            />
          )}

          {activeTab === 'admin-courses' && (
            <CourseAdminView
              onShowToast={handleShowToast}
              materials={uploadedMaterials}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onChangePasswordClick={() => setIsPasswordModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onShowToast={handleShowToast}
              themeMode={themeMode}
              onChangeTheme={setThemeMode}
            />
          )}

          {activeTab === 'help' && (
            <HelpView
              onShowToast={handleShowToast}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              onSelectCourse={handleSelectCourse}
            />
          )}

          {activeTab === 'certificate' && (
            <CertificateView
              certCode={activeCertCode}
              onNavigate={setActiveTab}
            />
          )}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <Footer />

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={(msg) => handleShowToast({ type: 'success', title: 'Đổi mật khẩu thành công', message: msg })}
      />

      {/* Floating Toast Notification */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

      {/* OmniBrain AI Platform Chat Widget */}
      <OmniBrainChat
        currentRole={currentRole}
        currentUser={currentUser}
      />

    </div>
  );
}
