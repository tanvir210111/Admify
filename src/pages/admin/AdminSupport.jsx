/**
 * AdminSupport.jsx — Clean rebuild
 *
 * Architecture:
 *   AdminLayout > main > AdminSupport
 *     ├── Page Header  (normal document flow)
 *     └── Support Workspace  (bounded height grid)
 *           ├── Left — Conversation Inbox  (list scrolls)
 *           └── Right — Conversation Panel  (message history scrolls)
 *
 * Rules enforced:
 *   - NO body/html/root overflow manipulation
 *   - NO viewport-level fixed positioning for the page itself
 *   - NO nested page-level overflow containers
 *   - Workspace owns its own bounded height via min()
 *   - Only two scroll owners: left list + right message history
 */

import React, {
  useState, useEffect, useRef, useCallback, useLayoutEffect,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare, Search, Send, User, Bot, Shield, AlertCircle,
  RefreshCw, ChevronLeft, ArrowDown, Trash2, Headphones,
} from "lucide-react";
import { api } from "../../lib/api";
import { initSocket, getSocket } from "../../lib/socket";
import { useAdminBadges } from "../../context/AdminBadgeContext";
import SafeMarkdown from "../../components/chat/SafeMarkdown";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const NEAR_BOTTOM_PX = 100;

const STATUS_FILTERS = [
  { key: "all",         label: "All" },
  { key: "needs_agent", label: "Handover" },
  { key: "open",        label: "Open" },
  { key: "resolved",    label: "Resolved" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getConvId  = (c) => c?.sessionId || c?.id || c?._id || "";
const getName    = (c) => c?.student?.name || c?.user?.name || `Visitor (${getConvId(c).slice(-6)})`;
const getEmail   = (c) => c?.student?.email || c?.user?.email || "";
const getInitial = (c) => (getName(c)[0] || "V").toUpperCase();

function fmtTime(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getSenderType(msg) {
  if (msg.sender === "system" || msg.isLiveAgentRequest)              return "system";
  if (msg.sender === "admin"  || msg.sender === "agent")              return "admin";
  if (msg.sender === "bot" || msg.sender === "ai" ||
      msg.role   === "model" || msg.role   === "assistant")           return "bot";
  return "visitor";
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  bg:           "rgba(5,11,31,0.55)",
  bgCard:       "rgba(7,9,30,0.45)",
  border:       "rgba(30,41,59,0.85)",
  borderSoft:   "rgba(30,41,59,0.55)",
  muted:        "#64748b",
  subdued:      "#94a3b8",
  violet:       "#7c3aed",
  violetDark:   "#6d28d9",
  amber:        "#fbbf24",
  emerald:      "#34d399",
  rose:         "#f87171",
  cyan:         "#22d3ee",
};

// ─── ConvCard ─────────────────────────────────────────────────────────────────

function ConvCard({ conv, isSelected, onClick }) {
  const name      = getName(conv);
  const email     = getEmail(conv);
  const isUnseen  = !conv.isSeenByAdmin;
  const needsAgent = conv.status === "needs_agent" || conv.isLiveAgentRequest;
  const isResolved = conv.status === "resolved";

  const baseBg = isSelected
    ? "rgba(109,40,217,0.13)"
    : isUnseen
    ? "rgba(76,29,149,0.07)"
    : "transparent";

  return (
    <div
      onClick={onClick}
      style={{
        padding:      "11px 14px",
        cursor:       "pointer",
        display:      "flex",
        alignItems:   "flex-start",
        gap:          10,
        borderBottom: "1px solid rgba(30,41,59,0.35)",
        borderLeft:   isSelected || isUnseen
          ? `3px solid ${T.violet}`
          : "3px solid transparent",
        background:   baseBg,
        transition:   "background 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = "rgba(30,41,59,0.28)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = baseBg;
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: isSelected ? "linear-gradient(135deg,#6d28d9,#4338ca)" : "rgba(30,41,59,0.8)",
        border: `1px solid ${isSelected ? "rgba(109,40,217,0.5)" : "rgba(51,65,85,0.65)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, color: "white", fontSize: 14,
        boxShadow: isSelected ? "0 0 10px rgba(109,40,217,0.3)" : "none",
      }}>
        {getInitial(conv)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
          <span style={{ fontWeight: 700, color: "white", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </span>
          <span style={{ fontSize: 10, color: T.muted, flexShrink: 0 }}>
            {fmtTime(conv.updatedAt || conv.createdAt)}
          </span>
        </div>

        {email && (
          <div style={{ fontSize: 11, color: T.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email}
          </div>
        )}

        {conv.lastMessage && (
          <div style={{ fontSize: 11, color: T.subdued, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {conv.lastMessage}
          </div>
        )}

        {(needsAgent || isResolved || (isUnseen && !isSelected)) && (
          <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
            {needsAgent && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: T.amber, border: "1px solid rgba(245,158,11,0.25)" }}>
                Handover
              </span>
            )}
            {isResolved && !needsAgent && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,0.1)", color: T.emerald, border: "1px solid rgba(16,185,129,0.25)" }}>
                Resolved
              </span>
            )}
            {isUnseen && !isSelected && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.violet, display: "inline-block", boxShadow: "0 0 4px rgba(124,58,237,0.7)" }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, selected, isFirst, isLast, marginTop }) {
  const sType = getSenderType(msg);
  const text  = msg.message || msg.text || "";

  if (sType === "system") {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)",
          borderRadius: 999, padding: "6px 14px", fontSize: 11, color: "#fcd34d", maxWidth: "88%",
        }}>
          <AlertCircle style={{ width: 12, height: 12, color: "#f59e0b", flexShrink: 0 }} />
          {text}
        </div>
      </div>
    );
  }

  const isAdmin = sType === "admin";
  const isBot   = sType === "bot";
  const alignRight = isAdmin;

  const bubbleBg = isAdmin ? T.violetDark : isBot ? "rgba(8,145,178,0.15)" : "rgba(30,41,59,0.65)";
  const bubbleBorder = isAdmin ? "none" : isBot ? "1px solid rgba(8,145,178,0.3)" : "1px solid rgba(51,65,85,0.45)";
  const AvatarIcon = isBot ? Bot : isAdmin ? Shield : User;
  const avatarBg   = isBot ? "rgba(8,145,178,0.22)" : isAdmin ? "rgba(109,40,217,0.28)" : "rgba(30,41,59,0.7)";
  const avatarBorder = isBot ? "1px solid rgba(8,145,178,0.35)" : isAdmin ? "1px solid rgba(109,40,217,0.45)" : "1px solid rgba(51,65,85,0.55)";
  const avatarColor  = isBot ? T.cyan : isAdmin ? "#a78bfa" : T.subdued;
  const labelColor   = isBot ? T.cyan : isAdmin ? "#a78bfa" : T.subdued;
  const senderLabel  = isAdmin ? "Admin Staff" : isBot ? "Admify AI" : getName(selected);

  return (
    <div style={{ display: "flex", flexDirection: alignRight ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginTop }}>
      <div style={{ width: 26, flexShrink: 0 }}>
        {isLast ? (
          <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: avatarBg, border: avatarBorder }}>
            <AvatarIcon style={{ width: 12, height: 12, color: avatarColor }} />
          </div>
        ) : <div style={{ width: 26 }} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: alignRight ? "flex-end" : "flex-start", maxWidth: "72%", minWidth: 0 }}>
        {isFirst && (
          <span style={{ fontSize: 10, fontWeight: 600, marginBottom: 3, display: "flex", alignItems: "center", gap: 4, color: labelColor }}>
            <AvatarIcon style={{ width: 10, height: 10 }} />
            {senderLabel}
            {isBot && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(8,145,178,0.15)", color: T.cyan, border: "1px solid rgba(8,145,178,0.25)" }}>
                AI
              </span>
            )}
          </span>
        )}

        <div style={{
          padding: "9px 13px",
          borderRadius: alignRight ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          fontSize: 12, lineHeight: 1.65,
          background: bubbleBg, border: bubbleBorder, color: "white",
          overflowWrap: "anywhere", wordBreak: "break-word",
          boxShadow: isAdmin ? "0 2px 10px rgba(109,40,217,0.28)" : isBot ? "0 2px 8px rgba(8,145,178,0.12)" : "none",
        }}>
          {isBot ? <SafeMarkdown content={text} /> : <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>}
        </div>

        {isLast && msg.createdAt && (
          <span style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>{fmtTime(msg.createdAt)}</span>
        )}
      </div>
    </div>
  );
}

// ─── AdminSupport ─────────────────────────────────────────────────────────────

export default function AdminSupport() {
  const { getStatusCount, markEntityAsSeen } = useAdminBadges();

  const [conversations,   setConversations]   = useState([]);
  const [selected,        setSelected]        = useState(null);
  const [messages,        setMessages]        = useState([]);
  const [loadingConvs,    setLoadingConvs]    = useState(true);
  const [loadingMsgs,     setLoadingMsgs]     = useState(false);
  const [reply,           setReply]           = useState("");
  const [sending,         setSending]         = useState(false);
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [showJump,        setShowJump]        = useState(false);
  const [mobileView,      setMobileView]      = useState("list"); // "list" | "chat"

  const msgAreaRef      = useRef(null);
  const wasNearBotRef   = useRef(true);
  const prevMsgCountRef = useRef(0);
  const selectedRef     = useRef(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // ── Scroll ─────────────────────────────────────────────────────────────────

  const isNearBottom = useCallback(() => {
    const el = msgAreaRef.current;
    if (!el || el.clientHeight === 0) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    const el = msgAreaRef.current;
    if (!el || el.clientHeight === 0) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleMsgScroll = useCallback(() => {
    wasNearBotRef.current = isNearBottom();
    if (wasNearBotRef.current) setShowJump(false);
  }, [isNearBottom]);

  useLayoutEffect(() => {
    if (messages.length === 0) {
      prevMsgCountRef.current = 0; wasNearBotRef.current = true; setShowJump(false); return;
    }
    const prev = prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    if (prev === 0) {
      requestAnimationFrame(() => {
        const el = msgAreaRef.current;
        if (el) { el.scrollTop = el.scrollHeight; wasNearBotRef.current = true; }
      });
      return;
    }
    if (messages.length > prev) {
      requestAnimationFrame(() => {
        if (wasNearBotRef.current) { scrollToBottom("smooth"); setShowJump(false); }
        else setShowJump(true);
      });
    }
  }, [messages, scrollToBottom]);

  // ── API ────────────────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      const res = await api.get("/api/admin/support/conversations");
      if (res?.success) setConversations(res.data?.conversations || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to load inbox");
    } finally { setLoadingConvs(false); }
  }, []);

  const selectConv = useCallback(async (conv) => {
    prevMsgCountRef.current = 0; wasNearBotRef.current = true;
    setShowJump(false); setMessages([]); setSelected(conv); setMobileView("chat");
    const sid = getConvId(conv);
    if (!sid) return;
    if (!conv.isSeenByAdmin) { conv.isSeenByAdmin = true; markEntityAsSeen("support", sid); }
    try {
      setLoadingMsgs(true);
      const res = await api.get(`/api/admin/support/conversations/${sid}`);
      if (res?.success) setMessages(res.data?.messages || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to load messages");
    } finally { setLoadingMsgs(false); }
  }, [markEntityAsSeen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    const sid = getConvId(selected);
    try {
      setSending(true);
      const res = await api.post(`/api/admin/support/conversations/${sid}/reply`, {
        text: reply.trim(), message: reply.trim(),
      });
      if (res?.success) {
        const msg = res.data?.reply || res.data?.message || { sender: "agent", text: reply.trim(), createdAt: new Date() };
        setMessages((prev) => [...prev, msg]);
        setReply(""); fetchConversations();
      } else toast.error(res?.message || "Failed to send");
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to send");
    } finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const sid = getConvId(selected);
    try {
      setDeleting(true);
      const res = await api.delete(`/api/admin/support/conversations/${sid}`);
      if (res?.success) {
        toast.success("Conversation deleted.");
        setShowDeleteModal(false);
        setConversations((prev) => prev.filter((c) => getConvId(c) !== sid));
        setSelected(null); setMessages([]); setMobileView("list"); fetchConversations();
      } else toast.error(res?.message || "Failed to delete");
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to delete");
    } finally { setDeleting(false); }
  };

  // ── Socket ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchConversations();
    const token  = localStorage.getItem("admify_token") || localStorage.getItem("token");
    const socket = initSocket(token) || getSocket();
    if (!socket) return;

    const onNew = () => fetchConversations();
    const onMsg = (data) => {
      const sel = selectedRef.current;
      if (data?.sessionId && sel && (sel.sessionId === data.sessionId || sel.id === data.sessionId)) {
        if (data.message) setMessages((prev) => [...prev, data.message]);
      }
      fetchConversations();
    };
    const onDel = (data) => {
      if (!data?.sessionId) return;
      setConversations((prev) => prev.filter((c) => getConvId(c) !== data.sessionId));
      const sel = selectedRef.current;
      if (sel && getConvId(sel) === data.sessionId) {
        setSelected(null); setMessages([]); setMobileView("list");
      }
    };

    socket.on("new_support_request",            onNew);
    socket.on("support_message_received",       onMsg);
    socket.on("support_conversation_deleted",   onDel);
    return () => {
      socket.off("new_support_request",          onNew);
      socket.off("support_message_received",     onMsg);
      socket.off("support_conversation_deleted", onDel);
    };
  }, [fetchConversations]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = conversations.filter((c) => {
    const s = c.student || c.user || {};
    const q = search.toLowerCase();
    const hit = !q ||
      s.name?.toLowerCase().includes(q)    ||
      s.email?.toLowerCase().includes(q)   ||
      s.phone?.toLowerCase().includes(q)   ||
      (c.sessionId   || "").toLowerCase().includes(q) ||
      (c.lastMessage || "").toLowerCase().includes(q);
    return hit && (statusFilter === "all" || c.status === statusFilter);
  });

  const selectedId = getConvId(selected);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", color: "#f1f5f9" }}>

      {/* ══ PAGE HEADER ══════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 22, fontWeight: 900, color: "white" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(109,40,217,0.2)", border: "1px solid rgba(109,40,217,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare style={{ width: 18, height: 18, color: "#a78bfa" }} />
            </div>
            Support Desk &amp; Bot Handover
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
            Real-time human-in-the-loop support inbox for escalated student inquiries and inquiries
          </p>
        </div>

        <button
          onClick={fetchConversations}
          disabled={loadingConvs}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, background: "rgba(30,41,59,0.7)", border: "1px solid rgba(51,65,85,0.7)", color: "#cbd5e1", fontSize: 12, fontWeight: 600, cursor: loadingConvs ? "not-allowed" : "pointer", transition: "all 0.15s", flexShrink: 0 }}
          onMouseEnter={(e) => { if (!loadingConvs) { e.currentTarget.style.borderColor = "rgba(109,40,217,0.5)"; e.currentTarget.style.color = "white"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(51,65,85,0.7)"; e.currentTarget.style.color = "#cbd5e1"; }}
        >
          <RefreshCw className={loadingConvs ? "animate-spin" : ""} style={{ width: 13, height: 13 }} />
          Refresh Inbox
        </button>
      </div>

      {/* ══ SUPPORT WORKSPACE ════════════════════════════════════════════════
          Bounded height. Grid layout. Does NOT scroll itself.
          Two interior scroll areas: left list + right message history.
      ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="support-workspace"
        style={{
          height:              "min(650px, calc(100vh - 250px))",
          minHeight:           420,
          display:             "grid",
          gridTemplateColumns: "minmax(280px, 32%) minmax(0, 1fr)",
          overflow:            "hidden",
          borderRadius:        16,
          border:              `1px solid ${T.border}`,
          boxShadow:           "0 24px 64px -12px rgba(0,0,0,0.6)",
          background:          T.bg,
        }}
      >

        {/* ════════════════════════════════════════════════════════════════════
            LEFT — CONVERSATION INBOX
        ════════════════════════════════════════════════════════════════════ */}
        <div
          className="inbox-left"
          style={{
            display:       mobileView === "chat" ? "none" : "flex",
            flexDirection: "column",
            height:        "100%",
            minHeight:     0,
            borderRight:   `1px solid ${T.borderSoft}`,
            background:    T.bgCard,
          }}
        >
          {/* Search + Filters — flex-shrink:0 */}
          <div style={{ flexShrink: 0, padding: "12px 12px 8px", borderBottom: `1px solid ${T.borderSoft}` }}>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: T.muted }} />
              <input
                type="text"
                placeholder="Search name, email, session…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, background: "rgba(15,23,42,0.8)", border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 12, color: "white", outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => (e.target.style.borderColor = T.violet)}
                onBlur={(e)  => (e.target.style.borderColor = T.border)}
              />
            </div>

            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {STATUS_FILTERS.map(({ key, label }) => {
                const cnt = getStatusCount("supportInbox", key);
                const act = statusFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 7, cursor: "pointer", border: act ? "none" : "1px solid rgba(51,65,85,0.55)", background: act ? T.violet : "rgba(30,41,59,0.5)", color: act ? "white" : T.subdued, display: "flex", alignItems: "center", gap: 4, transition: "all 0.12s" }}
                  >
                    {label}
                    {cnt > 0 && (
                      <span style={{ background: "rgba(139,92,246,0.28)", color: "#c4b5fd", padding: "1px 4px", borderRadius: 4, fontSize: 9, fontWeight: 700 }}>
                        {cnt}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation list — THE LEFT SCROLL OWNER */}
          <div className="custom-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
            {loadingConvs ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: T.muted }}>
                <RefreshCw className="animate-spin" style={{ width: 20, height: 20, margin: "0 auto 10px", color: "#a78bfa", display: "block" }} />
                <div style={{ fontSize: 12 }}>Loading conversations…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: T.muted, fontSize: 12 }}>
                <MessageSquare style={{ width: 28, height: 28, margin: "0 auto 10px", color: "#1e293b", display: "block" }} />
                {search || statusFilter !== "all" ? "No matching conversations." : "No conversations yet."}
              </div>
            ) : (
              filtered.map((conv) => (
                <ConvCard
                  key={getConvId(conv)}
                  conv={conv}
                  isSelected={getConvId(conv) === selectedId}
                  onClick={() => selectConv(conv)}
                />
              ))
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT — CONVERSATION PANEL
        ════════════════════════════════════════════════════════════════════ */}
        <div
          className="inbox-right"
          style={{ display: mobileView === "list" ? "none" : "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden", position: "relative" }}
        >
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.muted, padding: 32 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(30,41,59,0.4)", border: "1px solid rgba(51,65,85,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <MessageSquare style={{ width: 28, height: 28, color: "#1e293b" }} />
              </div>
              <h3 style={{ fontWeight: 700, color: "#cbd5e1", fontSize: 14, margin: "0 0 6px" }}>Select a conversation</h3>
              <p style={{ fontSize: 12, color: T.muted, textAlign: "center", maxWidth: 230, margin: 0, lineHeight: 1.6 }}>
                Choose a student inquiry from the left panel to read and respond.
              </p>
            </div>
          ) : (
            <>
              {/* Conv Header — flex-shrink:0 */}
              <div style={{ flexShrink: 0, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, background: "rgba(5,11,31,0.6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  {/* Mobile back */}
                  <button
                    type="button"
                    className="lg:hidden"
                    onClick={() => { setSelected(null); setMessages([]); setMobileView("list"); }}
                    style={{ padding: "4px 6px", borderRadius: 8, background: "transparent", border: "none", color: T.subdued, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <ChevronLeft style={{ width: 18, height: 18 }} />
                  </button>

                  <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#6d28d9,#4338ca)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 14, boxShadow: "0 0 14px rgba(109,40,217,0.35)" }}>
                    {getInitial(selected)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "white", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getName(selected)}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getEmail(selected) || "Public Visitor"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* Status */}
                  {(() => {
                    const isLive = selected.status === "needs_agent" || selected.isLiveAgentRequest;
                    const isRes  = selected.status === "resolved";
                    return (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: isLive ? "rgba(245,158,11,0.1)" : isRes ? "rgba(16,185,129,0.1)" : "rgba(30,41,59,0.7)", color: isLive ? T.amber : isRes ? T.emerald : T.subdued, border: isLive ? "1px solid rgba(245,158,11,0.3)" : isRes ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(51,65,85,0.6)" }}>
                        {isLive ? <><Headphones style={{ width: 10, height: 10 }} />Live Agent</> : isRes ? "Resolved" : selected.status || "open"}
                      </span>
                    );
                  })()}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ padding: "5px 10px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.08)", color: T.rose, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.22)"; }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {/* Message History — THE RIGHT SCROLL OWNER: flex:1, minHeight:0, overflowY:auto */}
              <div
                ref={msgAreaRef}
                onScroll={handleMsgScroll}
                className="custom-scrollbar"
                style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
              >
                <div style={{ padding: "16px 16px 8px" }}>
                  {loadingMsgs && (
                    <div style={{ padding: "56px 0", textAlign: "center", color: T.muted }}>
                      <RefreshCw className="animate-spin" style={{ width: 20, height: 20, margin: "0 auto 10px", color: "#a78bfa", display: "block" }} />
                      <div style={{ fontSize: 12 }}>Loading conversation…</div>
                    </div>
                  )}

                  {!loadingMsgs && messages.length === 0 && (
                    <div style={{ padding: "56px 0", textAlign: "center", color: T.muted }}>
                      <MessageSquare style={{ width: 28, height: 28, margin: "0 auto 10px", color: "#1e293b", display: "block" }} />
                      <div style={{ fontSize: 12 }}>No message history found.</div>
                    </div>
                  )}

                  {!loadingMsgs && messages.map((msg, idx) => {
                    const sType   = getSenderType(msg);
                    const prevType = idx > 0 ? getSenderType(messages[idx - 1]) : null;
                    const nextType = idx < messages.length - 1 ? getSenderType(messages[idx + 1]) : null;
                    const isFirst  = sType !== prevType;
                    const isLast   = sType !== nextType;
                    const mt       = idx === 0 ? 0 : isFirst ? 18 : 3;
                    return (
                      <MessageBubble
                        key={msg._id || msg.id || idx}
                        msg={msg}
                        selected={selected}
                        isFirst={isFirst}
                        isLast={isLast}
                        marginTop={mt}
                      />
                    );
                  })}

                  <div style={{ height: 8 }} />
                </div>
              </div>

              {/* Jump-to-bottom pill */}
              <AnimatePresence>
                {showJump && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                    style={{ position: "absolute", bottom: 68, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}
                  >
                    <button
                      type="button"
                      onClick={() => { scrollToBottom("smooth"); setShowJump(false); }}
                      style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, border: "1px solid rgba(139,92,246,0.4)", background: "rgba(109,40,217,0.95)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(109,40,217,0.5)", backdropFilter: "blur(4px)" }}
                    >
                      <ArrowDown style={{ width: 13, height: 13 }} />
                      ↓ New messages
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Composer — flex-shrink:0 */}
              <form
                onSubmit={handleSend}
                style={{ flexShrink: 0, padding: "10px 14px", borderTop: `1px solid ${T.border}`, background: "rgba(5,11,31,0.65)", display: "flex", alignItems: "center", gap: 10 }}
              >
                <input
                  type="text"
                  placeholder="Write a reply to student…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                  disabled={sending}
                  style={{ flex: 1, background: "rgba(15,23,42,0.85)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "9px 14px", fontSize: 12, color: "white", outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = T.violet)}
                  onBlur={(e)  => (e.target.style.borderColor = T.border)}
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  style={{ padding: "9px 16px", borderRadius: 12, border: "none", flexShrink: 0, background: sending || !reply.trim() ? "rgba(109,40,217,0.35)" : T.violet, color: "white", fontSize: 12, fontWeight: 700, cursor: sending || !reply.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: !sending && reply.trim() ? "0 4px 14px rgba(109,40,217,0.45)" : "none", transition: "all 0.15s" }}
                >
                  {sending ? <RefreshCw style={{ width: 13, height: 13 }} className="animate-spin" /> : <Send style={{ width: 13, height: 13 }} />}
                  Send
                </button>
              </form>
            </>
          )}
        </div>

      </div>{/* end workspace */}

      {/* ══ DELETE MODAL ═════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
              style={{ background: "rgb(11,18,40)", border: `1px solid ${T.border}`, borderRadius: 20, maxWidth: 440, width: "100%", padding: 24, boxShadow: "0 25px 50px -10px rgba(0,0,0,0.7)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 style={{ width: 18, height: 18, color: T.rose }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: "white", fontSize: 15, margin: 0 }}>Delete this conversation?</h3>
                  <p style={{ fontSize: 12, color: T.muted, margin: "3px 0 0" }}>Permanent — cannot be undone</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, marginBottom: 20 }}>
                This will permanently delete the complete conversation history including all AI messages, Live Agent exchanges, and associated data.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" disabled={deleting} onClick={() => setShowDeleteModal(false)}
                  style={{ padding: "8px 16px", fontSize: 12, fontWeight: 500, color: "#cbd5e1", background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="button" disabled={deleting} onClick={handleDelete}
                  style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, color: "white", background: "#dc2626", border: "none", borderRadius: 12, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1, display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.15s" }}>
                  {deleting ? <><RefreshCw style={{ width: 13, height: 13 }} className="animate-spin" /><span>Deleting…</span></> : <><Trash2 style={{ width: 13, height: 13 }} /><span>Delete Conversation</span></>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Responsive overrides ══════════════════════════════════════════════
          Desktop (lg+): both panels always visible, restore grid columns.
          Tablet: slightly narrower left.
          Mobile: single column; JS mobileView toggles display.
      ═══════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @media (min-width: 1024px) {
          .support-workspace { grid-template-columns: minmax(280px, 32%) minmax(0, 1fr) !important; }
          .inbox-left  { display: flex !important; }
          .inbox-right { display: flex !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .support-workspace { grid-template-columns: minmax(220px, 38%) minmax(0, 1fr) !important; }
          .inbox-left  { display: flex !important; }
          .inbox-right { display: flex !important; }
        }
        @media (max-width: 639px) {
          .support-workspace { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}
