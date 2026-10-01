import React, { useState } from 'react';
import { Search, Filter, BookOpen, Layers, User, PlayCircle, CheckCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function CourseCatalog({ courses, onSelectCourse }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <Breadcrumbs items={[{ label: 'Tất cả Khóa học Đào tạo' }]} />

      {/* Title & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borderLight shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain tracking-tight">Danh mục Chương trình Đào tạo</h1>
          <p className="text-xs text-textSec mt-1">Các khóa học tín chỉ & chứng chỉ chuyên sâu theo tiêu chuẩn giáo dục Đại học</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm môn học, mã môn..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div 
            key={course.id}
            className="card-interactive flex flex-col justify-between group overflow-hidden"
          >
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-primary-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                  Chính quy 3 Tín chỉ
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-textMain group-hover:text-primary-700 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-textSec mt-1 line-clamp-2 leading-relaxed">
                  {course.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-textMuted pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-primary-600" /> {course.totalModules} Chương
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-primary-600" /> {course.totalLessons} Bài học
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-textMuted">Giảng viên</p>
                <p className="text-xs font-semibold text-textMain truncate max-w-[140px]">{course.instructorName}</p>
              </div>

              <button
                onClick={() => onSelectCourse(course.slug)}
                className="btn-primary text-xs gap-1.5"
              >
                <PlayCircle className="w-4 h-4" /> Chi tiết & Học
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
