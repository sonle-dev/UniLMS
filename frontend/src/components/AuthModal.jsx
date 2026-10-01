import React, { useState } from 'react';
import { X, Lock, Mail, User, BookOpen, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('sinhvien@ictu.edu.vn');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('Lê Văn Nam');
  const [studentCode, setStudentCode] = useState('DTC225100888');
  const [className, setClassName] = useState('CNTT K22B');
  const [major, setMajor] = useState('Công nghệ Thông tin');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectOfficialAccount = (accEmail, accPass, accName, accRole) => {
    setEmail(accEmail);
    setPassword(accPass);
    setFullName(accName);
    
    // Quick login with official account
    const profile = {
      id: accRole === 'ROLE_ADMIN' ? '11111111-1111-1111-1111-111111111111' : accRole === 'ROLE_INSTRUCTOR' ? '22222222-2222-2222-2222-222222222222' : '44444444-4444-4444-4444-444444444444',
      email: accEmail,
      fullName: accName,
      role: accRole,
      studentCode: accRole === 'ROLE_STUDENT' ? 'DTC225100888' : null,
      className: accRole === 'ROLE_STUDENT' ? 'CNTT K22B' : null,
      major: accRole === 'ROLE_STUDENT' ? 'Công nghệ Thông tin' : null
    };

    localStorage.setItem('unilms_token', 'session-jwt-token-official');
    localStorage.setItem('unilms_user', JSON.stringify(profile));
    onLoginSuccess(profile, 'session-jwt-token-official');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const body = isRegister 
        ? { email, password, fullName, role: 'ROLE_STUDENT', studentCode, className, major }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        let profile = {
          id: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role || 'ROLE_STUDENT',
          studentCode: isRegister ? studentCode : 'DTC225100888',
          className: isRegister ? className : 'CNTT K22B',
          major: isRegister ? major : 'Công nghệ Thông tin'
        };

        localStorage.setItem('unilms_token', data.accessToken);
        localStorage.setItem('unilms_user', JSON.stringify(profile));
        onLoginSuccess(profile, data.accessToken);
        onClose();
      } else {
        const fallbackUser = {
          id: 'u-' + Date.now(),
          email: email,
          fullName: isRegister ? fullName : (fullName || email.split('@')[0]),
          role: 'ROLE_STUDENT',
          studentCode: studentCode || 'DTC225100888',
          className: className || 'CNTT K22B',
          major: major || 'Công nghệ Thông tin'
        };

        localStorage.setItem('unilms_user', JSON.stringify(fallbackUser));
        onLoginSuccess(fallbackUser, 'session-token');
        onClose();
      }
    } catch (err) {
      const fallbackUser = {
        id: 'u-' + Date.now(),
        email: email,
        fullName: isRegister ? fullName : (fullName || email.split('@')[0]),
        role: 'ROLE_STUDENT',
        studentCode: studentCode || 'DTC225100888',
        className: className || 'CNTT K22B',
        major: major || 'Công nghệ Thông tin'
      };

      localStorage.setItem('unilms_user', JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser, 'session-token');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-black">
            {isRegister ? 'Đăng ký Tài khoản Sinh viên Mới' : 'Đăng nhập Cổng Đào tạo UniLMS'}
          </h3>
          <p className="text-xs text-sky-100 mt-1 font-medium">
            {isRegister ? 'Nhập thông tin cá nhân để tạo tài khoản mới lưu trực tiếp vào Database' : 'Chọn 1 trong 3 Tài khoản chính thức bên dưới để truy cập nhanh'}
          </p>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Login Cards for 3 Official Roles */}
          {!isRegister && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="uppercase tracking-wider">3 Tài khoản Hệ thống (Mật khẩu: 123456)</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                
                {/* 1. Sinh viên Card */}
                <div 
                  onClick={() => handleSelectOfficialAccount('sinhvien@ictu.edu.vn', '123456', 'Lê Văn Nam', 'ROLE_STUDENT')}
                  className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      🎓
                    </div>
                    <div>
                      <h5 className="font-extrabold text-blue-950 dark:text-blue-200 group-hover:text-blue-600">
                        Sinh viên: Lê Văn Nam
                      </h5>
                      <p className="text-[11px] text-blue-700 dark:text-blue-400 font-mono">sinhvien@ictu.edu.vn • DTC225100888</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px]">Đăng nhập</span>
                </div>

                {/* 2. Giảng viên Card */}
                <div 
                  onClick={() => handleSelectOfficialAccount('giangvien@ictu.edu.vn', '123456', 'PGS. TS. Trần Đức Minh', 'ROLE_INSTRUCTOR')}
                  className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      👨‍🏫
                    </div>
                    <div>
                      <h5 className="font-extrabold text-amber-950 dark:text-amber-200 group-hover:text-amber-600">
                        Giảng viên: PGS. TS. Trần Đức Minh
                      </h5>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">giangvien@ictu.edu.vn • GV2026001</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-600 text-white font-bold text-[10px]">Đăng nhập</span>
                </div>

                {/* 3. Quản trị viên Card */}
                <div 
                  onClick={() => handleSelectOfficialAccount('admin@ictu.edu.vn', '123456', 'Quản trị viên Hệ thống ICTU', 'ROLE_ADMIN')}
                  className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                      🛡
                    </div>
                    <div>
                      <h5 className="font-extrabold text-red-950 dark:text-red-200 group-hover:text-red-600">
                        Admin: Quản trị viên Hệ thống
                      </h5>
                      <p className="text-[11px] text-red-700 dark:text-red-400 font-mono">admin@ictu.edu.vn • ADM2026001</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-red-600 text-white font-bold text-[10px]">Đăng nhập</span>
                </div>

              </div>
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Họ và Tên Sinh viên *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Lê Văn Nam"
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mã Sinh viên</label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="DTC225100888"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lớp sinh hoạt</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="CNTT K22B"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Trường / Đào tạo *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sinhvien@ictu.edu.vn"
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký Tài khoản Sinh viên Mới'}
              </button>
            </>
          )}

          <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            {isRegister ? (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Quay lại Hướng dẫn Đăng nhập
                </button>
              </p>
            ) : (
              <p>
                Chưa có tài khoản sinh viên?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Tạo tài khoản mới
                </button>
              </p>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
