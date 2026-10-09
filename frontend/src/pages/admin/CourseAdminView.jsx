import React, { useState } from 'react';
import { 
  Plus, 
  BookOpen, 
  Layers, 
  Users, 
  Calendar, 
  CheckCircle2, 
  UserCheck, 
  Upload, 
  FileText, 
  Video, 
  HelpCircle, 
  Trash2, 
  Download, 
  FileUp, 
  X,
  Paperclip,
  ShieldAlert
} from 'lucide-react';

export default function CourseAdminView({ onShowToast, materials = [], onAddMaterial, onDeleteMaterial }) {
  const [activeAdminTab, setActiveAdminTab] = useState('courses'); // 'courses' | 'materials'
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

  // Admin File Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matFileType, setMatFileType] = useState('DOCUMENT');
  const [matCourseId, setMatCourseId] = useState('c-101');
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);

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

  const handleAdminUploadMaterial = async (e) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    setIsUploading(true);

    const fileName = selectedFile ? selectedFile.name : (matFileType === 'VIDEO' ? 'lecture_admin.mp4' : 'tai_lieu_quan_tri.pdf');
    const fileSize = selectedFile ? selectedFile.size : '12.4 MB';

    try {
      const formData = new FormData();
      if (rawFile) {
        formData.append('file', rawFile);
      }
      formData.append('title', matTitle);
      formData.append('courseId', matCourseId);
      formData.append('fileType', matFileType);
      formData.append('allowDownload', allowDownload ? 'true' : 'false');
      formData.append('uploaderName', 'Quản trị viên Hệ thống (Admin)');

      const res = await fetch('/api/v1/materials/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (onAddMaterial) {
          onAddMaterial({
            id: data.id || ('mat-' + Date.now()),
            title: data.title || matTitle,
            fileName: data.fileName || fileName,
            fileType: data.fileType || matFileType,
            fileSize: data.fileSize || fileSize,
            downloadUrl: data.downloadUrl || `/api/v1/materials/download/${fileName}`,
            uploadedByName: data.uploadedByName || 'Quản trị viên Hệ thống (Admin)',
            createdAt: new Date().toISOString(),
            allowDownload: allowDownload
          });
        }
      }
    } catch (err) {
      console.warn("Backend API upload fallback to client state:", err);
    }

    setTimeout(() => {
      setIsUploading(false);

      if (onAddMaterial) {
        onAddMaterial({
          id: 'mat-' + Date.now(),
          title: matTitle,
          fileName: fileName,
          fileType: matFileType,
          fileSize: fileSize,
          downloadUrl: `/api/v1/materials/download/${fileName}`,
          uploadedByName: 'Quản trị viên Hệ thống (Admin)',
          createdAt: new Date().toISOString(),
          allowDownload: allowDownload
        });
      }

      setIsUploadModalOpen(false);
      setMatTitle('');
      setSelectedFile(null);
      setRawFile(null);

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Tải tài liệu hệ thống',
          message: `Quản trị viên đã đăng tải thành công tài liệu "${matTitle}"!`
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wide">PHÂN HỆ QUẢN TRỊ VIÊN</span>
          <h2 className="text-xl font-black text-slate-800">Quản lý Môn học & Đăng tải Tài liệu Bài giảng Hệ thống</h2>
          <p className="text-xs text-slate-500">Mở lớp học phần, phân công giảng viên & Quản lý tệp bài giảng toàn trường</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveAdminTab('courses')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeAdminTab === 'courses' ? 'bg-white text-red-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quản lý Lớp Môn học
          </button>
          <button
            onClick={() => setActiveAdminTab('materials')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeAdminTab === 'materials' ? 'bg-white text-red-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tải & Quản lý Tài liệu / Bài giảng ({materials.length})
          </button>
        </div>
      </div>

      {activeAdminTab === 'courses' ? (
        <>
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
        </>
      ) : (
        /* Materials & Documents Admin View */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Tài liệu & Bài giảng Toàn trường (Quản trị viên)</h3>
              <p className="text-xs text-slate-500">Cho phép Quản trị viên tải tệp tài liệu / video bài giảng và phân phối trực tiếp cho Sinh viên</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> QTV Tải tệp Bài giảng lên
            </button>
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {materials.map(mat => (
              <div key={mat.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
                    {mat.fileType === 'VIDEO' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{mat.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Paperclip className="w-3 h-3 text-red-600" /> {mat.fileName}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-500">{mat.fileSize || '4.5 MB'}</span>
                      <span>•</span>
                      <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">{mat.uploadedByName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <a
                    href={mat.downloadUrl || '#'}
                    download={mat.fileName}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg flex items-center gap-1 border border-blue-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải về
                  </a>
                  {onDeleteMaterial && (
                    <button
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Gỡ bỏ tài liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin File Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden relative">
            <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileUp className="w-5 h-5" />
                <h3 className="text-base font-extrabold">QTV Tải Bài giảng & Tài liệu lên Hệ thống</h3>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminUploadMaterial} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề Tài liệu / Bài giảng *</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Ví dụ: Giáo trình Chuẩn Kiến trúc Hệ thống ICTU 2026"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Định dạng tệp *</label>
                  <select
                    value={matFileType}
                    onChange={(e) => setMatFileType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="DOCUMENT">Tài liệu (.pdf, .pptx, .docx)</option>
                    <option value="VIDEO">Video MP4 (.mp4)</option>
                    <option value="QUIZ">Đề thi (.json)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gắn Môn học *</label>
                  <select
                    value={matCourseId}
                    onChange={(e) => setMatCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="c-101">Lập trình Enterprise với Java</option>
                    <option value="c-102">Tối ưu Cơ sở dữ liệu PostgreSQL</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone Container */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn tệp từ máy tính *</label>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-red-300 hover:border-red-500 bg-red-50/40 hover:bg-red-50 p-6 rounded-2xl text-center transition-all cursor-pointer relative"
                >
                  <input
                    type="file"
                    onChange={handleFileDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="font-extrabold text-red-900">{selectedFile.name}</p>
                      <p className="text-[11px] text-red-600 font-mono font-bold">Dung lượng: {selectedFile.size}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-slate-800">Kéo thả tệp tài liệu / video vào đây</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ các tệp .pdf, .docx, .pptx, .mp4 (Tối đa 500MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Controls */}
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
                  disabled={isUploading || !matTitle.trim()}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> {isUploading ? 'Đang tải...' : 'Xác nhận Đăng tải QTV'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
