import React from 'react';
import { PlayCircle, CheckCircle2, QrCode, Smartphone, ArrowRight, BookOpen } from 'lucide-react';

export default function StudentDashboard({ onSelectCourse, onOpenCertificate, enrollments, currentUser }) {

  // Current semester course list matching ICTU LMS specification
  const currentSemesterCourses = [
    {
      stt: 1,
      id: 'c-101',
      title: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
      code: 'CNTT.K22B.D1.K2.N01',
      fullTitle: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3 (CNTT.K22B.D1.K2.N01)',
      slug: 'lap-trinh-java-spring-boot-3',
      weeks: '9/9',
      absences: 0,
      status: 'Đúng tiến độ'
    },
    {
      stt: 2,
      id: 'c-102',
      title: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
      code: 'CNTT.K22B.D1.K2.N02',
      fullTitle: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise (CNTT.K22B.D1.K2.N02)',
      slug: 'postgresql-enterprise-optimization',
      weeks: '12/12',
      absences: 0,
      status: 'Đúng tiến độ'
    },
    {
      stt: 3,
      id: 'c-103',
      title: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25',
      code: 'CNTT.K22B.D1.K2.N03',
      fullTitle: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25 (CNTT.K22B.D1.K2.N03)',
      slug: 'phuong-phap-phat-trien-phan-mem-huong-doi-tuong',
      weeks: '9/9',
      absences: 0,
      status: 'Đúng tiến độ'
    },
    {
      stt: 4,
      id: 'c-104',
      title: 'Quản lý dự án CNTT-2-25',
      code: 'CNTT.K22B.D1.K2.N04',
      fullTitle: 'Quản lý dự án CNTT-2-25 (CNTT.K22B.D1.K2.N04)',
      slug: 'quan-ly-du-an-cntt',
      weeks: '9/9',
      absences: 0,
      status: 'Đúng tiến độ'
    },
    {
      stt: 5,
      id: 'c-105',
      title: 'Quản trị hệ thống-2-25',
      code: 'CNTT.K22B.D1.K2.N05',
      fullTitle: 'Quản trị hệ thống-2-25 (CNTT.K22B.D1.K2.N05)',
      slug: 'quan-tri-he-thong',
      weeks: '9/9',
      absences: 1,
      status: 'Đúng tiến độ'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. LMS ICTU MOBILE APP BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white p-6 sm:p-8 shadow-md">
        
        {/* Decorative Wave & Light Patterns */}
        <div className="absolute left-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6">
          <svg width="400" height="200" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="8"/>
            <circle cx="100" cy="100" r="140" stroke="white" strokeWidth="6"/>
            <circle cx="100" cy="100" r="190" stroke="white" strokeWidth="4"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Banner Text Area */}
          <div className="space-y-3 max-w-xl text-center md:text-left">
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

          {/* QR Codes & App Download Section */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            {/* iOS QR Code */}
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

            {/* Android QR Code */}
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

            {/* Mobile Illustration Icon */}
            <div className="hidden lg:flex flex-col items-center justify-center pl-2 border-l border-white/20 text-white/90">
              <Smartphone className="w-10 h-10" />
              <span className="text-[9px] font-bold mt-1">App Mobile</span>
            </div>
          </div>

        </div>
      </div>


      {/* 2. TABLE OF CURRENT SEMESTER COURSES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header Section Banner */}
        <div className="bg-blue-600 px-5 py-3 text-white flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold tracking-wide">
            Các lớp học phần học kỳ hiện tại (2025_2026_2)
          </h3>
          <span className="text-[11px] font-medium bg-blue-700 px-2.5 py-1 rounded-full text-blue-100">
            Tổng cộng: {currentSemesterCourses.length} môn
          </span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-16">STT</th>
                <th className="py-3 px-4">Tên lớp học phần</th>
                <th className="py-3 px-4 text-center w-28">Tuần học</th>
                <th className="py-3 px-4 text-center w-28">Số buổi nghỉ</th>
                <th className="py-3 px-4 text-center w-32">Trạng thái</th>
                <th className="py-3 px-4 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentSemesterCourses.map((course) => (
                <tr 
                  key={course.id}
                  onClick={() => onSelectCourse(course.slug)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                    {course.stt}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 group-hover:text-blue-700">
                    <span className="font-semibold">{course.fullTitle}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {course.weeks}
                  </td>
                  <td className={`py-3.5 px-4 text-center font-bold ${course.absences > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                    {course.absences}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {course.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course.slug);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded transition-colors inline-flex items-center gap-1"
                    >
                      Vào lớp <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
