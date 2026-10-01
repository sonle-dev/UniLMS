import React, { useState, useEffect } from 'react';
import { Clock, HelpCircle, CheckCircle2, XCircle, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function QuizEngine({ quizData, onNavigate, onQuizComplete }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [submittedResult, setSubmittedResult] = useState(null);

  // Timer effect
  useEffect(() => {
    if (submittedResult || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [submittedResult, timeLeft]);

  const questions = [
    {
      id: 'q-101',
      questionText: 'Trong kiến trúc Spring Boot 3 và Spring Security 6, đâu làAnnotation được khuyến nghị để kích hoạt cấu hình bảo mật Web?',
      options: [
        { id: 'A', text: '@EnableWebSecurity' },
        { id: 'B', text: '@EnableAuthorizationServer' },
        { id: 'C', text: '@SpringBootSecurity' },
        { id: 'D', text: '@ConfigurationSecurity' }
      ],
      correctOption: 'A',
      points: 2.5
    },
    {
      id: 'q-102',
      questionText: 'Để lưu trữ dữ liệu bất biến bài kiểm tra trong PostgreSQL nhằm bảo vệ tính toàn vẹn khi giảng viên cập nhật ngân hàng đề sau này, kiểu dữ liệu nào được sử dụng?',
      options: [
        { id: 'A', text: 'VARCHAR(255)' },
        { id: 'B', text: 'JSONB' },
        { id: 'C', text: 'BYTEA' },
        { id: 'D', text: 'TEXT ARRAY' }
      ],
      correctOption: 'B',
      points: 2.5
    },
    {
      id: 'q-103',
      questionText: 'Trong cơ chế Stateful vs Stateless của REST API JWT, khẳng định nào sau đây là đúng về Session người dùng trên Spring Boot?',
      options: [
        { id: 'A', text: 'Server lưu Session vào H2 database' },
        { id: 'B', text: 'Server sử dụng SessionCreationPolicy.STATELESS và xác thực token qua Filter từng request' },
        { id: 'C', text: 'Mỗi request bắt buộc mở lại HttpSession mặc định' },
        { id: 'D', text: 'Dữ liệu Token lưu hoàn toàn trong Cookie SessionID' }
      ],
      correctOption: 'B',
      points: 2.5
    },
    {
      id: 'q-104',
      questionText: 'Khi cập nhật tiến độ bài học (lesson completion), làm thế nào để tránh nghẽn I/O real-time COUNT(*) trên bảng tiến độ khi hàng vạn sinh viên cùng truy cập?',
      options: [
        { id: 'A', text: 'Lưu thuộc tính tổng hợp progress_percent trực tiếp trên bảng enrollments và cập nhật incremental' },
        { id: 'B', text: 'Chạy câu lệnh COUNT(*) từ bảng lesson_progress mỗi lần tải trang Dashboard' },
        { id: 'C', text: 'Xóa toàn bộ bản ghi cũ và chèn lại bản ghi mới' },
        { id: 'D', text: 'Chỉ tính toán tiến độ bằng Javascript trên phía Browser' }
      ],
      correctOption: 'A',
      points: 2.5
    }
  ];

  const handleSelectOption = (questionId, optionId) => {
    if (submittedResult) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    let earned = 0;
    let total = 0;
    const snapshot = [];

    questions.forEach(q => {
      total += q.points;
      const chosen = selectedAnswers[q.id];
      const isCorrect = chosen === q.correctOption;
      if (isCorrect) earned += q.points;

      snapshot.push({
        questionId: q.id,
        questionText: q.questionText,
        chosenOption: chosen || 'Chưa chọn',
        correctOption: q.correctOption,
        isCorrect: isCorrect
      });
    });

    const score = (earned / total) * 100;
    const isPassed = score >= 80;

    const result = {
      submissionId: 'sub-2026-uuid-v4-snap',
      score: score,
      isPassed: isPassed,
      submittedAt: new Date().toISOString(),
      snapshot: snapshot
    };

    setSubmittedResult(result);
    if (onQuizComplete) onQuizComplete(result);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Bài Kiểm Tra Trắc Nghiệm Tín Chỉ' }]} />

      {/* Quiz Header & Timer Bar */}
      <div className="bg-white rounded-2xl border border-borderLight p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Đề thi Khóa Tín chỉ
          </span>
          <h1 className="text-xl font-extrabold text-textMain mt-1">Kiểm Tra Điều Kiện: Spring Boot 3 & PostgreSQL Enterprise</h1>
          <p className="text-xs text-textSec">Thời gian: 15 Phút | Thang điểm: 10.0 | Điểm đạt: 8.0 trở lên</p>
        </div>

        {/* Countdown Box */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-base font-mono font-bold shrink-0 ${
          timeLeft < 180 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-slate-50 text-primary-700 border-slate-200'
        }`}>
          <Clock className="w-5 h-5 text-amber-500" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Result Display Banner if Submitted */}
      {submittedResult && (
        <div className={`p-6 rounded-2xl border shadow-md space-y-3 ${
          submittedResult.isPassed 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-red-50 border-red-300 text-red-900'
        }`}>
          <div className="flex items-center gap-3">
            {submittedResult.isPassed ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h3 className="text-lg font-bold">
                {submittedResult.isPassed ? 'Chúc mừng! Bạn đã ĐẠT bài kiểm tra' : 'Rất tiếc! Bạn CHƯA ĐẠT điểm tối thiểu'}
              </h3>
              <p className="text-xs opacity-90">
                Điểm tổng kết: <strong className="text-base">{submittedResult.score.toFixed(1)}/100</strong> (Điểm đạt yêu cầu: 80.0/100)
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-700 bg-white/70 p-3 rounded-lg border border-slate-200">
            🔒 <strong>Dữ liệu Snapshot Bất Biến:</strong> Toàn bộ đề bài, đáp án bạn chọn và thời gian nộp ({new Date(submittedResult.submittedAt).toLocaleString('vi-VN')}) đã được ghi lại vĩnh viễn vào hệ thống PostgreSQL dưới dạng payload JSONB.
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selectedOption = selectedAnswers[q.id];
          return (
            <div key={q.id} className="bg-white rounded-xl border border-borderLight p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-sm text-textMain leading-relaxed">
                  <span className="text-primary-700 font-extrabold mr-1.5">Câu {idx + 1}:</span>
                  {q.questionText}
                </h3>
                <span className="text-[11px] font-semibold text-textMuted bg-slate-100 px-2 py-0.5 rounded shrink-0">
                  {q.points} Điểm
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  let optStyle = "bg-slate-50 border-slate-200 text-textMain hover:bg-slate-100";

                  if (submittedResult) {
                    if (opt.id === q.correctOption) {
                      optStyle = "bg-emerald-100 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-400";
                    } else if (isSelected) {
                      optStyle = "bg-red-100 border-red-400 text-red-900 line-through";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-primary-50 border-primary-500 text-primary-800 font-bold ring-2 ring-primary-500/30";
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={!!submittedResult}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`p-3.5 rounded-lg border text-xs text-left transition-all flex items-center gap-3 ${optStyle}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-300 font-bold text-center flex items-center justify-center shrink-0">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!submittedResult ? (
        <div className="bg-white p-4 rounded-xl border border-borderLight flex items-center justify-between">
          <span className="text-xs text-textSec">
            Đã trả lời: <strong>{Object.keys(selectedAnswers).length}/{questions.length}</strong> câu
          </span>
          <button
            onClick={handleSubmit}
            className="btn-primary py-3 px-8 text-sm gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Nộp Bài Thi Ngay
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button onClick={() => onNavigate('dashboard')} className="btn-secondary gap-2 text-xs">
            <ArrowLeft className="w-4 h-4" /> Quay lại Bảng điều khiển Học tập
          </button>
        </div>
      )}

    </div>
  );
}
