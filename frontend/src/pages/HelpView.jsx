import React, { useState } from 'react';
import { HelpCircle, Phone, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function HelpView({ onShowToast }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Gửi yêu cầu hỗ trợ',
          message: 'Yêu cầu trợ giúp kỹ thuật đã được tiếp nhận. Đội ngũ IT sẽ phản hồi qua email trong thời gian sớm nhất!'
        });
      }
      setSubject('');
      setContent('');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Trung tâm Trợ giúp Kỹ thuật ICTU</h2>
            <p className="text-xs text-slate-500">Giải đáp thắc mắc và hỗ trợ xử lý sự cố học tập trực tuyến</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Hotline Kỹ thuật</h4>
            <p className="text-xs font-mono font-bold text-blue-600">0243.888.999</p>
            <p className="text-[11px] text-slate-400">Giờ làm việc: 07:30 - 17:00 (Thứ 2 - Thứ 6)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Email Hỗ trợ CNTT</h4>
            <p className="text-xs font-mono font-bold text-blue-600">support.lms@ictu.edu.vn</p>
            <p className="text-[11px] text-slate-400">Phản hồi tự động trong vòng 24 giờ</p>
          </div>
        </div>

        {/* Ticket Submit Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" /> Gửi Yêu cầu Hỗ trợ Trực tuyến
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vấn đề cần hỗ trợ *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ví dụ: Không xem được video bài giảng số 2 môn Java"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết sự cố *</label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mô tả cụ thể lỗi gặp phải, mã môn học hoặc thông báo hiển thị trên màn hình..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Đang gửi...' : 'Gửi Yêu cầu Trợ giúp'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
