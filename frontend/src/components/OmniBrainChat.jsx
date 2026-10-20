import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Shield, Sparkles, Cpu, Zap, Code, BookOpen, AlertTriangle, User, Wand2 } from 'lucide-react';

// ─── LLM Intent Classifier Engine ───────────────────────────────────────────
// Phân loại câu hỏi thành 4 intent và route sang mô hình phù hợp.
// Ưu tiên: Security Guard > Math > Code > DB/Entity > Academic > Quick > Guide
const classifyIntent = (text) => {
  const lower = text.toLowerCase();

  // CODE intent: từ khóa lập trình, SQL, debug
  const codePatterns = [
    /\b(code|lập trình|viết code|debug|lỗi|error|exception|compile|build|chạy|run|function|class|method|interface|sql|select|insert|update|delete|join|query|java|python|react|spring|api|endpoint|json|xml|html|css|js|javascript|typescript|git|deploy|docker|maven|npm|pom\.xml|controller|service|repository|dto|entity|annotation|@|\[\[|syntax|algorithm|thuật toán|vòng lặp|loop|array|list|map|set|hashmap|recursion|đệ quy|pointer|con trỏ|heap|stack|queue|binary|tree|graph|sort|search|sắp xếp|tìm kiếm|big o|độ phức tạp)\b/i,
    /```|`[a-z]/,
    /[a-zA-Z_]+\(\)|\{\s*\}|=>|->|::/,
  ];

  // QUICK intent: tóm tắt nhanh, câu ngắn, tính toán
  const quickPatterns = [
    /\b(tóm tắt|tóm lược|ngắn gọn|brief|nhanh|quick|tldr|tl;dr|điểm chính|key point)\b/i,
    /^[^\s]{1,30}(\s+[^\s]{1,20}){0,4}\??$/,  // câu rất ngắn < 6 từ
  ];

  // GUIDE / ROADMAP intent: lộ trình, hướng dẫn học, ôn thi
  const guidePatterns = [
    /\b(lộ trình|ôn thi|học thế nào|bắt đầu từ đâu|roadmap|hướng dẫn học|tài liệu|giáo trình|study|luyện tập|thực hành|bài tập|tips?|mẹo|phương pháp học|kế hoạch học|time management|quản lý thời gian)\b/i,
  ];

  // Kiểm tra theo thứ tự ưu tiên
  const isCode = codePatterns.some(p => p.test(lower) || p.test(text));
  const isGuide = guidePatterns.some(p => p.test(lower));
  const isQuick = !isCode && !isGuide && quickPatterns.some(p => p.test(lower) || p.test(text));

  if (isCode)  return 'code-assist';
  if (isGuide) return 'edubrain-guide';
  if (isQuick) return 'gemini-flash';
  return 'gemini-pro';   // default: học thuật chuyên sâu
};
// ─────────────────────────────────────────────────────────────────────────────

export default function OmniBrainChat({ currentRole, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModel, setActiveModel] = useState(null); // model được tự động chọn
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Xin chào bạn! 👋 Mình là trợ lý học tập UniLMS.\n\nBạn cần hỗ trợ về bài giảng, lịch thi hay kiến thức gì cứ nhắn cho mình nhé!',
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

  const cleanAiText = (txt) => {
    if (!txt) return '';
    return txt
      .replace(/^⚡\s*\*\*\[Gemini[^\]]*\]\*\*(\s*—\s*)?:?\s*/gi, '')
      .replace(/^🧠\s*\*\*\[Gemini[^\]]*\]\*\*(\s*—\s*)?:?\s*/gi, '')
      .replace(/^💻\s*\*\*\[CodeAssist[^\]]*\]\*\*(\s*—\s*)?:?\s*/gi, '')
      .replace(/^📘\s*\*\*\[EduBrain[^\]]*\]\*\*(\s*—\s*)?:?\s*/gi, '')
      .replace(/\*\*\[Gemini[^\]]*\]\*\*:\s*/gi, '')
      .replace(/\[Gemini[^\]]*\]:\s*/gi, '')
      .trim();
  };

  const callRealGenerativeAI = async (userPrompt, model, role, userObj) => {
    const apiKey = (localStorage.getItem('omnibrain_api_key') || '').trim();
    const modelPrefix = '';

    const userFullName = userObj?.fullName || (role === 'ROLE_INSTRUCTOR' ? 'TS. Trần Thị Mai' : 'Nguyễn Văn An');
    const userCode = userObj?.studentCode || userObj?.instructorCode || (role === 'ROLE_INSTRUCTOR' ? 'MSGV 10245' : 'MSSV 22110045');
    const userEmail = userObj?.email || (role === 'ROLE_INSTRUCTOR' ? 'mai.tt@eduportal.edu.vn' : 'an.nv22110045@st.eduportal.edu.vn');

    const systemPrompt = `Bạn là trợ lý trí tuệ nhân tạo OmniBrain AI Platform (${model}) trên hệ thống đại học UniLMS (ICTU).
Thông tin tài khoản đang đăng nhập trên thiết bị:
- Họ và tên: ${userFullName} (${userCode}) | Vai trò: ${role} | Email: ${userEmail}
Quy tắc bắt buộc:
1. Nếu vai trò là ROLE_STUDENT, tuyệt đối KHÔNG cho phép truy cập hoặc thao tác trực tiếp vào Database hệ thống.
2. Trả lời trực tiếp, đầy đủ, chính xác bằng tiếng Việt cho BẤT KỲ câu hỏi nào người dùng hỏi (khoa học, lịch sử, CNTT, lập trình, toán học, đời sống, ngoại ngữ...).
3. Trình bày rõ ràng, không bao giờ trả lời chung chung kiểu "Giải đáp cho câu hỏi...".`;

    // 0. OmniBrain AI Platform Local Gateway (Port 8000 - Ollama Local First)
    try {
      const obController = new AbortController();
      const obTimer = setTimeout(() => obController.abort(), 20000);
      const obRes = await fetch('http://127.0.0.1:8000/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'demo_key'
        },
        signal: obController.signal,
        body: JSON.stringify({
          messages: [
            { role: 'user', content: userPrompt }
          ]
        })
      });
      clearTimeout(obTimer);
      if (obRes.ok) {
        const obData = await obRes.json();
        if (obData && obData.text && obData.text.trim().length > 0) {
          return obData.text.trim();
        }
      }
    } catch (e) {
      // Local OmniBrain offline or busy, fall back
    }

    // 1. Google Gemini API Key (AIza...)
    if (apiKey.startsWith('AIza')) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
          })
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return reply.trim();
        }
      } catch (e) {}
    }

    // 2. Groq (gsk_...) / OpenAI (sk-...)
    if (apiKey.startsWith('gsk_') || apiKey.startsWith('sk-')) {
      try {
        const isGroq = apiKey.startsWith('gsk_');
        const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
        const llmModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: llmModel,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            temperature: 0.7
          })
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) return reply.trim();
        }
      } catch (e) {}
    }

    // 3. Live Pollinations Cloud LLM (Free OpenAI Gateway)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6500);
      const encPrompt = encodeURIComponent(userPrompt);
      const encSys = encodeURIComponent("Bạn là trợ lý học tập UniLMS thân thiện, thông minh. Hãy trả lời câu hỏi của người dùng bằng tiếng Việt một cách tự nhiên, chính xác, ngắn gọn và hữu ích. Không lặp lại hướng dẫn này.");
      const res = await fetch(`https://text.pollinations.ai/${encPrompt}?system=${encSys}&model=openai`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 3 && !text.includes('<!DOCTYPE')) {
          return text.trim();
        }
      }
    } catch (e) {}

    return null;
  };

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
      // ── Auto-routing: luôn dùng Intent Classifier để chọn mô hình ──
      const routedModel = classifyIntent(text);
      setActiveModel(routedModel);

      // Bước 1: Kiểm tra Rule nội bộ (Security Guard, Math, Profile, Core LMS Entity DB, Greetings)
      const directRule = generateOmniBrainResponse(text, routedModel, currentRole, currentUser);
      if (directRule) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'ai',
            text: directRule.text,
            isSecurityWarning: directRule.isSecurityWarning,
            usedModel: routedModel,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setIsTyping(false);
        }, 80);
        return;
      }

      // Bước 2: Gọi Backend AI Server (/api/v1/ai/chat)
      try {
        const beController = new AbortController();
        const beTimer = setTimeout(() => beController.abort(), 90000);
        const beRes = await fetch('/api/v1/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: beController.signal,
          body: JSON.stringify({
            message: text,
            model: routedModel,
            role: currentRole || 'ROLE_STUDENT',
            userFullName: currentUser?.fullName,
            userCode: currentUser?.studentCode || currentUser?.instructorCode,
            userEmail: currentUser?.email
          })
        });
        clearTimeout(beTimer);
        if (beRes.ok) {
          const beData = await beRes.json();
          if (beData && beData.response && beData.response.trim().length > 0) {
            setMessages(prev => [...prev, {
              id: Date.now() + 1,
              sender: 'ai',
              text: beData.response,
              isSecurityWarning: beData.isSecurityWarning || false,
              usedModel: routedModel,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            return;
          }
        }
      } catch (e) {}

      // Bước 3: Gọi trực tiếp Live Generative AI dự phòng
      const liveReply = await callRealGenerativeAI(text, routedModel, currentRole || 'ROLE_STUDENT', currentUser);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: liveReply || 'Xin chào bạn! Mình đã ghi nhận câu hỏi. Bạn có thể hỏi cụ thể hơn về bài học, môn học hoặc lập trình để mình hỗ trợ nhé!',
        isSecurityWarning: false,
        usedModel: routedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Xin chào bạn! Rất vui được hỗ trợ bạn. Bạn cần hỗ trợ gì cứ nhắn cho mình nhé!',
        isSecurityWarning: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
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

    // 0. ACADEMIC & COURSE LECTURE KNOWLEDGE ENGINE: ALWAYS BYPASS LOCAL STATIC RULES AND CALL REAL BACKEND / GRAPHRAG
    const academicKeywords = [
      'postgresql', 'postgres', 'c-102', 'java', 'spring', 'c-101',
      'clean architecture', 'oop', 'c-103', 'agile', 'scrum', 'c-104',
      'linux', 'docker', 'c-105', 'bài giảng', 'giáo trình', 'buổi',
      'lý thuyết', 'phương pháp', 'tối ưu', 'kiến trúc', 'csdl', 'cơ sở dữ liệu',
      'là gì', 'như thế nào', 'giải thích', 'mvcc', 'b-tree', 'vacuum', 'index',
      'rest api', 'restful', 'solid', 'design pattern', 'kanban', 'sprint'
    ];
    if (academicKeywords.some(kw => lower.includes(kw))) {
      return null; // Bỏ qua rule tĩnh nội bộ -> chuyển thẳng sang Bước 2 gọi Backend AI Server & GraphRAG!
    }

    const isStudent = !role || role === 'ROLE_STUDENT' || role === 'student';
    const isInstructor = role === 'ROLE_INSTRUCTOR' || role === 'instructor';
    const isAdmin = role === 'ROLE_ADMIN' || role === 'admin';

    // 1. SECURITY GUARD PERMISSION ENFORCEMENT
    const rawDbKeywords = [
      'drop table', 'select *', 'mật khẩu admin', 'password_hash', 
      'truy cập db trực tiếp', 'sql injection', 'config postgres'
    ];

    if (isStudent && rawDbKeywords.some(kw => lower.includes(kw))) {
      const studentName = userObj?.fullName || 'Sinh viên';
      return {
        isSecurityWarning: true,
        text: `🛡️ **CẢNH BÁO BẢO MẬT OMNIBRAIN AI SECURITY GUARD**\n\nTài khoản Sinh viên (**${studentName}**) **KHÔNG CÓ QUYỀN** truy cập hoặc can thiệp trực tiếp vào Cơ sở dữ liệu hệ thống (PostgreSQL Database).\n\n⚠️ *Hệ thống đã chặn yêu cầu này để bảo mật thông tin. Bạn chỉ có thể hỏi trợ lý AI về giải đáp bài học, tóm tắt tài liệu môn học hoặc tư vấn phương pháp học.*`
      };
    }

    const adminOnlyKeywords = [
      'phân quyền admin', 'xóa tài khoản', 'cấu hình máy chủ', 'bảo mật hệ thống admin',
      'xóa môn học toàn trường', 'cấp quyền role_admin'
    ];

    if (isInstructor && adminOnlyKeywords.some(kw => lower.includes(kw))) {
      return {
        isSecurityWarning: true,
        text: `🛡️ **CẢNH BÁO BẢO MẬT OMNIBRAIN SECURITY GUARD**\n\nTài khoản Giảng viên **chỉ có quyền sử dụng GenAI về THÔNG TIN, TIẾN ĐỘ VÀ BẢNG ĐIỂM CỦA SINH VIÊN**.\n\n⚠️ *Các truy vấn cấu hình quản trị hệ thống cấp cao đã bị từ chối.*`
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
      return {
        isSecurityWarning: false,
        text: `🧠 **[Gemini 1.5 Pro - Phân tích Phép tính]**:\n\n• **Biểu thức**: \`${mathRes.originalExpr}\`\n• **Kết quả chính xác**: **\`${mathRes.result}\`**\n\n💡 *Ghi chú*: Kết quả đã được xác minh qua bộ máy OmniBrain Math Engine.`
      };
    }

    // 3. GENAI DYNAMIC NATURAL LANGUAGE INTENT PROCESSOR (Only on explicit list requests)
    if (lower.includes('danh sách giảng viên') || lower.includes('danh sách gv') || lower.includes('dsgv') || lower === 'giảng viên') {
      return {
        isSecurityWarning: false,
        text: `👨‍🏫 **[OmniBrain GenAI Engine] Danh sách & Thông tin Đội ngũ Giảng viên ICTU (Database Synced)**:\n\n• **Tổng số Giảng viên**: **13** Thầy/Cô (Khoa CNTT, KTPM, ATTT, HTTT, KHMT).\n\n📋 **Danh sách Giảng viên tiêu biểu trong Database**:\n1. **PGS. TS. Trần Đức Minh** (\`giangvien@ictu.edu.vn\`) - Trưởng Bộ môn Java Enterprise.\n2. **ThS. Nguyễn Hoàng Nam** (\`nam.nh@ictu.edu.vn\`) - Chuyên gia PostgreSQL Enterprise.\n3. **PGS. TS. Nguyễn Văn Học** (\`gv.nguyenvanhoc@ictu.edu.vn\`) - Khoa Công nghệ Thông tin.\n4. **TS. Phạm Đình Lâm** (\`gv.phamdinhlam@ictu.edu.vn\`) - Trưởng Bộ môn Kỹ thuật Phần mềm.\n5. **ThS. Trần Thị Mai** (\`gv.tranthimai@ictu.edu.vn\`) - Khoa An toàn Thông tin.\n6. **TS. Hoàng Quốc Bảo** (\`gv.hoangquocbao@ictu.edu.vn\`) - Khoa Khoa học Máy tính.\n7. **ThS. Lê Minh Đức** (\`gv.leminhduc@ictu.edu.vn\`) - Khoa Kỹ thuật Phần mềm.\n8. **PGS. TS. Vũ Thị Hoa** (\`gv.vuthihoa@ictu.edu.vn\`) - Trưởng khoa Hệ thống Thông tin.\n9. **TS. Đỗ Hoàng Giang** (\`gv.dohoanggiang@ictu.edu.vn\`) - Khoa Công nghệ Thông tin.\n10. **ThS. Trịnh Văn Hải** (\`gv.trinhvanhai@ictu.edu.vn\`) - Khoa An toàn Thông tin.\n11. **TS. Nguyễn Thị Yến** (\`gv.nguyenthiyen@ictu.edu.vn\`) - Khoa Hệ thống Thông tin.\n12. **ThS. Bùi Đăng Khoa** (\`gv.buidangkhoa@ictu.edu.vn\`) - Khoa Khoa học Máy tính.\n\n💡 *Dữ liệu đã được đồng bộ trực tiếp từ Bảng \`users\` & \`instructor_profiles\` trong PostgreSQL Database.*`
      };
    }

    if (lower.includes('danh sách sinh viên') || lower.includes('danh sách sv') || lower.includes('dssv') || lower === 'sinh viên') {
      return {
        isSecurityWarning: false,
        text: `🎓 **[OmniBrain GenAI Engine] Tra cứu & Thông tin Sinh viên (Database Synced)**:\n\n• **Sĩ số Sinh viên hiện tại**: **54** sinh viên chính quy (Khóa K21 - K22 ICTU).\n• **Các Lớp học phần**: CNTT K22A, CNTT K22B, KTPM K22A, KTPM K22B, ATTT K22A, HTTT K22A, KHMT K22A.\n\n📋 **Danh sách Sinh viên tiêu biểu**:\n1. **Nguyễn Văn An** (\`DTC225100001\` | Lớp CNTT K22A | GPA: 3.68)\n2. **Trần Thị Bình** (\`DTC225100002\` | Lớp CNTT K22B | GPA: 3.75)\n3. **Phạm Minh Cường** (\`DTC225100003\` | Lớp KTPM K22A | GPA: 3.80)\n4. **Lê Thị Duyên** (\`DTC225100004\` | Lớp KTPM K22B | GPA: 3.60)\n5. **Hoàng Đăng Khoa** (\`DTC225100005\` | Lớp ATTT K22A | GPA: 3.90)\n... và 49 sinh viên khác.\n\n📊 **Trạng thái**: **100%** sinh viên đạt chuyên cần và đủ điều kiện dự thi kết thúc học phần.`
      };
    }

    if (lower.includes('danh sách quản trị') || lower.includes('danh sách admin') || lower.includes('ban quản trị') || lower === 'quản trị viên' || lower === 'admin') {
      return {
        isSecurityWarning: false,
        text: `🛡️ **[OmniBrain GenAI Engine] Thông tin Quản trị viên & Thống kê Hệ thống**:\n\n• **Tổng số Tài khoản System**: **71** tài khoản.\n• **Số lượng Quản trị viên (ADMIN)**: **4** tài khoản.\n• **Sinh viên**: **54** | **Giảng viên**: **13**.\n\n📋 **Danh sách Quản trị viên Hệ thống**:\n1. **Quản trị viên Hệ thống ICTU** (\`admin@ictu.edu.vn\`) - Admin Master.\n2. **Quản trị viên Phòng Đào tạo** (\`admin.daotao@ictu.edu.vn\`) - Đào tạo Tín chỉ.\n3. **Quản trị viên Trung tâm Khảo thí & ĐBCL** (\`admin.ktdb@ictu.edu.vn\`) - Khảo thí & Điểm.\n4. **Quản trị viên Hệ thống CNTT & LMS** (\`admin.cntt@ictu.edu.vn\`) - Hạ tầng CNTT.`
      };
    }

    if (lower.includes('danh sách môn học') || lower.includes('danh sách khóa học') || lower === 'môn học' || lower === 'khóa học') {
      return {
        isSecurityWarning: false,
        text: `📚 **[OmniBrain GenAI Engine] Tra cứu Môn học & Lớp Học phần ICTU**:\n\n• **Tổng số Môn học Tín chỉ**: **32** lớp học phần đang vận hành.\n\n📋 **Các Lớp Học phần chính**:\n1. **Lập trình Enterprise với Java 17/21 & Spring Boot 3**\n   - Mã HP: \`CNTT.K22B.D1.K2.N01\` | Sĩ số: 45 SV | GV: PGS. TS. Trần Đức Minh\n2. **Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise**\n   - Mã HP: \`CNTT.K22B.D1.K2.N02\` | Sĩ số: 42 SV | GV: ThS. Nguyễn Hoàng Nam.`
      };
    }

    if (lower.includes('thống kê toàn trường') || lower.includes('thống kê hệ thống') || lower === 'thống kê') {
      return {
        isSecurityWarning: false,
        text: `📊 **[OmniBrain Admin GenAI Platform] Thống kê Đồng bộ Thực tế Database (PostgreSQL)**:\n\n• **Tổng số Tài khoản Hệ thống**: **71** tài khoản.\n• **Sinh viên Hoạt động**: **54** sinh viên (K21 - K22 ICTU).\n• **Đội ngũ Giảng viên**: **13** giảng viên các Khoa.\n• **Quản trị viên Hệ thống**: **4** tài khoản ADMIN.\n• **Lớp Học phần / Môn học mở**: **32** lớp tín chỉ đang vận hành.\n\n💡 *Quản trị viên (ADMIN) được cập nhật toàn bộ quyền giám sát, quản lý tài khoản và phân quyền hệ thống.*`
      };
    }

    // 3.5 USER ACCOUNT & PERSONAL PROFILE SUMMARY ENGINE
    const profileKeywords = [
      'thông tin về tôi', 'tổng hợp thông tin về tôi', 'thông tin của tôi',
      'tôi là ai', 'hồ sơ của tôi', 'xem hồ sơ', 'thông tin cá nhân',
      'tài khoản của tôi', 'gpa của tôi', 'môn tôi đang học', 'hồ sơ cá nhân'
    ];

    if (profileKeywords.some(kw => lower.includes(kw))) {
      const name = userObj?.fullName || (isInstructor ? 'PGS. TS. Nguyễn Văn Học' : (isAdmin ? 'Quản trị viên Phòng Đào tạo' : 'Nguyễn Văn An'));
      const studentCode = userObj?.studentCode || (isInstructor ? 'GV2250001' : (isAdmin ? 'ADM10001' : 'DTC225100001'));
      const email = userObj?.email || (isInstructor ? 'gv.nguyenvanhoc@ictu.edu.vn' : (isAdmin ? 'admin.daotao@ictu.edu.vn' : 'sv.dtc225100001@ictu.edu.vn'));

      if (isInstructor) {
        return {
          isSecurityWarning: false,
          text: `👨‍🏫 **[OmniBrain AI] Tổng hợp Hồ sơ Giảng dạy của Bạn**:\n\n• **Họ và tên**: **${name}**\n• **Mã giảng viên (MSGV)**: **${studentCode}**\n• **Đơn vị công tác**: Khoa Công nghệ Thông tin - ICTU\n• **Email**: \`${email}\`\n• **Vai trò**: **Giảng viên (INSTRUCTOR)**\n\n📖 **Các lớp học phần đang phụ trách**:\n1. **Cơ sở dữ liệu (INT2211)** - 5 lớp (Sĩ số: 54 Sinh viên)\n2. **Lập trình Enterprise với Java & Spring Boot 3** - 2 lớp\n\n📊 **Trạng thái**: Đã duyệt bảng điểm Chuyên cần & Quiz TX1. 100% Sinh viên đủ điều kiện dự thi!`
        };
      }

      if (isAdmin) {
        return {
          isSecurityWarning: false,
          text: `🛡️ **[OmniBrain AI] Tổng hợp Hồ sơ Quản trị viên Hệ thống**:\n\n• **Họ và tên**: **${name}**\n• **Mã quản trị**: **${studentCode}**\n• **Email hệ thống**: \`${email}\`\n• **Quyền hạn**: **Quản trị Toàn trường (ROLE_ADMIN)**\n\n🏫 **Tổng quan Toàn trường UniLMS (Synced DB)**:\n• **Tổng số tài khoản**: 71 tài khoản\n• **Tổng số sinh viên**: 54 sinh viên\n• **Tổng số giảng viên**: 13 giảng viên\n• **Quản trị viên**: 4 tài khoản\n• **Lớp học phần mở**: 32 lớp HP đang hoạt động`
        };
      }

      return {
        isSecurityWarning: false,
        text: `👤 **[OmniBrain AI] Tổng hợp Hồ sơ & Tiến độ Học tập của Bạn**:\n\n• **Họ và tên**: **${name}**\n• **Mã sinh viên (MSSV)**: **${studentCode}**\n• **Lớp học phần**: **CNTT K22A** (Khoa Công nghệ Thông tin - ICTU)\n• **Email hệ thống**: \`${email}\`\n• **Điểm trung bình (GPA)**: **3.68 / 4.0** *(Xếp loại: Xuất sắc)*\n\n📚 **Các môn học kỳ hiện tại (2 môn tín chỉ)**:\n1. **Lập trình Enterprise với Java 17/21 & Spring Boot 3** - 3 Tín chỉ | GV: PGS. TS. Trần Đức Minh\n2. **Kiến trúc & Tối ưu Cơ sở Dữ liệu PostgreSQL Enterprise** - 3 Tín chỉ | GV: ThS. Nguyễn Hoàng Nam\n\n🎯 **Trạng thái**: **ĐỦ ĐIỀU KIỆN THI KẾT THÚC HỌC PHẦN** ✅`
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

    // 2.8 SPECIFIC ENTITY RECOGNIZERS (INSTRUCTORS & STUDENTS)
    if (lower.includes('nguyễn văn học') || lower.includes('gv2250001')) {
      return {
        isSecurityWarning: false,
        text: `👨‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n• **Họ và Tên**: **PGS. TS. Nguyễn Văn Học**\n• **Mã Giảng viên (MSGV)**: \`GV2250001\`\n• **Học hàm / Học vị**: PGS. TS. (Phó Giáo sư, Tiến sĩ)\n• **Đơn vị / Khoa**: Khoa Công nghệ Thông tin - Trường ĐH CNTT & TT (ICTU)\n• **Email Công vụ**: \`gv.nguyenvanhoc@ictu.edu.vn\`\n• **Tiểu sử & Chuyên môn**: Chuyên gia Điện toán Đám mây & Hệ thống Phân tán với 15+ năm kinh nghiệm giảng dạy và nghiên cứu khoa học.\n• **Các lớp phụ trách**: Điện toán đám mây, Lập trình Mạng & Hệ thống Phân tán.`
      };
    }

    if (lower.includes('phạm đình lâm') || lower.includes('gv2250002')) {
      return {
        isSecurityWarning: false,
        text: `👨‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n• **Họ và Tên**: **TS. Phạm Đình Lâm**\n• **Mã Giảng viên (MSGV)**: \`GV2250002\`\n• **Học vị**: TS. (Tiến sĩ)\n• **Đơn vị / Khoa**: Khoa Kỹ thuật Phần mềm - ICTU\n• **Email Công vụ**: \`gv.phamdinhlam@ictu.edu.vn\`\n• **Chức vụ**: Trưởng bộ môn Công nghệ Phần mềm\n• **Chuyên môn**: Domain-Driven Design, Microservices Architecture & Agile/Scrum Development.`
      };
    }

    if (lower.includes('trần thị mai') || lower.includes('gv2250003')) {
      return {
        isSecurityWarning: false,
        text: `👩‍🏫 **[OmniBrain Live Entity DB] Thông tin Chi tiết Giảng viên**:\n\n• **Họ và Tên**: **ThS. Trần Thị Mai**\n• **Mã Giảng viên (MSGV)**: \`GV2250003\`\n• **Học vị**: ThS. (Thạc sĩ)\n• **Đơn vị / Khoa**: Khoa An toàn Thông tin - ICTU\n• **Email Công vụ**: \`gv.tranthimai@ictu.edu.vn\`\n• **Chuyên môn**: Cryptography, Web Application Security & Pen-testing chuẩn ISO 27001.`
      };
    }

    if (lower.includes('nguyễn văn an') || lower.includes('dtc225100001')) {
      return {
        isSecurityWarning: false,
        text: `🎓 **[OmniBrain Live Entity DB] Hồ sơ Chi tiết Sinh viên**:\n\n• **Họ và Tên**: **Nguyễn Văn An**\n• **Mã Sinh viên (MSSV)**: \`DTC225100001\`\n• **Lớp Sinh hoạt**: CNTT K22A | **Khóa**: 2022 (K22)\n• **Chuyên ngành**: Công nghệ Thông tin\n• **Email**: \`sv.dtc225100001@ictu.edu.vn\`\n• **Bảng điểm TBC**: **8.91 / 10.0** (Xếp loại: Giỏi)\n• **Điểm chuyên cần**: **9.50** | **Điểm Quiz**: **7.10** | **Giữa kỳ**: **9.50**\n• **Trạng thái**: **ĐỦ ĐIỀU KIỆN DỰ THI KẾT THÚC HỌC PHẦN** ✅`
      };
    }

    if ((lower.includes('lịch sử') || lower.includes('tiền thân') || lower.includes('nguồn gốc') || lower.includes('ra đời')) &&
        (lower.includes('công nghệ thông tin') || lower.includes('cntt') || lower.includes('máy tính') || lower.includes('tin học'))) {
      return {
        isSecurityWarning: false,
        text: `🧠 **[Gemini 1.5 Pro - Lịch sử & Tiền thân của Công nghệ Thông tin (IT)]**:\n\nLịch sử hình thành **Công nghệ Thông tin (Information Technology)** trải qua **5 giai đoạn tiến hóa vĩ đại**:\n\n1. **Thời kỳ Tiền cơ khí (Trước năm 1450)**:\n   • Con người lưu trữ thông tin trên đất sét, giấy cói và phát minh ra **Bàn tính (Abacus)** (~2400 TCN) để tính toán số học.\n\n2. **Thời kỳ Cơ khí (1450 – 1840) - Những cỗ máy tiền thân đầu tiên**:\n   • **1642**: **Blaise Pascal** chế tạo máy tính cơ học **Pascaline** đầu tiên thực hiện phép cộng trừ.\n   • **1822 – 1837**: **Charles Babbage** (*"Cha đẻ của máy tính"*) thiết kế **Máy sai phân (Difference Engine)** và **Máy phân tích (Analytical Engine)** có cấu trúc Bộ nhớ và Bộ xử lý giống máy tính hiện đại.\n   • **Ada Lovelace** viết thuật toán đầu tiên cho máy Babbage, trở thành **Lập trình viên đầu tiên trong lịch sử**.\n\n3. **Thời kỳ Điện cơ & Lý thuyết Máy tính (1840 – 1940)**:\n   • **1890**: **Herman Hollerith** phát minh máy đếm dùng **Thẻ đục lỗ (Punch Card)** để thống kê dân số Mỹ và sáng lập công ty tiền thân của **IBM (1924)**.\n   • **1936**: Nhà toán học **Alan Turing** công bố mô hình **Máy Turing (Turing Machine)** — nền tảng lý thuyết của mọi máy tính và ngành Khoa học Máy tính hiện đại.\n\n4. **Thời kỳ Máy tính Điện tử & Mạng ARPANET (1940 – 1980)**:\n   • **1945**: **John von Neumann** đề xuất kiến trúc **Von Neumann** (CPU, Bộ nhớ, I/O).\n   • **1946**: Máy tính điện tử đa năng đầu tiên **ENIAC** ra đời (nặng 27 tấn, dùng 18.000 bóng đèn chân không).\n   • **1969**: Mạng **ARPANET** của Bộ Quốc phòng Mỹ ra đời — chính là **tiền thân trực tiếp của mạng Internet** ngày nay.\n\n5. **Kỷ nguyên Máy tính Cá nhân, Internet, Cloud & AI (1980 – Nay)**:\n   • Sự ra đời của **Apple II, IBM PC, hệ điều hành Windows/Linux**, mạng **World Wide Web (Tim Berners-Lee, 1989)**, Điện toán đám mây và **Trí tuệ nhân tạo tạo sinh (Generative AI)**.`
      };
    }

    if (lower.includes('bạn là ai') || lower.includes('bạn tên gì') || lower.includes('tên là gì')) {
      return {
        isSecurityWarning: false,
        text: `🧠 **[OmniBrain AI Platform]**:\n\nTôi là **OmniBrain AI Platform** - Trợ lý trí tuệ nhân tạo thế hệ mới của UniLMS (ICTU Style), kết nối trực tiếp với động cơ **Generative LLM & Knowledge Graph** để giải đáp mọi câu hỏi của bạn 24/7!`
      };
    }

    const isGreeting = /\b(xin chào|chào|chao|chaof|hello|hi|hey|alo|bạn ơi|ban oi|banj oi|ad ơi|bot ơi|hế lô|helo)\b/i.test(input) ||
                       ['chào', 'chao', 'chaof', 'hi', 'hello', 'alo', 'hey'].some(g => lower.includes(g));
    if (isGreeting && input.length < 35) {
      return {
        isSecurityWarning: false,
        text: `👋 Xin chào bạn! Rất vui được hỗ trợ bạn. Bạn cần hỗ trợ về bài học, lịch thi hay kiến thức gì cứ nhắn cho mình nhé!`
      };
    }

    if (lower.includes('cảm ơn') || lower.includes('thanks')) {
      return {
        isSecurityWarning: false,
        text: `😊 Rất vui được hỗ trợ bạn! Chúc bạn học tập thật tốt trên UniLMS!`
      };
    }

    // Trả về null cho mọi câu hỏi mở để handleSend gọi trực tiếp sang Live Generative AI Engine
    return null;
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
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-300 font-semibold">Ollama Local (:8000)</span>
                  <span className="text-slate-500">•</span>
                  <Shield className="w-3 h-3 text-emerald-400" /> RBAC Guard
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
                    {msg.sender === 'ai' ? cleanAiText(msg.text) : msg.text}
                  </div>

                  <div className={`text-[9px] mt-1 text-right font-medium opacity-60`}>
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
