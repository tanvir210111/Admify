import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircle,
  Send,
  Bot,
  User,
  ChevronDown,
  Sparkles,
  Phone,
  Clock,
  CheckCheck,
  Paperclip,
  Smile,
  ArrowLeft,
  Circle,
} from "lucide-react";

// ── AI smart reply engine ──────────────────────────────────────────────────
const AI_REPLIES = {
  keywords: [
    {
      keys: ["hello", "hi", "hey", "helo"],
      reply:
        "Hi there! 👋 I'm Admify AI. I can help you with university recommendations, application deadlines, scholarship eligibility, SOP generation, and much more. What would you like to know?",
    },
    {
      keys: ["university", "universities", "college", "colleges"],
      reply:
        "I can recommend universities based on your GPA, test scores, and budget. 🎓 We have data on 3,000+ institutions globally. Want me to show you your best matches right now?",
    },
    {
      keys: ["scholarship", "scholarships", "grant", "funding", "money"],
      reply:
        "Great question! 💰 Admify matches you with scholarships automatically. Based on a typical profile (3.5+ GPA), you may be eligible for scholarships ranging from $5,000 to $50,000. Shall I run a match analysis?",
    },
    {
      keys: ["sop", "statement", "purpose", "essay", "document", "lor"],
      reply:
        "Our AI SOP Generator creates personalized Statements of Purpose in minutes! ✍️ It tailors the narrative to your target university's values and program. It costs only 150 credits. Want to try it?",
    },
    {
      keys: ["deadline", "when", "date", "time"],
      reply:
        "⏰ Application deadlines vary by university:\n• Stanford: Dec 15\n• MIT: Dec 1\n• Oxford: Jan 10\n• University of Toronto: Feb 1\n\nI can set reminders for any deadline you choose!",
    },
    {
      keys: ["gpa", "score", "grade", "ielts", "toefl", "sat", "gre"],
      reply:
        "Your academic scores play a big role in matching! 📊 Typically:\n• GPA 3.5+: Top 50 universities\n• GPA 3.0–3.5: Strong mid-tier options\n• IELTS 6.5+ preferred by most English universities\n\nShall I assess your eligibility?",
    },
    {
      keys: ["apply", "application", "apply", "how"],
      reply:
        "Applying through Admify is simple! 🚀\n1. Complete your profile\n2. Get AI university matches\n3. One-click apply to multiple universities\n4. Track all applications in one dashboard\n\nYou can start right now — it's free to sign up!",
    },
    {
      keys: ["cost", "fee", "price", "pricing", "plan", "credit"],
      reply:
        "Admify offers flexible plans 💳:\n• **Free**: Basic recommendations\n• **Pro ($29/mo)**: Full AI + unlimited applications\n• **Elite ($79/mo)**: Personal advisor + priority review\n\nCredits are used for premium AI features like SOP generation.",
    },
    {
      keys: ["agent", "human", "person", "advisor", "counselor", "support"],
      reply:
        "You can switch to a **Live Agent** using the tab above! 👆 Our human advisors are available 24/7 and specialize in your target region. Average wait time is under 2 minutes.",
    },
    {
      keys: ["canada", "usa", "uk", "australia", "germany", "europe"],
      reply:
        "Each destination has unique advantages! 🌍\n• **USA**: World's top ranked universities\n• **Canada**: Post-study work permit friendly\n• **UK**: 1-2 year Master's programs\n• **Germany**: Low/no tuition fees\n• **Australia**: Relaxed student visa rules\n\nWhere are you considering?",
    },
    {
      keys: ["visa", "student visa", "immigration"],
      reply:
        "Student visa guidance is part of our Elite plan! 🛂 Generally:\n• Apply after receiving your university offer letter\n• Prepare financial documents showing 12 months of living costs\n• Our agents can guide you step by step!\n\nWant to connect with a visa expert?",
    },
    {
      keys: ["thank", "thanks", "great", "awesome", "good", "helpful"],
      reply:
        "You're very welcome! 😊 I'm here 24/7 whenever you need help. Is there anything else about your university journey I can assist with?",
    },
  ],
  fallback: [
    "That's a great question! Let me connect you with more specific information. Could you tell me a bit more about what you're looking for — your target country, program, or GPA range?",
    "I want to make sure I give you the most accurate answer! Are you asking about university applications, scholarships, or document preparation?",
    "I'm still learning some specifics on that! 🤔 For complex queries, I'd recommend switching to a **Live Agent** (tab above) — they're online right now and can help immediately.",
    "Great topic! Admify specializes in this area. To give you the best answer, could you share your academic background and target destination?",
  ],
};

