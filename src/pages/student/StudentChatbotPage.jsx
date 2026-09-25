import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
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
  Headphones,
  CheckCheck,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  UserCheck,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import toast from "react-hot-toast";

// Helper to cleanly format text: strip regional indicator flags (e.g. "DE", "US") and convert **bold** into clean bold elements without any asterisks (*)
function cleanRegionalFlags(str) {
  if (!str) return "";
  // Strip regional indicator flag emojis that render as literal "DE", "GB", "US" etc.
  return str.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "").replace(/^DE\s+/i, "").trim();
}

function renderCleanFormattedText(text) {
  if (!text) return null;
  const cleaned = cleanRegionalFlags(text);
  
  // Split by bold patterns (**text**)
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldContent = part.slice(2, -2).replace(/\*/g, "");
      return (
        <strong key={idx} className="font-extrabold text-white">
          {boldContent}
        </strong>
      );
    }
    // Remove any stray asterisks
    const cleanPart = part.replace(/\*/g, "");
    return <span key={idx}>{cleanPart}</span>;
  });
}

const PRESET_TOPICS = [
  {
    label: "Zero Tuition in Germany",
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
    label: "SOP & LOR Guidelines",
    query: "What are the most critical sections to include in my Master's SOP?",
  },
];

const INITIAL_MESSAGES = [
  {
    id: "bot-init",
    sender: "bot",
    time: "Just now",
    text: `Hello! I am Admify AI, your personal admissions and scholarship advisor.

I can guide you on:
• Authentic Universities & Programs across all 20 countries (UK, USA, Canada, Germany, etc.)
• Government & Institutional Scholarships (DAAD, Chevening, Fulbright, MEXT, GKS)
• 1 Free Direct Application and admission requirements
• SOP & LOR writing guidelines

Please ask at least 4 inquiries with Admify AI. Once you complete 4 inquiries, you will unlock the option to transfer this session directly to an Admin Live Agent.`,
  },
];

function generateBotReply(prompt, user) {
  const q = prompt.toLowerCase();
  const gpa = user?.gpa || "3.7";

  if (q.includes("free") && (q.includes("application") || q.includes("apply") || q.includes("direct"))) {
    return {
      title: "Admify 1 Free Application Guarantee",
      text: `Every registered student on Admify receives 1 FREE Direct University Application with zero platform processing fee!

How to claim:
1. Browse to Find Universities in the sidebar.
2. Select your target university and program (Stanford, Oxford, TUM, Toronto, etc.).
3. Attach your verified documents (Transcripts, SOP, IELTS).
4. Click Submit Application — your free tier waiver is automatically applied!

Additional applications can be submitted using credits from your Wallet or you can request competitive bids through Agency Assistance.`,
    };
  }

  if (q.includes("germany") || q.includes("tum") || q.includes("heidelberg") || q.includes("zero tuition")) {
    return {
      title: "Germany Study Guide: Zero Tuition Public Universities",
      text: `German public universities charge €0 tuition fees for international students (students only pay a semester contribution fee of approx. ৳31,200 – ৳46,800 / semester ($250 – $400 / semester) which includes regional transit).

Top Institutions:
• Technical University of Munich (TUM): QS #28 • Programs: M.Sc. Informatics, Data Engineering
• Heidelberg University: QS #87 • Programs: M.Sc. Biomedical Sciences, Scientific Computing

Top German Scholarships:
• DAAD Helmut-Schmidt Program: 100% Tuition Waiver + ৳112,000 / mo (€934 / mo) living stipend + roundtrip flights.
• Deutschlandstipendium: ৳36,000 / mo (€300 / mo) national merit grant.`,
    };
  }

  if (q.includes("scholarship") || q.includes("grant") || q.includes("daad") || q.includes("chevening") || q.includes("fulbright") || q.includes("mext")) {
    return {
      title: "Prestigious Global Scholarships (20 Countries)",
      text: `Here are the highest-funded authentic scholarship opportunities available on Admify:

1. UK — Chevening Scholarships: 100% Tuition + ৳225,000 / mo (£1,500 / mo) living grant + flights.
2. USA — Fulbright Foreign Student Program: Full Tuition + ৳240,000 – ৳360,000 / mo ($2,000 – $3,000 / mo) stipend.
3. Germany — DAAD Scholarships: 100% Tuition Exemption + ৳112,000 / mo (€934 / mo) allowance.
4. Japan — MEXT Government Scholarship: Full Tuition Exemption + ৳115,000 / mo (¥144,000 / mo) stipend.
5. South Korea — Global Korea Scholarship (GKS): Full Degree Tuition + ৳90,000 / mo (₩1,000,000 / mo) stipend.`,
    };
  }

  if (q.includes("sop") || q.includes("statement") || q.includes("lor") || q.includes("essay")) {
    return {
      title: "High-Impact Statement of Purpose (SOP) Blueprint",
      text: `For competitive admissions, universities look for 5 key sections:

1. Hook & Academic Focus (15%): Specific academic challenge or curiosity that drove your ambition.
2. Technical Acumen & Project Proof (35%): Concrete undergraduate projects, datasets, algorithms, or lab accomplishments.
3. Target University Alignment (25%): Name 2 professors, labs, or specialized courses at the target university.
4. Career Trajectory (15%): Clear 3-5 year post-graduation milestone plan.
5. Value Contribution (10%): What unique perspective you bring to the campus cohort.`,
    };
  }

  if (q.includes("probability") || q.includes("chance") || q.includes("gpa") || q.includes("ielts")) {
    return {
      title: "Admission Probability Analysis",
      text: `Based on an applicant profile with GPA ${gpa} and strong English proficiency:

• Top 20 Ivy / Oxbridge / Go8 Tier: ~65% - 78% (Competitive Reach — requires publication or specialized project portfolio)
• Top 50 - 100 Global Universities: ~82% - 94% (High Probability Match)
• Leading European Public Universities: ~90% - 97% (Strong Match)

Recommended Action: Target 2 Safe universities, 3 Core matches, and 1-2 Reach schools. Maintain IELTS 7.0+ for maximum scholarship eligibility.`,
    };
  }

  return {
    title: "Admify AI Recommendation",
    text: `Regarding "${prompt.slice(0, 80)}":

Our global database covers all 20 primary study destinations with authentic QS rankings, verified admission requirements, and dual currency calculations in ৳ Bangladeshi Taka (primary) and $ US Dollars (secondary).

You can explore matched universities, evaluate full scholarships, or claim your 1 Free Direct Application through your student dashboard.`,
  };
}

