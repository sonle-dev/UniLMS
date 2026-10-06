import React from 'react';
import { BookOpen, Users, FileCheck2, Clock, Plus, BarChart3, ChevronRight, Award } from 'lucide-react';

export default function InstructorDashboard({ onNavigate, onSelectCourse }) {
  const teachingCourses = [
    {
      id: 'c-101',
      title: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
      code: 'CNTT.K22B.D1.K2.N01',
      studentsCount: 65,
      pendingQuizzes: 12,
      completionRate: 82,
      nextSession: 'Thứ 2 (07:00 - 09:25) - Phòng A2.301'
    },
    {
      id: 'c-102',
      title: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
      code: 'CNTT.K22B.D1.K2.N02',
      studentsCount: 58,
      pendingQuizzes: 5,
      completionRate: 74,
      nextSession: 'Thứ 4 (13:00 - 15:25) - Phòng B1.102'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Banner Top Giảng viên */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-bold rounded-full border border-blue-400/30 inline-block">
            CỔNG THÔNG TIN GIẢNG VIÊN ICTU
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Xin chào, TS. Trần Thị Mai</h1>
          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
            Học kỳ 2 - Năm học 2025-2026. Quản lý lớp học phần, đăng tải tài liệu giảng dạy và theo dõi tiến độ sinh viên.
          </p>
        </div>
        <div className="absolute right-4 bottom-0 opacity-15 pointer-events-none">
          <Award className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Lớp HP đang dạy</p>
            <h3 className="text-xl font-black text-slate-800">2 Lớp</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Sinh viên</p>
            <h3 className="text-xl font-black text-slate-800">123 SV</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Bài trắc nghiệm đã nộp</p>
            <h3 className="text-xl font-black text-slate-800">17 Bài</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tỷ lệ hoàn thành trung bình</p>
            <h3 className="text-xl font-black text-slate-800">78%</h3>
          </div>
        </div>
      </div>

      {/* Teaching Classes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Lớp học phần phụ trách</h3>
            <p className="text-xs text-slate-500">Danh sách các môn học bạn trực tiếp giảng dạy trong kỳ</p>
          </div>
          <button
            onClick={() => onNavigate('instructor-courses')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Quản lý Nội dung Bài giảng
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {teachingCourses.map(course => (
            <div key={course.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                    {course.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đang hoạt động
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 hover:text-blue-600 transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.nextSession}
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600">
                <div className="text-center">
                  <span className="block font-black text-slate-800 text-sm">{course.studentsCount}</span>
                  <span className="text-slate-400">Sinh viên</span>
                </div>
                <div className="text-center">
                  <span className="block font-black text-amber-600 text-sm">{course.pendingQuizzes}</span>
                  <span className="text-slate-400">Bài cần chấm</span>
                </div>
                <div className="text-center">
                  <span className="block font-black text-emerald-600 text-sm">{course.completionRate}%</span>
                  <span className="text-slate-400">Hoàn thành</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('instructor-grades')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Nhập điểm
                  </button>
                  <button
                    onClick={() => onNavigate('instructor-courses')}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
