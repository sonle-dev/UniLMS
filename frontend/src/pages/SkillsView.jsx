import React, { useState } from 'react';
import { Smartphone, CheckCircle, FileText, HelpCircle, Edit3, Filter, Award, Clock } from 'lucide-react';

export default function SkillsView({ quizSubmissions = [], onStartQuiz }) {
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ 2');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');

  // Sample default submitted skill assessments matching ICTU LMS image
  const defaultSubmissions = [
    {
      id: 'sub-1',
      title: 'Bài kiểm tra kỹ năng 1: Spring Boot REST API & Security',
      courseName: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3 (CNTT.K22B.D1.K2.N01)',
      score: 9.3,
      type: 'Thi trắc nghiệm',
      submittedAt: '02/01/2026 04:15:10',
      status: 'Đã hoàn thành',
      iconType: 'QUIZ'
    },
    {
      id: 'sub-2',
      title: 'Bài kiểm tra kỹ năng 2: Cấu hình Hibernate & HikariCP Pool',
      courseName: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3 (CNTT.K22B.D1.K2.N01)',
      score: 8.3,
      type: 'Thi trắc nghiệm',
      submittedAt: '06/02/2026 01:45:07',
      status: 'Đã hoàn thành',
      iconType: 'QUIZ'
    },
    {
      id: 'sub-3',
      title: 'Bài kiểm tra kỹ năng 3: Thiết kế DDL Schema PostgreSQL 15',
      courseName: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise (CNTT.K22B.D1.K2.N02)',
      score: 9.0,
      type: 'Thực hành',
      submittedAt: '06/03/2026 01:57:28',
      status: 'Đã hoàn thành',
      iconType: 'PRACTICE'
    },
    {
      id: 'sub-4',
      title: 'Bài kiểm tra kỹ năng 3: Quản trị tiến trình Linux & PostgreSQL System',
      courseName: 'Quản trị hệ thống-2-25 (CNTT.K22B.D1.K2.N02)',
      score: 8.5,
      type: 'Thực hành',
      submittedAt: '08/02/2026 07:12:16',
      status: 'Đã hoàn thành',
      iconType: 'PRACTICE'
    },
    {
      id: 'sub-5',
      title: 'Bài kiểm tra kỹ năng 2: Lập kế hoạch & Quản lý tiến độ dự án',
      courseName: 'Quản lý dự án CNTT-2-25 (CNTT.K22B.D1.K2.N02)',
      score: 8.5,
      type: 'Thực hành',
      submittedAt: '25/01/2026 07:08:32',
      status: 'Đã hoàn thành',
      iconType: 'PRACTICE'
    },
    {
      id: 'sub-6',
      title: 'Bài kiểm tra kỹ năng 1: Phân tích yêu cầu phần mềm hướng đối tượng',
      courseName: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25 (CNTT.K22B.D1.K2.N02)',
      score: 8.5,
      type: 'Thực hành',
      submittedAt: '04/01/2026 07:33:27',
      status: 'Đã hoàn thành',
      iconType: 'PRACTICE'
    }
  ];

  // Combine user live completed quizzes with default list
  const allSubmissions = [...quizSubmissions, ...defaultSubmissions];

  const filteredSubmissions = allSubmissions.filter(item => {
    if (selectedCourseFilter === 'ALL') return true;
    return item.courseName.includes(selectedCourseFilter);
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. LMS ICTU MOBILE APP BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black backdrop-blur-xs text-white uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span> LMS FOR STUDENTS
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
              Các bạn Sinh viên ICTU ơi...!<br />
              <span className="text-amber-300">LMS ĐÃ CÓ PHIÊN BẢN DÀNH CHO THIẾT BỊ DI ĐỘNG</span>
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 font-medium">
              Quét mã QR truy cập App Store hoặc CH Play để tải nào...!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider block">ios</span>
              <div className="w-20 h-20 bg-white p-1.5 rounded-lg shadow-inner flex items-center justify-center">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://lms.ictu.edu.vn/app/ios" 
                  alt="iOS QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider block">android</span>
              <div className="w-20 h-20 bg-white p-1.5 rounded-lg shadow-inner flex items-center justify-center">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://lms.ictu.edu.vn/app/android" 
                  alt="Android QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center pl-2 border-l border-white/20 text-white/90">
              <Smartphone className="w-10 h-10" />
              <span className="text-[9px] font-bold mt-1">App Mobile</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER CONTROLS TOOLBAR */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700">
        
        {/* Năm học */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500 whitespace-nowrap">Năm học:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        {/* Học kỳ */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500 whitespace-nowrap">Học kỳ:</label>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="Học kỳ 1">Học kỳ 1</option>
            <option value="Học kỳ 2">Học kỳ 2</option>
          </select>
        </div>

        {/* Lọc theo lớp học phần */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500 whitespace-nowrap">Lọc theo:</label>
          <select 
            value={selectedCourseFilter} 
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs min-w-[200px]"
          >
            <option value="ALL">Tất cả lớp học phần</option>
            <option value="Java">Lập trình Enterprise với Java</option>
            <option value="PostgreSQL">Kiến trúc PostgreSQL Enterprise</option>
            <option value="Quản trị">Quản trị hệ thống</option>
          </select>
        </div>

      </div>

      {/* 3. COMPLETED TESTS LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-200">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Chưa có bài kiểm tra kỹ năng nào trong danh mục này.
            </div>
          ) : (
            filteredSubmissions.map((item) => (
              <div 
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                {/* Left Title & Course Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.iconType === 'QUIZ' ? (
                      <Edit3 className="w-5 h-5 text-blue-600" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-sky-600" />
                    )}
                  </div>
                  
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      - Lớp học phần : <span className="font-semibold text-slate-700">{item.courseName}</span>
                    </p>
                  </div>
                </div>

                {/* Right Meta Specs: Score, Type, Time, Status */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  
                  {/* Điểm */}
                  <div className="text-center min-w-[50px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Điểm</span>
                    <span className="text-sm font-extrabold text-slate-800">{item.score}</span>
                  </div>

                  {/* Hình thức */}
                  <div className="text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Hình thức</span>
                    <span className="text-xs font-semibold text-slate-700">{item.type}</span>
                  </div>

                  {/* Thời gian */}
                  <div className="text-center min-w-[130px]">
                    <span className="text-[10px] text-slate-400 block font-medium">Thời gian</span>
                    <span className="text-[11px] font-mono text-slate-600">{item.submittedAt}</span>
                  </div>

                  {/* Trạng thái Button */}
                  <div>
                    <span className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg inline-block text-center border border-slate-200">
                      {item.status || 'Đã hoàn thành'}
                    </span>
                  </div>

                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