export default function StudentChatbotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mode: "ai" or "live"
  const [chatMode, setChatMode] = useState("ai");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // User AI Message counter: Minimum 4 required to unlock live agent
  const [userAiMsgCount, setUserAiMsgCount] = useState(0);
  const canShowLiveAgent = userAiMsgCount >= 4;

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isTransferring]);

  // Transfer from AI to Live Human Agent (Admin Panel)
  const handleTransferToLiveAgent = async (reason = "Student requested live agent escalation") => {
    if (!canShowLiveAgent) {
      toast.error(`Please ask at least 4 questions to Admify AI first (${userAiMsgCount}/4 completed).`);
      return;
    }

    setIsTransferring(true);

    try {
      await api.post("/api/chat/message", {
        sessionId: `student_${user?._id || "local"}`,
        text: `[SYSTEM DISPATCH] Student ${user?.name || "Student"} transferred to Live Agent after ${userAiMsgCount} AI inquiries. Reason: ${reason}`,
        isLiveAgentRequest: true,
      });
    } catch (err) {
      console.warn("Backend chat dispatch notice:", err.message);
    }

    setTimeout(() => {
      const transferNotice = {
        id: `sys-${Date.now()}`,
        sender: "system",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: "Session transferred to Admify Admin Panel Live Desk. Senior Support Officer Alex Turner has joined your chat.",
      };

      const liveAgentGreeting = {
        id: `live-greet-${Date.now()}`,
        sender: "live_agent",
        agentName: "Alex Turner",
        agentRole: "Admin Support Desk • Senior Admissions Liaison",
        agentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Hello ${user?.name || "there"}! I am Alex Turner from the Admify Admin Panel Support Desk.

I have received your inquiry context from Admify AI. I can personally review your application status, verify university eligibility requirements, or escalate documents to our compliance team. How can I assist you right now?`,
      };

      setMessages((prev) => [...prev, transferNotice, liveAgentGreeting]);
      setChatMode("live");
      setIsTransferring(false);
      toast.success("Connected to Live Agent (Admin Support Desk)");
    }, 1200);
  };

  const handleSwitchBackToAI = () => {
    setChatMode("ai");
    const switchNotice = {
      id: `sys-${Date.now()}`,
      sender: "system",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: "Switched back to Admify AI Assistant mode. You can continue asking questions anytime.",
    };
    setMessages((prev) => [...prev, switchNotice]);
    toast.success("Switched to Admify AI mode");
  };

  const handleSendMessage = async (textToSend) => {
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

    // If currently in AI mode, increment user question count
    let currentCount = userAiMsgCount;
    if (chatMode === "ai") {
      currentCount = userAiMsgCount + 1;
      setUserAiMsgCount(currentCount);
    }

    const lower = query.toLowerCase();
    const isAskingForHuman =
      chatMode === "ai" &&
      (lower.includes("live agent") ||
        lower.includes("human") ||
        lower.includes("agent") ||
        lower.includes("transfer") ||
        lower.includes("admin") ||
        lower.includes("not satisfied") ||
        lower.includes("talk to someone"));

    // Enforce minimum 4 inquiries rule before transferring
    if (isAskingForHuman) {
      if (currentCount < 4) {
        setIsTyping(true);
        setTimeout(() => {
          const needed = 4 - currentCount;
          const guidanceMsg = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: `Please ask Admify AI at least 4 questions first so our engine can assess your profile and prepare a recommendation summary for the human agent.

You have completed ${currentCount} of 4 required AI inquiries (${needed} remaining). Please ask ${needed} more question${needed > 1 ? "s" : ""} to unlock the Live Agent transfer option!`,
          };
          setMessages((prev) => [...prev, guidanceMsg]);
          setIsTyping(false);
        }, 600);
        return;
      } else {
        handleTransferToLiveAgent(query);
        return;
      }
    }

    setIsTyping(true);

    if (chatMode === "live") {
      // In Live Agent Mode: Route to Admin Panel message box
      try {
        await api.post("/api/chat/message", {
          sessionId: `student_${user?._id || "local"}`,
          text: query.trim(),
          isLiveAgentRequest: true,
        });
      } catch (err) {
        console.warn("Live chat message post:", err.message);
      }

      // Simulate Live Agent response
      setTimeout(() => {
        let liveReply = `Thank you for your message. I have logged this inquiry into our Admin Panel ticket system and am verifying the records for you.`;
        if (lower.includes("free") || lower.includes("direct")) {
          liveReply = `Regarding your 1 Free Direct Application: Your profile has 1 free application credit ready to use. You can submit directly from the Direct Applications tab with zero platform charge.`;
        } else if (lower.includes("visa") || lower.includes("fund") || lower.includes("bank")) {
          liveReply = `Our Visa Compliance team has verified that bank solvency certificates must be dated within 28 days of your visa submission date. Let me know if you would like me to review your financial statement draft.`;
        }

        const agentMessage = {
          id: `live-${Date.now()}`,
          sender: "live_agent",
          agentName: "Alex Turner",
          agentRole: "Admin Support Desk",
          agentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: liveReply,
        };

        setMessages((prev) => [...prev, agentMessage]);
        setIsTyping(false);
      }, 1300);
    } else {
      // In AI Mode: Generate Bot Response
      setTimeout(() => {
        const responseData = generateBotReply(query, user);
        const botMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          title: responseData.title,
          text: responseData.text,
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 700);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setChatMode("ai");
    setUserAiMsgCount(0);
    toast.success("Chat history cleared");
  };

  const handleCopy = (text, id) => {
    const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "");
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1250px] mx-auto space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1228] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
              chatMode === "live"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-cyan-500/20"
            }`}
          >
            {chatMode === "live" ? <Headphones className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {chatMode === "live" ? "Live Agent (Admin Support Desk)" : "Admify AI Chatbot"}
              </h1>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${
                  chatMode === "live"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    chatMode === "live" ? "bg-emerald-400 animate-ping" : "bg-cyan-400"
                  }`}
                />
                <span>{chatMode === "live" ? "Live Agent Connected" : "AI Mode Active"}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {chatMode === "live"
                ? "Direct real-time session with Admin Panel support officer Alex Turner."
                : "Ask AI anything or complete 4 inquiries to unlock direct transfer to a Live Agent."}
            </p>
          </div>
        </div>

        {/* Action Toggle / Mode Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {chatMode === "ai" ? (
            canShowLiveAgent ? (
              <button
                onClick={() => handleTransferToLiveAgent("Student clicked Transfer to Live Agent")}
                disabled={isTransferring}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#050B1F] font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all animate-pulse"
              >
                <Headphones className="w-4 h-4" />
                <span>Transfer to Live Agent</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-[#07142D] border border-slate-800 text-[11px] font-medium text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Ask AI {4 - userAiMsgCount} more {4 - userAiMsgCount === 1 ? "question" : "questions"} for Live Agent ({userAiMsgCount}/4)</span>
              </div>
            )
          ) : (
            <button
              onClick={handleSwitchBackToAI}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Switch to AI Assistant</span>
            </button>
          )}

          <button
            onClick={handleClearChat}
            className="p-2.5 rounded-xl bg-[#07142D] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Inquiries (Shown in AI Mode) */}
      {chatMode === "ai" && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Quick Inquiries
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
      )}

      {/* Main Single Chatbox Container */}
      <div className="rounded-3xl bg-[#0B1228] border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[650px]">
        {/* Chat Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} className="p-3 rounded-2xl bg-[#07142D] border border-slate-800 text-center text-xs text-cyan-300 font-medium max-w-lg mx-auto shadow-inner">
                  {msg.text}
                </div>
              );
            }

            const isUser = msg.sender === "user";
            const isLive = msg.sender === "live_agent";
            const isBot = msg.sender === "bot";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? "items-start flex-row-reverse" : "items-start"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? "bg-purple-600 text-white border border-purple-400"
                      : isLive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : isLive ? (
                    <Headphones className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Body */}
                <div className="space-y-2 max-w-[85%] sm:max-w-[75%]">
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
                    <span className="font-bold text-white">
                      {isUser ? user?.name || "You" : isLive ? msg.agentName || "Alex Turner (Admin Support)" : "Admify AI"}
                    </span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-cyan-500/10 shadow-lg"
                        : isLive
                        ? "bg-[#07142D] border border-emerald-500/30 text-slate-200 shadow-lg"
                        : "bg-[#07142D] border border-slate-800 text-slate-200 shadow-lg"
                    }`}
                  >
                    {/* Clean Title if present */}
                    {msg.title && (
                      <h4 className="text-base font-extrabold text-cyan-300 mb-2">
                        {cleanRegionalFlags(msg.title)}
                      </h4>
                    )}

                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split("\n").map((line, idx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("### ")) {
                          return (
                            <h4 key={idx} className="text-base font-extrabold text-cyan-300 mt-2 mb-1">
                              {renderCleanFormattedText(trimmed.replace("### ", ""))}
                            </h4>
                          );
                        }
                        if (trimmed.startsWith("• ")) {
                          return (
                            <div key={idx} className="flex items-start gap-2 pl-1">
                              <span className="text-cyan-400 shrink-0">•</span>
                              <div className="flex-1">{renderCleanFormattedText(trimmed.replace("• ", ""))}</div>
                            </div>
                          );
                        }
                        return <div key={idx}>{renderCleanFormattedText(line)}</div>;
                      })}
                    </div>

                    {/* Transfer to Live Agent action prompt: ONLY shown if user has sent >= 4 inquiries */}
                    {isBot && canShowLiveAgent && chatMode === "ai" && (
                      <div className="p-3.5 rounded-2xl bg-[#0B1228]/90 border border-emerald-500/30 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>4 Inquiries Completed: Need personal verification?</span>
                          </p>
                          <p className="text-[10px] text-slate-400">Transfer this session directly to an Admin Live Agent in this chat.</p>
                        </div>
                        <button
                          onClick={() => handleTransferToLiveAgent("Student requested human agent escalation")}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050B1F] text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Transfer to Live Agent</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Copy button */}
                  {!isUser && (
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

          {/* Transferring loader */}
          {isTransferring && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 max-w-md mx-auto text-emerald-300 text-xs font-medium">
              <Headphones className="w-4 h-4 animate-bounce" />
              <span>Connecting session to Admify Admin Panel Live Desk...</span>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  chatMode === "live"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                }`}
              >
                {chatMode === "live" ? (
                  <Headphones className="w-5 h-5 animate-pulse" />
                ) : (
                  <Bot className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#07142D] border border-slate-800 flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>
                  {chatMode === "live"
                    ? "Alex Turner (Admin Support Desk) is typing..."
                    : "Admify AI is formulating recommendation..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-[#07142D] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            {chatMode === "live" && (
              <button
                type="button"
                onClick={() => toast.success("Document attached: Will be forwarded to Admin Live Agent")}
                className="p-3 rounded-2xl bg-[#0B1228] hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
                title="Attach Document"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                chatMode === "live"
                  ? "Message Alex Turner (Admin Support Desk)..."
                  : canShowLiveAgent
                  ? "Ask Admify AI or click 'Transfer to Live Agent'..."
                  : `Ask Admify AI (Inquiry ${userAiMsgCount + 1} of 4 to unlock Live Agent)...`
              }
              className="flex-1 bg-[#0B1228] border border-slate-700/70 rounded-2xl px-5 py-3.5 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping || isTransferring}
              className={`px-5 py-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed text-[#050B1F] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all shrink-0 ${
                chatMode === "live"
                  ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
                  : "bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20"
              }`}
            >
              <span>{chatMode === "live" ? "Send to Agent" : "Ask AI"}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