function getAIReply(message) {
  const lower = message.toLowerCase();
  for (const group of AI_REPLIES.keywords) {
    if (group.keys.some((k) => lower.includes(k))) {
      return group.reply;
    }
  }
  return AI_REPLIES.fallback[Math.floor(Math.random() * AI_REPLIES.fallback.length)];
}

// ── Human agent messages ───────────────────────────────────────────────────
const AGENT_INTRO =
  "Hi! I'm Sarah, your Admify admissions advisor. I've helped 200+ students get accepted to their dream universities! How can I assist you today? 😊";

const AGENT_REPLIES = [
  "That's a great point! Let me pull up the details for you right away.",
  "I completely understand your concern. Many students ask the same thing. Here's what I recommend...",
  "Absolutely! I've worked with students in similar situations. The best approach would be to start with your profile completion first.",
  "Great news — based on what you've shared, you have very strong chances at your target universities! Let me show you a few options.",
  "I'd suggest booking a one-on-one consultation with me so I can review your full profile and give personalized advice. Would that work for you?",
  "I'll make a note of that. Just to clarify, are you targeting for the Fall 2027 or Spring 2027 intake?",
  "Don't worry, this is very common! Let me walk you through the process step by step.",
];

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
      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4"
          alt="Agent"
          className="w-full h-full object-cover"
        />
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

