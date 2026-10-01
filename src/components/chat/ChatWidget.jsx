import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  X,
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  Mail,
  Clock,
  CheckCheck,
  Circle,
  AlertCircle,
  Headphones,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { initVisitorSocket, getVisitorSocket } from "../../lib/socket";

export const EXACT_AI_WARNING =
  "I’m an AI chatbot and may not always provide accurate or up-to-date information. For accurate information and personalized assistance, please talk to a live agent.";

// Helper to get or initialize secure visitor session token
function getVisitorToken() {
  if (typeof window === "undefined") return "vis_ssr_fallback";
  try {
    let token = sessionStorage.getItem("admify_visitor_token");
    if (!token || !token.startsWith("vis_")) {
      const rand = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      token = `vis_${rand}`;
      sessionStorage.setItem("admify_visitor_token", token);
    }
    return token;
  } catch {
    return `vis_${Date.now()}`;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-slate-400 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentTypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
        <Headphones className="w-3.5 h-3.5" />
      </div>
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, mode, onEscalateLive }) {
  const isUser = msg.from === "user" || msg.sender === "visitor";
  const isAI = msg.from === "ai" || msg.sender === "ai";
  const isSystem = msg.from === "system" || msg.sender === "system";
  const isLimitWarning = Boolean(msg.isLimitWarning);

  if (isSystem) {
    return (
      <div className="my-2 text-center px-4">
        <div className="inline-block bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-[11px] text-slate-300">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden">
          {isAI ? (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <Headphones className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      )}

      <div className={`max-w-[82%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        {!isUser && (
          <span className="text-[10px] text-slate-500 mb-1 px-1 font-medium">
            {isAI ? "Admify AI" : "Live Admissions Advisor"}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-br-sm"
              : isLimitWarning
              ? "bg-amber-950/40 border border-amber-500/40 text-amber-200 rounded-bl-sm"
              : "bg-slate-800 border border-slate-700/50 text-slate-200 rounded-bl-sm"
          }`}
        >
          {msg.text}

          {/* Prominent Talk to Live Agent CTA when 4-message ceiling is reached */}
          {isLimitWarning && onEscalateLive && (
            <div className="mt-3 pt-2 border-t border-amber-500/30 flex justify-end">
              <button
                type="button"
                onClick={onEscalateLive}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5" />
                Talk to Live Agent
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-slate-600">{msg.time || "Just now"}</span>
          {isUser && <CheckCheck className="w-3 h-3 text-primary-400" />}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Widget Inner Component ─────────────────────────────────────────────
function ChatWidgetContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const [mode, setMode] = useState("ai"); // "ai" | "agent"
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [aiLimitReached, setAiLimitReached] = useState(false);
  const [aiCount, setAiCount] = useState(0);

  // Live Agent form state
  const [showLiveForm, setShowLiveForm] = useState(false);
  const [isConnectingLive, setIsConnectingLive] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const visitorTokenRef = useRef(getVisitorToken());

  const now = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const [aiMessages, setAiMessages] = useState([
    {
      id: "ai-init",
      from: "ai",
      text: "👋 Hello! I'm Admify AI — your 24/7 global study admissions assistant. Ask me anything about universities, scholarships, admission criteria, or application guidance!",
      time: now(),
    },
  ]);

  const [agentMessages, setAgentMessages] = useState([]);

  const messages = mode === "ai" ? aiMessages : agentMessages;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Connect socket and fetch history on initial open
  useEffect(() => {
    const token = visitorTokenRef.current;
    if (!token) return;

    // Initialize visitor socket
    const socket = initVisitorSocket(token);

    if (socket) {
      const handleSupportReply = (data) => {
        if (data?.message) {
          const newMsg = {
            id: data.message._id || `rep-${Date.now()}`,
            from: data.message.sender === "agent" ? "agent" : "ai",
            text: data.message.text,
            time: new Date(data.message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setAgentMessages((prev) => [...prev, newMsg]);
        }
      };

      socket.on("admin_support_reply", handleSupportReply);
      socket.on("support_connected", () => {
        setIsEscalated(true);
      });

      return () => {
        socket.off("admin_support_reply", handleSupportReply);
      };
    }
  }, []);

  // Fetch session history if previously active
  const loadHistory = useCallback(async () => {
    try {
      const token = visitorTokenRef.current;
      const res = await api.get(`/api/chat/history/${token}`);
      if (res?.success && res.data?.messages) {
        const loaded = res.data.messages;
        const loadedAi = [];
        const loadedAgent = [];

        for (const m of loaded) {
          const formatted = {
            id: m._id || String(Math.random()),
            from: m.sender === "visitor" ? "user" : m.sender,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isLimitWarning: m.isLimitWarning || m.text === EXACT_AI_WARNING,
          };
          if (m.isLiveAgentRequest || m.sender === "agent" || res.status === "waiting_live_agent" || res.status === "live") {
            loadedAgent.push(formatted);
          } else {
            loadedAi.push(formatted);
          }
        }

        if (loadedAi.length > 0) {
          setAiMessages((prev) => [prev[0], ...loadedAi]);
        }
        if (loadedAgent.length > 0) {
          setAgentMessages(loadedAgent);
        }
        if (res.visitorInfo) {
          setIsEscalated(true);
        }
        if (res.limitReached || res.aiMessageCount >= 4) {
          setAiLimitReached(true);
          setAiCount(res.aiMessageCount || 4);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  // ── Send Message Logic ──────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    const token = visitorTokenRef.current;
    const userMsg = { id: `usr-${Date.now()}`, from: "user", text, time: now() };

    setInputValue("");

    if (mode === "ai") {
      if (aiLimitReached) {
        setShowLiveForm(true);
        toast("AI message quota reached. Please click 'Talk to Live Agent' below to connect with an advisor.", {
          icon: "ℹ️",
        });
        return;
      }

      setAiMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const res = await api.post("/api/chat/message", {
          text,
          visitorToken: token,
        });

        setIsTyping(false);

        if (res?.success) {
          if (res.visitorToken) {
            visitorTokenRef.current = res.visitorToken;
            sessionStorage.setItem("admify_visitor_token", res.visitorToken);
          }

          if (res.limitReached) {
            setAiLimitReached(true);
          }

          const replyMsg = {
            id: res.data?.reply?._id || `ai-${Date.now()}`,
            from: "ai",
            text: res.data?.reply?.text || res.warning || res.reply?.text,
            time: now(),
            isLimitWarning: Boolean(res.limitReached || res.warning),
          };

          setAiMessages((prev) => [...prev, replyMsg]);
        } else {
          setAiMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              from: "ai",
              text: res?.message || "I apologize, but I am currently unable to process your request. Please try again or talk to a live agent.",
              time: now(),
            },
          ]);
        }
      } catch (err) {
        setIsTyping(false);
        const isRateLimit = err?.status === 429 || err?.response?.status === 429;
        const errMsg = isRateLimit
          ? "Too many messages sent. Please wait a minute before asking another question."
          : (err?.data?.message || err?.message || "An error occurred connecting to Admify AI. Please try again shortly.");
        setAiMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, from: "ai", text: errMsg, time: now() },
        ]);
      }
    } else {
      // In Live Agent mode
      setAgentMessages((prev) => [...prev, userMsg]);

      try {
        await api.post("/api/chat/visitor-reply", {
          visitorToken: token,
          text,
        });
      } catch (err) {
        toast.error("Failed to deliver message to support desk.");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setIsTyping(false);
  };

  // ── Live Agent Intake Form Submission ─────────────────────────────────────
  const handleLiveAgentSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!fullName || fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    const phoneRegex = /^[\d+\-\s()]{7,25}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsConnectingLive(true);

    try {
      const token = visitorTokenRef.current;
      const res = await api.post("/api/chat/live-agent-request", {
        visitorToken: token,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });

      if (res?.success) {
        setIsEscalated(true);
        setShowLiveForm(false);
        setMode("agent");

        // Initialize and bind socket
        initVisitorSocket(token);

        setAgentMessages([
          {
            id: `sys-${Date.now()}`,
            from: "system",
            text: `Support request created for ${fullName.trim()}. You are connected to the Admify Live Admissions Desk.`,
            time: now(),
          },
          {
            id: `agent-welcome-${Date.now()}`,
            from: "agent",
            text: `Hello ${fullName.trim()}! 👋 Thank you for reaching out. An admissions advisor has been notified and will join this live thread shortly. Feel free to type your question below!`,
            time: now(),
          },
        ]);
        toast.success("Connected to Admify Live Admissions Desk");
      } else {
        toast.error(res?.message || "Failed to initiate live support.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to connect to live agent.");
    } finally {
      setIsConnectingLive(false);
    }
  };

  return (
    <>
      {/* ── Floating Button (Freely Draggable Anywhere) ─────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="chat-btn-wrapper"
            drag
            dragMomentum={false}
            dragElastic={0.08}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 120)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            className="fixed bottom-24 right-6 z-[9999] touch-none cursor-grab active:cursor-grabbing select-none"
            title="Drag anywhere to move freely • Click to open chat"
          >
            <button
              onClick={() => {
                if (!isDragging) handleOpen();
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 shadow-[0_8px_40px_rgba(6,182,212,0.45)] flex items-center justify-center border border-white/20 group relative cursor-pointer"
              aria-label="Open chat"
            >
              <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950 shadow"
                >
                  {unreadCount}
                </motion.span>
              )}
              <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Window (Freely Draggable via Header) ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.08}
            initial={{ opacity: 0, scale: 0.85, y: 30, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-24 right-6 z-[9999] w-[385px] max-w-[calc(100vw-1.5rem)] h-[610px] max-h-[calc(100vh-5rem)] flex flex-col rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)] border border-slate-700/60 touch-none"
            style={{ background: "linear-gradient(180deg, #0f1a2e 0%, #0a1220 100%)" }}
          >
            {/* ── Header with Drag Handle ── */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="relative bg-gradient-to-r from-[#0d1629] via-[#091122] to-[#0d1629] border-b border-white/10 flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
              title="Drag header to move chat window freely"
            >
              {/* Top Drag Handle Indicator Bar */}
              <div className="flex items-center justify-center pt-2 pb-0.5 opacity-40 hover:opacity-100 transition-opacity">
                <div className="w-12 h-1 rounded-full bg-slate-400/60" />
              </div>

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-2 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#070b1a] border border-cyan-500/35 flex items-center justify-center shadow-lg p-1 overflow-hidden">
                      <img
                        src="/logo-mark.png"
                        alt="Admify Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-sm leading-tight">Admify Live Support</h3>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
                        {mode === "agent" && isEscalated ? "Live Agent" : "AI Assistant"}
                      </span>
                    </div>
                    <p className="text-green-400 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                      <Circle className="w-2 h-2 fill-green-400" />
                      AI & Live Agent Counselors
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Live Agent Intake Form View (only shown when visitor clicks 'Talk to Live Agent') ── */}
            {showLiveForm && !isEscalated ? (
              <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => setShowLiveForm(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3 transition cursor-pointer self-start"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to AI Assistant
                </button>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-bold text-base">Connect to Live Admissions Advisor</h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Please provide your contact information so an admissions advisor can review your inquiry.
                  </p>
                </div>

                <form onSubmit={handleLiveAgentSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-red-400 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah@example.com"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-red-400 mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555 123 4567"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-red-400 mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isConnectingLive}
                    className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isConnectingLive ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Headphones className="w-4 h-4" />
                        Connect to Live Agent
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* ── Standard Messages Area ── */
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 custom-scrollbar">
                {/* Mode info banner */}
                <div
                  className={`flex items-center gap-2 text-[11px] rounded-xl px-3 py-2 mb-4 border ${
                    mode === "ai"
                      ? "bg-primary-900/30 border-primary-700/30 text-primary-300"
                      : "bg-emerald-900/30 border-emerald-700/30 text-emerald-300"
                  }`}
                >
                  {mode === "ai" ? (
                    <>
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      Admify AI Admissions Assistant · {Math.max(0, 4 - aiCount)} Inquiries Remaining
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      Admify Live Support Desk · Real-time Admin Desk Connected
                    </>
                  )}
                </div>

                {/* Message list */}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    mode={mode}
                    onEscalateLive={() => setShowLiveForm(true)}
                  />
                ))}

                {/* Prominent CTA below messages when AI limit reached in AI mode */}
                {mode === "ai" && aiLimitReached && !isEscalated && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="my-3 p-3.5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/40 rounded-2xl shadow-lg flex flex-col items-center text-center gap-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-white font-bold text-xs">AI Inquiries Limit Reached</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Connect with our admissions desk counselors for personalized assistance.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLiveForm(true)}
                      className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                    >
                      <Headphones className="w-4 h-4" />
                      Talk to Live Agent
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* Typing indicator */}
                {isTyping && (mode === "ai" ? <TypingIndicator /> : <AgentTypingIndicator />)}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* ── Input bar (shown when not in intake form) ── */}
            {!showLiveForm && (
              <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm px-4 py-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-2.5 focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        mode === "ai"
                          ? aiLimitReached
                            ? "AI limit reached. Click 'Talk to Live Agent' above."
                            : "Ask Admify AI anything about study abroad..."
                          : "Message your live admissions advisor..."
                      }
                      className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 resize-none outline-none leading-snug max-h-24 custom-scrollbar"
                      style={{ height: "20px" }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      inputValue.trim()
                        ? mode === "ai"
                          ? "bg-gradient-to-br from-primary-500 to-blue-600 shadow-lg shadow-primary-500/30 text-white cursor-pointer"
                          : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 text-white cursor-pointer"
                        : "bg-slate-800 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
                <p className="text-center text-[10px] text-slate-500 mt-2">
                  Admify Global Study Platform · Encrypted Visitor Session
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ChatWidget() {
  const { pathname } = useLocation();
  const [introActive, setIntroActive] = useState(() => {
    try {
      return pathname === "/" && sessionStorage.getItem("admify_intro_seen") !== "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkIntro = () => {
      try {
        const seen = sessionStorage.getItem("admify_intro_seen") === "true";
        if (seen) setIntroActive(false);
      } catch {}
    };

    const handleIntroEnd = () => setIntroActive(false);
    window.addEventListener("admify_intro_finished", handleIntroEnd);
    const interval = setInterval(checkIntro, 400);

    return () => {
      window.removeEventListener("admify_intro_finished", handleIntroEnd);
      clearInterval(interval);
    };
  }, []);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  // Hide chat widget completely on student dashboard, admin, agent, agency, and university rep portals, auth pages, or while intro is active
  if (
    pathname.startsWith("/student") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/agency") ||
    pathname.startsWith("/university-rep") ||
    isAuthPage ||
    introActive
  ) {
    return null;
  }

  return <ChatWidgetContent />;
}
