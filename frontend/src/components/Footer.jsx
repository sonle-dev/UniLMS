import React from 'react';
import { GraduationCap, ShieldCheck, PhoneCall, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-borderLight mt-16 text-textSec text-xs">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Institution Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-textMain tracking-tight">UniLMS VN</span>
            </div>
            <p className="text-textSec leading-relaxed">
              Hệ thống quản lý học tập và kiểm tra trực tuyến chuẩn Quốc gia dành cho các Trường Đại học và Trung tâm đào tạo tại Việt Nam.
            </p>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chứng nhận kiểm định chất lượng GD</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-textMain text-sm uppercase tracking-wider text-[12px]">Phòng Đào tạo</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Quy chế Đào tạo Tín chỉ</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Hướng dẫn Đăng ký Khóa học</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Lịch thi Học kỳ & Phúc khảo</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Tra cứu Văn bằng & Chứng chỉ</a></li>
            </ul>
          </div>

          {/* Support & Regulations */}
          <div className="space-y-2">
            <h4 className="font-semibold text-textMain text-sm uppercase tracking-wider text-[12px]">Hỗ trợ & Quy định</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Quyền riêng tư & Bảo mật dữ liệu</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Trung tâm Trợ giúp Sinh viên</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Báo lỗi Kỹ thuật & Sự cố Online</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors flex items-center gap-1">Cổng thông tin Bộ GD&ĐT <ExternalLink className="w-3 h-3"/></a></li>
            </ul>
          </div>

          {/* Hotline & Office */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-textMain text-sm uppercase tracking-wider text-[12px]">Liên hệ Phòng Đào tạo</h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <span>Khu Đô thị Đại học, Hà Nội / TP. Hồ Chí Minh, Việt Nam</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span className="font-semibold text-textMain">Hotline: 1900 6868 (Giờ hành chính)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span>daotao@unilms.edu.vn</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-borderLight mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-textMuted">
          <p>© {new Date().getFullYear()} UniLMS Enterprise Platform. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-textMain">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#" className="hover:text-textMain">Chính sách Bảo mật</a>
            <span>•</span>
            <a href="#" className="hover:text-textMain">Phiên bản v1.0.0-PROD</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
