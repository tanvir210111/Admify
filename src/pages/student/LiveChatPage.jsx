import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  Bot,
  Users2,
  ShieldCheck,
  Sparkles,
  Phone,
  Video,
  ArrowRight,
  Clock,
  Circle,
  Search,
  ExternalLink,
  ChevronRight,
  Calendar,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const LIVE_ADVISORS = [
  {
    id: "advisor-1",
    name: "Dr. Sarah Jenkins",
    role: "Senior Global Admissions Counselor",
    department: "UK & European Universities",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    status: "online",
    badge: "Verified Counselor",
    replyTime: "Usually replies in < 2 mins",
    bio: "12+ years advising students on Oxbridge, Russell Group, and European zero-tuition admissions.",
    initialMessages: [
      {
        id: "msg-101",
        sender: "advisor",
        text: "Hello! Welcome to Admify Live Counselor Desk. I am Dr. Sarah Jenkins. I can review your academic transcripts, check your target universities across our 20 supported countries, or discuss your 1 Free Application submission. How can I assist you right now?",
        time: "10:14 AM",
      },
    ],
  },
  {
    id: "advisor-2",
    name: "Michael Chen",
    role: "Visa & Financial Compliance Specialist",
    department: "Immigration & Blocked Accounts",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
    status: "online",
    badge: "Visa Specialist",
    replyTime: "Online now",
    bio: "Former consular liaison officer specializing in US F-1, UK Tier 4, and German Blocked Account documentation.",
    initialMessages: [
      {
        id: "msg-201",
        sender: "advisor",
        text: "Hi there! I handle student visa guidance, financial sponsor documentation, and embassy interview preparation. Feel free to ask any question regarding bank solvency certificates or visa timelines.",
        time: "09:45 AM",
      },
    ],
  },
  {
    id: "advisor-3",
    name: "Admify Live Help Desk",
    role: "24/7 Platform & Application Support",
    department: "General Operations",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    status: "online",
    badge: "Official Support",
    replyTime: "Instant response",
    bio: "Official student assistance team for technical issues, wallet credits, and application status inquiries.",
    initialMessages: [
      {
        id: "msg-301",
        sender: "advisor",
        text: "Welcome to Admify Student Operations! Let us know if you need help claiming your 1 Free Application, activating agency bids, or purchasing application credits.",
        time: "Yesterday",
      },
    ],
  },
];

