import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, CheckCircle2, GraduationCap, Shield, UserCheck, BookOpen, ChevronDown } from 'lucide-react';

export default function Header({ onToggleSidebar, activeTab, currentUser, onOpenAuth, onLogout, currentRole, onChangeRole, themeMode }) {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'BẢNG TIN ICTU';
      case 'catalog': return 'TẤT CẢ KHÓA HỌC';
      case 'schedule': return 'THỜI KHÓA BIỂU & LỊCH THI';
      case 'skills': return 'KIỂM TRA KỸ NĂNG';
      case 'projects': return 'DỰ ÁN';
      case 'grades': return 'TRA CỨU ĐIỂM';
      case 'profile': return 'HỒ SƠ CỦA BẠN';
      case 'course-detail': return 'CHI TIẾT LỚP HỌC PHẦN';
      case 'lesson-player': return 'TRÌNH PHÁT BÀI HỌC';
      case 'quiz': return 'BÀI KIỂM TRA TRẮC NGHIỆM';
      case 'certificate': return 'CHỨNG CHỈ XÁC NHẬN';
      case 'instructor-dashboard': return 'DASHBOARD GIẢNG VIÊN';
      case 'instructor-courses': return 'QUẢN LÝ BÀI GIẢNG & ĐĂNG TẢI TÀI LIỆU';
      case 'instructor-students': return 'DANH SÁCH SINH VIÊN LỚP HỌC PHẦN';
      case 'instructor-grades': return 'QUẢN LÝ & NHẬP BẢNG ĐIỂM LỚP';
      case 'admin-dashboard': return 'THỐNG KÊ QUẢN TRỊ VIÊN';
      case 'admin-users': return 'QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG';
      case 'admin-courses': return 'QUẢN LÝ MÔN HỌC & MỞ LỚP HP';
      default: return 'BẢNG TIN ICTU';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_INSTRUCTOR':
        return { label: 'Giảng viên', icon: BookOpen, bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'ROLE_ADMIN':
        return { label: 'Quản trị viên', icon: Shield, bg: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: 'Sinh viên', icon: UserCheck, bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
  };

  const roleInfo = getRoleBadge(currentRole || 'ROLE_STUDENT');
  const RoleIcon = roleInfo.icon;

  return (
    <header className={`sticky top-0 z-30 h-14 px-4 sm:px-6 flex items-center justify-between border-b transition-colors ${
      themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-2xs text-slate-800'
    }`}>
      
      {/* Left Title & Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors lg:hidden ${themeMode === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className={`p-1 rounded hidden sm:inline-block ${themeMode === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            <Menu className="w-4 h-4" />
          </span>
          <h1 className={`text-xs sm:text-sm font-black tracking-wide uppercase ${themeMode === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
            {getPageTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Right Actions & Role Switcher */}
      <div className="flex items-center gap-3">
        
        {/* Role Switcher Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${roleInfo.bg}`}
            title="Bấm để đổi vai trò thử nghiệm"
          >
            <RoleIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{roleInfo.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                CHUYỂN VAI TRÒ DÙNG THỬ
              </div>

              <button
                onClick={() => { onChangeRole('ROLE_STUDENT'); setIsRoleDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  currentRole === 'ROLE_STUDENT' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Sinh viên (STUDENT)</span>
              </button>

              <button
                onClick={() => { onChangeRole('ROLE_INSTRUCTOR'); setIsRoleDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  currentRole === 'ROLE_INSTRUCTOR' ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Giảng viên (INSTRUCTOR)</span>
              </button>

              <button
                onClick={() => { onChangeRole('ROLE_ADMIN'); setIsRoleDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  currentRole === 'ROLE_ADMIN' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-red-600" />
                <span>Quản trị viên (ADMIN)</span>
              </button>
            </div>
          )}
        </div>

        <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden md:block leading-tight">
              <p className="text-xs font-bold text-slate-800">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{currentUser.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Đăng nhập
          </button>
        )}
      </div>

    </header>
  );
}
