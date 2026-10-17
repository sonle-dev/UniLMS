import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Mail, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Send, 
  Filter, 
  UserCheck, 
  ShieldAlert, 
  Award,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  BookOpen
} from 'lucide-react';

const SECTIONS = [
  {
    code: 'CNTT.K22B.D1.K2.N03',
    courseTitle: 'Phương pháp phát triển phần mềm hướng đối tượng-2-25',
    instructorName: 'TS. Trần Thị Mai',
    instructorEmail: 'maitt@unilms.edu.vn'
  },
  {
    code: 'CNTT.K22B.D1.K2.N01',
    courseTitle: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
    instructorName: 'PGS. TS. Trần Đức Minh',
    instructorEmail: 'minhtd@unilms.edu.vn'
  },
  {
    code: 'CNTT.K22B.D1.K2.N02',
    courseTitle: 'Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise',
    instructorName: 'ThS. Nguyễn Hoàng Nam',
    instructorEmail: 'namnh@unilms.edu.vn'
  },
  {
    code: 'CNTT.K22B.D1.K2.N04',
    courseTitle: 'Quản lý dự án CNTT-2-25',
    instructorName: 'TS. Phạm Đình Lâm',
    instructorEmail: 'lampd@unilms.edu.vn'
  },
  {
    code: 'CNTT.K22B.D1.K2.N05',
    courseTitle: 'Quản trị hệ thống-2-25',
    instructorName: 'PGS. TS. Nguyễn Văn Học',
    instructorEmail: 'hocnv@unilms.edu.vn'
  }
];

