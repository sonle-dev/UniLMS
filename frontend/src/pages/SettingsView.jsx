import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsView({ onShowToast, themeMode: currentTheme, onChangeTheme }) {
  const [themeMode, setThemeMode] = useState(() => currentTheme || localStorage.getItem('unilms_theme') || 'light');
  const [emailNotify, setEmailNotify] = useState(true);
  const [examNotify, setExamNotify] = useState(true);
  const [language, setLanguage] = useState('vi');

  const handleSave = (e) => {
    e.preventDefault();
    if (onChangeTheme) {
      onChangeTheme(themeMode);
    }
    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Cài đặt hệ thống',
        message: `Đã chuyển và lưu cài đặt ${themeMode === 'dark' ? 'Giao diện Tối (Dark Mode)' : 'Giao diện Sáng (Light Mode)'} thành công!`
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Cài đặt Cấu hình Hệ thống LMS</h2>
            <p className="text-xs text-slate-500">Tùy chỉnh giao diện, thông báo và ngôn ngữ hiển thị cá nhân</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Interface Theme Mode */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Chế độ Giao diện
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                themeMode === 'light'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500 mb-2" />
              <span>Giao diện Sáng (Mặc định)</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                themeMode === 'dark'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-500 mb-2" />
              <span>Giao diện Tối (Dark)</span>
            </button>
          </div>
        </div>

        {/* 2. Notifications Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Cấu hình Thông báo
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-700">Nhận thông báo bài học & lịch thi qua Email</span>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-700">Thông báo nhắc nhở nộp bài trước hạn 24 giờ</span>
              <input
                type="checkbox"
                checked={examNotify}
                onChange={(e) => setExamNotify(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 3. Language & Region */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" /> Ngôn ngữ & Vùng miền
          </h3>

          <div className="max-w-xs text-xs">
            <label className="block text-slate-500 font-medium mb-1.5">Ngôn ngữ giao diện:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">Tiếng Việt (Vietnamese)</option>
              <option value="en">English (Mỹ)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu Tùy chọn Cài đặt
          </button>
        </div>

      </form>

    </div>
  );
}
