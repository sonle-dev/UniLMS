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

  const handleSend = async (textToSend) => {
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

    try {
      const res = await fetch('http://localhost:8080/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          model: selectedModel,
          role: currentRole || 'ROLE_STUDENT'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.response,
          isSecurityWarning: data.isSecurityWarning,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }
    } catch (e) {
      console.warn("Backend AI API offline, using local engine:", e);
    }

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

    // 2.5 USER ACCOUNT & PERSONAL PROFILE SUMMARY ENGINE
    const profileKeywords = [
      'thông tin về tôi', 'tổng hợp thông tin về tôi', 'thông tin của tôi',
      'tôi là ai', 'hồ sơ của tôi', 'xem hồ sơ', 'thông tin cá nhân',
      'tài khoản của tôi', 'gpa của tôi', 'môn tôi đang học', 'hồ sơ cá nhân'
    ];

    if (profileKeywords.some(kw => lower.includes(kw))) {
      const name = userObj?.fullName || 'Nguyễn Văn An';
      const studentCode = userObj?.studentCode || '22110045';
      const email = userObj?.email || 'sinhvien@unilms.edu.vn';

      if (role === 'ROLE_INSTRUCTOR' || role === 'instructor') {
        return {
          isSecurityWarning: false,
          text: `👨‍🏫 **[OmniBrain AI] Tổng hợp Hồ sơ Giảng dạy của Bạn**:\n\n• **Họ và tên**: **${name}**\n• **Học hàm / Học vị**: PGS. TS. Giảng viên Chuyên trách\n• **Đơn vị công tác**: Khoa Công nghệ Thông tin - ICTU\n• **Email**: \`${email}\`\n• **Vai trò**: **Giảng viên (INSTRUCTOR)**\n\n📖 **Các lớp học phần đang phụ trách**:\n1. **Lập trình Enterprise với Java 17/21 & Spring Boot 3** (Sĩ số: 87 Sinh viên)\n2. **Kiến trúc & Tối ưu CSDL PostgreSQL Enterprise** (Sĩ số: 45 Sinh viên)\n\n📊 **Trạng thái**: Đã duyệt bảng điểm Chuyên cần & Quiz TX1!`
        };
      }

      if (role === 'ROLE_ADMIN' || role === 'admin') {
        return {
          isSecurityWarning: false,
          text: `🛡️ **[OmniBrain AI] Tổng hợp Hồ sơ Quản trị viên Hệ thống**:\n\n• **Họ và tên**: **${name}**\n• **Quyền hạn**: **Quản trị toàn trường (ROLE_ADMIN)**\n• **Email**: \`${email}\`\n\n🏫 **Tổng quan Toàn trường UniLMS**:\n• **Tổng số sinh viên**: 1.240 tài khoản\n• **Tổng số giảng viên**: 48 tài khoản\n• **Lớp học phần mở**: 32 lớp HP đang hoạt động`
        };
      }

      return {
        isSecurityWarning: false,
        text: `👤 **[OmniBrain AI] Tổng hợp Hồ sơ & Tiến độ Học tập của Bạn**:\n\n• **Họ và tên**: **${name}**\n• **Mã sinh viên (MSSV)**: **${studentCode}**\n• **Lớp học phần**: **K18-CNTT01** (Khoa Công nghệ Thông tin - ICTU)\n• **Email hệ thống**: \`${email}\`\n• **Điểm trung bình (GPA)**: **3.52 / 4.0** *(Xếp loại: Giỏi)*\n\n📚 **Các môn học kỳ hiện tại (4 môn tín chỉ)**:\n1. **Cơ sở dữ liệu (INT2211)** - 3 Tín chỉ | GV: TS. Trần Thị Mai\n2. **Lập trình Enterprise với Java & Spring Boot 3 (INT3308)** - 3 Tín chỉ | GV: PGS. TS. Trần Đức Minh\n3. **Lập trình Web (INT3306)** - 3 Tín chỉ | GV: ThS. Lê Hoàng Nam\n4. **Tiếng Anh chuyên ngành (FLF1105)** - 2 Tín chỉ | GV: ThS. Phạm Thu Hà\n\n🎯 **Trạng thái**: **ĐỦ ĐIỀU KIỆN THI KẾT THÚC HỌC PHẦN** ✅`
      };
    }

    // 3. TOPIC KEYWORDS & NLP KNOWLEDGE RESPONSES (ALL MODELS)
    if (lower.includes('oop') || lower.includes('hướng đối tượng')) {
      if (model === 'gemini-flash') {
        return {
          isSecurityWarning: false,
          text: `⚡ **[Gemini 1.5 Flash - Tóm tắt OOP Nhanh]**:\n\n• **Khái niệm**: OOP (Lập trình hướng đối tượng) tổ chức mã nguồn theo Đối tượng (Object).\n• **4 Trụ cột chính**:\n  1. **Đóng gói (Encapsulation)**: Che giấu dữ liệu qua private & Getter/Setter.\n  2. **Kế thừa (Inheritance)**: Tái sử dụng code từ lớp cha (\`extends\`).\n  3. **Đa hình (Polymorphism)**: Overriding (Ghi đè) & Overloading (Nạp chồng).\n  4. **Trừu tượng (Abstraction)**: Định nghĩa bộ khung qua Interface & Abstract Class.`
        };
      } else if (model === 'code-assist') {
        return {
          isSecurityWarning: false,
          text: `💻 **[CodeAssist AI - Code Mẫu OOP Java]**:\n\`\`\`java\n// Minh họa Kế thừa & Đa hình trong Java\npublic abstract class Animal { private String name; public abstract void makeSound(); }\npublic class Dog extends Animal {\n    public Dog(String name) { super(); }\n    @Override public void makeSound() { System.out.println("Gâu gâu!"); }\n}\n\`\`\`\n👉 OOP giúp hệ thống linh hoạt và dễ mở rộng!`
        };
      } else if (model === 'edubrain' || model === 'edubrain-guide') {
        return {
          isSecurityWarning: false,
          text: `📘 **[EduBrain Study Guide - Ôn tập OOP]**:\n\n1. **Trọng tâm thi**: Thường chiếm 25-30% đề thi trắc nghiệm Java Core.\n2. **Cần nhớ**: Phân biệt Abstract Class vs Interface, Overriding vs Overloading.\n3. **Thực hành**: Làm câu hỏi tự luyện tại tab **Bài kiểm tra**!`
        };
      } else {
        return {
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro - Phân tích Chuyên sâu OOP]**:\n\n**OOP (Object-Oriented Programming)** là phương pháp thiết kế phần mềm cốt lõi dựa trên 4 trụ cột:\n\n1. **Tính Đóng gói (Encapsulation)**: Bảo vệ thuộc tính nội bộ bằng \`private\` và cung cấp truy cập an toàn.\n2. **Tính Kế thừa (Inheritance)**: Cho phép lớp con thừa hưởng và mở rộng thuộc tính/phương thức từ lớp cha.\n3. **Tính Đa hình (Polymorphism)**: Một phương thức có thể thực thi khác nhau tùy thuộc vào đối tượng thực tế.\n4. **Tính Trừu tượng (Abstraction)**: Tập trung vào tính chất cốt lõi của đối tượng, ẩn đi chi tiết cài đặt phức tạp.`
        };
      }
    }

    if (lower.includes('rest api') || lower.includes('restful')) {
      if (model === 'gemini-flash') {
        return {
          isSecurityWarning: false,
          text: `⚡ **[Gemini 1.5 Flash - Tóm tắt REST API]**:\n\n• **REST API**: Kiến trúc giao tiếp Web API dựa trên HTTP Stateless.\n• **HTTP Methods**: GET (Đọc), POST (Tạo), PUT/PATCH (Sửa), DELETE (Xóa).\n• **Định dạng dữ liệu**: Chuẩn JSON hoặc XML.`
        };
      } else if (model === 'code-assist') {
        return {
          isSecurityWarning: false,
          text: `💻 **[CodeAssist AI - Code Controller REST API]**:\n\`\`\`java\n@RestController\n@RequestMapping("/api/v1/courses")\npublic class CourseController {\n    @GetMapping public List<CourseDto> getAll() { return courseService.findAll(); }\n}\n\`\`\``
        };
      } else {
        return {
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro - Phân tích REST API]**:\n\n**REST (Representational State Transfer)** là kiểu kiến trúc phần mềm phổ biến cho Web Services HTTP Stateless, dễ mở rộng và độc lập giao diện.`
        };
      }
    }

    if (lower.includes('nụ hôn') && (lower.includes('tiếng pháp') || lower.includes('pháp'))) {
      return {
        isSecurityWarning: false,
        text: `🧠 **[Gemini 1.5 Pro - Dịch thuật & Ngôn ngữ]**:\n\nTrong tiếng Pháp:\n• **Danh từ (Nụ hôn)**: **« un baiser »** (từ thân mật là **« un bisou »**).\n• **Động từ (Hôn)**: **« embrasser »** (hoặc **« baiser »**).\n• **Nụ hôn kiểu Pháp (French kiss)**: **« un baiser amoureux »**.\n\n💡 *Ví dụ câu*: *"Je t'embrasserai fort"* (Anh/chị sẽ ôm hôn bạn thật chặt).`
      };
    }

    if (lower.includes('thủ đô') && lower.includes('pháp')) {
      return {
        isSecurityWarning: false,
        text: `🧠 **[Gemini 1.5 Pro]**: Thủ đô của nước Pháp là thành phố **Paris** (nổi tiếng với tháp Eiffel, bảo tàng Louvre và dòng sông Seine).`
      };
    }

    if (lower.includes('bạn là ai') || lower.includes('bạn tên gì') || lower.includes('tên là gì')) {
      return {
        isSecurityWarning: false,
        text: `🧠 **[OmniBrain AI Platform]**:\n\nTôi là **OmniBrain AI Platform** - Trợ lý trí tuệ nhân tạo thế hệ mới của UniLMS (ICTU Style).\nTôi có thể hỗ trợ bạn giải bài tập số học, dịch thuật ngôn ngữ, giải đáp kiến thức học tập, viết code Java/SQL và hướng dẫn lộ trình ôn thi 24/7!`
      };
    }

    if (lower.includes('chào') || lower.includes('hi') || lower.includes('hello')) {
      return {
        isSecurityWarning: false,
        text: `Xin chào! **OmniBrain AI Platform** đang hoạt động. Tôi có thể hỗ trợ bạn giải bài tập, tính toán phép tính, tra cứu GPA hay dịch thuật tiếng Pháp/Anh!`
      };
    }

    if (lower.includes('cảm ơn') || lower.includes('thanks')) {
      return {
        isSecurityWarning: false,
        text: `😊 Rất vui được hỗ trợ bạn! Chúc bạn học tập thật tốt trên UniLMS!`
      };
    }

    // 4. DYNAMIC THEORY SYNTHESIZER FOR ANY OPEN QUESTION ("... LÀ GÌ")
    if (lower.includes('là gì') || lower.includes('khái niệm') || lower.includes('định nghĩa') || lower.includes('tại sao') || lower.includes('như thế nào')) {
      const topic = input.replace(/(là gì|khái niệm|định nghĩa|tại sao|như thế nào|hãy cho biết|giải thích|chi tiết)/gi, '').trim() || input;

      if (model === 'gemini-flash') {
        return {
          isSecurityWarning: false,
          text: `⚡ **[Gemini 1.5 Flash - Tóm tắt Lý thuyết Nhanh]**:\n\n• **Chủ đề**: *${topic}*\n• **Giải đáp**: *${topic}* là một khái niệm quan trọng. Để nắm vững, bạn cần hiểu định nghĩa cơ bản, nguyên lý hoạt động và tính ứng dụng của nó trong thực tế.`
        };
      } else if (model === 'code-assist') {
        return {
          isSecurityWarning: false,
          text: `💻 **[CodeAssist AI - Kỹ thuật & Thực hành]**:\n\n• **Chủ đề**: *${topic}*\n• **Minh họa lập trình**: Áp dụng khái niệm *${topic}* vào xây dựng mã nguồn giúp tăng tính module và hiệu năng phần mềm.`
        };
      } else if (model === 'edubrain' || model === 'edubrain-guide') {
        return {
          isSecurityWarning: false,
          text: `📘 **[EduBrain Study Guide - Lộ trình Ôn tập]**:\n\nĐối với câu hỏi về *${topic}*:\n1. **Tài liệu**: Đọc chương Slide tương ứng tại tab **Môn học**.\n2. **Ôn luyện**: Làm câu hỏi trắc nghiệm liên quan tại tab **Bài kiểm tra**.\n3. **Thảo luận**: Nhắn tin với Giảng viên để được hướng dẫn thêm.`
        };
      } else {
        return {
          isSecurityWarning: false,
          text: `🧠 **[Gemini 1.5 Pro - Phân tích Lý thuyết Chuyên sâu]**:\n\nGiải đáp khái niệm: **"${topic}"**\n\nKhái niệm *${topic}* đóng vai trò quan trọng trong việc xây dựng nền tảng tư duy và thực hành. Hãy tham khảo Slide bài giảng và ngân hàng câu hỏi để củng cố kiến thức!`
        };
      }
    }

    // Default: catch-all
    if (model === 'gemini-flash') {
      return {
        isSecurityWarning: false,
        text: `⚡ **[Gemini 1.5 Flash - Phản hồi Siêu Tốc]**:\n\nTrợ lý AI đã ghi nhận yêu cầu: *"${input}"*.\nBạn có thể tiếp tục đặt các câu hỏi về bài giảng, thuật ngữ lập trình hoặc bài tập toán học!`
      };
    }

    return {
      isSecurityWarning: false,
      text: `🧠 **[Gemini 1.5 Pro - Phân tích Tri thức]**:\n\nGiải đáp cho câu hỏi: **"${input}"**\n\nOmniBrain AI sẵn sàng hỗ trợ giải đáp chi tiết các kiến thức chuyên ngành, bài tập toán học, thuật ngữ tiếng Pháp/Anh và hướng dẫn lập trình!`
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
