import React from 'react';
import { Award, ShieldCheck, Printer, Download, GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function CertificateView({ certCode = 'UNI-CERT-2026-JAVA88', onNavigate }) {

  const certData = {
    code: certCode,
    studentName: 'LE HONG SON',
    studentCode: 'SV2026889',
    major: 'Công nghệ Thông tin (Software Engineering)',
    courseTitle: 'Lập trình Enterprise với Java 17/21 & Spring Boot 3',
    issuedAt: '08 tháng 09 năm 2026',
    institution: 'Hội đồng Khoa học & Đào tạo UniLMS Vietnam',
    signatory: 'PGS. TS. Trần Đức Minh',
    signatoryTitle: 'Trưởng Phòng Đào tạo'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Tra cứu Chứng chỉ Đào tạo' }]} />

      {/* Action Bar Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-borderLight shadow-xs">
        <button onClick={() => onNavigate('dashboard')} className="btn-secondary text-xs gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
        </button>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary text-xs gap-1.5">
            <Printer className="w-4 h-4 text-textSec" /> In Chứng chỉ (Print)
          </button>
          <button onClick={handlePrint} className="btn-primary text-xs gap-1.5">
            <Download className="w-4 h-4" /> Tải File PDF Xác thực
          </button>
        </div>
      </div>

      {/* Official Certificate Card Frame (Vietnamese Aesthetic) */}
      <div className="bg-white rounded-3xl border-8 border-primary-700/20 p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-8">

        {/* Background Decorative Seals */}
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -translate-x-12 translate-y-12 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        {/* Certificate Header Banner */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-primary-700 to-primary-500 text-white shadow-lg mb-2">
            <GraduationCap className="w-9 h-9" />
          </div>
          <p className="text-xs uppercase font-extrabold tracking-widest text-primary-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="text-[11px] font-semibold text-textSec">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-32 h-0.5 bg-primary-600 mx-auto my-3"></div>

          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-primary-900 pt-2">
            CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC
          </h1>
          <p className="text-xs text-textMuted font-mono">Certificate of Course Completion</p>
        </div>

        {/* Certificate Recipient Details */}
        <div className="space-y-4 max-w-2xl mx-auto py-4 border-y border-primary-100">
          <p className="text-xs text-textSec uppercase tracking-wider font-semibold">CHỨNG NHẬN SINH VIÊN</p>

          <h2 className="text-3xl sm:text-4xl font-black text-primary-700 tracking-wide">
            {certData.studentName}
          </h2>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-textSec">
            <span>Mã sinh viên: <strong className="text-textMain">{certData.studentCode}</strong></span>
            <span>•</span>
            <span>Chuyên ngành: <strong className="text-textMain">{certData.major}</strong></span>
          </div>

          <p className="text-xs text-textSec pt-2">Đã hoàn thành xuất sắc chương trình đào tạo tín chỉ chuyên đề:</p>

          <h3 className="text-xl sm:text-2xl font-extrabold text-textMain px-4 py-2 bg-primary-50/80 rounded-xl border border-primary-200 inline-block text-primary-900">
            {certData.courseTitle}
          </h3>
        </div>

        {/* Certificate Footer & Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-4 items-end text-xs">

          {/* Verification Code & Stamp */}
          <div className="text-left space-y-2">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 inline-block">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ĐÃ XÁC THỰC KỸ THUẬT SỐ
              </div>
              <p className="text-[10px] font-mono text-emerald-700 mt-0.5">Mã số: {certData.code}</p>
            </div>
            <p className="text-[10px] text-textMuted">Tra cứu hợp lệ trên Cổng Văn bằng UniLMS Vietnam</p>
          </div>

          {/* Institutional Signatory */}
          <div className="text-right space-y-1">
            <p className="text-textSec">Hà Nội, ngày {certData.issuedAt}</p>
            <p className="font-bold text-textMain uppercase">{certData.signatoryTitle}</p>
            <div className="h-16 flex items-center justify-end">
              <span className="font-serif italic text-primary-700 text-lg font-bold opacity-80 decoration-wavy underline">
                Trần Đức Minh
              </span>
            </div>
            <p className="font-extrabold text-textMain">{certData.signatory}</p>
          </div>

        </div>

      </div>
    </div>
  );
}
