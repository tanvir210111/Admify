import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const MAX_RECORDING_SECONDS = 120; // 2 minutes

export default function VoiceRecorder({ onVoiceRecorded, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled || isRecording) return;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Audio recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine supported mime type
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          mimeType = "";
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioChunksRef.current.length > 0) {
          const actualMime = mediaRecorder.mimeType || "audio/webm";
          const ext = actualMime.includes("mp4") ? ".mp4" : ".webm";
          const blob = new Blob(audioChunksRef.current, { type: actualMime });
          const file = new File([blob], `voice-memo-${Date.now()}${ext}`, {
            type: actualMime,
          });

          if (file.size > 5 * 1024 * 1024) {
            toast.error("Voice note exceeded 5MB limit.");
            return;
          }

          if (onVoiceRecorded) {
            onVoiceRecorded(file);
          }
        }
      };

      mediaRecorder.start(200); // Collect slices every 200ms
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn("Microphone access error:", err);
      toast.error("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setSeconds(0);
    toast("Recording cancelled");
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 animate-pulse text-xs font-mono">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="font-bold text-red-400">REC</span>
        <span>{formatTimer(seconds)} / 02:00</span>
        <button
          type="button"
          onClick={cancelRecording}
          className="p-1 rounded hover:bg-red-900/60 text-slate-300 hover:text-white transition ml-1"
          title="Cancel recording"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
        </button>
        <button
          type="button"
          onClick={stopRecording}
          className="p-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center gap-1"
          title="Done recording"
        >
          <Check className="w-3.5 h-3.5" />
          <span className="text-[10px]">Attach</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-cyan-400 border border-slate-700/60 transition disabled:opacity-50"
      title="Record voice note (up to 2 mins)"
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}
