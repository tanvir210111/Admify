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
} from "lucide-react";

export default function AgencyMessages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultRecipient = searchParams.get("recipient");

  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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

      if (msgRes.success) setMessages(msgRes.data.messages || []);

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
        if (found) setSelectedContact(found);
      } else if (list.length > 0 && !selectedContact) {
        setSelectedContact(list[0]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load communications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactsAndMessages();
  }, [defaultRecipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedContact) return;

    setSending(true);
    try {
      const res = await api.post("/api/agency/messages", {
        receiverId: selectedContact.id,
        text: text.trim(),
        sessionId: `AGY-CONV-${selectedContact.id}`,
      });
      if (res.success) {
        setText("");
        setMessages((prev) => [...prev, res.data.message]);
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
      (m.user?.toString() === selectedContact?.id || m.receiver?.toString() === selectedContact?.id) ||
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
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`w-full p-3 text-left transition-colors flex items-center gap-3 ${
                      isSelected ? "bg-violet-600/20 border-l-2 border-violet-500" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <c.icon className={`w-4 h-4 ${c.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-semibold truncate">{c.name}</p>
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
                  <span className="text-[11px] text-violet-400 font-medium">{selectedContact.type}</span>
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
                  activeConversation.map((msg, i) => {
                    const isAgencySender = msg.sender === "agency" || msg.user?.toString() === user?._id?.toString();
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex flex-col ${isAgencySender ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                            isAgencySender
                              ? "bg-violet-600 text-white rounded-br-sm"
                              : "bg-white/10 text-slate-200 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder={`Write a message to ${selectedContact.name}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
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
