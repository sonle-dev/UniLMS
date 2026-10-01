import React, { useState } from 'react';
import { Search, UserPlus, Shield, Edit, Lock, Unlock, CheckCircle2, User, X, Upload, FileSpreadsheet, Download, FileText, Check } from 'lucide-react';

export default function UserManagementView({ onShowToast }) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addMode, setAddMode] = useState('MANUAL'); // 'MANUAL' | 'FILE'

  // Form Single User State
  const [newCode, setNewCode] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('ROLE_STUDENT');
  const [newPassword, setNewPassword] = useState('123456');

  // File Upload Batch State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [usersList, setUsersList] = useState([
    { id: 'u-1', code: 'SV2026889', fullName: 'Nguyễn Văn An', email: 'sinhvien@unilms.edu.vn', role: 'ROLE_STUDENT', status: 'ACTIVE' },
    { id: 'u-2', code: 'GV100234', fullName: 'PGS. TS. Trần Đức Minh', email: 'minhtd@ictu.edu.vn', role: 'ROLE_INSTRUCTOR', status: 'ACTIVE' },
    { id: 'u-3', code: 'GV100235', fullName: 'ThS. Nguyễn Hoàng Nam', email: 'namnh@ictu.edu.vn', role: 'ROLE_INSTRUCTOR', status: 'ACTIVE' },
    { id: 'u-4', code: 'ADM00001', fullName: 'Ban Quản trị CNTT ICTU', email: 'admin@unilms.edu.vn', role: 'ROLE_ADMIN', status: 'ACTIVE' },
    { id: 'u-5', code: 'SV2026895', fullName: 'Lê Hoàng Cường', email: 'cuonglh@unilms.edu.vn', role: 'ROLE_STUDENT', status: 'LOCKED' }
  ]);

  const toggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextS = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        if (onShowToast) {
          onShowToast({
            type: nextS === 'LOCKED' ? 'error' : 'success',
            title: 'Quản lý Tài khoản',
            message: `Đã ${nextS === 'LOCKED' ? 'khoá' : 'mở khoá'} tài khoản ${u.fullName} thành công!`
          });
        }
        return { ...u, status: nextS };
      }
      return u;
    }));
  };

  const handleCreateManualUser = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newFullName.trim() || !newEmail.trim()) return;

    const newU = {
      id: 'u-' + Date.now(),
      code: newCode.toUpperCase(),
      fullName: newFullName,
      email: newEmail,
      role: newRole,
      status: 'ACTIVE'
    };

    setUsersList([newU, ...usersList]);
    setIsAddUserModalOpen(false);

    // Reset form
    setNewCode('');
    setNewFullName('');
    setNewEmail('');

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Tạo tài khoản',
        message: `Đã khởi tạo tài khoản mới cho ${newU.fullName} thành công!`
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    }
  };

  const handleDownloadSampleFile = () => {
    // Generate real UTF-8 CSV file download for Excel compatibility
    const headers = "Ma_So,Ho_Va_Ten,Email,Vai_Tro\n";
    const sampleRows = [
      "SV2026901,Phan Quốc Việt,vietpq@unilms.edu.vn,ROLE_STUDENT",
      "SV2026902,Đỗ Hải Yến,yendh@unilms.edu.vn,ROLE_STUDENT",
      "GV100240,TS. Phạm Minh Tuấn,tuanpm@ictu.edu.vn,ROLE_INSTRUCTOR"
    ].join("\n");

    const blob = new Blob(["\uFEFF" + headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mau_Danh_Sach_Nguoi_Dung_ICTU.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Tải File Mẫu thành công',
        message: 'Tệp Mau_Danh_Sach_Nguoi_Dung_ICTU.csv đã được tải về máy tính!'
      });
    }
  };

  const handleImportBatchUsers = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      const importedBatch = [
        { id: 'imp-1', code: 'SV2026901', fullName: 'Phan Quốc Việt', email: 'vietpq@unilms.edu.vn', role: 'ROLE_STUDENT', status: 'ACTIVE' },
        { id: 'imp-2', code: 'SV2026902', fullName: 'Đỗ Hải Yến', email: 'yendh@unilms.edu.vn', role: 'ROLE_STUDENT', status: 'ACTIVE' },
        { id: 'imp-3', code: 'GV100240', fullName: 'TS. Phạm Minh Tuấn', email: 'tuanpm@ictu.edu.vn', role: 'ROLE_INSTRUCTOR', status: 'ACTIVE' }
      ];

      setUsersList(prev => [...importedBatch, ...prev]);
      setIsAddUserModalOpen(false);
      setSelectedFile(null);

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Nhập file danh sách',
          message: `Đã nhập thành công 3 tài khoản người dùng từ file "${selectedFile.name}"!`
        });
      }
    }, 700);
  };

  const filteredUsers = usersList.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wide">PHÂN HỆ QUẢN TRỊ VIÊN</span>
          <h2 className="text-xl font-black text-slate-800">Quản lý Tài khoản Người dùng toàn trường</h2>
          <p className="text-xs text-slate-500">Phân quyền vai trò Sinh viên, Giảng viên, Quản trị viên hệ thống</p>
        </div>

        <button
          onClick={() => {
            setAddMode('MANUAL');
            setIsAddUserModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Thêm Tài khoản Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          {['ALL', 'ROLE_STUDENT', 'ROLE_INSTRUCTOR', 'ROLE_ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                roleFilter === role ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {role === 'ALL' && 'Tất cả'}
              {role === 'ROLE_STUDENT' && 'Sinh viên'}
              {role === 'ROLE_INSTRUCTOR' && 'Giảng viên'}
              {role === 'ROLE_ADMIN' && 'Quản trị viên'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Mã số</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Vai trò hệ thống</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{u.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{u.email}</td>
                  <td className="py-3 px-4 text-center">
                    {u.role === 'ROLE_STUDENT' && (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">Sinh viên</span>
                    )}
                    {u.role === 'ROLE_INSTRUCTOR' && (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">Giảng viên</span>
                    )}
                    {u.role === 'ROLE_ADMIN' && (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-red-100 text-red-800 rounded-full">Quản trị viên</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.status === 'ACTIVE' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">HOẠT ĐỘNG</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 rounded">ĐÃ KHÓA</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        u.status === 'ACTIVE'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal (Thủ công / Tải file Excel) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-black">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-extrabold">Thêm Tài khoản Người dùng</h3>
              </div>
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
              <button
                onClick={() => setAddMode('MANUAL')}
                className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                  addMode === 'MANUAL'
                    ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <User className="w-4 h-4" /> Thêm Thủ công
              </button>
              <button
                onClick={() => setAddMode('FILE')}
                className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                  addMode === 'FILE'
                    ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Tải file Excel / CSV
              </button>
            </div>

            {/* Mode 1: Manual Single User Form */}
            {addMode === 'MANUAL' ? (
              <form onSubmit={handleCreateManualUser} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã số (Mã SV / GV) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: SV202699"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vai trò Hệ thống *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ROLE_STUDENT">Sinh viên (STUDENT)</option>
                      <option value="ROLE_INSTRUCTOR">Giảng viên (INSTRUCTOR)</option>
                      <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và Tên đầy đủ *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Phạm Minh Hoàng"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    placeholder="hoangpm@unilms.edu.vn"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mật khẩu khởi tạo</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Mật khẩu mặc định kích hoạt ban đầu cho tài khoản mới.</p>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Khởi tạo Tài khoản
                  </button>
                </div>
              </form>
            ) : (
              /* Mode 2: Batch Excel/CSV File Upload Form */
              <form onSubmit={handleImportBatchUsers} className="p-6 space-y-4 text-xs">
                
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-900">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-extrabold">Tải File Mẫu Danh sách (.xlsx)</h4>
                      <p className="text-[10px] text-emerald-700">Mẫu chuẩn gồm các cột: Mã_SV, Họ_Tên, Email, Vai_Trò</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleFile}
                    className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 font-extrabold text-[11px] rounded-lg shadow-2xs hover:bg-emerald-100 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải Mẫu
                  </button>
                </div>

                {/* Dropzone Container */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chọn hoặc Kéo thả tệp danh sách (.xlsx / .csv) *</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileUpload}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 p-6 rounded-2xl text-center transition-all cursor-pointer relative"
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="font-extrabold text-emerald-900">{selectedFile.name}</p>
                        <p className="text-[11px] text-emerald-700 font-mono font-bold">Dung lượng: {selectedFile.size}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-extrabold text-slate-800">Nhấp hoặc thả tệp Excel vào đây</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ các định dạng .xlsx, .xls, .csv (Tối đa 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> {uploading ? 'Đang nhập...' : 'Nhập Danh sách Hàng loạt'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
