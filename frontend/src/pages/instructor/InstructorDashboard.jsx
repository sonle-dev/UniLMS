import React, { useState } from 'react';
import { BookOpen, Users, FileCheck2, Clock, Plus, BarChart3, ChevronRight, Award, UserCheck } from 'lucide-react';

const INSTRUCTOR_ASSIGNMENTS = [
  {
    id: 'gv_maitt',
    instructorName: 'TS. Trần Thị Mai',
    email: 'maitt@unilms.edu.vn',
    courseId: 'c-103',
    title: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25',
    code: 'CNTT.K22B.D1.K2.N03',
    slug: 'phuong-phap-phat-trien-phan-mem-huong-doi-tuong',
    studentsCount: 54,
    pendingQuizzes: 8,
    completionRate: 85,
    nextSession: 'Thứ 3 (07:00 - 09:25) - Phòng C1.204'
  },
  {
    id: 'gv_minhtd',
    instructorName: 'PGS. TS. Trần Đức Minh',
    email: 'minhtd@unilms.edu.vn',
    courseId: 'c-101',
    title: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
    code: 'CNTT.K22B.D1.K2.N01',
    slug: 'lap-trinh-java-spring-boot-3',
    studentsCount: 54,
    pendingQuizzes: 6,
    completionRate: 82,
    nextSession: 'Thứ 2 (07:00 - 09:25) - Phòng A2.301'
  },
  {
    id: 'gv_namnh',
    instructorName: 'ThS. Nguyễn Hoàng Nam',
    email: 'namnh@unilms.edu.vn',
    courseId: 'c-102',
    title: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
    code: 'CNTT.K22B.D1.K2.N02',
    slug: 'postgresql-enterprise-optimization',
    studentsCount: 54,
    pendingQuizzes: 4,
    completionRate: 74,
    nextSession: 'Thứ 4 (13:00 - 15:25) - Phòng B1.102'
  },
  {
    id: 'gv_lampd',
    instructorName: 'TS. Phạm Đình Lâm',
    email: 'lampd@unilms.edu.vn',
    courseId: 'c-104',
    title: 'Quản lý dự án CNTT-2-25',
    code: 'CNTT.K22B.D1.K2.N04',
    slug: 'quan-ly-du-an-cntt',
    studentsCount: 54,
    pendingQuizzes: 5,
    completionRate: 79,
    nextSession: 'Thứ 5 (09:30 - 11:55) - Phòng B2.203'
  },
  {
    id: 'gv_hocnv',
    instructorName: 'PGS. TS. Nguyễn Văn Học',
    email: 'hocnv@unilms.edu.vn',
    courseId: 'c-105',
    title: 'Quản trị hệ thống-2-25',
    code: 'CNTT.K22B.D1.K2.N05',
    slug: 'quan-tri-he-thong',
    studentsCount: 54,
    pendingQuizzes: 7,
    completionRate: 88,
    nextSession: 'Thứ 6 (13:00 - 15:25) - Phòng D3.101'
  }
];

export default function InstructorDashboard({ onNavigate, onSelectCourse, currentUser }) {
  // Determine active instructor from currentUser or default to TS. Trần Thị Mai
  const [selectedInstructorId, setSelectedInstructorId] = useState(() => {
    if (currentUser?.email) {
      const match = INSTRUCTOR_ASSIGNMENTS.find(ins => ins.email === currentUser.email);
      if (match) return match.id;
    }
    return 'gv_maitt';
  });

  const activeInstructor = INSTRUCTOR_ASSIGNMENTS.find(ins => ins.id === selectedInstructorId) || INSTRUCTOR_ASSIGNMENTS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Banner Top Giảng viên */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-bold rounded-full border border-blue-400/30 inline-block">
              CỔNG THÔNG TIN GIẢNG VIÊN ICTU
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold rounded-full border border-emerald-400/30">
              Phân công: 1 Giảng viên / 1 Môn học
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Xin chào, {activeInstructor.instructorName}</h1>
          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
            Học kỳ 2 - Năm học 2025-2026. Quản lý lớp học phần phụ trách, tải bài giảng tài liệu và theo dõi kết quả 54 sinh viên.
          </p>

          {/* Quick Switch Instructor Dropdown */}
          <div className="pt-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-300" />
            <label className="text-xs text-sky-100 font-medium">Chuyển xem giảng viên:</label>
            <select
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="bg-white/10 text-white border border-white/20 text-xs rounded-lg px-2.5 py-1 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-300 backdrop-blur-md cursor-pointer"
            >
              {INSTRUCTOR_ASSIGNMENTS.map(ins => (
                <option key={ins.id} value={ins.id} className="text-slate-800 bg-white">
                  {ins.instructorName} — {ins.title}
                </option>
              ))}
            </select>
          </div>
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
            <h3 className="text-xl font-black text-slate-800">1 Lớp</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">1 Môn / 1 Giảng viên</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Sinh viên</p>
            <h3 className="text-xl font-black text-slate-800">{activeInstructor.studentsCount} SV</h3>
            <span className="text-[10px] text-slate-400">100% sĩ số lớp</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Bài trắc nghiệm đã nộp</p>
            <h3 className="text-xl font-black text-slate-800">{activeInstructor.pendingQuizzes} Bài</h3>
            <span className="text-[10px] text-amber-600 font-semibold">Cần đánh giá</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tỷ lệ hoàn thành môn</p>
            <h3 className="text-xl font-black text-slate-800">{activeInstructor.completionRate}%</h3>
            <span className="text-[10px] text-indigo-600 font-semibold">Tiến độ chuẩn ICTU</span>
          </div>
        </div>
      </div>

      {/* Teaching Classes Table - Exactly 1 Course per Instructor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Lớp học phần phụ trách</h3>
            <p className="text-xs text-slate-500">Môn học do {activeInstructor.instructorName} trực tiếp giảng dạy trong học kỳ</p>
          </div>
          <button
            onClick={() => onNavigate('instructor-courses')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Quản lý Nội dung Bài giảng
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          <div className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                  {activeInstructor.code}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đang giảng dạy
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  • Giảng viên: <span className="font-bold text-slate-700">{activeInstructor.instructorName}</span>
                </span>
              </div>
              <h4 
                onClick={() => onSelectCourse ? onSelectCourse(activeInstructor.slug) : onNavigate('instructor-courses')}
                className="text-base font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {activeInstructor.title}
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {activeInstructor.nextSession}
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600">
              <div className="text-center">
                <span className="block font-black text-slate-800 text-sm">{activeInstructor.studentsCount}</span>
                <span className="text-slate-400">Sinh viên</span>
              </div>
              <div className="text-center">
                <span className="block font-black text-amber-600 text-sm">{activeInstructor.pendingQuizzes}</span>
                <span className="text-slate-400">Bài cần chấm</span>
              </div>
              <div className="text-center">
                <span className="block font-black text-emerald-600 text-sm">{activeInstructor.completionRate}%</span>
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
                  title="Xem chi tiết nội dung"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
