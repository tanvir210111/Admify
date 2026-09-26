import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Building2,
  GraduationCap,
  RefreshCw,
  Clock,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContact, setActiveContact] = useState(null);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const chatEndRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [msgRes, stuRes] = await Promise.all([
        api.get("/api/agent/messages"),
        api.get("/api/agent/students"),
      ]);

      if (msgRes?.data?.success) {
        setMessages(msgRes.data.data.messages || []);
      }
      if (stuRes?.data?.success) {
        const stuList = stuRes.data.data.students || [];
        setStudents(stuList);
        if (stuList.length > 0 && !activeContact) {
          setActiveContact(stuList[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load messaging data:", err);
      toast.error("Failed to load counselor communication threads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    try {
      setSending(true);
      const res = await api.post("/api/agent/messages", {
        receiverId: activeContact._id,
        text: inputText.trim(),
      });

      if (res?.data?.success) {
        setInputText("");
        // append locally
        setMessages((prev) => [...prev, res.data.data.message]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // Filter messages for active contact
  const activeThread = messages.filter((m) => {
    if (!activeContact) return false;
    const agentId = user?._id?.toString();
    const contactId = activeContact._id?.toString();

    const mUser = (m.user?._id || m.user)?.toString();
    const mReceiver = (m.receiver?._id || m.receiver)?.toString();

    return (
      (mUser === agentId && mReceiver === contactId) ||
      (mUser === contactId && mReceiver === agentId)
    );
  });

  const filteredContacts = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.targetCountry || "").toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-violet-400" /> Authorized Counselor Messaging
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Secure communications with assigned applicants and sponsoring agency administration.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Main Messaging Layout */}
      <motion.div
        variants={fade}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[650px] rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {/* Contact List */}
        <div className="border-r border-white/10 flex flex-col h-full bg-slate-900/40">
          <div className="p-3 border-b border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
              Assigned Students ({students.length})
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search assigned contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No assigned students found.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = activeContact?._id === contact._id;
                return (
                  <div
                    key={contact._id}
                    onClick={() => setActiveContact(contact)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected
                        ? "bg-violet-600/20 border-l-2 border-violet-500"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs shrink-0">
                      {contact.name ? contact.name.charAt(0) : "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">{contact.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {contact.targetCountry ? `Target: ${contact.targetCountry}` : contact.email}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 flex flex-col h-full bg-[#0B1228]">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs">
                    {activeContact.name ? activeContact.name.charAt(0) : "S"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeContact.name}</h3>
                    <p className="text-[11px] text-slate-400">{activeContact.email}</p>
                  </div>
                </div>

                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Assigned Applicant
                </span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeThread.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-violet-400" />
                    <p className="text-xs">No conversation history yet with {activeContact.name}.</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Send a guidance note to assist with university documentation or timeline milestones.
                    </p>
                  </div>
                ) : (
                  activeThread.map((msg, idx) => {
                    const isMe = (msg.user?._id || msg.user)?.toString() === user?._id?.toString();
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-violet-600 text-white rounded-br-xs"
                              : "bg-slate-900 border border-white/10 text-slate-200 rounded-bl-xs"
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-white/10 flex gap-2 bg-slate-900/40"
              >
                <input
                  type="text"
                  placeholder={`Write guidance message to ${activeContact.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <User className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
              <p className="text-xs">Select an assigned applicant to initiate counselor guidance.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
