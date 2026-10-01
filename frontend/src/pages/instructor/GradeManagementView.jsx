import React, { useState } from 'react';
import { Search, Save, CheckCircle2, Sliders, AlertTriangle, HelpCircle, ShieldCheck, ChevronDown } from 'lucide-react';

export default function GradeManagementView({ onShowToast }) {
  // Config threshold states (Giảng viên tùy chỉnh theo quy chế trường)
  const [minAttendance, setMinAttendance] = useState(7.0);
  const [minAvgScore, setMinAvgScore] = useState(4.0);
  const [evaluationMode, setEvaluationMode] = useState('AUTO'); // 'AUTO' | 'MANUAL'
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const [students, setStudents] = useState([
    { id: '1', code: 'SV2026889', name: 'Nguyễn Văn An', attendance: 10, quiz: 9.0, tx1: 8.5, tx2: 9.0, tx3: 8.8, tx4: 9.2, status: 'ELIGIBLE' },
    { id: '2', code: 'SV2026890', name: 'Trần Thị Bích', attendance: 9.5, quiz: 8.5, tx1: 8.0, tx2: 8.5, tx3: 8.2, tx4: 8.6, status: 'ELIGIBLE' },
    { id: '3', code: 'SV2026891', name: 'Lê Hoàng Cường', attendance: 6.0, quiz: 4.5, tx1: 5.0, tx2: 5.5, tx3: 4.0, tx4: 5.0, status: 'WARNING' },
    { id: '4', code: 'SV2026892', name: 'Phạm Đức Dũng', attendance: 10, quiz: 9.5, tx1: 9.5, tx2: 9.0, tx3: 9.8, tx4: 9.5, status: 'ELIGIBLE' }
  ]);

  const recalculateStatus = (att, quiz, tx1, tx2, tx3, tx4, mAtt, mAvg) => {
    const avg = (att * 0.1) + (quiz * 0.2) + ((tx1 + tx2 + tx3 + tx4) / 4 * 0.7);
    return (att >= mAtt && avg >= mAvg) ? 'ELIGIBLE' : 'WARNING';
  };

  const handleGradeChange = (id, field, value) => {
    const val = parseFloat(value) || 0;
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: val };
        if (evaluationMode === 'AUTO') {
          updated.status = recalculateStatus(
            field === 'attendance' ? val : updated.attendance,
            field === 'quiz' ? val : updated.quiz,
            field === 'tx1' ? val : updated.tx1,
            field === 'tx2' ? val : updated.tx2,
            field === 'tx3' ? val : updated.tx3,
            field === 'tx4' ? val : updated.tx4,
            minAttendance,
            minAvgScore
          );
        }
        return updated;
      }
      return s;
    }));
  };

  const handleStatusChange = (id, newStatus) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleApplyThresholds = () => {
    if (evaluationMode === 'AUTO') {
      setStudents(prev => prev.map(s => ({
        ...s,
        status: recalculateStatus(s.attendance, s.quiz, s.tx1, s.tx2, s.tx3, s.tx4, minAttendance, minAvgScore)
      })));
    }
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Cột mốc Quy chế Đào tạo',
        message: `Đã áp dụng mốc Chuyên cần ≥ ${minAttendance} và TBC ≥ ${minAvgScore} cho toàn lớp!`
      });
    }
  };

  const handleSaveGrades = () => {
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Quản lý Bảng điểm',
        message: 'Đã lưu và duyệt bảng điểm cùng trạng thái Điều kiện Thi thành công!'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wide">PHÂN HỆ GIẢNG VIÊN</span>
          <h2 className="text-xl font-black text-slate-800">Quản lý & Nhập Bảng Điểm Lớp Học Phần</h2>
          <p className="text-xs text-slate-500">Lớp: CNTT.K22B.D1.K2.N01 - Lập trình Enterprise với Java 17/21 & Spring Boot 3</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`px-3.5 py-2 font-bold text-xs rounded-xl border transition-all flex items-center gap-2 ${
              showConfigPanel 
                ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-600" /> Cấu hình Cột mốc Quy chế
          </button>

          <button
            onClick={handleSaveGrades}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu & Duyệt Bảng Điểm
          </button>
        </div>
      </div>

      {/* Config Threshold Panel (Tùy chỉnh cột mốc thi) */}
      {showConfigPanel && (
        <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Thiết lập Cột mốc Điều kiện Thi của Trường / Cơ sở Đào tạo
            </h3>
            <span className="text-[11px] text-blue-700 font-medium">Giảng viên có thể tùy chỉnh mốc điểm hoặc xét chọn từng SV</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mốc Điểm Chuyên cần tối thiểu *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={minAttendance}
                onChange={(e) => setMinAttendance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mốc Điểm TBC thường xuyên tối thiểu *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={minAvgScore}
                onChange={(e) => setMinAvgScore(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chế độ Xét duyệt Điều kiện *</label>
              <select
                value={evaluationMode}
                onChange={(e) => setEvaluationMode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="AUTO">Tự động (Theo cột mốc điểm ở trên)</option>
                <option value="MANUAL">Thủ công (Giảng viên tự chọn từng SV)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleApplyThresholds}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Cập nhật & Tự động Tính lại Toàn lớp
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Mã SV</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-3 text-center">Chuyên cần (10%)</th>
                <th className="py-3.5 px-3 text-center">Quiz (20%)</th>
                <th className="py-3.5 px-3 text-center">TX 1</th>
                <th className="py-3.5 px-3 text-center">TX 2</th>
                <th className="py-3.5 px-3 text-center">TX 3</th>
                <th className="py-3.5 px-3 text-center">TX 4</th>
                <th className="py-3.5 px-4 text-center">Cột Điều kiện Thi (Giảng viên chỉnh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="10"
                      value={s.attendance}
                      onChange={(e) => handleGradeChange(s.id, 'attendance', e.target.value)}
                      className="w-14 text-center py-1 border border-slate-300 rounded font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={s.quiz}
                      onChange={(e) => handleGradeChange(s.id, 'quiz', e.target.value)}
                      className="w-14 text-center py-1 border border-slate-300 rounded font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={s.tx1}
                      onChange={(e) => handleGradeChange(s.id, 'tx1', e.target.value)}
                      className="w-14 text-center py-1 border border-slate-300 rounded font-bold"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={s.tx2}
                      onChange={(e) => handleGradeChange(s.id, 'tx2', e.target.value)}
                      className="w-14 text-center py-1 border border-slate-300 rounded font-bold"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={s.tx3}
                      onChange={(e) => handleGradeChange(s.id, 'tx3', e.target.value)}
                      className="w-14 text-center py-1 border border-slate-300 rounded font-bold"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={s.tx4}
                      onChange={(e) => handleGradeChange(s.id, 'tx4', e.target.value)}
                      className="w-14 text-center py-1 border border-slate-300 rounded font-bold"
                    />
                  </td>
                  
                  {/* Interactive Status Selector for Instructor */}
                  <td className="py-3 px-4 text-center">
                    <select
                      value={s.status}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        s.status === 'ELIGIBLE' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : s.status === 'WARNING'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="ELIGIBLE">🟢 ĐỦ ĐIỀU KIỆN</option>
                      <option value="WARNING">🔴 CẢNH BÁO (KHÔNG ĐỦ Đ/K)</option>
                      <option value="PENDING">🟡 CHỜ MINH CHỨNG</option>
                    </select>
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
