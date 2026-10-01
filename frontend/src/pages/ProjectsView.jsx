import React, { useState } from 'react';
import { Smartphone, Folder, FileSearch, User, Phone, Layers } from 'lucide-react';

export default function ProjectsView({ onSelectCourse }) {
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ 2');

  const projectList = [
    {
      id: 'proj-1',
      title: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25 (CNTT.K22B.D1.K2.N02)',
      slug: 'phuong-phap-phat-trien-phan-mem-huong-doi-tuong',
      groupNo: '08',
      semester: '2025_2026_2',
      instructor: 'Nguyễn Thanh Hải',
      phone: '0968550888'
    },
    {
      id: 'proj-2',
      title: 'Quản lý dự án CNTT-2-25 (CNTT.K22B.D1.K2.N02)',
      slug: 'quan-ly-du-an-cntt',
      groupNo: '05',
      semester: '2025_2026_2',
      instructor: 'Quách Xuân Trường',
      phone: '0989090832'
    },
    {
      id: 'proj-3',
      title: 'Marketing số-2-25 (CNTT.K22B.D1.K2.N02)',
      slug: 'marketing-so',
      groupNo: '03',
      semester: '2025_2026_2',
      instructor: 'Nguyễn Quang Hiệp',
      phone: '0915.122.722'
    },
    {
      id: 'proj-4',
      title: 'Phát triển ứng dụng Python-2-25 (CNTT.K22B.D1.K2.N01)',
      slug: 'phat-trien-ung-dung-python',
      groupNo: '15',
      semester: '2025_2026_2',
      instructor: 'Nguyễn Tuấn Anh',
      phone: '0912662003'
    },
    {
      id: 'proj-5',
      title: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3 (CNTT.K22B.D1.K2.N01)',
      slug: 'lap-trinh-java-spring-boot-3',
      groupNo: '01',
      semester: '2025_2026_2',
      instructor: 'PGS. TS. Trần Đức Minh',
      phone: '0988.123.456'
    }
  ];

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

      </div>

      {/* 3. PROJECTS LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-200">
          {projectList.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelectCourse && onSelectCourse(item.slug)}
              className="p-4 sm:p-5 flex items-start gap-4 hover:bg-blue-50/40 transition-colors cursor-pointer group"
            >
              {/* Icon Circle */}
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-200 mt-0.5 group-hover:scale-105 transition-transform">
                <FileSearch className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-blue-600 group-hover:underline leading-snug">
                  {item.title}
                </h4>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>- Nhóm số : <strong className="text-slate-800 font-bold">{item.groupNo}</strong></span>
                  <span>- Học kỳ : <span className="font-semibold text-slate-700">{item.semester}</span></span>
                  <span>- Giảng viên : <strong className="text-slate-800 font-bold">{item.instructor}</strong></span>
                  <span>- Số điện thoại : <span className="font-mono text-blue-700 font-semibold">{item.phone}</span></span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
