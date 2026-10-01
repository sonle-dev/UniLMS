import React, { useState } from 'react';
import { Plus, BookOpen, Layers, Users, Calendar, CheckCircle2, UserCheck } from 'lucide-react';

export default function CourseAdminView({ onShowToast }) {
  const [courses, setCourses] = useState([
    {
      id: 'c-101',
      title: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
      code: 'JAVA88',
      credits: 3,
      instructor: 'PGS. TS. Trần Đức Minh',
      semester: 'Học kỳ 2 (2025-2026)',
      classesCount: 2,
      totalStudents: 123
    },
    {
      id: 'c-102',
      title: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
      code: 'PGDB99',
      credits: 3,
      instructor: 'ThS. Nguyễn Hoàng Nam',
      semester: 'Học kỳ 2 (2025-2026)',
      classesCount: 1,
      totalStudents: 58
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCredits, setNewCredits] = useState('3');
  const [newInstructor, setNewInstructor] = useState('PGS. TS. Trần Đức Minh');

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const newC = {
      id: 'c-' + Date.now(),
      title: newTitle,
      code: newCode.toUpperCase(),
      credits: parseInt(newCredits) || 3,
      instructor: newInstructor,
      semester: 'Học kỳ 2 (2025-2026)',
      classesCount: 1,
      totalStudents: 0
    };

    setCourses([newC, ...courses]);
    setNewTitle('');
    setNewCode('');
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Quản lý Môn học',
        message: `Đã mở lớp học phần môn ${newC.title} thành công!`
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wide">PHÂN HỆ QUẢN TRỊ VIÊN</span>
          <h2 className="text-xl font-black text-slate-800">Quản lý Môn học Tín chỉ & Mở Lớp học phần</h2>
          <p className="text-xs text-slate-500">Tạo môn học mới, mở lớp theo học kỳ và phân công Giảng viên phụ trách</p>
        </div>
      </div>

      {/* Form Add New Course */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" /> Tạo Môn học mới & Mở Lớp học phần
        </h3>

        <form onSubmit={handleCreateCourse} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên môn học *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Phương pháp phát triển PM Hướng đối tượng"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mã môn học *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: OOD01"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Giảng viên phụ trách *</label>
            <select
              value={newInstructor}
              onChange={(e) => setNewInstructor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="PGS. TS. Trần Đức Minh">PGS. TS. Trần Đức Minh</option>
              <option value="ThS. Nguyễn Hoàng Nam">ThS. Nguyễn Hoàng Nam</option>
              <option value="TS. Phạm Minh Tuấn">TS. Phạm Minh Tuấn</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors"
            >
              Mở Lớp Học Phần
            </button>
          </div>
        </form>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800">Danh sách Môn học & Lớp HP đang mở</h3>
          <span className="text-xs font-bold text-slate-500">{courses.length} Môn học</span>
        </div>

        <div className="divide-y divide-slate-200">
          {courses.map(c => (
            <div key={c.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 rounded">
                    Mã: {c.code}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                    {c.credits} Tín chỉ
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">{c.title}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Giảng viên: <strong className="text-slate-800">{c.instructor}</strong></span> |
                  <span>{c.semester}</span>
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600">
                <div className="text-center">
                  <span className="block font-black text-slate-800 text-sm">{c.classesCount}</span>
                  <span className="text-slate-400">Lớp HP</span>
                </div>
                <div className="text-center">
                  <span className="block font-black text-blue-600 text-sm">{c.totalStudents}</span>
                  <span className="text-slate-400">Sinh viên</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
