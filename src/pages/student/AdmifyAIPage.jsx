import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";
import { convertTextToDual } from "../../utils/currency";
import {
  Sparkles,
  Bot,
  User,
  Send,
  Trash2,
  Copy,
  Check,
  Building2,
  Award,
  ArrowRight,
  Calculator,
  FileEdit,
  GraduationCap,
  Globe,
  Clock,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

// Knowledge base for Admify AI smart contextual answers
const PRESET_TOPICS = [
  {
    label: "Zero / Low Tuition in Germany",
    query: "Which German public universities offer zero tuition programs for international students?",
  },
  {
    label: "Full Scholarships (20 Countries)",
    query: "List top government scholarships like DAAD, Chevening, Fulbright, and MEXT with stipend amounts.",
  },
  {
    label: "Admission Probability Check",
    query: "What are my chances for Top 50 universities with GPA 3.7 and IELTS 7.5?",
  },
  {
    label: "1 Free Application Policy",
    query: "How does the 1 Free Direct Application work on Admify?",
  },
  {
    label: "SOP & LOR Advice",
    query: "What are the most critical sections to include in my Master's SOP?",
  },
  {
    label: "Fall 2026 Deadlines",
    query: "When are the upcoming admission deadlines for UK, USA, and European universities?",
  },
];

const INITIAL_MESSAGES = [
  {
    id: "msg-welcome-1",
    sender: "bot",
    time: "Just now",
    text: `Hello! 👋 I am **Admify AI**, your personal global admissions and scholarship advisor.

I can guide you on:
• **Authentic Universities & Programs** across all 20 study destination countries (UK, USA, Canada, Germany, France, Australia, Japan, etc.)
• **Government & Institutional Scholarships** (Chevening, DAAD, Fulbright, MEXT, GKS, etc.)
• **1 Free Direct Application** submission or Agency Assistance
• **SOP & LOR writing strategies** and admission probability scoring

All financial amounts are displayed in **Bangladeshi Taka (৳)** with **US Dollar ($)**. How can I help you today?`,
    suggestions: [
      "Find zero-tuition universities in Germany",
      "Show top scholarships for Fall 2026",
      "How to claim my 1 free direct application",
    ],
  },
];

function generateBotResponse(prompt, user) {
  const q = prompt.toLowerCase();
  const gpa = user?.gpa || "3.7";

  if (q.includes("free") && (q.includes("application") || q.includes("apply") || q.includes("direct"))) {
    return {
      text: `### 🎓 Admify 1 Free Application Guarantee

Every registered student on Admify receives **1 FREE Direct Application** without paying any platform service fee!

**How to use it:**
1. Browse to **[Find Universities](/student/universities)** or **[Direct Applications](/student/direct-applications)**.
2. Select your target university and program (e.g. *Stanford, Oxford, TUM, University of Toronto*).
3. Attach your verified documents (Transcripts, SOP, IELTS).
4. Click **Submit Application** — your free tier waiver is automatically applied!

Additional applications can be submitted using credits from your **[Wallet](/student/wallet)** or you can request competitive bids through **[Agency Assistance](/student/agency-assistance)**.`,
      actions: [
        { label: "Go to Direct Applications", path: "/student/direct-applications" },
        { label: "Explore Universities", path: "/student/universities" },
      ],
    };
  }

  if (q.includes("germany") || q.includes("tum") || q.includes("heidelberg") || q.includes("zero tuition")) {
    return {
      text: `### 🇩🇪 Germany Study Guide: Zero Tuition Public Universities

German public universities charge **€0 tuition fees** for international students (students only pay a semester contribution fee of approx. **৳31,200 – ৳46,800 ($250 – $400 / semester)** which includes regional transit).

**Top Ranked Institutions on Admify:**
• **Technical University of Munich (TUM)**: QS #28 • Programs: *M.Sc. Informatics, Data Engineering* • Deadlines: May 31 / Jan 15
• **Heidelberg University**: QS #87 • Programs: *M.Sc. Biomedical Sciences, Scientific Computing* • Deadlines: July 15 / Jan 15

**Top German Scholarships:**
• **DAAD Helmut-Schmidt Program**: 100% Tuition Waiver + **৳112,000 / mo (€934 / mo) living stipend** + roundtrip flights.
• **Deutschlandstipendium**: **৳36,000 / mo (€300 / mo)** national merit grant.`,
      actions: [
        { label: "View German Universities", path: "/student/universities?country=Germany" },
        { label: "View DAAD Scholarships", path: "/student/scholarships?country=Germany" },
      ],
    };
  }

  if (q.includes("scholarship") || q.includes("daad") || q.includes("chevening") || q.includes("fulbright") || q.includes("mext") || q.includes("grant")) {
    return {
      text: `### 💰 Prestigious Global Scholarships (20 Countries)

Here are the highest-funded authentic scholarship opportunities available on Admify:

1. **United Kingdom — Chevening Scholarships**:
   • Coverage: 100% Tuition + **৳225,000 / mo (£1,500 / mo)** stipend + flights.
   • Target: 1-Year Master's degrees at any UK university.

2. **United States — Fulbright Foreign Student Program**:
   • Coverage: Full Tuition + **৳240,000 – ৳360,000 / mo ($2,000 – $3,000 / mo)** living grant + medical.

3. **Germany — DAAD Scholarships**:
   • Coverage: Full semester fee waiver + **৳112,000 / mo (€934 / mo)** living allowance.

4. **Japan — MEXT Government Scholarship**:
   • Coverage: 100% University fee exemption + **৳115,000 / mo (¥144,000 / mo)** allowance.

5. **South Korea — Global Korea Scholarship (GKS)**:
   • Coverage: Complete tuition + **৳90,000 / mo (₩1,000,000 / mo)** stipend.`,
      actions: [
        { label: "Open Scholarships Portal", path: "/student/scholarships" },
        { label: "Calculate Probability", path: "/student/probability" },
      ],
    };
  }

  if (q.includes("sop") || q.includes("statement") || q.includes("lor") || q.includes("essay") || q.includes("letter")) {
    return {
      text: `### ✍️ High-Impact Statement of Purpose (SOP) Blueprint

For competitive admissions, universities look for 5 key sections:

1. **Hook & Academic Genesis (15%)**: Why this specific field excites you. Avoid cliché childhood stories; discuss a transformative project or question.
2. **Technical Acumen & Project Proof (35%)**: Specific undergraduate research, datasets manipulated, software built, or methodologies mastered.
3. **Target University Synergy (25%)**: Name 2 specific faculty members, laboratories, or elective courses that align with your thesis goals.
4. **Post-Graduation Roadmap (15%)**: Clear 3-5 year trajectory in industry or academia.
5. **Conclusion & Value Contribution (10%)**: How your international perspective enriches the campus cohort.

*Tip: You can use our AI SOP Generator to create a tailored initial draft!*`,
      actions: [
        { label: "Generate SOP Now", path: "/student/sop-generator" },
        { label: "Generate Academic LOR", path: "/student/lor-generator" },
      ],
    };
  }

  if (q.includes("probability") || q.includes("chance") || q.includes("gpa") || q.includes("score") || q.includes("ielts")) {
    return {
      text: `### 📊 Admission Probability Analysis

Based on an applicant profile with **GPA ${gpa}** and strong language credentials:

• **Top 20 Ivy / Oxbridge / Go8 Tier**: ~65% - 78% (Competitive Reach — requires publication or specialized project portfolio)
• **Top 50 - 100 Global Universities**: ~82% - 94% (**High Probability Match**)
• **Leading European Public Universities**: ~90% - 97% (**Strong Match**)

**Recommended Action Plan:**
1. Target 2 "Safe" universities, 3 "Core" matches, and 1-2 "Reach" schools.
2. Ensure IELTS is **7.0+ overall** (minimum 6.5 per band) for maximum scholarship eligibility.`,
      actions: [
        { label: "Run AI Probability Calculator", path: "/student/probability" },
        { label: "View Matched Universities", path: "/student/recommendations" },
      ],
    };
  }

  if (q.includes("deadline") || q.includes("date") || q.includes("when") || q.includes("intake")) {
    return {
      text: `### ⏰ Upcoming Admission Deadlines for Fall 2026 Intake

• **United States**: Regular Decision typically closes **Jan 05 – Feb 01**; priority scholarship deadline **Dec 01 – Dec 15**.
• **United Kingdom**: UCAS / Postgraduate deadlines **Jan 15 – Mar 31** (Oxford/Cambridge: **Oct 15 / Jan 10**).
• **Germany**: Winter Semester application window opens **May 01 – July 15**.
• **Sweden & Finland**: Centralized application portal closes **Mid-January**.
• **Australia & New Zealand**: Semester 1 (Feb intake) closes **Nov 30**; Semester 2 (July intake) closes **May 31**.`,
      actions: [
        { label: "Browse All Universities", path: "/student/universities" },
        { label: "Direct Applications", path: "/student/direct-applications" },
      ],
    };
  }

  // Default dynamic response
  return {
    text: `### 💡 Admify AI Recommendation

Regarding **"${prompt.slice(0, 80)}"**:

Our global database has verified information across all **20 primary study destinations**:
• **North America**: United States, Canada
• **Europe**: United Kingdom, Germany, France, Netherlands, Ireland, Sweden, Finland, Norway, Denmark, Switzerland, Italy, Spain, Belgium, Austria
• **Asia-Pacific**: Japan, South Korea, Australia, New Zealand

You can filter tuition and living budgets calculated in **৳ Bangladeshi Taka (primary)** and **$ US Dollars (secondary)**.

Would you like me to recommend top universities for your profile, assess scholarship funding, or guide you through submitting your **1 Free Application**?`,
    actions: [
      { label: "AI Recommendations", path: "/student/recommendations" },
      { label: "Explore Scholarships", path: "/student/scholarships" },
      { label: "Direct Applications", path: "/student/direct-applications" },
    ],
  };
}

export default function AdmifyAIPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: query.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and streaming
    setTimeout(() => {
      const responseData = generateBotResponse(query, user);
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: responseData.text,
        actions: responseData.actions,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 700);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    toast.success("Chat history cleared");
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Assistant</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Intelligent Admissions Chatbot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <span>Admify AI Chatbot</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              Online
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ask anything about authentic universities, scholarships, admission probabilities, or application steps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/live-chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
          >
            <span>Switch to Live Human Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleClearChat}
            className="p-2.5 rounded-xl bg-[#0B1228] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Popular Inquiries
        </span>
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {PRESET_TOPICS.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(topic.query)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0B1228] hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-all whitespace-nowrap shrink-0 shadow-sm"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="rounded-3xl bg-[#0B1228] border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[640px]">
        {/* Chat Messages Scrollable Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isBot ? "items-start" : "items-start flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isBot
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-purple-600 text-white border border-purple-400"
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble & Content */}
                <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                    <span className="font-bold text-white">{isBot ? "Admify AI" : user?.name || "You"}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isBot
                        ? "bg-[#07142D] border border-slate-800 text-slate-200 shadow-lg"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-cyan-500/10 shadow-lg"
                    }`}
                  >
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split("\n").map((line, idx) => {
                        if (line.startsWith("### ")) {
                          return (
                            <h4 key={idx} className="text-base font-extrabold text-cyan-300 mt-2 mb-1">
                              {line.replace("### ", "")}
                            </h4>
                          );
                        }
                        if (line.startsWith("• ")) {
                          return (
                            <div key={idx} className="flex items-start gap-2 pl-1">
                              <span className="text-cyan-400">•</span>
                              <span>{line.replace("• ", "")}</span>
                            </div>
                          );
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>

                    {/* Action buttons if attached to bot response */}
                    {isBot && msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-800/80">
                        {msg.actions.map((act, idx) => (
                          <Link
                            key={idx}
                            to={act.path}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Copy button */}
                  {isBot && (
                    <div className="flex items-center gap-2 px-2">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#07142D] border border-slate-800 flex items-center gap-2 text-xs text-cyan-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Admify AI is formulating recommendation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Bar */}
        <div className="p-4 sm:p-5 bg-[#07142D] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about universities, admission chances, scholarships, deadlines, SOP..."
              className="flex-1 bg-[#0B1228] border border-slate-700/70 rounded-2xl px-5 py-3.5 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-5 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#050B1F] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
