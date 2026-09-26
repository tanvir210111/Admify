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
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

export default function UniRepMessages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPartner = searchParams.get("partner");

  const [messages, setMessages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialPartner || null);
  const [activePartner, setActivePartner] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedPartnerId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!selectedPartnerId) {
      toast.error("Please select a connected partner agency to chat with.");
      return;
    }

    setSending(true);
    const content = text.trim();
    setText("");

    try {
      const res = await api.post("/api/university-rep/messages", {
        receiverId: selectedPartnerId,
        text: content,
      });

      if (res?.success && res?.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
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
    const senderId = m.user?._id || m.user;
    const receiverId = m.receiver?._id || m.receiver;
    const myId = user?._id;
    return (
      (senderId === myId && receiverId === selectedPartnerId) ||
      (senderId === selectedPartnerId && receiverId === myId) ||
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
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
              partnerMessages.map((msg, idx) => {
                const isMine = (msg.user?._id || msg.user) === user?._id;
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isMine
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none"
                          : "bg-[#0B1228] text-slate-200 border border-white/5 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/5 bg-[#070E24]/50 flex items-center gap-2">
            <input
              type="text"
              disabled={!activePartner || sending}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                activePartner
                  ? `Message ${activePartner.name}...`
                  : "Select an agency partner to compose message..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!activePartner || !text.trim() || sending}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition disabled:opacity-40"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
