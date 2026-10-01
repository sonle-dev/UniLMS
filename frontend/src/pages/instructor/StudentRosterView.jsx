import React, { useState } from 'react';
import { Search, Mail, Users, CheckCircle2, AlertTriangle, Eye, Send, Filter, UserCheck, ShieldAlert, Award } from 'lucide-react';

export default function StudentRosterView({ onShowToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [students, setStudents] = useState([
    {
      id: 'sv-1',
      code: 'SV2026889',
      fullName: 'Nguyễn Văn An',
      email: 'sinhvien@unilms.edu.vn',
      className: 'CNTT-K65',
      progressPercent: 88,
      attendanceScore: 10,
      quizzesCompleted: '3/3',
      status: 'GOOD',
      lastActive: 'Vừa xong'
    },
    {
      id: 'sv-2',
      code: 'SV2026890',
      fullName: 'Trần Thị Bích',
      email: 'bichtt@unilms.edu.vn',
      className: 'CNTT-K65',
      progressPercent: 75,
      attendanceScore: 9.5,
      quizzesCompleted: '3/3',
      status: 'GOOD',
      lastActive: '2 giờ trước'
    },
    {
      id: 'sv-3',
      code: 'SV2026891',
      fullName: 'Lê Hoàng Cường',
      email: 'cuonglh@unilms.edu.vn',
      className: 'CNTT-K65',
      progressPercent: 35,
      attendanceScore: 6.0,
      quizzesCompleted: '1/3',
      status: 'WARNING',
      lastActive: '3 ngày trước'
    },
    {
      id: 'sv-4',
      code: 'SV2026892',
      fullName: 'Phạm Đức Dũng',
      email: 'dungpd@unilms.edu.vn',
      className: 'CNTT-K65',
      progressPercent: 96,
      attendanceScore: 10,
      quizzesCompleted: '3/3',
      status: 'GOOD',
      lastActive: '10 phút trước'
    },
    {
      id: 'sv-5',
      code: 'SV2026893',
      fullName: 'Vũ Hoàng Anh',
      email: 'anhvh@unilms.edu.vn',
      className: 'CNTT-K65',
      progressPercent: 42,
      attendanceScore: 7.0,
      quizzesCompleted: '2/3',
      status: 'WARNING',
      lastActive: '1 ngày trước'
    }
  ]);

  const handleSendReminder = (studentName) => {
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Gửi thông báo nhắc nhở',
        message: `Đã gửi email nhắc nhở học tập đến sinh viên ${studentName} thành công!`
      });
    }
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wide">PHÂN HỆ GIẢNG VIÊN</span>
          <h2 className="text-xl font-black text-slate-800">Quản lý Sinh viên & Tiến độ Học tập Lớp HP</h2>
          <p className="text-xs text-slate-500">Lớp HP: CNTT.K22B.D1.K2.N01 - Lập trình Enterprise với Java 17/21 & Spring Boot 3</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSendReminder('Toàn bộ lớp')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Nhắc nhở Sinh viên Cảnh báo
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm sinh viên theo tên hoặc mã SV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'ALL' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({students.length})
          </button>
          <button
            onClick={() => setFilterStatus('GOOD')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'GOOD' ? 'bg-white text-emerald-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Học tốt
          </button>
          <button
            onClick={() => setFilterStatus('WARNING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'WARNING' ? 'bg-white text-amber-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cần nhắc nhở
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Mã Sinh viên</th>
                <th className="py-3.5 px-4">Họ và Tên Sinh viên</th>
                <th className="py-3.5 px-4">Lớp sinh hoạt</th>
                <th className="py-3.5 px-4">Tiến độ Học tập</th>
                <th className="py-3.5 px-3 text-center">Chuyên cần</th>
                <th className="py-3.5 px-3 text-center">Bài trắc nghiệm</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{s.code}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-200 text-sky-800 font-extrabold flex items-center justify-center text-xs">
                        {s.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{s.fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{s.className}</td>
                  <td className="py-3.5 px-4 w-44">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-700">{s.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.progressPercent >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${s.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">{s.attendanceScore} / 10</td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-600">{s.quizzesCompleted}</td>
                  <td className="py-3.5 px-4 text-center">
                    {s.status === 'GOOD' ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full">ĐẠT TIẾN ĐỘ</span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded-full">CẢNH BÁO</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSendReminder(s.fullName)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors flex items-center gap-1"
                        title="Gửi email nhắc nhở"
                      >
                        <Send className="w-3 h-3" /> Nhắc nhở
                      </button>
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800">Chi tiết Hồ sơ Học tập Sinh viên</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-medium">Họ và tên:</span>
                <p className="font-extrabold text-slate-800 text-sm">{selectedStudent.fullName} ({selectedStudent.code})</p>
                <p className="text-slate-500 font-mono">{selectedStudent.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <span className="text-slate-500 block">Tiến độ bài học</span>
                  <span className="text-base font-black text-blue-700">{selectedStudent.progressPercent}%</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <span className="text-slate-500 block">Điểm chuyên cần</span>
                  <span className="text-base font-black text-emerald-700">{selectedStudent.attendanceScore}/10</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