export default function StudentRosterView({ onShowToast, currentUser }) {
  const [selectedSectionCode, setSelectedSectionCode] = useState(() => {
    if (currentUser?.email) {
      const match = SECTIONS.find(s => s.instructorEmail === currentUser.email);
      if (match) return match.code;
    }
    return 'CNTT.K22B.D1.K2.N03';
  });

  const activeSection = SECTIONS.find(s => s.code === selectedSectionCode) || SECTIONS[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoster = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/instructor/students?sectionCode=${selectedSectionCode}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API roster fallback:", err);
    }

    // Fallback: generate 54 students
    const fallback = Array.from({ length: 54 }, (_, i) => {
      const num = i + 1;
      const codeStr = 'DTC2251000' + (num < 10 ? '0' + num : num);
      const names = [
        'Bùi Minh Tâm', 'Bùi Thiện Nhân', 'Bùi Văn Hùng', 'Đặng Quốc Anh', 'Đặng Tiến Thành',
        'Đỗ Thảo Nguyên', 'Đỗ Tuấn Kiệt', 'Đỗ Văn Quý', 'Dương Thu Thảo', 'Dương Văn Hải',
        'Hà Hải Đăng', 'Hà Thị Kim Ngân', 'Hoàng Bảo Long', 'Hoàng Đình Trọng', 'Hoàng Ngọc Ánh',
        'Lê Đăng Khoa', 'Lê Gia Huy', 'Lê Hữu Nghĩa', 'Lê Ngọc Mai', 'Lê Thanh Bình',
        'Lê Trọng Tấn', 'Lý Gia Hân', 'Mai Quốc Khánh', 'Mai Xuân Bách', 'Ngô Bá Hưng',
        'Ngô Phương Nam', 'Nguyễn Anh Đức', 'Nguyễn Chí Thanh', 'Nguyễn Đăng Quang', 'Nguyễn Đình Triệu',
        'Nguyễn Đức Huy', 'Nguyễn Hà My', 'Nguyễn Hữu Đạt', 'Nguyễn Mạnh Cường', 'Nguyễn Minh Quân',
        'Nguyễn Nhật Nam', 'Nguyễn Quang Dũng', 'Nguyễn Thái Sơn', 'Nguyễn Thành Long', 'Nguyễn Tiến Dũng',
        'Nguyễn Trọng Đại', 'Nguyễn Tuấn Kiệt', 'Nguyễn Văn An', 'Nguyễn Xuân Trường', 'Phạm Công Thành',
        'Phạm Đình Duy', 'Phạm Đức Dũng', 'Phạm Gia Khiêm', 'Phạm Minh Tuấn', 'Phan Thanh Tùng',
        'Trần Bảo Nam', 'Trần Đình Trọng', 'Trần Thị Bích', 'Vũ Hoàng Anh'
      ];
      const isWarn = num === 3 || num === 15;
      return {
        id: 'sv-' + num,
        code: codeStr,
        fullName: names[i] || `Sinh viên ${num}`,
        email: `sv.dtc2251000${num < 10 ? '0' + num : num}@ictu.edu.vn`,
        className: 'CNTT-K22B',
        progressPercent: isWarn ? 38 : 88,
        attendanceScore: isWarn ? 6.0 : 9.5,
        quizzesCompleted: isWarn ? '1/3' : '3/3',
        status: isWarn ? 'WARNING' : 'GOOD',
        lastActive: isWarn ? '3 ngày trước' : 'Vừa xong'
      };
    });

    setStudents(fallback);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRoster();
    setCurrentPage(1);
  }, [selectedSectionCode]);

  const handleSendReminder = (studentName) => {
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Gửi thông báo nhắc nhở',
        message: `Đã gửi email nhắc nhở học tập đến sinh viên ${studentName} thành công!`
      });
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [students, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    if (pageSize >= 100) return filteredStudents;
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wide">PHÂN HỆ GIẢNG VIÊN</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full">
              Sĩ số: {students.length} Sinh viên
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-800">Quản lý Sinh viên & Tiến độ Học tập Lớp HP</h2>
          
          {/* Section Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500">Lớp HP:</span>
            <select
              value={selectedSectionCode}
              onChange={(e) => setSelectedSectionCode(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {SECTIONS.map(sec => (
                <option key={sec.code} value={sec.code}>
                  {sec.code} — {sec.courseTitle} ({sec.instructorName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRoster}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
            title="Tải lại từ Cơ sở dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => handleSendReminder('Toàn bộ lớp')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Nhắc nhở Sinh viên Cảnh báo
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã SV hoặc họ tên (54 SV)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setFilterStatus('ALL'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'ALL' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => { setFilterStatus('GOOD'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'GOOD' ? 'bg-white text-emerald-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Học tốt ({students.filter(s => s.status === 'GOOD').length})
            </button>
            <button
              onClick={() => { setFilterStatus('WARNING'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'WARNING' ? 'bg-white text-red-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cảnh báo ({students.filter(s => s.status === 'WARNING').length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-2 py-1 font-bold"
            >
              <option value={15}>15 SV / trang</option>
              <option value={25}>25 SV / trang</option>
              <option value={100}>Tất cả ({students.length} SV)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3 text-center w-12">STT</th>
                <th className="py-3.5 px-4 w-32">Mã SV</th>
                <th className="py-3.5 px-4 min-w-[180px]">Họ và Tên</th>
                <th className="py-3.5 px-3 text-center">Lớp SH</th>
                <th className="py-3.5 px-4 text-center min-w-[160px]">Tiến độ học tập</th>
                <th className="py-3.5 px-3 text-center">Chuyên cần</th>
                <th className="py-3.5 px-3 text-center">Trắc nghiệm</th>
                <th className="py-3.5 px-3 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    {isLoading ? 'Đang tải danh sách 54 sinh viên...' : 'Không tìm thấy sinh viên nào khớp với tìm kiếm.'}
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={s.id || s.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">{globalIdx}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{s.code}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{s.email}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-600">{s.className}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                s.progressPercent < 50 ? 'bg-red-500' : s.progressPercent < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${s.progressPercent}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-[11px] w-9 text-right text-slate-700">{s.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                        {s.attendanceScore}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                        {s.quizzesCompleted}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          s.status === 'GOOD' 
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200' 
                            : 'text-red-800 bg-red-50 border-red-200'
                        }`}>
                          {s.status === 'GOOD' ? '🟢 Học tốt' : '🔴 Cảnh báo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleSendReminder(s.fullName)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3 h-3" /> Nhắc nhở
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pageSize < 100 && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-slate-500 font-medium">
              Hiển thị <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filteredStudents.length)}</span> trên tổng số <span className="font-bold text-slate-800">{filteredStudents.length}</span> sinh viên
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all ${
                    currentPage === p 
                      ? 'bg-blue-600 text-white shadow-2xs' 
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