function MessageBubble({ msg, mode }) {
  const isUser = msg.from === "user";
  const isAI = msg.from === "ai";

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
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4"
              alt="Agent"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        {!isUser && (
          <span className="text-[10px] text-slate-500 mb-1 px-1 font-medium">
            {isAI ? "Admify AI" : "Sarah • Advisor"}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? "bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-br-sm"
              : "bg-slate-800 border border-slate-700/50 text-slate-200 rounded-bl-sm"
          }`}
        >
          {msg.text}
        </div>

        {/* Timestamp + read */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-slate-600">{msg.time}</span>
          {isUser && <CheckCheck className="w-3 h-3 text-primary-400" />}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Widget ─────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("ai"); // "ai" | "agent"
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [agentHasGreeted, setAgentHasGreeted] = useState(false);
  const [agentConnecting, setAgentConnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  if (pathname.startsWith("/admin") || pathname.startsWith("/agent")) return null;

  const now = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      from: "ai",
      text: "👋 Hello! I'm Admify AI — your 24/7 university admissions assistant. Ask me anything about universities, scholarships, deadlines, or SOPs!",
      time: now(),
    },
  ]);

  const [agentMessages, setAgentMessages] = useState([]);

  const messages = mode === "ai" ? aiMessages : agentMessages;
  const setMessages = mode === "ai" ? setAiMessages : setAgentMessages;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Agent greeting when switching to agent mode
  useEffect(() => {
    if (mode === "agent" && !agentHasGreeted) {
      setAgentConnecting(true);
      setAgentHasGreeted(true);
      setTimeout(() => {
        setAgentConnecting(false);
        setAgentMessages([
          {
            id: Date.now(),
            from: "agent",
            text: AGENT_INTRO,
            time: now(),
          },
        ]);
      }, 2000);
    }
  }, [mode, agentHasGreeted]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: "user", text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    const delay = mode === "ai" ? 900 + text.length * 15 : 1200 + Math.random() * 1000;

    setTimeout(() => {
      setIsTyping(false);
      const replyText =
        mode === "ai"
          ? getAIReply(text)
          : AGENT_REPLIES[Math.floor(Math.random() * AGENT_REPLIES.length)];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: mode === "ai" ? "ai" : "agent",
          text: replyText,
          time: now(),
        },
      ]);
    }, delay);
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

  return (
    <>
      {/* ── Floating Button ─────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleOpen}
            className="fixed bottom-24 right-6 z-[9999] w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 shadow-[0_8px_40px_rgba(124,58,237,0.55)] flex items-center justify-center border border-white/20 group"
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
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.85, y: 30, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-24 right-6 z-[9999] w-[370px] max-w-[calc(100vw-1.5rem)] h-[580px] max-h-[calc(100vh-5rem)] flex flex-col rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)] border border-slate-700/60"
            style={{ background: "linear-gradient(180deg, #0f1a2e 0%, #0a1220 100%)" }}
          >
            {/* ── Header ── */}
            <div className="relative bg-gradient-to-r from-primary-900/80 to-blue-900/80 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-black text-lg">A</span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm leading-tight">Admify Support</h3>
                    <p className="text-green-400 text-[11px] font-semibold flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-green-400" />
                      Online • 24/7 Available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode tabs */}
              <div className="flex mx-4 mb-3 bg-black/30 rounded-xl p-1 gap-1">
                <button
                  onClick={() => switchMode("ai")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    mode === "ai"
                      ? "bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Assistant
                </button>
                <button
                  onClick={() => switchMode("agent")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    mode === "agent"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Live Agent
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                </button>
              </div>
            </div>

            {/* ── Agent connecting overlay ── */}
            <AnimatePresence>
              {agentConnecting && mode === "agent" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4"
                      alt="Agent"
                    />
                  </div>
                  <p className="text-white font-bold mb-1">Connecting to Sarah...</p>
                  <p className="text-slate-400 text-sm mb-4">Admissions Advisor</p>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 custom-scrollbar">
              {/* Mode info banner */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 text-[11px] rounded-xl px-3 py-2 mb-4 border ${
                    mode === "ai"
                      ? "bg-primary-900/30 border-primary-700/30 text-primary-300"
                      : "bg-emerald-900/30 border-emerald-700/30 text-emerald-300"
                  }`}
                >
                  {mode === "ai" ? (
                    <>
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      AI powered by Admify Intelligence · Instant replies
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      Live human advisor · Avg. wait &lt; 2 min · Available 24/7
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Message list */}
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} mode={mode} />
              ))}

              {/* Typing indicator */}
              {isTyping && (mode === "ai" ? <TypingIndicator /> : <AgentTypingIndicator />)}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick replies ── */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto custom-scrollbar flex-shrink-0">
                {(mode === "ai"
                  ? ["Best universities for CS?", "Scholarship matches", "How to apply?", "Check deadlines"]
                  : ["Talk about my SOP", "I need visa help", "Review my profile", "Scholarship advice"]
                ).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInputValue(q);
                      setTimeout(() => {
                        const fakeEvent = { preventDefault: () => {} };
                        const text = q;
                        const userMsg = { id: Date.now(), from: "user", text, time: now() };
                        setMessages((prev) => [...prev, userMsg]);
                        setInputValue("");
                        setIsTyping(true);
                        const delay = mode === "ai" ? 900 + text.length * 15 : 1500;
                        setTimeout(() => {
                          setIsTyping(false);
                          const replyText =
                            mode === "ai"
                              ? getAIReply(text)
                              : AGENT_REPLIES[Math.floor(Math.random() * AGENT_REPLIES.length)];
                          setMessages((prev) => [
                            ...prev,
                            { id: Date.now() + 1, from: mode === "ai" ? "ai" : "agent", text: replyText, time: now() },
                          ]);
                        }, delay);
                      }, 0);
                    }}
                    className="whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input bar ── */}
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
                        ? "Ask Admify AI anything..."
                        : "Message your advisor..."
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
                        ? "bg-gradient-to-br from-primary-500 to-blue-600 shadow-lg shadow-primary-500/30 text-white"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 text-white"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-center text-[10px] text-slate-600 mt-2">
                Powered by Admify Intelligence · End-to-end encrypted
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
