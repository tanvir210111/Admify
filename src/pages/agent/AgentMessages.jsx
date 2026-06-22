import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Paperclip, CheckCircle, ShieldAlert, Award, FileText, Calendar, Info, Circle } from "lucide-react";

const STUDENTS = [
  { name: "Ahmad Khalid", status: "online", unread: 2, uni: "University of Toronto", prog: "MSc Computer Science", stage: "Visa Pending", gpa: "3.85", ielts: "7.5", deadline: "2026-12-15" },
  { name: "Sarah Jenkins", status: "offline", unread: 0, uni: "University of Melbourne", prog: "Master of Finance", stage: "Document Upload", gpa: "3.40", ielts: "6.5", deadline: "2027-01-10" },
  { name: "Liu Wei", status: "online", unread: 0, uni: "University of Manchester", prog: "BSc Data Science", stage: "Enrolled", gpa: "3.70", ielts: "7.0", deadline: "2026-11-30" },
];

const INITIAL_CONVO = {
  "Ahmad Khalid": [
    { sender: "student", text: "Hello! I have uploaded my updated transcript. Could you please check if it meets Toronto's requirements?", time: "14:20" },
    { sender: "agent", text: "Hi Ahmad! Let me check that. Yes, I see it. The transcript looks great, and your GPA is well above their 3.6 threshold.", time: "14:25" },
    { sender: "student", text: "Awesome! What are the next steps for my study visa draft?", time: "14:30" }
  ],
  "Sarah Jenkins": [
    { sender: "agent", text: "Hi Sarah, do you have your reference letters ready for the Melbourne application?", time: "Yesterday" },
    { sender: "student", text: "Yes, I will scan and send them tomorrow morning.", time: "Yesterday" }
  ],
  "Liu Wei": [
    { sender: "student", text: "Hi, I received my official enrollment confirmation letter today!", time: "2 days ago" },
    { sender: "agent", text: "Incredible news Wei! Congratulations. I will log this into the system.", time: "2 days ago" }
  ]
};

export default function AgentMessages() {
  const [activeStudent, setActiveStudent] = useState(STUDENTS[0]);
  const [convos, setConvos] = useState(INITIAL_CONVO);
  const [inputVal, setInputVal] = useState("");
  const chatEndRef = useRef(null);

  const activeMessages = convos[activeStudent.name] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg = { sender: "agent", text: inputVal, time: timeStr };

    setConvos(prev => ({
      ...prev,
      [activeStudent.name]: [...(prev[activeStudent.name] || []), newMsg]
    }));
    setInputVal("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convos, activeStudent]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto h-[calc(100vh-10rem)] min-h-[500px]">

      {/* 1. Left Panel: Chats List */}
      <div className="w-full lg:w-72 rounded-2xl border flex flex-col overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="p-4 border-b border-white/6 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-violet-400" /> Students Chats</h3>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {STUDENTS.map(s => (
            <button
              key={s.name}
              onClick={() => setActiveStudent(s)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeStudent.name === s.name ? "bg-violet-600/20 border border-violet-500/30" : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-bold text-sm text-white">
                  {s.name.charAt(0)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#050b1f] ${
                  s.status === "online" ? "bg-green-500" : "bg-slate-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline">
                  <p className="text-slate-200 font-semibold text-xs truncate">{s.name}</p>
                  {s.unread > 0 && (
                    <span className="bg-violet-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{s.unread}</span>
                  )}
                </div>
                <p className="text-slate-500 text-[10px] truncate mt-0.5">{s.prog}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Center Panel: Chat Window */}
      <div className="flex-1 rounded-2xl border flex flex-col overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="p-4 border-b border-white/6 flex items-center justify-between">
          <div>
            <h4 className="text-white font-bold text-sm leading-none">{activeStudent.name}</h4>
            <p className="text-slate-500 text-[10px] mt-1 flex items-center gap-1">
              <Circle className={`w-1.5 h-1.5 fill-current ${activeStudent.status === "online" ? "text-green-400" : "text-slate-600"}`} />
              {activeStudent.status === "online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Message Log scrollarea */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {activeMessages.map((msg, i) => {
            const isAgent = msg.sender === "agent";
            return (
              <div key={i} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  isAgent
                    ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-none shadow"
                    : "bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-none"
                }`}>
                  <p>{msg.text}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono text-right">{msg.time}</p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Messaging Input bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/6 flex gap-2 items-center">
          <button type="button" className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/8 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Type your message to student..."
            className="flex-1 bg-white/4 border border-white/8 rounded-xl py-2 px-3.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
          />
          <button type="submit" className="p-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:brightness-110 text-white rounded-xl shadow transition-all">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 3. Right Panel: Student Context Info Card */}
      <div className="w-full lg:w-72 rounded-2xl border p-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
        <h4 className="text-white font-bold text-sm border-b border-white/5 pb-2 flex items-center gap-1.5"><Info className="w-4 h-4 text-violet-400" /> Student Profile</h4>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Target Course</p>
            <p className="text-slate-200 font-bold mt-0.5">{activeStudent.uni}</p>
            <p className="text-slate-400">{activeStudent.prog}</p>
          </div>

          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Application Status</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-violet-600/10 text-violet-400 border border-violet-500/20 font-semibold">{activeStudent.stage}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">GPA</p>
              <p className="text-slate-200 font-bold font-mono">{activeStudent.gpa}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">IELTS</p>
              <p className="text-slate-200 font-bold font-mono">{activeStudent.ielts}</p>
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Key Admissions Deadline</p>
            <p className="text-slate-200 font-mono font-bold mt-0.5">{activeStudent.deadline}</p>
          </div>

          <div className="border-t border-white/5 pt-3.5 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase font-black">Upcoming Tasks</p>
            <div className="flex items-center gap-1.5 text-slate-400">
              <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-violet-600 cursor-pointer" />
              <span className="line-through">Verify IELTS certificate</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <input type="checkbox" className="w-3.5 h-3.5 accent-violet-600 cursor-pointer" />
              <span>Submit visa recommendation</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
