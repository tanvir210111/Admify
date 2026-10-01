import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Search,
  Send,
  RefreshCw,
  UserCheck,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  Mic,
  Circle,
} from "lucide-react";

import { useAgencyBadges } from "../../context/AgencyBadgeContext";
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

export default function AgencyMessages() {
  const { markEntityAsSeen } = useAgencyBadges();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultRecipient = searchParams.get("recipient");

  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
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

  // Load authorized contacts (students + agents + connected uni reps)
  const loadContactsAndMessages = async () => {
    setLoading(true);
    try {
      const [msgRes, stRes, agRes, connRes] = await Promise.all([
        api.get("/api/agency/messages"),
        api.get("/api/agency/students"),
        api.get("/api/agency/agents"),
        api.get("/api/agency/university-connections"),
      ]);

      const fetchedMessages = msgRes.success ? (msgRes.data.messages || []) : [];
      setMessages(fetchedMessages);

      const list = [];
      if (stRes.success && stRes.data?.students) {
        stRes.data.students.forEach((s) =>
          list.push({ id: s._id, name: s.name, email: s.email, type: "Student", icon: Users, color: "text-cyan-400" })
        );
      }
      if (agRes.success && agRes.data?.registeredAgents) {
        agRes.data.registeredAgents.forEach((a) =>
          list.push({ id: a._id, name: a.name, email: a.email, type: "Counselor", icon: UserCheck, color: "text-violet-400" })
        );
      }
      if (connRes.success && connRes.data?.connections) {
        connRes.data.connections
          .filter((c) => c.status === "ACCEPTED" && c.universityRepresentative)
          .forEach((c) =>
            list.push({
              id: c.universityRepresentative._id || c.universityRepresentativeId,
              name: `${c.universityRepresentative.name} (${c.university?.name || "Partner Uni"})`,
              email: c.universityRepresentative.email,
              type: "University Rep",
              icon: Building2,
              color: "text-pink-400",
            })
          );
      }

      setContacts(list);

      if (defaultRecipient) {
        const found = list.find((c) => c.id === defaultRecipient);
        if (found) handleSelectContact(found, fetchedMessages);
      } else if (list.length > 0 && !selectedContact) {
        handleSelectContact(list[0], fetchedMessages);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load communications");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (c, msgsList = messages) => {
    setSelectedContact(c);
    // Resolve unified conversation doc
    if (c?.id) {
      api.post("/api/conversations/direct", { receiverId: c.id }).then((res) => {
        if (res?.success && res.data?.conversation) {
          setActiveConversationDoc(res.data.conversation);
          api.post(`/api/conversations/${res.data.conversation._id}/read`).catch(() => {});
        }
      }).catch(() => {});
    }

    // Mark any unseen incoming messages from this contact as seen
    const unseenMsgs = (msgsList || []).filter(
      (m) =>
        m.isSeenByAgency === false &&
        m.sender !== "agency" &&
        (((m.senderId || m.user)?.toString() === c.id || (m.receiverId || m.receiver)?.toString() === c.id) ||
         (m.sessionId && m.sessionId.includes(c.id)))
    );
    unseenMsgs.forEach((m) => {
      markEntityAsSeen("message", m._id || m.sessionId);
    });
    if (unseenMsgs.length > 0) {
      setMessages((prev) =>
        prev.map((m) =>
          unseenMsgs.some((u) => u._id === m._id) ? { ...m, isSeenByAgency: true } : m
        )
      );
    }
  };

  useEffect(() => {
    loadContactsAndMessages();
  }, [defaultRecipient]);

  // Socket.io Real-Time listeners for Agency
  useEffect(() => {
    const token = localStorage.getItem("admify_token") || localStorage.getItem("token");
    if (!token || !activeConversationDoc?._id) return;

    const socket = initSocket(token);
    if (!socket) return;

    const convId = activeConversationDoc._id;
    joinConversationRoom(socket, convId);

    if (selectedContact?.id) {
      fetchPresence(selectedContact.id).then((st) => setContactPresence(st));
    }

    const handleIncomingNewMessage = (msg) => {
      if (!msg) return;
      if (msg.conversationId === convId || (selectedContact?.id && msg.sessionId?.includes(selectedContact.id))) {
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
      if (conversationId === convId && userId === selectedContact?.id) {
        setIsOtherTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsOtherTyping(false), 3500);
      }
    };

    const handleIncomingUserStoppedTyping = ({ conversationId, userId }) => {
      if (conversationId === convId && userId === selectedContact?.id) {
        setIsOtherTyping(false);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      }
    };

    const handleIncomingPresenceChanged = ({ userId, status }) => {
      if (userId === selectedContact?.id) {
        setContactPresence(status);
      }
    };

    const handleReconnect = () => {
      joinConversationRoom(socket, convId);
      api.get(`/api/conversations/${convId}/messages`).then((res) => {
        if (res?.success && Array.isArray(res.data?.messages)) {
          setMessages((prev) => {
            const map = new Map();
            prev.forEach((m) => map.set(m._id, m));
            res.data.messages.forEach((m) => map.set(m._id, m));
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
  }, [activeConversationDoc?._id, selectedContact?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

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
    if ((!text.trim() && !attachmentFile) || !selectedContact) return;

    if (activeConversationDoc?._id) {
      emitTypingStop(activeConversationDoc._id);
    }

    setSending(true);
    try {
      let res;
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("receiverId", selectedContact.id);
        if (text.trim()) formData.append("text", text.trim());
        formData.append("attachment", attachmentFile);
        formData.append("sessionId", `AGY-CONV-${selectedContact.id}`);
        res = await api.post("/api/agency/messages", formData);
      } else {
        res = await api.post("/api/agency/messages", {
          receiverId: selectedContact.id,
          text: text.trim(),
          sessionId: `AGY-CONV-${selectedContact.id}`,
        });
      }

      if (res.success && res.data?.message) {
        setText("");
        handleClearAttachment();
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Filter messages for current selected contact
  const activeConversation = messages.filter(
    (m) =>
      (((m.senderId || m.user)?.toString() === selectedContact?.id || (m.receiverId || m.receiver)?.toString() === selectedContact?.id)) ||
      (m.sessionId && selectedContact && m.sessionId.includes(selectedContact.id))
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Agency Messaging</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Real-time communication with assigned students, internal counselors, and university representatives.
          </p>
        </div>

        <button
          onClick={loadContactsAndMessages}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div
        className="flex-1 rounded-2xl border flex overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        {/* Contacts Sidebar */}
        <div
          className="w-72 border-r border-white/5 flex flex-col"
          style={{ background: "rgba(7, 11, 26, 0.6)" }}
        >
          <div className="p-3 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Conversations ({contacts.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-xs">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No authorized contacts yet. Once students or agents are assigned, you can chat with them here.
              </div>
            ) : (
              contacts.map((c) => {
                const isSelected = selectedContact?.id === c.id;
                const hasUnread = messages.some(
                  (m) =>
                    m.isSeenByAgency === false &&
                    m.sender !== "agency" &&
                    (((m.senderId || m.user)?.toString() === c.id || (m.receiverId || m.receiver)?.toString() === c.id) ||
                     (m.sessionId && m.sessionId.includes(c.id)))
                );
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectContact(c)}
                    className={`w-full p-3 text-left transition-all flex items-center gap-3 ${
                      hasUnread
                        ? "border-l-4 border-l-violet-500 bg-violet-950/30 shadow-[inset_0_0_24px_rgba(139,92,246,0.12)]"
                        : isSelected
                        ? "bg-violet-600/20 border-l-2 border-violet-500"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <c.icon className={`w-4 h-4 ${c.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                        {hasUnread && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            UNREAD
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{c.type}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 flex flex-col justify-between">
          {selectedContact ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">{selectedContact.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-violet-400 font-medium">{selectedContact.type}</span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${contactPresence === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                      {contactPresence === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {activeConversation.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare className="w-10 h-10 text-slate-600 mb-2 opacity-50" />
                    <p className="text-white text-xs font-semibold">Start the conversation</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 max-w-xs">
                      Send a direct message regarding applications, documents, or admissions updates.
                    </p>
                  </div>
                ) : (
                  activeConversation.map((msg, i) => (
                    <MessageBubble
                      key={msg._id || i}
                      msg={msg}
                      currentUserId={user?._id}
                      senderAvatar={selectedContact?.avatar}
                      senderName={selectedContact?.name}
                      themeColor="violet"
                      onSaveEdit={handleSaveEdit}
                      onToggleReaction={handleToggleReaction}
                    />
                  ))
                )}
                {isOtherTyping && (
                  <div className="px-4 py-1 text-xs text-violet-400 italic flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                    <span>{selectedContact.name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form or Voice Recorder */}
              {isRecording ? (
                <div className="p-3 border-t border-white/5">
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
                <form onSubmit={handleSendMessage} className="relative p-3 border-t border-white/5 flex items-center gap-2">
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
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0"
                    title="Record Voice Note"
                  >
                    <Mic className="w-4 h-4 text-violet-400" />
                  </button>
                  <input
                    type="text"
                    placeholder={
                      attachmentFile
                        ? "Add an optional caption..."
                        : `Write a message to ${selectedContact.name}...`
                    }
                    value={text}
                    onChange={handleTextChange}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!text.trim() && !attachmentFile)}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select an authorized contact to view chat history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
