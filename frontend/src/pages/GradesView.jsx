import React, { useState } from 'react';
import { Smartphone, Award, CheckCircle2, Search, FileText } from 'lucide-react';

export default function GradesView({ onSelectCourse }) {
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ 2');

  const gradesList = [
    {
      stt: 1,
      id: 'g-1',
      courseTitle: 'Phương pháp phát triển phần mềm hướng đối tượng',
      slug: 'phuong-phap-phat-trien-phan-mem-huong-doi-tuong',
      credits: 3,
      semester: '2025_2026_2',
      attendanceScore: 9.5,
      quizAvgScore: 8.4,
      tx1: 7,
      tx2: 7.5,
      tx3: 7,
      tx4: '',
      tbcScore: 7.8,
      status: 'Đạt'
    },
    {
      stt: 2,
      id: 'g-2',
      courseTitle: 'Quản lý dự án CNTT',
      slug: 'quan-ly-du-an-cntt',
      credits: 3,
      semester: '2025_2026_2',
      attendanceScore: 9.0,
      quizAvgScore: 9.1,
      tx1: 8,
      tx2: 9.5,
      tx3: 8.5,
      tx4: '',
      tbcScore: 8.9,
      status: 'Đạt'
    },
    {
      stt: 3,
      id: 'g-3',
      courseTitle: 'Phát triển ứng dụng Python',
      slug: 'phat-trien-ung-dung-python',
      credits: 4,
      semester: '2025_2026_2',
      attendanceScore: 10.0,
      quizAvgScore: 9.6,
      tx1: 8.5,
      tx2: 8.5,
      tx3: 7.5,
      tx4: 7.5,
      tbcScore: 8.7,
      status: 'Đạt'
    },
    {
      stt: 4,
      id: 'g-4',
      courseTitle: 'Marketing số',
      slug: 'marketing-so',
      credits: 3,
      semester: '2025_2026_2',
      attendanceScore: 7.0,
      quizAvgScore: 9.4,
      tx1: 9.3,
      tx2: 8.3,
      tx3: 9.0,
      tx4: '',
      tbcScore: 8.9,
      status: 'Đạt'
    },
    {
      stt: 5,
      id: 'g-5',
      courseTitle: 'Quản trị hệ thống',
      slug: 'quan-tri-he-thong',
      credits: 3,
      semester: '2025_2026_2',
      attendanceScore: 8.5,
      quizAvgScore: 9.6,
      tx1: 8.5,
      tx2: 8.5,
      tx3: 8.5,
      tx4: '',
      tbcScore: 8.8,
      status: 'Đạt'
    },
    {
      stt: 6,
      id: 'g-6',
      courseTitle: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
      slug: 'lap-trinh-java-spring-boot-3',
      credits: 3,
      semester: '2025_2026_2',
      attendanceScore: 10.0,
      quizAvgScore: 9.5,
      tx1: 9.0,
      tx2: 9.5,
      tx3: 9.0,
      tx4: 9.5,
      tbcScore: 9.4,
      status: 'Đạt'
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

      {/* 3. GRADES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th rowSpan={2} className="py-3 px-3 text-center border-r border-slate-200 w-12">STT</th>
                <th rowSpan={2} className="py-3 px-4 border-r border-slate-200">Tên học phần</th>
                <th rowSpan={2} className="py-3 px-2 text-center border-r border-slate-200 w-16">Số TC</th>
                <th rowSpan={2} className="py-3 px-3 text-center border-r border-slate-200 w-24">Học kỳ</th>
                <th rowSpan={2} className="py-3 px-2 text-center border-r border-slate-200 w-20">Điểm C.Cần</th>
                <th rowSpan={2} className="py-3 px-2 text-center border-r border-slate-200 w-20">Điểm TBCTN</th>
                <th colSpan={4} className="py-2 px-2 text-center border-r border-slate-200 bg-blue-50/70 text-blue-900">Điểm thường xuyên</th>
                <th rowSpan={2} className="py-3 px-2 text-center border-r border-slate-200 w-20">Điểm TBC</th>
                <th rowSpan={2} className="py-3 px-3 text-center w-24">ĐK thi KTHP</th>
              </tr>
              <tr className="bg-blue-50/50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <th className="py-1.5 px-2 text-center border-r border-slate-200 w-12">TX 1</th>
                <th className="py-1.5 px-2 text-center border-r border-slate-200 w-12">TX 2</th>
                <th className="py-1.5 px-2 text-center border-r border-slate-200 w-12">TX 3</th>
                <th className="py-1.5 px-2 text-center border-r border-slate-200 w-12">TX 4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {gradesList.map((row) => (
                <tr 
                  key={row.id}
                  onClick={() => onSelectCourse && onSelectCourse(row.slug)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 text-center border-r border-slate-200 text-slate-500 font-semibold">{row.stt}</td>
                  <td className="py-3 px-4 border-r border-slate-200 font-semibold text-slate-800 hover:text-blue-600">{row.courseTitle}</td>
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-bold">{row.credits}</td>
                  <td className="py-3 px-3 text-center border-r border-slate-200 font-mono text-[11px] text-slate-600">{row.semester}</td>
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-bold text-slate-700">{row.attendanceScore}</td>
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-bold text-slate-700">{row.quizAvgScore}</td>
                  
                  {/* TX 1 - TX 4 */}
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-semibold text-slate-700">{row.tx1}</td>
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-semibold text-slate-700">{row.tx2}</td>
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-semibold text-slate-700">{row.tx3}</td>
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-semibold text-slate-400">{row.tx4 || ''}</td>
                  
                  {/* Điểm TBC quá trình */}
                  <td className="py-3 px-2 text-center border-r border-slate-200 font-extrabold text-blue-900 text-sm">{row.tbcScore}</td>
                  
                  {/* Điều kiện thi KTHP */}
                  <td className="py-3 px-3 text-center font-bold text-blue-600">
                    {row.status}
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
