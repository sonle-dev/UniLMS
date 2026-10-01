import React, { useState } from 'react';
import { Play, CheckCircle2, FileText, MessageSquare, ChevronLeft, ChevronRight, HelpCircle, Download, Send } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function LessonPlayer({ course, currentLessonId, onSelectLesson, onOpenQuiz, onNavigate, onToggleComplete, isCompleted }) {
  const [activeTab, setActiveTab] = useState('doc'); // 'doc' or 'discussion'
  const [comments, setComments] = useState([
    { id: 1, author: 'ThS. Nguyễn Hoàng Nam', role: 'Trợ giảng', text: 'Chào cả lớp! Các em lưu ý phần cấu hình Spring Security 6 với JwtAuthenticationFilter trong bài học này.', time: '2 giờ trước' },
    { id: 2, author: 'Trần Văn Cường (SV)', role: 'Sinh viên', text: 'Thầy cho em hỏi phần JSONB trong PostgreSQL có thể đánh index GIN được không ạ?', time: '45 phút trước' }
  ]);
  const [newComment, setNewComment] = useState('');

  // Find active lesson & module
  let currentLesson = null;
  let currentModule = null;

  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      if (l.id === currentLessonId) {
        currentLesson = l;
        currentModule = m;
      }
    });
  });

  if (!currentLesson) {
    currentLesson = course.modules[0]?.lessons[0];
    currentModule = course.modules[0];
  }

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), author: 'Nguyễn Văn An (SV)', role: 'Sinh viên', text: newComment, time: 'Vừa xong' }
    ]);
    setNewComment('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <Breadcrumbs 
        items={[
          { label: course.title, target: 'course-detail' },
          { label: currentModule?.title || 'Chương 1' },
          { label: currentLesson.title }
        ]} 
        onNavigate={onNavigate}
      />

      {/* Main Grid: Player on Left (2 cols), Module List on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Player & Tabbed Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 16:9 Zero CLS Video / Content Container */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative">
            {currentLesson.contentType === 'VIDEO' ? (
              <div className="w-full aspect-video bg-black flex flex-col items-center justify-center relative group">
                <img 
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80" 
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
                <button className="absolute w-16 h-16 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-primary-500 transition-all group-hover:ring-4 group-hover:ring-primary-400/50">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 bg-slate-950/80 backdrop-blur-xs px-4 py-2 rounded-lg text-white text-xs flex items-center justify-between">
                  <span>HLS Stream Ready: {currentLesson.title}</span>
                  <span className="font-mono">14:35 / {Math.floor(currentLesson.durationSeconds / 60)}:00</span>
                </div>
              </div>
            ) : currentLesson.contentType === 'QUIZ' ? (
              <div className="w-full aspect-video bg-gradient-to-tr from-slate-900 via-primary-950 to-slate-900 p-8 flex flex-col items-center justify-center text-center text-white space-y-4">
                <HelpCircle className="w-16 h-16 text-amber-400 animate-bounce" />
                <h3 className="text-xl font-bold">Bài Kiểm Tra Trắc Nghiệm Tín Chỉ</h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Bài trắc nghiệm có giới hạn thời gian 15 phút. Kết quả thi và đáp án snapshot sẽ được lưu bất biến vào hồ sơ bảng điểm.
                </p>
                <button 
                  onClick={() => onOpenQuiz(currentLesson.id)}
                  className="btn-accent py-3 px-6 text-sm font-bold gap-2"
                >
                  <Play className="w-4 h-4 fill-current" /> Bắt đầu Làm Bài Thi Ngay
                </button>
              </div>
            ) : (
              <div className="w-full aspect-video bg-slate-100 p-8 flex flex-col items-center justify-center text-center text-textMain space-y-3">
                <FileText className="w-12 h-12 text-primary-600" />
                <h3 className="text-lg font-bold">Tài Liệu Đọc Lý Thuyết Chuyên Đề</h3>
                <p className="text-xs text-textSec">Vui lòng đọc tài liệu nội dung bên dưới để hoàn thành bài học</p>
              </div>
            )}
          </div>

          {/* Action Bar Below Player */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-borderLight shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                {currentModule?.title}
              </span>
              <h2 className="text-xl font-extrabold text-textMain mt-1">{currentLesson.title}</h2>
            </div>

            <button
              onClick={() => onToggleComplete(currentLesson.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                isCompleted 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Đã hoàn thành bài học' : 'Đánh dấu Đã học xong'}
            </button>
          </div>

          {/* Tabs: Document Reader & Discussion */}
          <div className="bg-white rounded-xl border border-borderLight shadow-xs overflow-hidden">
            <div className="flex border-b border-borderLight bg-slate-50">
              <button
                onClick={() => setActiveTab('doc')}
                className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'doc'
                    ? 'border-primary-600 text-primary-700 bg-white'
                    : 'border-transparent text-textSec hover:text-textMain'
                }`}
              >
                <FileText className="w-4 h-4" /> Tài liệu Lý thuyết & Ghi chú
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'discussion'
                    ? 'border-primary-600 text-primary-700 bg-white'
                    : 'border-transparent text-textSec hover:text-textMain'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Diễn đàn Thảo luận ({comments.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'doc' ? (
                <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4">
                  <h3 className="text-base font-bold text-textMain">1. Tổng quan Kiến trúc Spring Security 6 & Spring Boot 3</h3>
                  <p>
                    Spring Security 6 giới thiệu cách cấu hình SecurityFilterChain dựa trên Lambda DSL thay vì SecurityConfigurerAdapter đã bị gạch bỏ (deprecated).
                    Trong kiến trúc Enterprise LMS, chúng ta sử dụng cơ chế Stateless JWT Authentication thông qua `OncePerRequestFilter`.
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    <code>
                      {`@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.cors().and().csrf().disable()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    return http.build();
}`}
                    </code>
                  </div>
                  <h3 className="text-base font-bold text-textMain">2. Tối ưu Cơ sở dữ liệu PostgreSQL 15 với UUID & JSONB</h3>
                  <p>
                    Bảng `quiz_submissions` lưu trữ toàn bộ đề thi và đáp án đã chọn vào trường `answers_snapshot` dạng `JSONB` để đảm bảo dữ liệu bất biến, bảo vệ tính toàn vẹn của kết quả thi sinh viên.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Write Comment Form */}
                  <form onSubmit={handleSendComment} className="space-y-2">
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Đặt câu hỏi hoặc thảo luận bài học với Giảng viên..."
                      className="input-field"
                    />
                    <div className="flex justify-end">
                      <button type="submit" className="btn-primary text-xs gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Gửi câu hỏi
                      </button>
                    </div>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    {comments.map((c) => (
                      <div key={c.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-textMain">{c.author}</span>
                          <span className="text-[10px] text-textMuted">{c.time}</span>
                        </div>
                        <p className="text-xs text-textSec leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Course Modules Sidebar Navigation */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-textMain">Nội dung Khóa học</h3>
          <div className="bg-white rounded-xl border border-borderLight overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {course.modules.map((m, idx) => (
              <div key={m.id} className="p-4 space-y-2">
                <h4 className="font-bold text-xs text-textMain uppercase tracking-wider">
                  Chương 0{idx + 1}: {m.title}
                </h4>
                <div className="space-y-1">
                  {m.lessons.map((l) => {
                    const isActive = l.id === currentLesson.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => onSelectLesson(l.id)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200' 
                            : 'text-textSec hover:bg-slate-50 hover:text-textMain'
                        }`}
                      >
                        <span className="truncate pr-2">{l.title}</span>
                        <span className="text-[10px] uppercase font-semibold text-textMuted shrink-0">{l.contentType}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
