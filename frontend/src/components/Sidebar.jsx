import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Layers, 
  Flag, 
  CheckSquare, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  Search, 
  Settings, 
  HelpCircle, 
  User,
  Download,
  LogOut,
  Lock,
  GraduationCap,
  SlidersHorizontal,
  LayoutGrid
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout, 
  isOpen, 
  onClose,
  onChangePasswordClick,
  onDownloadSEBClick,
  onShowToast,
  currentRole,
  themeMode,
  onOpenAuth
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const role = currentRole || currentUser?.role || 'ROLE_STUDENT';

  const user = currentUser;

  const getNavGroupsByRole = (r) => {
    if (r === 'ROLE_INSTRUCTOR') {
      return [
        {
          title: 'GIẢNG DẠY',
          items: [
            { id: 'instructor-dashboard', label: 'Dashboard Giảng dạy', icon: Layers },
            { id: 'instructor-courses', label: 'Bài giảng & Upload Tài liệu', icon: BookOpen },
            { id: 'instructor-students', label: 'Sinh viên Lớp HP', icon: User },
            { id: 'instructor-grades', label: 'Nhập Bảng điểm Lớp', icon: Search },
          ]
        },
        {
          title: 'HỆ THỐNG',
          items: [
            { id: 'settings', label: 'Cài đặt', icon: Settings },
            { id: 'help', label: 'Trợ giúp kỹ thuật', icon: HelpCircle },
            { id: 'profile', label: 'Hồ sơ của bạn', icon: User },
            { id: 'logout', label: 'Đăng xuất', icon: LogOut, isAction: true },
          ]
        }
      ];
    }

    if (r === 'ROLE_ADMIN') {
      return [
        {
          title: 'QUẢN TRỊ HỆ THỐNG',
          items: [
            { id: 'admin-dashboard', label: 'Thống kê Tổng quan', icon: LayoutGrid },
            { id: 'admin-users', label: 'Quản lý Tài khoản', icon: User },
            { id: 'admin-courses', label: 'Quản lý Môn & Lớp HP', icon: Layers },
          ]
        },
        {
          title: 'HỆ THỐNG',
          items: [
            { id: 'settings', label: 'Cài đặt', icon: Settings },
            { id: 'help', label: 'Trợ giúp kỹ thuật', icon: HelpCircle },
            { id: 'profile', label: 'Hồ sơ của bạn', icon: User },
            { id: 'logout', label: 'Đăng xuất', icon: LogOut, isAction: true },
          ]
        }
      ];
    }

    // Default ROLE_STUDENT
    return [
      {
        title: 'HỌC TẬP',
        items: [
          { id: 'schedule', label: 'Thời khóa biểu', icon: Calendar },
          { id: 'dashboard', label: 'Lớp học phần', icon: Layers },
          { id: 'skills', label: 'Kiểm tra kỹ năng', icon: Flag },
          { id: 'quiz-entry', label: 'Kiểm tra đầu giờ', icon: CheckSquare, isLocked: true },
          { id: 'quiz-final', label: 'Thi kết thúc học phần', icon: FileText, isLocked: true },
          { id: 'projects', label: 'Dự án', icon: Briefcase },
          { id: 'discussions', label: 'Hỏi đáp với giảng viên', icon: MessageSquare },
          { id: 'notifications', label: 'Thông báo', icon: Bell },
        ]
      },
      {
        title: 'KẾT QUẢ',
        items: [
          { id: 'grades', label: 'Tra cứu điểm', icon: Search },
        ]
      },
      {
        title: 'HỆ THỐNG',
        items: [
          { id: 'settings', label: 'Cài đặt', icon: Settings },
          { id: 'help', label: 'Trợ giúp kỹ thuật', icon: HelpCircle },
          { id: 'profile', label: 'Hồ sơ của bạn', icon: User },
          { id: 'seb', label: 'Tải phần mềm thi SEB', icon: Download, isSEB: true },
          { id: 'logout', label: 'Đăng xuất', icon: LogOut, isAction: true },
        ]
      }
    ];
  };

  const navGroups = getNavGroupsByRole(role);

  const handleLockedItemClick = (item) => {
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: item.label,
        message: 'Bài thi hiện đang ở trạng thái Khóa. Hệ thống sẽ tự động mở khóa trước giờ thi 15 phút theo thời khóa biểu.'
      });
    }
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
        themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
      } ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 border-b flex items-center justify-between ${themeMode === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold text-sm tracking-tight ${themeMode === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>LMS - v3.2.78</span>
            </div>
            <p className="text-[11px] text-emerald-500 font-medium">lms.ictu.edu.vn</p>
          </div>
        </div>
      </div>

      {/* Collapsible User Info Card (ICTU LMS Style) */}
      <div className="mx-3 my-3 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-3 shadow-2xs transition-all">
        
        {user ? (
          <>
            {/* Logged In User Card Header */}
            <div 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-sky-200 border-2 border-white dark:border-slate-700 shadow-xs overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-sky-800 text-sm">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'SV'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600">{user.fullName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.studentCode || user.student_code || user.email}</p>
                </div>
              </div>

              {/* Filter/Dropdown Toggle Icon */}
              <button 
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Sổ menu cá nhân"
              >
                <SlidersHorizontal className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-90 text-blue-600' : ''}`} />
              </button>
            </div>

            {/* Collapsible Dropdown Menu inside Card */}
            {isUserMenuOpen && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1 animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => { setActiveTab('profile'); setIsUserMenuOpen(false); if(onClose) onClose(); }}
                  className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Tài khoản</span>
                </button>

                <button
                  onClick={() => { setActiveTab('settings'); setIsUserMenuOpen(false); if(onClose) onClose(); }}
                  className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Cài đặt</span>
                </button>

                <button
                  onClick={() => { 
                    setIsUserMenuOpen(false); 
                    if (onChangePasswordClick) onChangePasswordClick();
                  }}
                  className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                >
                  <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Cập nhật mật khẩu</span>
                </button>

                <button
                  onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Guest / Unauthenticated Card */
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow-xs flex-shrink-0 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 text-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">Khách (Chưa đăng nhập)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Vui lòng đăng nhập tài khoản</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                if (onClose) onClose();
              }}
              className="mt-1 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 rotate-180" />
              <span>Đăng nhập ngay</span>
            </button>
          </div>
        )}

      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-6 scrollbar-thin">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h5 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {group.title}
            </h5>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isAction && item.id === 'logout') {
                      onLogout();
                    } else if (item.isSEB) {
                      if (onDownloadSEBClick) onDownloadSEBClick();
                    } else if (item.isLocked) {
                      handleLockedItemClick(item);
                    } else {
                      setActiveTab(item.id);
                      if (onClose) onClose();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.isLocked
                      ? 'text-slate-500 hover:bg-slate-200/40 cursor-pointer'
                      : isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.isLocked && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-red-100 text-red-600 rounded flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> KHÓA
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Version Tag */}
      <div className="p-3 border-t border-slate-200 bg-white text-center text-[10px] text-slate-400 flex items-center justify-between px-4">
        <span>v3.2.78 (UTC+07)</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Hệ thống Hoạt động"></span>
      </div>
    </aside>
  );
}
