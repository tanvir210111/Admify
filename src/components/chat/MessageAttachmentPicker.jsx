import React, { useRef } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function MessageAttachmentPicker({
  attachment,
  previewUrl,
  onSelect,
  onClear,
  disabled = false,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      toast.error("Unsupported file type. Please select a JPG, PNG, WEBP, or PDF file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size limit (10MB)
    if (file.size > MAX_SIZE) {
      toast.error(`File size (${formatBytes(file.size)}) exceeds the 10MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (onSelect) {
      onSelect(file);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onClear) onClear();
  };

  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        disabled={disabled}
      />

      {/* Attachment Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
        title="Attach file (JPG, PNG, WEBP, PDF up to 10MB)"
      >
        <Paperclip className="w-4 h-4" />
      </button>

      {/* Attachment Preview Banner if file selected */}
      {attachment && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 px-3 rounded-2xl bg-[#091228] border border-cyan-500/40 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-10 h-10 rounded-lg object-cover border border-cyan-500/30 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate max-w-[240px]">
                {attachment.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {formatBytes(attachment.size)} • Ready to send
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition shrink-0"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
