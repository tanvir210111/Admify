import React, { useState } from "react";
import {
  Edit3,
  Check,
  X,
  FileText,
  Download,
  AlertTriangle,
  Loader2,
  Paperclip,
  Smile,
  Volume2,
} from "lucide-react";
import toast from "react-hot-toast";
import SafeMarkdown from "./SafeMarkdown";

const AVAILABLE_EMOJIS = ["👍", "❤️", "🎉", "💡", "🎓", "🚀", "🔥", "👏"];

// Format timestamp
function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Format file size
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function MessageBubble({
  msg,
  currentUserId,
  senderAvatar,
  senderName,
  themeColor = "purple", // "purple" | "cyan" | "violet" | "blue"
  onSaveEdit,
  onToggleReaction,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const myId = currentUserId?.toString();
  const msgSenderId = (
    msg.senderId?._id ||
    msg.senderId ||
    msg.user?._id ||
    msg.user
  )?.toString();

  const isUser = msgSenderId === myId;
  const isAI = Boolean(
    msg.isAI ||
    msg.from === "ai" ||
    msg.sender === "ai" ||
    msg.role === "assistant" ||
    msg.senderModel === "AI" ||
    msg.senderName === "Admify AI" ||
    senderName === "Admify AI"
  );
  const isDeleted = Boolean(msg.isDeleted);
  const isEdited = Boolean(msg.isEdited);

  // Exactly 3-minute edit window check (3 * 60 * 1000 = 180,000 ms)
  const createdAtMs = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
  const isWithinEditWindow = Date.now() - createdAtMs <= 3 * 60 * 1000;
  const canEdit = isUser && !isDeleted && isWithinEditWindow;

  const handleStartEdit = () => {
    setEditText(msg.text || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(msg.text || "");
  };

  const handleSave = async () => {
    if (!editText.trim()) {
      toast.error("Message text cannot be empty.");
      return;
    }
    setSavingEdit(true);
    try {
      if (onSaveEdit) {
        await onSaveEdit(msg._id, editText.trim());
      }
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Failed to update message.");
    } finally {
      setSavingEdit(false);
    }
  };


  // Color classes map based on role
  const bubbleStyles = {
    purple: isUser
      ? "bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-600/20"
      : "bg-[#07142D] text-slate-200 border border-slate-800 rounded-tl-none",
    cyan: isUser
      ? "bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-600/20"
      : "bg-[#07142D] text-slate-200 border border-slate-800 rounded-tl-none",
    violet: isUser
      ? "bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-600/20"
      : "bg-[#07142D] text-slate-200 border border-slate-800 rounded-tl-none",
    blue: isUser
      ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20"
      : "bg-[#07142D] text-slate-200 border border-slate-800 rounded-tl-none",
  };

  return (
    <div
      className={`group flex items-start gap-3 transition-opacity ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {!isUser && (
        <img
          src={
            senderAvatar ||
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
          }
          alt={senderName || "User"}
          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-1"
        />
      )}

      <div
        className={`max-w-[75%] space-y-1.5 ${
          isUser ? "items-end text-right" : "items-start text-left"
        }`}
      >
        {/* Soft-deleted placeholder */}
        {isDeleted ? (
          <div className="p-3.5 rounded-2xl text-xs sm:text-sm italic bg-slate-900/80 text-slate-400 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500">🚫</span>
            <span>This message was deleted</span>
          </div>
        ) : isEditing ? (
          /* Inline Edit Mode */
          <div className="p-3 rounded-2xl bg-[#091228] border border-cyan-500/50 shadow-xl space-y-2.5 text-left w-full sm:min-w-[280px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Edit message
            </span>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full bg-[#050B1F] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
              placeholder="Edit message..."
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={savingEdit || !editText.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#050B1F] bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-1.5 shadow-md shadow-cyan-400/20 disabled:opacity-50"
              >
                {savingEdit ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Message Bubble */
          <div className="relative group/bubble">
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                bubbleStyles[themeColor] || bubbleStyles.purple
              }`}
            >
              {/* Message Text */}
              {msg.text && (
                isAI ? (
                  <SafeMarkdown content={msg.text} />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                )
              )}

              {/* Attachments Section */}
              {Array.isArray(msg.attachments) &&
                msg.attachments.length > 0 &&
                msg.attachments.map((att) => {
                  const isImage = att.mimeType?.startsWith("image/");
                  return (
                    <div
                      key={att._id || att.filename}
                      className={`mt-2.5 rounded-xl overflow-hidden border ${
                        isUser
                          ? "border-white/20 bg-black/20"
                          : "border-slate-700/80 bg-[#050B1F]"
                      }`}
                    >
                      {isImage ? (
                        <div className="space-y-1.5">
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden max-h-60 rounded-t-xl group/img relative"
                          >
                            <img
                              src={att.url}
                              alt={att.originalName}
                              className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Download className="w-4 h-4" />
                              <span>View Image</span>
                            </div>
                          </a>
                          <div className="p-2 px-3 flex items-center justify-between text-[11px] text-slate-300">
                            <span className="truncate max-w-[160px] font-medium">
                              {att.originalName}
                            </span>
                            <span className="text-[10px] opacity-75 font-mono">
                              {formatBytes(att.size)}
                            </span>
                          </div>
                        </div>
                      ) : (att.mimeType?.startsWith("audio/") || ['.webm', '.mp4', '.m4a', '.ogg', '.mp3'].some((ext) => att.originalName?.toLowerCase().endsWith(ext))) ? (
                        <div className="p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-white">
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                              <Volume2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate max-w-[160px]">{att.originalName || "Voice Note"}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-auto">
                              {formatBytes(att.size)}
                            </span>
                          </div>
                          <audio controls className="w-full h-8 rounded" src={att.url}>
                            Your browser does not support audio playback.
                          </audio>
                        </div>
                      ) : (
                        <div className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                                {att.originalName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                PDF Document • {formatBytes(att.size)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={att.originalName}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition shrink-0"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Hover Action Buttons for Reactions, Editing, and Deletion */}
            {!isDeleted && (
              <div
                className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 bg-[#091228] border border-slate-700 rounded-lg p-1 shadow-lg z-10 ${
                  isUser ? "left-0 -translate-x-full mr-2" : "right-0 translate-x-full ml-2"
                }`}
              >
                {/* Emoji Reaction Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                    title="Add reaction"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Emoji Picker Flyout */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-1 left-0 bg-[#0c1838] border border-slate-700 rounded-xl p-1.5 shadow-2xl flex items-center gap-1 z-20">
                      {AVAILABLE_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            if (onToggleReaction) onToggleReaction(msg._id, emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-base p-1 hover:scale-125 transition-transform rounded hover:bg-white/10"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && canEdit && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                    title="Edit message (within 3 mins)"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reaction Pills Row */}
        {!isDeleted && Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
          <div className={`flex flex-wrap items-center gap-1 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
            {Object.values(
              msg.reactions.reduce((acc, r) => {
                const em = r.emoji;
                if (!acc[em]) acc[em] = { emoji: em, count: 0, hasReacted: false };
                acc[em].count += 1;
                if ((r.user?._id || r.user)?.toString() === myId) acc[em].hasReacted = true;
                return acc;
              }, {})
            ).map((g) => (
              <button
                key={g.emoji}
                type="button"
                onClick={() => onToggleReaction && onToggleReaction(msg._id, g.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition ${
                  g.hasReacted
                    ? "bg-purple-500/25 border-purple-500/50 text-purple-200"
                    : "bg-slate-850/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80"
                }`}
                title={`Reacted ${g.count} time(s). Click to toggle.`}
              >
                <span>{g.emoji}</span>
                <span className="text-[10px] opacity-80">{g.count}</span>
              </button>
            ))}
          </div>
        )}


        {/* Timestamp and Edited Tag */}
        <div
          className={`flex items-center gap-1.5 px-1 text-[10px] text-slate-500 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatTime(msg.createdAt)}</span>
          {isEdited && !isDeleted && (
            <span className="text-[9px] font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/60">
              (edited)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
