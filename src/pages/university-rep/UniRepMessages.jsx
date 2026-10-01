import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  Search,
  Building2,
  User,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Mic,
  Circle,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { useUniRepBadges, formatBadgeCount } from "../../context/UniRepBadgeContext";
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

export default function UniRepMessages() {
  const { user } = useAuth();
  const { markEntityAsSeen } = useUniRepBadges();
  const [searchParams] = useSearchParams();
  const initialPartner = searchParams.get("partner");

  const [messages, setMessages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialPartner || null);
  const [activePartner, setActivePartner] = useState(null);
  const [activeConversationDoc, setActiveConversationDoc] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [contactPresence, setContactPresence] = useState("offline");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const fetchMessagesAndPartners = async () => {
    try {
      setLoading(true);
      const [msgRes, partnerRes] = await Promise.allSettled([
        api.get("/api/university-rep/messages"),
        api.get("/api/university-rep/agencies"),
      ]);

      let loadedMsgs = [];
      let loadedPartners = [];

      if (msgRes.status === "fulfilled" && Array.isArray(msgRes.value?.data?.messages)) {
        loadedMsgs = msgRes.value.data.messages;
        setMessages(loadedMsgs);
      }

      if (partnerRes.status === "fulfilled" && Array.isArray(partnerRes.value?.data?.connectedAgencies)) {
        loadedPartners = partnerRes.value.data.connectedAgencies.map((c) => {
          const a = c.agencyId || c.agency || {};
          return {
            id: a._id || a.id || c.agencyId,
            name: a.name || "Partner Agency",
            email: a.email || "",
            country: a.country || "",
            avatar: a.avatar || "",
            connectionId: c._id,
          };
        });
        setPartners(loadedPartners);
      }

      // Auto select first partner or query param
      if (initialPartner) {
        setSelectedPartnerId(initialPartner);
        const match = loadedPartners.find((p) => p.id === initialPartner);
        if (match) setActivePartner(match);
      } else if (loadedPartners.length > 0 && !selectedPartnerId) {
        setSelectedPartnerId(loadedPartners[0].id);
        setActivePartner(loadedPartners[0]);
      }
    } catch (err) {
      console.warn("Failed to load messaging", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesAndPartners();
  }, [initialPartner]);

  useEffect(() => {
    if (selectedPartnerId && partners.length > 0) {
      const match = partners.find((p) => p.id === selectedPartnerId);
      if (match) setActivePartner(match);
    }
  }, [selectedPartnerId, partners]);

  useEffect(() => {
    if (!selectedPartnerId || !user?._id) return;
    const unseenMsgs = messages.filter(
      (m) =>
        (m.senderId?._id || m.senderId || m.user?._id || m.user)?.toString() === selectedPartnerId?.toString() &&
        m.isSeenByUniRep === false
    );
    if (unseenMsgs.length > 0) {
      unseenMsgs.forEach((m) => {
        markEntityAsSeen("message", m._id);
        m.isSeenByUniRep = true;
      });
      setMessages((prev) =>
        prev.map((m) =>
          (m.senderId?._id || m.senderId || m.user?._id || m.user)?.toString() === selectedPartnerId?.toString()
            ? { ...m, isSeenByUniRep: true }
            : m
        )
      );
    }
  }, [selectedPartnerId, messages, user?._id, markEntityAsSeen]);

  useEffect(() => {
    if (!selectedPartnerId) return;
    api.post("/api/conversations/direct", { receiverId: selectedPartnerId }).then((res) => {
      const conv = res?.data?.conversation || res?.data?.data?.conversation;
      if (conv) {
        setActiveConversationDoc(conv);
        api.post(`/api/conversations/${conv._id}/read`).catch(() => {});
      }
    }).catch(() => {});
  }, [selectedPartnerId]);

  useEffect(() => {
    const token = localStorage.getItem("admify_token") || localStorage.getItem("token");
    if (!token || !activeConversationDoc?._id) return;

    const socket = initSocket(token);
    if (!socket) return;

    const convId = activeConversationDoc._id;
    joinConversationRoom(socket, convId);

    if (selectedPartnerId) {
      fetchPresence(selectedPartnerId).then((st) => setContactPresence(st));
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
      if (conversationId === convId && userId === selectedPartnerId) {
        setIsOtherTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsOtherTyping(false), 3500);
      }
    };

    const handleIncomingUserStoppedTyping = ({ conversationId, userId }) => {
      if (conversationId === convId && userId === selectedPartnerId) {
        setIsOtherTyping(false);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      }
    };

    const handleIncomingPresenceChanged = ({ userId, status }) => {
      if (userId === selectedPartnerId) {
        setContactPresence(status);
      }
    };

    const handleReconnect = () => {
      joinConversationRoom(socket, convId);
      api.get(`/api/conversations/${convId}/messages`).then((res) => {
        const msgs = res?.data?.messages || res?.data?.data?.messages;
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
  }, [activeConversationDoc?._id, selectedPartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedPartnerId]);

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
    if (res?.success && res.data?.message) {
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? res.data.message : m))
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
      toast.error(err.message || "Failed to update reaction.");
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (activeConversationDoc?._id) {
      emitTypingStart(activeConversationDoc._id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !attachmentFile) return;

    if (!selectedPartnerId) {
      toast.error("Please select a connected partner agency to chat with.");
      return;
    }

    if (activeConversationDoc?._id) {
      emitTypingStop(activeConversationDoc._id);
    }

    setSending(true);
    const content = text.trim();

    try {
      let res;
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("receiverId", selectedPartnerId);
        if (content) formData.append("text", content);
        formData.append("attachment", attachmentFile);
        res = await api.post("/api/university-rep/messages", formData);
      } else {
        res = await api.post("/api/university-rep/messages", {
          receiverId: selectedPartnerId,
          text: content,
        });
      }

      if (res?.success && res?.data?.message) {
        setText("");
        handleClearAttachment();
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
      } else {
        fetchMessagesAndPartners();
      }
    } catch (err) {
      toast.error(err.message || "Failed to deliver message.");
      setText(content);
    } finally {
      setSending(false);
    }
  };

  // Filter messages for active partner
  const partnerMessages = messages.filter((m) => {
    const senderId = (m.senderId?._id || m.senderId || m.user?._id || m.user)?.toString();
    const receiverId = (m.receiverId?._id || m.receiverId || m.receiver?._id || m.receiver)?.toString();
    const myId = user?._id?.toString();
    const partnerId = selectedPartnerId?.toString();
    return (
      (senderId === myId && receiverId === partnerId) ||
      (senderId === partnerId && receiverId === myId) ||
      (!receiverId && senderId === myId) // broadcast or general
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Institutional Communications
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Messages & Agency Inquiries
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct, authorized correspondence with your connected educational agencies.
          </p>
        </div>

        <button
          onClick={fetchMessagesAndPartners}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Chat
        </button>
      </div>

      {/* ── Split Chat View ── */}
      <div className="rounded-2xl border border-white/5 bg-[#0B1228] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Pane: Connected Agency Partners (4 Cols) */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-white/5 bg-[#070E24]/60 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-purple-400">
              Connected Agencies ({partners.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading partners...</div>
            ) : partners.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-semibold text-white">No Connected Agencies</p>
                <p className="text-[11px] text-slate-400">
                  Accept an agency partnership request to unlock direct communications.
                </p>
              </div>
            ) : (
              partners.map((partner) => {
                const isSelected = selectedPartnerId === partner.id;
                const unreadCount = messages.filter(
                  (m) =>
                    (m.user?._id || m.user) === partner.id &&
                    m.isSeenByUniRep === false
                ).length;
                return (
                  <button
                    key={partner.id}
                    onClick={() => {
                      setSelectedPartnerId(partner.id);
                      setActivePartner(partner);
                    }}
                    className={`w-full p-4 flex items-center gap-3 text-left transition ${
                      isSelected
                        ? "bg-purple-600/15 border-l-2 border-purple-500 text-white"
                        : unreadCount > 0
                        ? "bg-gradient-to-r from-purple-500/[0.08] to-blue-500/[0.04] border-l-4 border-l-purple-500 text-white"
                        : "hover:bg-white/[0.03] text-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                      {partner.avatar ? (
                        <img src={partner.avatar} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">{partner.name}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500 text-white shadow-sm shadow-purple-500/40">
                              {unreadCount}
                            </span>
                          )}
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {partner.country || "International Partner"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window (8 Cols) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-[#050B1F]">
          {/* Active Partner Header */}
          <div className="p-4 border-b border-white/5 bg-[#070E24]/40 flex items-center justify-between">
            {activePartner ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {activePartner.name}
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                      <span className={`w-2 h-2 rounded-full ${contactPresence === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                      {contactPresence === "online" ? "Online" : "Offline"}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">{activePartner.email || "Verified Recruiter"}</p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Select an agency to begin conversation</span>
            )}
            <span className="text-[10px] text-slate-500 uppercase font-mono">End-to-End Encrypted</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 custom-scrollbar min-h-[360px] max-h-[460px]">
            {!activePartner ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                <MessageSquare className="w-10 h-10 opacity-30" />
                <p className="text-xs">Choose a connected agency partner on the left to view messages.</p>
              </div>
            ) : partnerMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                <Clock className="w-8 h-8 opacity-40 text-purple-400" />
                <p className="text-xs text-slate-300 font-semibold">Start the conversation</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Send admission guidelines, intake deadlines, or inquire about applicant documentation directly to {activePartner.name}.
                </p>
              </div>
            ) : (
              partnerMessages.map((msg, idx) => (
                <MessageBubble
                  key={msg._id || idx}
                  msg={msg}
                  currentUserId={user?._id}
                  senderAvatar={activePartner?.avatar}
                  senderName={activePartner?.name}
                  themeColor="blue"
                  onSaveEdit={handleSaveEdit}
                  onToggleReaction={handleToggleReaction}
                />
              ))
            )}
            {isOtherTyping && (
              <div className="px-4 py-1 text-xs text-purple-400 italic flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                <span>{activePartner.name} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input Bar or Voice Recorder */}
          {isRecording ? (
            <div className="p-3.5 border-t border-white/5 bg-[#070E24]/50">
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
            <form onSubmit={handleSendMessage} className="relative p-3.5 border-t border-white/5 bg-[#070E24]/50 flex items-center gap-2">
              <MessageAttachmentPicker
                attachment={attachmentFile}
                previewUrl={attachmentPreview}
                onSelect={handleFileSelect}
                onClear={handleClearAttachment}
                disabled={!activePartner || sending}
              />
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                disabled={!activePartner || sending}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition shrink-0 disabled:opacity-40"
                title="Record Voice Note"
              >
                <Mic className="w-4 h-4 text-purple-400" />
              </button>
              <input
                type="text"
                disabled={!activePartner || sending}
                value={text}
                onChange={handleTextChange}
                placeholder={
                  activePartner
                    ? attachmentFile
                      ? "Add an optional caption..."
                      : `Message ${activePartner.name}...`
                    : "Select an agency partner to compose message..."
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!activePartner || (!text.trim() && !attachmentFile) || sending}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition disabled:opacity-40 shrink-0"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
