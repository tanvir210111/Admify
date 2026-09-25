import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService, REGISTERED_AGENCIES } from "../../services/studentService";
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  ShieldCheck,
  Crown,
  Lock,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Flag,
  Users2,
  Bot,
} from "lucide-react";
import toast from "react-hot-toast";

// Helper to cleanly format text: strip regional indicator flags and format bold text
function cleanRegionalFlags(str) {
  if (!str) return "";
  return str.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "").replace(/^DE\s+/i, "").trim();
}

function renderCleanFormattedText(text) {
  if (!text) return null;
  const cleaned = cleanRegionalFlags(text);
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
    const cleanPart = part.replace(/\*/g, "");
    return <span key={idx}>{cleanPart}</span>;
  });
}

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Subscription plan: 'free' | 'pro' | 'elite'
  const [currentPlan, setCurrentPlan] = useState(() => studentService.getStudentPlan(user));
  const [agencyState, setAgencyState] = useState(() => studentService.getAgencyAssistanceState(user));

  const assignedAgency = agencyState?.selectedAgency;
  const assignedAgent = agencyState?.assignedAgent || (assignedAgency ? {
    name: assignedAgency.agentName,
    role: assignedAgency.agentRole,
    avatar: assignedAgency.agentAvatar,
    agencyName: assignedAgency.name,
    online: true,
  } : null);

  // Initial messages for the assigned counselor
  const [chatMessages, setChatMessages] = useState(() => {
    if (!assignedAgency || !assignedAgent) return [];
    return [
      {
        id: "msg-init-1",
        sender: "agent",
        text: `Welcome! I am ${assignedAgent.name}, your assigned accredited admissions counselor from ${assignedAgency.name}. Your profile has been prioritized for personalized application reviews and university representative coordination. How can we proceed with your documents and university choices today?`,
        time: "10:30 AM",
      },
    ];
  });

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !assignedAgent) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const agentReply = {
        id: `a-${Date.now()}`,
        sender: "agent",
        text: `Thank you for sharing that inquiry! As your assigned counselor from ${assignedAgency?.name || "our partner agency"}, I have noted this in your admission file and will verify the department prerequisites accordingly.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, agentReply]);
      setIsTyping(false);
    }, 1100);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 1. FREE STARTER VIEW (Strictly Self-Service — NO Agency, NO Agent)
  // ──────────────────────────────────────────────────────────────────────────
  if (currentPlan === "free") {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1228] border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Communication</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Counselor Messages</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-cyan-400" />
              <span>Messages</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-slate-800 text-slate-400 border-slate-700">
                Free Starter Account
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct counselor messaging is reserved for Pro Path and Elite Premium subscriptions.
            </p>
          </div>

        </div>

        {/* Locked Screen */}
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#0B1228] via-[#07142D] to-[#0B1228] border border-purple-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500/20 via-cyan-500/20 to-purple-500/20 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10 relative z-10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Assigned Counselor Messaging Locked
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agency Counselor Messaging is available on Pro Path & Elite Premium
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Free Starter accounts are <strong>self-service applicants</strong> and do not have an assigned agency or counselor. To have a certified agency assigned to your profile with unlimited direct messaging, upgrade to Pro Path ($39/mo) or Elite Premium ($119/mo).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto relative z-10">
            <button
              onClick={() => navigate("/student/wallet")}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>Upgrade to Pro Path ($39/mo) →</span>
            </button>
            <Link
              to="/student/chatbot"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0B1228] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Use Free AI Chatbot</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. PRO PATH / ELITE PREMIUM VIEW
  // ──────────────────────────────────────────────────────────────────────────
  const isElite = currentPlan === "elite";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1228] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Communication</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              {isElite ? "Elite Dedicated Counselor Desk" : "Pro Path Counselor Desk"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-purple-400" />
            <span>Counselor Messages</span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-purple-500/15 text-purple-300 border-purple-500/30">
              {isElite ? "Elite Direct Liaison" : "Pro Certified Counselor"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Direct 1-on-1 communication channel with your assigned agency admissions counselor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            title="File report with Admin Panel"
          >
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Agent</span>
          </Link>
        </div>
      </div>

      {/* If No Agency has been assigned yet */}
      {!assignedAgency || !assignedAgent ? (
        <div className="p-10 rounded-3xl bg-[#0B1228] border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">No active conversations yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isElite
                ? "Browse the Agency Directory and select an agency partner to begin messaging."
                : "Submit an Agency Assistance request. Once Admin assigns an agency, your counselor conversation will appear here."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/student/agency-assistance"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20"
            >
              <Users2 className="w-4 h-4" />
              <span>{isElite ? "Browse Agency Directory" : "Go to Agency Assistance"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Active Messaging Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Assigned Agent Profile */}
          <div className="lg:col-span-1 p-5 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5 h-fit shadow-xl">
            <div className="text-center space-y-3 pb-4 border-b border-slate-800">
              <div className="relative inline-block">
                <img
                  src={assignedAgent.avatar}
                  alt={assignedAgent.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500 shadow-md mx-auto"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0B1228] rounded-full" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{assignedAgent.name}</h3>
                <p className="text-xs text-purple-300 font-medium">{assignedAgent.role}</p>
                <p className="text-[11px] text-slate-400">{assignedAgency.name}</p>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Online & Active</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#07142D] border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Agency</span>
                <span className="text-white font-bold">{assignedAgency.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#07142D] border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Country of Agency</span>
                <span className="text-cyan-300 font-bold">{assignedAgency.country}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#07142D] border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Support Scope</span>
                <span className="text-slate-200 font-medium">Unlimited messaging, document review & university liaison</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/student/reports"
                className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>Flag / Report to Admin</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="lg:col-span-3 flex flex-col h-[650px] rounded-3xl bg-[#0B1228] border border-slate-800 shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 px-6 bg-[#07142D] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={assignedAgent.avatar}
                  alt={assignedAgent.name}
                  className="w-10 h-10 rounded-xl object-cover border border-purple-500/40"
                />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{assignedAgent.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Counselor
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Official Agency Liaison: {assignedAgency.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCheck className="w-4 h-4" />
                  <span>Secure Channel</span>
                </span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isUser && (
                      <img
                        src={assignedAgent.avatar}
                        alt={assignedAgent.name}
                        className="w-8 h-8 rounded-full object-cover border border-purple-500/30 shrink-0 mt-1"
                      />
                    )}

                    <div className={`max-w-[75%] space-y-1 ${isUser ? "items-end text-right" : "items-start text-left"}`}>
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? "bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-600/20"
                            : "bg-[#07142D] text-slate-200 border border-slate-800 rounded-tl-none"
                        }`}
                      >
                        {renderCleanFormattedText(msg.text)}
                      </div>
                      <span className="text-[10px] text-slate-500 block px-1">{msg.time}</span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-purple-300 italic p-2 bg-[#07142D] rounded-xl w-fit border border-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span>{assignedAgent.name} is formulating response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#07142D] border-t border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${assignedAgent.name} regarding applications, university requirements, or documents...`}
                className="flex-1 bg-[#0B1228] border border-slate-700/60 rounded-xl py-3 px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
