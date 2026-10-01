import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, PlayCircle, FileText, HelpCircle, CheckCircle, User, Award, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function CourseDetail({ course, onStartLesson, onNavigate }) {
  const [expandedModules, setExpandedModules] = useState({ [course.modules[0]?.id]: true });

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <Breadcrumbs 
        items={[
          { label: 'Tất cả Khóa học', target: 'catalog' },
          { label: course.title }
        ]} 
        onNavigate={onNavigate}
      />

      {/* Hero Header Banner */}
      <div className="bg-white rounded-2xl border border-borderLight p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-xs font-bold text-primary-700 border border-primary-100">
            <Award className="w-3.5 h-3.5 text-primary-600" /> Chương trình Tín chỉ Chính quy
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
            {course.title}
          </h1>

          <p className="text-sm text-textSec leading-relaxed">
            {course.summary}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-textSec pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" />
              <span>Giảng viên: <strong className="text-textMain">{course.instructorName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span>{course.modules.length} Chương đào tạo</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Cấp Chứng chỉ khi hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Course Card Sidebar CTA */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="aspect-video rounded-lg overflow-hidden border border-slate-300">
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          </div>

          <button 
            onClick={() => onStartLesson(course.modules[0]?.lessons[0]?.id)}
            className="btn-primary w-full py-3 text-base gap-2"
          >
            <PlayCircle className="w-5 h-5" /> Vào học ngay bây giờ
          </button>
        </div>
      </div>

      {/* Syllabus Tree Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-600" />
          Khung Chương trình Chi tiết (Syllabus)
        </h2>

        <div className="space-y-3">
          {course.modules.map((module, idx) => {
            const isExpanded = expandedModules[module.id];
            return (
              <div key={module.id} className="bg-white rounded-xl border border-borderLight overflow-hidden shadow-xs">
                
                {/* Module Accordion Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 font-extrabold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <span className="font-bold text-base text-textMain">{module.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-textMuted font-medium">
                    <span>{module.lessons.length} Bài học</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-textMain" /> : <ChevronRight className="w-4 h-4 text-textMuted" />}
                  </div>
                </button>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100 bg-white">
                    {module.lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        onClick={() => onStartLesson(lesson.id)}
                        className="px-6 py-3.5 flex items-center justify-between hover:bg-primary-50/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          {lesson.contentType === 'VIDEO' && <PlayCircle className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />}
                          {lesson.contentType === 'DOCUMENT' && <FileText className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />}
                          {lesson.contentType === 'QUIZ' && <HelpCircle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />}
                          
                          <span className="text-sm font-medium text-textMain group-hover:text-primary-700 transition-colors">
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          {lesson.durationSeconds > 0 && (
                            <span className="text-textMuted font-medium">{Math.floor(lesson.durationSeconds / 60)} phút</span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-textSec">
                            {lesson.contentType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
