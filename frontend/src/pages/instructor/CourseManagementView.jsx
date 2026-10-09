import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Video, 
  HelpCircle, 
  Save, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Globe, 
  Upload, 
  Paperclip, 
  FileUp, 
  X, 
  Eye, 
  Download,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';

export default function CourseManagementView({ onShowToast, onAddMaterial }) {
  const [activeTabSection, setActiveTabSection] = useState('modules'); // 'modules' | 'quizzes'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState('m-1');

  // Form Upload state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('VIDEO'); // 'VIDEO' | 'DOCUMENT' | 'QUIZ'
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);

  const [modules, setModules] = useState([
    {
      id: 'm-1',
      title: 'Chương 1: Tổng quan Kiến trúc Spring Boot 3 & Security 6 Stateless',
      lessons: [
        { 
          id: 'l-101', 
          title: 'Bài 01: Giới thiệu Kiến trúc Spring Boot 3 & Java 17/21 LTS', 
          type: 'VIDEO', 
          duration: '15 phút', 
          fileName: 'lecture_01_spring_boot_3.mp4', 
          fileSize: '142 MB',
          isPublished: true 
        },
        { 
          id: 'l-102', 
          title: 'Bài 02: Cấu hình Spring Security 6 với Stateless JWT Filter', 
          type: 'DOCUMENT', 
          duration: '10 phút', 
          fileName: 'Bai_02_Spring_Security_JWT.pdf', 
          fileSize: '4.8 MB',
          isPublished: true 
        },
        { 
          id: 'l-103', 
          title: 'Bài 03: Kiểm tra Trắc nghiệm Tín chỉ Chương 1', 
          type: 'QUIZ', 
          duration: '15 phút', 
          fileName: 'Quiz_Chuong_1_Enterprise.json', 
          fileSize: '12 KB',
          isPublished: true 
        }
      ]
    },
    {
      id: 'm-2',
      title: 'Chương 2: Thiết kế Cơ sở dữ liệu PostgreSQL 15 & Flyway Migration',
      lessons: [
        { 
          id: 'l-201', 
          title: 'Bài 04: Thiết kế DDL Schema UUIDv4 & Soft Delete', 
          type: 'VIDEO', 
          duration: '20 phút', 
          fileName: 'ddl_schema_postgresql_v15.mp4', 
          fileSize: '210 MB',
          isPublished: true 
        }
      ]
    }
  ]);

  const [quizzes, setQuizzes] = useState([
    {
      id: 'q-101',
      questionText: 'Trong Spring Boot 3 & Security 6, filter nào chịu trách nhiệm giải mã và xác thực token JWT stateless?',
      options: ['JwtAuthenticationFilter', 'UsernamePasswordAuthenticationFilter', 'BasicAuthenticationFilter', 'CorsFilter'],
      correctOption: 0
    },
    {
      id: 'q-102',
      questionText: 'Công cụ Flyway Migration trong Spring Boot lưu lịch sử vết thực thi schema DDL ở bảng nào?',
      options: ['flyway_schema_history', 'flyway_migrations', 'schema_version', 'flyway_history_log'],
      correctOption: 0
    }
  ]);

  const handleOpenUploadModal = (moduleId) => {
    setActiveModuleId(moduleId);
    setLessonTitle('');
    setSelectedFile(null);
    setRawFile(null);
    setVideoUrl('');
    setUploadProgress(0);
    setIsUploadModalOpen(true);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : (e.dataTransfer ? e.dataTransfer.files[0] : null);
    if (file) {
      setRawFile(file);
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      });
    }
  };

  const handleStartUpload = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    setIsUploading(true);
    setUploadProgress(30);

    const fileName = selectedFile ? selectedFile.name : (lessonType === 'VIDEO' ? 'lecture_video.mp4' : 'tai_lieu_giang_day.pdf');
    const fileSize = selectedFile ? selectedFile.size : '8.5 MB';

    // Call Backend API to upload
    try {
      const formData = new FormData();
      if (rawFile) {
        formData.append('file', rawFile);
      }
      formData.append('title', lessonTitle);
      formData.append('moduleId', activeModuleId);
      formData.append('fileType', lessonType);
      formData.append('allowDownload', allowDownload ? 'true' : 'false');
      formData.append('uploaderName', 'TS. Trần Thị Mai (Giảng viên)');

      const res = await fetch('/api/v1/materials/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUploadProgress(100);

        if (onAddMaterial) {
          onAddMaterial({
            id: data.id || ('mat-' + Date.now()),
            title: data.title || lessonTitle,
            fileName: data.fileName || fileName,
            fileType: data.fileType || lessonType,
            fileSize: data.fileSize || fileSize,
            downloadUrl: data.downloadUrl || `/api/v1/materials/download/${fileName}`,
            uploadedByName: data.uploadedByName || 'TS. Trần Thị Mai (Giảng viên)',
            createdAt: new Date().toISOString(),
            allowDownload: allowDownload
          });
        }
      }
    } catch (err) {
      console.warn("Backend API upload fallback to client state:", err);
    }

    setUploadProgress(100);

    setTimeout(() => {
      setIsUploading(false);
      const newL = {
        id: 'l-' + Date.now(),
        title: lessonTitle,
        type: lessonType,
        duration: lessonType === 'VIDEO' ? '18 phút' : '12 phút',
        fileName: fileName,
        fileSize: fileSize,
        isPublished: true
      };

      setModules(prev => prev.map(m => {
        if (m.id === activeModuleId) {
          return { ...m, lessons: [...m.lessons, newL] };
        }
        return m;
      }));

      // Synchronize material with parent state
      if (onAddMaterial) {
        onAddMaterial({
          id: 'mat-' + Date.now(),
          title: lessonTitle,
          fileName: fileName,
          fileType: lessonType,
          fileSize: fileSize,
          downloadUrl: `/api/v1/materials/download/${fileName}`,
          uploadedByName: 'TS. Trần Thị Mai (Giảng viên)',
          createdAt: new Date().toISOString(),
          allowDownload: allowDownload
        });
      }

      setIsUploadModalOpen(false);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Tải bài giảng thành công',
          message: `Đã upload và xuất bản tài liệu "${lessonTitle}" lên lớp học phần!`
        });
      }
    }, 600);
  };

  const handleDeleteLesson = (moduleId, lessonId) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Xóa bài học',
        message: 'Đã gỡ bỏ bài giảng khỏi chương học.'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wide">PHÂN HỆ GIẢNG VIÊN</span>
          <h2 className="text-xl font-black text-slate-800">Quản lý & Đăng tải Bài giảng, Tài liệu Tín chỉ</h2>
          <p className="text-xs text-slate-500">Môn học: Lập trình Enterprise với Java 17/21 & Spring Boot 3 (CNTT.K22B.D1.K2.N01)</p>
        </div>

        {/* Section Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTabSection('modules')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTabSection === 'modules' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chương & Đẩy Bài giảng
          </button>
          <button
            onClick={() => setActiveTabSection('quizzes')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTabSection === 'quizzes' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ngân hàng Câu hỏi
          </button>
        </div>
      </div>

      {/* Modules List & Upload Actions */}
      {activeTabSection === 'modules' ? (
        <div className="space-y-6">
          {modules.map(module => (
            <div key={module.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              
              {/* Module Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800">{module.title}</h3>
                <button
                  onClick={() => handleOpenUploadModal(module.id)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Đẩy Bài giảng / Tài liệu lên
                </button>
              </div>

              {/* Lessons List */}
              <div className="divide-y divide-slate-100 p-3 space-y-2">
                {module.lessons.map(lesson => (
                  <div key={lesson.id} className="p-3.5 bg-slate-50/50 hover:bg-slate-100/80 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200/60">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {lesson.type === 'VIDEO' && <Video className="w-5 h-5" />}
                        {lesson.type === 'DOCUMENT' && <FileText className="w-5 h-5" />}
                        {lesson.type === 'QUIZ' && <HelpCircle className="w-5 h-5" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">{lesson.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1 text-slate-600 font-mono">
                            <Paperclip className="w-3 h-3 text-blue-600" /> {lesson.fileName}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-400">{lesson.fileSize}</span>
                          <span>•</span>
                          <span className="text-slate-400">{lesson.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1 border border-emerald-200">
                        <Globe className="w-3 h-3" /> Đã xuất bản
                      </span>

                      <button
                        onClick={() => handleDeleteLesson(module.id, lesson.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Quiz Question Bank */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Ngân hàng Câu hỏi Trắc nghiệm Tín chỉ</h3>
            <span className="text-xs font-bold text-blue-600">{quizzes.length} Câu hỏi sẵn có</span>
          </div>

          <div className="space-y-4">
            {quizzes.map((q, idx) => (
              <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">
                  Câu {idx + 1}: {q.questionText}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                        optIdx === q.correctOption
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      {optIdx === q.correctOption && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload File Modal Pop-up */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileUp className="w-5 h-5" />
                <h3 className="text-base font-extrabold">Đăng tải Bài giảng & Tài liệu môn học</h3>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleStartUpload} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Bài giảng / Tiêu đề Bài học *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 05: Cấu hình HikariCP & Composite Indexing PostgreSQL"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại định dạng *</label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VIDEO">Video MP4 (.mp4)</option>
                    <option value="DOCUMENT">Tài liệu (.pdf, .pptx, .docx)</option>
                    <option value="QUIZ">Bài thi Trắc nghiệm (.json)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quyền tải về</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Cho phép SV tải về</span>
                  </label>
                </div>
              </div>

              {/* Upload Dropzone Container */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tải tệp từ máy tính *</label>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 p-6 rounded-2xl text-center transition-all cursor-pointer relative"
                >
                  <input
                    type="file"
                    onChange={handleFileDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="font-extrabold text-blue-900">{selectedFile.name}</p>
                      <p className="text-[11px] text-blue-600 font-mono font-bold">Dung lượng: {selectedFile.size}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-slate-800">Kéo thả tệp tài liệu / video vào đây</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ các tệp .mp4, .pdf, .docx, .pptx (Tối đa 500MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-blue-700">
                    <span>Đang tải lên hệ thống...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer Modal Controls */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !lessonTitle.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> {isUploading ? 'Đang tải...' : 'Xác nhận Đăng tải'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
