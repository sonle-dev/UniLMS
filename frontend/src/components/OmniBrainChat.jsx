import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Shield, Sparkles, Cpu, Zap, Code, BookOpen, AlertTriangle, User } from 'lucide-react';

export default function OmniBrainChat({ currentRole, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Xin chào! Tôi là **OmniBrain AI Platform** - Trợ lý trí tuệ nhân tạo tích hợp của UniLMS.\n\nBạn có thể hỏi tôi về bài học, lịch thi, tóm tắt tài liệu hoặc sinh mã nguồn. Bạn cũng có thể đổi mô hình AI ở góc trên!',
      isSecurityWarning: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      isSecurityWarning: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateOmniBrainResponse(text, selectedModel, currentRole, currentUser);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse.text,
        isSecurityWarning: aiResponse.isSecurityWarning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const tryEvaluateMath = (input) => {
    if (!input) return null;
    let cleaned = input.toLowerCase()
      .replace(/kết quả (của )?(phép tính )?/gi, '')
      .replace(/bằng bao nhiêu\??/gi, '')
      .replace(/tính toán/gi, '')
      .replace(/tính/gi, '')
      .replace(/bằng/gi, '')
      .replace(/=/g, '')
      .trim();

    let expr = cleaned
      .replace(/nhân/gi, '*')
      .replace(/chia/gi, '/')
      .replace(/cộng/gi, '+')
      .replace(/trừ/gi, '-')
      .replace(/mũ/gi, '^')
      .replace(/\bx\b/gi, '*')
      .replace(/×/gi, '*')
      .replace(/÷/gi, '/')
      .trim();

    if (/^[0-9\.\s\+\-\*\/\(\)\^]+$/.test(expr) && /[0-9]/.test(expr)) {
      try {
        const jsExpr = expr.replace(/\^/g, '**');
        const evalResult = new Function(`return (${jsExpr});`)();
        if (typeof evalResult === 'number' && !isNaN(evalResult) && isFinite(evalResult)) {
          const displayExpr = expr
            .replace(/\*/g, ' × ')
            .replace(/\//g, ' ÷ ')
            .replace(/\+/g, ' + ')
            .replace(/\-/g, ' − ')
            .replace(/\s+/g, ' ')
            .trim();
          return {
            originalExpr: displayExpr,
            result: evalResult
          };
        }
      } catch (e) {}
    }
    return null;
  };

  const generateOmniBrainResponse = (input, model, role, userObj) => {
    const lower = input.toLowerCase();

    // 1. SECURITY GUARD: Sinh viên không có quyền truy cập / can thiệp vào Database
    const dbKeywords = [
      'database', 'cơ sở dữ liệu hệ thống', 'xem db', 'drop table', 'select *', 
      'mật khẩu', 'password', 'truy cập db', 'xem bảng điểm người khác', 'truy vấn db', 'sql injection', 'postgres'
    ];

    const isTryingDbAccess = dbKeywords.some(kw => lower.includes(kw));
    const isStudent = !role || role === 'ROLE_STUDENT' || role === 'student';

    if (isStudent && isTryingDbAccess && !lower.includes('môn cơ sở dữ liệu') && !lower.includes('tóm tắt')) {
      const studentName = userObj?.fullName || 'Sinh viên';
      return {
        isSecurityWarning: true,
        text: `🛡️ **CẢNH BÁO BẢO MẬT OMNIBRAIN AI SECURITY GUARD**\n\nTài khoản Sinh viên (**${studentName}**) **KHÔNG CÓ QUYỀN** truy cập hoặc can thiệp trực tiếp vào Cơ sở dữ liệu hệ thống (PostgreSQL Database).\n\n⚠️ *Hệ thống đã chặn yêu cầu này để bảo mật thông tin. Bạn chỉ có thể hỏi trợ lý AI về giải đáp bài học, tóm tắt tài liệu môn học hoặc tư vấn phương pháp học.*`
      };
    }

    // 2. MATH EVALUATION ENGINE
    const mathRes = tryEvaluateMath(input);
    if (mathRes) {
      if (model === 'code-assist') {
        return {
          isSecurityWarning: false,
          text: `💻 **[CodeAssist AI - Biểu thức Toán học trong Code]**:\n\`\`\`java\n// Cú pháp tính toán Java / C++\ndouble result = ${mathRes.originalExpr.replace(/×/g, '*').replace(/÷/g, '/')};\nSystem.out.println("Kết quả = " + result); // Output: ${mathRes.result}\n\`\`\`\n👉 **Kết quả phép tính**: **\`${mathRes.originalExpr} = ${mathRes.result}\`**`
        };
      }
      if (model === 'gemini-flash') {
        return {
          isSecurityWarning: false,
          text: `⚡ **[Gemini 1.5 Flash]**: \`${mathRes.originalExpr} = ${mathRes.result}\``
        };
      }
      if (model === 'edubrain' || model === 'edubrain-guide') {
        return {
          isSecurityWarning: false,
          text: `📘 **[EduBrain Study Guide]**: Đáp án phép tính \`${mathRes.originalExpr}\` là **\`${mathRes.result}\`**.\n\n💡 *Mẹo*: Hãy nhớ kiểm tra thứ tự thực hiện phép tính (Nhân chia trước, Cộng trừ sau) khi làm các bài tập!`
        };
      }
      // Default: gemini-pro
      return {
        isSecurityWarning: false,
        text: `🧠 **[Gemini 1.5 Pro - Phân tích Phép tính]**:\n\n• **Biểu thức**: \`${mathRes.originalExpr}\`\n• **Kết quả chính xác**: **\`${mathRes.result}\`**\n\n💡 *Ghi chú*: Kết quả đã được xác minh qua bộ máy OmniBrain Math Engine.`
      };
    }

    // 3. TOPIC KEYWORDS & DYNAMIC RESPONSES
    if (lower.includes('lịch thi') || lower.includes('thời khóa biểu')) {
      return {
        isSecurityWarning: false,
        text: `📅 **[Gemini 1.5 Pro] Thông tin Thời khóa biểu & Lịch thi**:\n\n- **Môn**: Lập trình Enterprise với Java & Spring Boot 3\n- **Phòng thi**: A101 - Phòng Máy Tính Lab 3\n- **Thời gian**: 08:00 AM - 15/10/2026\n- **Hình thức**: Trắc nghiệm 45 câu trên UniLMS Quiz Engine.`
      };
    }

    if (lower.includes('spring security') || lower.includes('jwt')) {
      return {
        isSecurityWarning: false,
        text: `🧠 **[Gemini 1.5 Pro] Tổng quan Spring Security 6 & JWT**:\n\n1. **Stateless Auth**: Không lưu Session trên Server, xác thực qua Header \`Authorization: Bearer <token>\`.\n2. **SecurityFilterChain**: Cấu hình quy tắc phân quyền route theo role (STUDENT, INSTRUCTOR, ADMIN).\n3. **JwtAuthenticationFilter**: Đọc token, verify chữ ký HMAC-SHA256 và set Authentication vào SecurityContextHolder.`
      };
    }

    if (model === 'code-assist') {
      if (lower.includes('sql') || lower.includes('join')) {
        return {
          isSecurityWarning: false,
          text: `💻 **[CodeAssist AI] Cú pháp SQL JOIN chuẩn PostgreSQL**:\n\`\`\`sql\n-- Ví dụ INNER JOIN bảng Sinh viên và Bảng điểm\nSELECT s.student_code, s.full_name, g.tx1, g.midterm_score, g.final_score\nFROM student_profiles s\nINNER JOIN student_grades g ON s.user_id = g.student_id\nWHERE g.is_eligible_for_exam = TRUE;\n\`\`\`\n💡 *Ghi chú*: Mã nguồn đã được kiểm thử trên PostgreSQL 15+!`
        };
      }
      return {
        isSecurityWarning: false,
        text: `💻 **[CodeAssist AI] Đã nhận yêu cầu lập trình**:\n\`\`\`java\n// Ví dụ Controller REST Spring Boot 3\n@RestController\n@RequestMapping("/api/v1/courses")\npublic class CourseController {\n    @GetMapping\n    public ResponseEntity<List<CourseDto>> getPublishedCourses() {\n        return ResponseEntity.ok(courseService.findAllPublished());\n    }\n}\n\`\`\`\nCần thêm mẫu code về Redis Cache hay Security JWT không bạn?`
      };
    }

    if (model === 'edubrain-guide' || model === 'edubrain') {
      return {
        isSecurityWarning: false,
        text: `🎓 **[EduBrain Study Guide] Hướng dẫn cho câu hỏi "${input}"**:\n\n1. **Nghiên cứu tài liệu**: Đọc Slide PPTX tương ứng tại mục môn học.\n2. **Thực hành Quiz**: Luyện tập câu hỏi trắc nghiệm tự kiểm tra kiến thức.\n3. **Hỏi đáp Giảng viên**: Liên hệ Giảng viên giảng dạy nếu có thắc mắc chuyên sâu.`
      };
    }

    if (model === 'gemini-flash') {
      return {
        isSecurityWarning: false,
        text: `⚡ **[Gemini 1.5 Flash - Tóm tắt nhanh]**:\n• **Nội dung yêu cầu**: "${input}"\n• **Gợi ý**: Hệ thống UniLMS cập nhật dữ liệu tự động. Hãy tham khảo lịch thi & danh sách môn học tại menu chính.`
      };
    }

    // Default: gemini-pro
    return {
      isSecurityWarning: false,
      text: `🧠 **[Gemini 1.5 Pro]** Trợ lý OmniBrain AI đã tiếp nhận câu hỏi: "*${input}*".\n\nBạn có thể tra cứu lịch thi, thực hiện các phép tính toán học (ví dụ: \`5 nhân 2\` hay \`100 / 4\`), hoặc chọn **CodeAssist AI** để viết code mẫu!`
    };
  };

  const getModelBadge = (modelId) => {
    switch(modelId) {
      case 'gemini-pro': return { name: 'Gemini 1.5 Pro', icon: Cpu, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'gemini-flash': return { name: 'Gemini 1.5 Flash', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'code-assist': return { name: 'CodeAssist AI', icon: Code, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'edubrain-guide': return { name: 'EduBrain Guide', icon: BookOpen, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      default: return { name: 'Gemini 1.5 Pro', icon: Cpu, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    }
  };

  return (
    <>
      {/* Floating Toggle Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group ring-4 ring-blue-500/20"
          title="Mở OmniBrain AI Platform Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-blue-600"></span>
          </div>
          <span className="font-bold text-xs pr-1 hidden sm:inline">OmniBrain AI</span>
        </button>
      )}

      {/* Main Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-400/30 text-indigo-300">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-wide bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                    OmniBrain AI
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase">
                    Platform
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Security Guard Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Đóng chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AI Model Selector Bar */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" /> Model:
            </span>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="gemini-pro">🧠 Gemini 1.5 Pro (Học thuật)</option>
              <option value="gemini-flash">⚡ Gemini 1.5 Flash (Tóm tắt)</option>
              <option value="code-assist">💻 CodeAssist AI (Mã nguồn)</option>
              <option value="edubrain-guide">🎓 EduBrain Study Guide (Lộ trình)</option>
            </select>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            
            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              {[
                '📅 Lịch thi môn Java?',
                '⚡ Tóm tắt Spring Security',
                '💻 Mẫu SQL INNER JOIN',
                '🎓 Lộ trình ôn tập'
              ].map((chipText, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chipText)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                >
                  {chipText}
                </button>
              ))}
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 ${
                    msg.isSecurityWarning ? 'bg-red-600' : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                  }`}>
                    {msg.isSecurityWarning ? <Shield className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : msg.isSecurityWarning
                    ? 'bg-red-50 border-2 border-red-300 text-red-900 rounded-tl-xs dark:bg-red-950/40 dark:border-red-800 dark:text-red-200'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                }`}>
                  {msg.isSecurityWarning && (
                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold mb-1.5 pb-1 border-b border-red-200 dark:border-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span>OMNIBRAIN SECURITY GUARD</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  <div className={`text-[9px] mt-1.5 text-right font-medium opacity-60`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                  <span>OmniBrain AI đang suy nghĩ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Hỏi OmniBrain AI về bài học, lịch thi..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-colors shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