export default function LiveChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const agencyState = studentService.getAgencyAssistanceState();
  const assignedAgent = agencyState?.assignedAgent;

  // Merge registered assigned agency counselor if student selected one
  const allAdvisors = [
    ...(assignedAgent
      ? [
          {
            id: "advisor-assigned",
            name: assignedAgent.name,
            role: `${assignedAgent.role} (${agencyState.selectedAgency?.name || "Assigned Agency"})`,
            department: "Assigned Personal Counselor",
            avatar: assignedAgent.avatar,
            status: "online",
            badge: "Dedicated Agent",
            replyTime: "Direct Line Active",
            bio: `Your officially selected counselor from ${agencyState.selectedAgency?.name}.`,
            initialMessages: [
              {
                id: "msg-ag-1",
                sender: "advisor",
                text: `Greetings! I am ${assignedAgent.name}, your dedicated agent. I am preparing your university application portfolio and reviewing scholarship deadlines. What can we work on together today?`,
                time: "10:30 AM",
              },
            ],
          },
        ]
      : []),
    ...LIVE_ADVISORS,
  ];

  const [activeAdvisorId, setActiveAdvisorId] = useState(allAdvisors[0].id);
  const [messagesMap, setMessagesMap] = useState(() => {
    const init = {};
    allAdvisors.forEach((a) => {
      init[a.id] = a.initialMessages;
    });
    return init;
  });

  const [inputText, setInputText] = useState("");
  const [isCounselorTyping, setIsCounselorTyping] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const messagesEndRef = useRef(null);
  const activeAdvisor = allAdvisors.find((a) => a.id === activeAdvisorId) || allAdvisors[0];
  const currentMessages = messagesMap[activeAdvisor.id] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isCounselorTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeAdvisor.id]: [...(prev[activeAdvisor.id] || []), userMsg],
    }));
    setInputText("");
    setIsCounselorTyping(true);

    // Dynamic counselor reply simulation
    setTimeout(() => {
      let replyText = `Thank you for sharing that! I have noted your requirements regarding this query. Let me cross-reference the university admissions criteria and document checklist for you.`;
      
      const q = userMsg.text.toLowerCase();
      if (q.includes("free") || q.includes("apply") || q.includes("direct")) {
        replyText = `Great inquiry! As an Admify student, you can submit your very first application directly for 100% free through our Direct Applications portal. I recommend starting with your top-choice university!`;
      } else if (q.includes("visa") || q.includes("bank") || q.includes("blocked") || q.includes("fund")) {
        replyText = `For student visa financial verification, standard embassy protocols require either a verified bank statement or a blocked account proof (e.g. €11,904 in Germany). Our document desk can verify your financial proofs before you book an embassy appointment.`;
      } else if (q.includes("ielts") || q.includes("gpa") || q.includes("score")) {
        replyText = `With your current academic standing, you meet the standard direct entry requirements for most Russell Group and European public institutions. We can also explore scholarship fee waivers!`;
      }

      const counselorMsg = {
        id: `c-${Date.now()}`,
        sender: "advisor",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeAdvisor.id]: [...(prev[activeAdvisor.id] || []), counselorMsg],
      }));
      setIsCounselorTyping(false);
    }, 1200);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Communication</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Live Human Support & Counselors</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>Live Chat & Counselor Desk</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Counselors Online
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chat in real-time with certified admissions counselors, visa officers, or your assigned agency partner.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/admify-ai"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Switch to Admify AI Chatbot</span>
          </Link>
          <button
            onClick={() => setShowBookingModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050B1F] text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Video className="w-4 h-4" />
            <span>Book 1-on-1 Call</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Live Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-[#0B1228] border border-slate-800 overflow-hidden shadow-2xl h-[680px]">
        {/* Left Column (4 Cols): Advisor & Specialist Directory */}
        <div className="lg:col-span-4 border-r border-slate-800 flex flex-col bg-[#07142D]">
          <div className="p-4 border-b border-slate-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Available Live Counselors
            </span>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search advisor by specialty..."
                className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
            {allAdvisors.map((advisor) => {
              const isSelected = advisor.id === activeAdvisorId;
              return (
                <button
                  key={advisor.id}
                  onClick={() => setActiveAdvisorId(advisor.id)}
                  className={`w-full text-left p-4 transition-all flex items-start gap-3 relative ${
                    isSelected
                      ? "bg-[#0B1228] border-l-4 border-emerald-400 shadow-inner"
                      : "hover:bg-[#0B1228]/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={advisor.avatar}
                      alt={advisor.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#07142D]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{advisor.name}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                        {advisor.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-cyan-300 font-medium truncate">{advisor.role}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{advisor.replyTime}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 Cols): Live Conversation Window */}
        <div className="lg:col-span-8 flex flex-col bg-[#0B1228]">
          {/* Active Advisor Profile Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#07142D]/60 backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={activeAdvisor.avatar}
                  alt={activeAdvisor.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#07142D]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">{activeAdvisor.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    🟢 Live Now
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{activeAdvisor.role}</p>
                <p className="text-[11px] text-slate-400">{activeAdvisor.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0B1228] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Schedule 1-on-1</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4">
            <div className="p-3 rounded-2xl bg-[#07142D]/80 border border-slate-800/80 text-center text-xs text-slate-400 max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1.5" />
              <span>This session is encrypted and covered under Admify verified admissions guarantee.</span>
            </div>

            {currentMessages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <img
                      src={activeAdvisor.avatar}
                      alt={activeAdvisor.name}
                      className="w-7 h-7 rounded-xl object-cover shrink-0 mb-1"
                    />
                  )}

                  <div className="space-y-1 max-w-[80%] sm:max-w-[70%]">
                    <div
                      className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md shadow-emerald-600/10 font-medium"
                          : "bg-[#07142D] border border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>

                    <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
                      <span>{msg.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isCounselorTyping && (
              <div className="flex items-center gap-2.5 text-xs text-emerald-400">
                <img
                  src={activeAdvisor.avatar}
                  alt={activeAdvisor.name}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="animate-pulse">{activeAdvisor.name.split(" ")[0]} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <div className="p-4 sm:p-5 bg-[#07142D] border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast.success("File attachment ready. Select PDF transcript or SOP.")}
                className="p-3 rounded-2xl bg-[#0B1228] hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
                title="Attach Document"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type your message to ${activeAdvisor.name}...`}
                className="flex-1 bg-[#0B1228] border border-slate-700/70 rounded-2xl px-5 py-3 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#050B1F] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setShowBookingModal(false)}
          />
          <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Schedule 1-on-1 Video Session</h3>
                <p className="text-xs text-slate-400">with {activeAdvisor.name}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Preferred Date</label>
                <input
                  type="date"
                  defaultValue="2026-09-28"
                  className="w-full bg-[#0B1228] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Preferred Time Slot</label>
                <select className="w-full bg-[#0B1228] border border-slate-700 rounded-xl p-2.5 text-white text-xs">
                  <option value="11:00 AM">11:00 AM - 11:30 AM (Dhaka Time / GMT+6)</option>
                  <option value="03:00 PM">03:00 PM - 03:30 PM (Dhaka Time / GMT+6)</option>
                  <option value="07:00 PM">07:00 PM - 07:30 PM (Dhaka Time / GMT+6)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Consultation Topic</label>
                <textarea
                  rows="3"
                  placeholder="E.g. Reviewing my SOP for Oxford, or verifying my DAAD scholarship checklist."
                  className="w-full bg-[#0B1228] border border-slate-700 rounded-xl p-2.5 text-white text-xs placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  toast.success(`Video consultation booked with ${activeAdvisor.name}! Meeting invitation sent to your email.`);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050B1F] font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
