import React from 'react';
import { Shield, Users, BookOpen, Layers, Activity, ChevronRight, UserCheck, AlertTriangle } from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const systemMetrics = [
    { label: 'Tổng Tài khoản', value: '4,520', sub: '+120 trong tháng', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sinh viên Hoạt động', value: '4,150', sub: 'Chính quy ICTU', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Giảng viên', value: '185', sub: 'Khoa CNTT & ĐTVT', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Lớp Học phần Mở', value: '312', sub: 'Học kỳ 2 (2025-2026)', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-blue-500/30">
        <div className="relative z-10 space-y-2.5 max-w-2xl">
          <span className="px-3.5 py-1 bg-red-500/30 text-white text-xs font-black rounded-full border border-red-400/40 inline-block tracking-wide">
            CỔNG QUẢN TRỊ VIÊN HỆ THỐNG (ADMINISTRATOR)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">Trung tâm Quản trị UniLMS ICTU</h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed font-medium">
            Giám sát vận hành toàn trường, phân quyền người dùng, mở lớp học phần và cấu hình hệ thống.
          </p>
        </div>
        <div className="absolute right-4 bottom-0 opacity-20 pointer-events-none">
          <Shield className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${m.bg} ${m.color} flex items-center justify-center font-bold`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{m.label}</p>
                <h3 className="text-xl font-black text-slate-800">{m.value}</h3>
                <span className="text-[10px] text-slate-400">{m.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div 
          onClick={() => onNavigate('admin-users')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 group-hover:text-blue-600">Quản lý Tài khoản & Phân quyền</h3>
          <p className="text-xs text-slate-500 mt-1">Xem danh sách sinh viên, giảng viên, cấp quyền ADMIN, khóa/mở khóa tài khoản.</p>
        </div>

        <div 
          onClick={() => onNavigate('admin-courses')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 group-hover:text-indigo-600">Quản lý Môn học & Mở Lớp học phần</h3>
          <p className="text-xs text-slate-500 mt-1">Tạo môn học tín chỉ mới, phân công Giảng viên giảng dạy và mở lớp theo kỳ.</p>
        </div>

      </div>

    </div>
  );
}
