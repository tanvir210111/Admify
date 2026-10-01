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
  Mic,
  Circle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAgentBadges } from "../../context/AgentBadgeContext";
import MessageBubble from "../../components/chat/MessageBubble";
import MessageAttachmentPicker from "../../components/chat/MessageAttachmentPicker";
import VoiceRecorder from "../../components/chat/VoiceRecorder";
import {
  initSocket,
  getSocket,
  joinConversationRoom,
  leaveConversationRoom,
  emitTypingStart,
  emitTypingStop,
  fetchPresence,
} from "../../lib/socket";

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
  const [activeConversationDoc, setActiveConversationDoc] = useState(null);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [contactPresence, setContactPresence] = useState("offline");
  const [isRecording, setIsRecording] = useState(false);
  const { sidebarCounts, markEntityAsSeen } = useAgentBadges();

  const chatEndRef = useRef(null);
  const typingTimerRef = useRef(null);

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
    if (!activeContact?._id) return;
    api.post("/api/conversations/direct", { receiverId: activeContact._id }).then((res) => {
      const conv = res?.data?.data?.conversation || res?.data?.conversation;
      if (conv) {
        setActiveConversationDoc(conv);
        api.post(`/api/conversations/${conv._id}/read`).catch(() => {});
      }
    }).catch(() => {});
  }, [activeContact?._id]);

  useEffect(() => {
    const token = localStorage.getItem("admify_token") || localStorage.getItem("token");
    if (!token || !activeConversationDoc?._id) return;

    const socket = initSocket(token);
    if (!socket) return;

    const convId = activeConversationDoc._id;
    joinConversationRoom(socket, convId);

    if (activeContact?._id) {
      fetchPresence(activeContact._id).then((st) => setContactPresence(st));
    }

    const handleIncomingNewMessage = (msg) => {
      if (!msg) return;
      if (msg.conversationId === convId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleIncomingMessageEdited = (msg) => {
      if (!msg) return;
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    };

    const handleIncomingMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: "This message was deleted", attachments: [] }
            : m
        )
      );
    };

    const handleIncomingReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    const handleIncomingUserTyping = ({ conversationId, userId }) => {
      if (conversationId === convId && userId === activeContact?._id) {
        setIsOtherTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsOtherTyping(false), 3500);
      }
    };

    const handleIncomingUserStoppedTyping = ({ conversationId, userId }) => {
      if (conversationId === convId && userId === activeContact?._id) {
        setIsOtherTyping(false);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      }
    };

    const handleIncomingPresenceChanged = ({ userId, status }) => {
      if (userId === activeContact?._id) {
        setContactPresence(status);
      }
    };

    const handleReconnect = () => {
      joinConversationRoom(socket, convId);
      api.get(`/api/conversations/${convId}/messages`).then((res) => {
        const msgs = res?.data?.data?.messages || res?.data?.messages;
        if (Array.isArray(msgs)) {
          setMessages((prev) => {
            const map = new Map();
            prev.forEach((m) => map.set(m._id, m));
            msgs.forEach((m) => map.set(m._id, m));
            return Array.from(map.values()).sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
          });
        }
      }).catch(() => {});
    };

    socket.on("new_message", handleIncomingNewMessage);
    socket.on("message_edited", handleIncomingMessageEdited);
    socket.on("message_deleted", handleIncomingMessageDeleted);
    socket.on("message_reaction_updated", handleIncomingReactionUpdated);
    socket.on("user_typing", handleIncomingUserTyping);
    socket.on("user_stopped_typing", handleIncomingUserStoppedTyping);
    socket.on("user_presence_changed", handleIncomingPresenceChanged);
    socket.on("connect", handleReconnect);

    return () => {
      leaveConversationRoom(socket, convId);
      socket.off("new_message", handleIncomingNewMessage);
      socket.off("message_edited", handleIncomingMessageEdited);
      socket.off("message_deleted", handleIncomingMessageDeleted);
      socket.off("message_reaction_updated", handleIncomingReactionUpdated);
      socket.off("user_typing", handleIncomingUserTyping);
      socket.off("user_stopped_typing", handleIncomingUserStoppedTyping);
      socket.off("user_presence_changed", handleIncomingPresenceChanged);
      socket.off("connect", handleReconnect);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [activeConversationDoc?._id, activeContact?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  useEffect(() => {
    if (activeContact) {
      markEntityAsSeen("message", activeContact._id);
    }
  }, [activeContact, markEntityAsSeen]);

  const handleFileSelect = (file) => {
    setAttachmentFile(file);
    if (file.type?.startsWith("image/")) {
      setAttachmentPreview(URL.createObjectURL(file));
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleClearAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachmentFile(null);
    setAttachmentPreview(null);
  };

  const handleSaveEdit = async (msgId, newText) => {
    const targetMsg = messages.find((m) => m._id === msgId);
    const convId = activeConversationDoc?._id || targetMsg?.conversationId || targetMsg?.sessionId;
    if (!convId) return;

    const res = await api.patch(`/api/conversations/${convId}/messages/${msgId}`, {
      text: newText,
    });
    const updated = res?.data?.data?.message || res?.data?.message;
    if (updated) {
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? updated : m))
      );
      toast.success("Message edited successfully.");
    }
  };

  const handleToggleReaction = async (msgId, emoji) => {
    const targetMsg = messages.find((m) => m._id === msgId);
    const convId = activeConversationDoc?._id || targetMsg?.conversationId || targetMsg?.sessionId;
    if (!convId) return;

    try {
      await api.post(`/api/conversations/${convId}/messages/${msgId}/reactions`, { emoji });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update reaction.");
    }
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    if (activeConversationDoc?._id) {
      emitTypingStart(activeConversationDoc._id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachmentFile) || !activeContact) return;

    if (activeConversationDoc?._id) {
      emitTypingStop(activeConversationDoc._id);
    }

    try {
      setSending(true);
      let res;
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("receiverId", activeContact._id);
        if (inputText.trim()) formData.append("text", inputText.trim());
        formData.append("attachment", attachmentFile);
        res = await api.post("/api/agent/messages", formData);
      } else {
        res = await api.post("/api/agent/messages", {
          receiverId: activeContact._id,
          text: inputText.trim(),
        });
      }

      const newMsg = res?.data?.data?.message || res?.data?.message;
      if (newMsg) {
        setInputText("");
        handleClearAttachment();
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // Filter messages for active contact
  const activeThread = messages.filter((m) => {
    if (!activeContact) return false;
    const agentId = user?._id?.toString();
    const contactId = activeContact._id?.toString();

    const mUser = (m.senderId?._id || m.senderId || m.user?._id || m.user)?.toString();
    const mReceiver = (m.receiverId?._id || m.receiverId || m.receiver?._id || m.receiver)?.toString();

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
                const contactId = contact._id?.toString();
                const hasUnseen = messages.some(
                  (m) =>
                    (m.senderId?._id || m.senderId || m.user?._id || m.user)?.toString() === contactId &&
                    m.isSeenByAgent === false
                );

                return (
                  <div
                    key={contact._id}
                    onClick={() => {
                      setActiveContact(contact);
                      markEntityAsSeen("message", contact._id);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                      hasUnseen
                        ? "bg-cyan-950/30 border-l-4 border-l-cyan-500 shadow-[inset_0_0_24px_rgba(6,182,212,0.12)]"
                        : isSelected
                        ? "bg-violet-600/20 border-l-2 border-violet-500"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs shrink-0">
                      {contact.name ? contact.name.charAt(0) : "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate flex items-center justify-between">
                        <span>{contact.name}</span>
                        {hasUnseen && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </div>
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400">{activeContact.email}</p>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className={`w-2 h-2 rounded-full ${contactPresence === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                        {contactPresence === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
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
                  activeThread.map((msg, idx) => (
                    <MessageBubble
                      key={msg._id || idx}
                      msg={msg}
                      currentUserId={user?._id}
                      senderAvatar={null}
                      senderName={activeContact?.name}
                      themeColor="violet"
                      onSaveEdit={handleSaveEdit}
                      onToggleReaction={handleToggleReaction}
                    />
                  ))
                )}
                {isOtherTyping && (
                  <div className="px-4 py-1 text-xs text-violet-400 italic flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                    <span>{activeContact.name} is typing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input or Voice Recorder */}
              {isRecording ? (
                <div className="p-3 border-t border-white/10 bg-slate-900/40">
                  <VoiceRecorder
                    onRecordingComplete={(audioFile) => {
                      setAttachmentFile(audioFile);
                      setIsRecording(false);
                      toast.success("Voice note attached. Click Send to deliver.");
                    }}
                    onCancel={() => setIsRecording(false)}
                    disabled={sending}
                  />
                </div>
              ) : (
                <form
                  onSubmit={handleSendMessage}
                  className="relative p-3 border-t border-white/10 flex items-center gap-2 bg-slate-900/40"
                >
                  <MessageAttachmentPicker
                    attachment={attachmentFile}
                    previewUrl={attachmentPreview}
                    onSelect={handleFileSelect}
                    onClear={handleClearAttachment}
                    disabled={sending}
                  />
                  <button
                    type="button"
                    onClick={() => setIsRecording(true)}
                    disabled={sending}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0"
                    title="Record Voice Note"
                  >
                    <Mic className="w-4 h-4 text-violet-400" />
                  </button>
                  <input
                    type="text"
                    placeholder={
                      attachmentFile
                        ? "Add an optional caption..."
                        : `Write guidance message to ${activeContact.name}...`
                    }
                    value={inputText}
                    onChange={handleTextChange}
                    className="flex-1 px-4 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !attachmentFile)}
                    className="px-4 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              )}
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
