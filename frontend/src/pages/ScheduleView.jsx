import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, Smartphone, Clock, MapPin, User } from 'lucide-react';

export default function ScheduleView({ onSelectCourse }) {
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ 2');
  const [selectedWeekRange, setSelectedWeekRange] = useState('15/09/2026 - 21/09/2026');
  const [showEmptyState, setShowEmptyState] = useState(false);

  const weekDays = [
    { dayName: 'Thứ 2', dateStr: '15/09/2026', id: 'mon' },
    { dayName: 'Thứ 3', dateStr: '16/09/2026', id: 'tue' },
    { dayName: 'Thứ 4', dateStr: '17/09/2026', id: 'wed' },
    { dayName: 'Thứ 5', dateStr: '18/09/2026', id: 'thu' },
    { dayName: 'Thứ 6', dateStr: '19/09/2026', id: 'fri' },
    { dayName: 'Thứ 7', dateStr: '20/09/2026', id: 'sat' },
    { dayName: 'Chủ nhật', dateStr: '21/09/2026', id: 'sun' },
  ];

  // Sample Schedule Data for ICTU Student
  const scheduleData = {
    mon: [
      {
        id: 's-1',
        courseTitle: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
        code: 'CNTT.K22B.D1.K2.N01',
        time: '07:00 - 09:25 (Tiết 1 - 3)',
        room: 'Phòng A2.301 - Tòa nhà A2',
        instructor: 'PGS. TS. Trần Đức Minh',
        slug: 'lap-trinh-java-spring-boot-3'
      }
    ],
    wed: [
      {
        id: 's-2',
        courseTitle: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
        code: 'CNTT.K22B.D1.K2.N02',
        time: '13:00 - 15:25 (Tiết 7 - 9)',
        room: 'Phòng B1.102 - Tòa nhà B1',
        instructor: 'ThS. Nguyễn Hoàng Nam',
        slug: 'postgresql-enterprise-optimization'
      }
    ],
    fri: [
      {
        id: 's-3',
        courseTitle: 'Phương pháp phát triển phần mềm hướng đối tượng',
        code: 'CNTT.K22B.D1.K2.N03',
        time: '09:35 - 11:55 (Tiết 4 - 6)',
        room: 'Phòng C3.204',
        instructor: 'TS. Phạm Minh Tuấn',
        slug: 'phuong-phap-phat-trien-phan-mem-huong-doi-tuong'
      }
    ]
  };

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
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
        
        {/* Năm học */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Năm học:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        {/* Học kỳ */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Học kỳ:</label>
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="Học kỳ 1">Học kỳ 1</option>
            <option value="Học kỳ 2">Học kỳ 2</option>
          </select>
        </div>

        {/* Tuần */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Tuần:</label>
          <select 
            value={selectedWeekRange} 
            onChange={(e) => setSelectedWeekRange(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="15/09/2026 - 21/09/2026">15/09/2026 - 21/09/2026</option>
            <option value="22/09/2026 - 28/09/2026">22/09/2026 - 28/09/2026</option>
          </select>
        </div>

        {/* Demo Toggle Mode */}
        <button
          onClick={() => setShowEmptyState(!showEmptyState)}
          className="ml-auto text-[11px] px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          {showEmptyState ? 'Xem Lịch mẫu' : 'Xem Trạng thái Trống (Nghỉ)'}
        </button>

      </div>

      {/* 3. WEEK TITLE CENTER HEADER */}
      <div className="text-center">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
          Tuần bắt đầu từ <span className="text-blue-600 dark:text-blue-400 font-black">{selectedWeekRange.split(' - ')[0]}</span> đến <span className="text-blue-600 dark:text-blue-400 font-black">{selectedWeekRange.split(' - ')[1]}</span>
        </h3>
      </div>

      {/* 4. WEEKLY SCHEDULE GRID TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-center font-bold text-xs">
          {weekDays.map((w) => (
            <div key={w.id} className="py-3 px-1 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
              <div className="text-slate-800 dark:text-slate-100 font-extrabold">{w.dayName}</div>
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">{w.dateStr}</div>
            </div>
          ))}
        </div>

        {/* SCHEDULE CONTENT BODY */}
        {showEmptyState ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
            Bạn không có lớp học nào diễn ra trong tuần này.
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800 min-h-[300px] bg-slate-50/30 dark:bg-slate-950/40">
            {weekDays.map((w) => {
              const classes = scheduleData[w.id] || [];
              return (
                <div key={w.id} className="p-2 space-y-2">
                  {classes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-600 italic text-center p-2">
                      Không có tiết
                    </div>
                  ) : (
                    classes.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => onSelectCourse && onSelectCourse(cls.slug)}
                        className="bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-500 p-2.5 rounded-lg text-left shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <h5 className="text-xs font-extrabold text-blue-950 dark:text-blue-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cls.courseTitle}
                        </h5>
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-mono mt-1 font-semibold">{cls.code}</p>
                        
                        <div className="mt-2 space-y-1 text-[10px] text-slate-600 dark:text-slate-300 border-t border-blue-100 dark:border-blue-900/50 pt-1.5">
                          <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span>{cls.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <span>{cls.room}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <User className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                            <span className="truncate">{cls.instructor}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
