import React, { useState } from 'react';
import { User, Lock, Mail, Shield, BookOpen, AlertTriangle, Edit2, Save, KeyRound } from 'lucide-react';

export default function ProfileView({ currentUser, onUpdateUser, onChangePasswordClick, onShowToast }) {
  const [isEditing, setIsEditing] = useState(false);
  
  const user = currentUser || {
    fullName: 'Lê Hồng Sơn',
    studentCode: 'DTC235200647',
    email: 'sinhvien@unilms.edu.vn',
    className: 'CNTT.K22B.D1.K2.N02',
    major: 'Công nghệ Thông tin'
  };

  const [fullName, setFullName] = useState(user.fullName || 'Lê Hồng Sơn');
  const [studentCode, setStudentCode] = useState(user.studentCode || 'DTC235200647');
  const [className, setClassName] = useState(user.className || 'CNTT.K22B.D1.K2.N02');
  const [major, setMajor] = useState(user.major || 'Công nghệ Thông tin');

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      fullName,
      studentCode,
      className,
      major
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }

    setIsEditing(false);
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Hồ sơ cá nhân',
        message: 'Đã cập nhật thông tin hồ sơ sinh viên thành công!'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      
      {/* 1. System Alert Message matching ICTU LMS image */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>Chức năng đang tạm khóa, vui lòng quay trở lại sau.</span>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 bg-white border border-red-200 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-bold text-[11px]"
        >
          {isEditing ? 'Hủy chỉnh sửa' : 'Mở cập nhật thông tin'}
        </button>
      </div>

      {/* 2. User Profile Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* User Card Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sky-200 text-sky-800 font-extrabold flex items-center justify-center text-xl border-2 border-white shadow-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{fullName ? fullName.substring(0, 2).toUpperCase() : 'SV'}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">{fullName}</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">Mã sinh viên: {studentCode}</p>
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full mt-1">
                Sinh viên Chính quy ICTU
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onChangePasswordClick}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Đổi Mật Khẩu
            </button>
          </div>
        </div>

        {/* Form Body */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên Sinh viên *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Sinh viên *</label>
                <input
                  type="text"
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lớp sinh hoạt *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngành đào tạo *</label>
                <input
                  type="text"
                  required
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Lưu Cập Nhật
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium block">Email sinh viên:</span>
              <span className="font-bold text-slate-800">{user.email || 'sinhvien@unilms.edu.vn'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium block">Lớp sinh hoạt:</span>
              <span className="font-bold text-slate-800">{className}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium block">Ngành đào tạo:</span>
              <span className="font-bold text-slate-800">{major}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium block">Trạng thái tài khoản:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã xác thực sinh viên
              </span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
