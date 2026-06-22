import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Headphones, Send, Paperclip, Circle, AlertTriangle, CheckCircle2, Clock, Users, MessageSquare, Star, ChevronRight } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const AGENTS_LIST = [
  { name: "James Thornton",  agency: "GlobalStudy UK",    status: "online",  students: 48, responseTime: "< 1 min",  avatar: "JT", lastMsg: "Student visa docs confirmed for Ahmad" },
  { name: "Mei Lin",         agency: "Pacific Edu Group", status: "online",  students: 62, responseTime: "< 2 min",  avatar: "ML", lastMsg: "Melbourne application approved 🎉" },
  { name: "Rahul Verma",     agency: "Apex Consultancy",  status: "online",  students: 55, responseTime: "3 min",    avatar: "RV", lastMsg: "Need SOP template for Stanford" },
  { name: "Sophie Laurent",  agency: "EduConnect France", status: "away",    students: 41, responseTime: "8 min",    avatar: "SL", lastMsg: "Checking scholarship eligibility" },
  { name: "Ahmed Nasser",    agency: "MidEast Admissions",status: "offline", students: 33, responseTime: "—",        avatar: "AN", lastMsg: "Will reconnect after meeting" },
];

const TICKETS = [
  { id: "TKT-001", agent: "James Thornton",  priority: "high",   issue: "Document verification delay for Ahmad Khalid",   status: "open" },
  { id: "TKT-002", agent: "Mei Lin",         priority: "medium", issue: "Application fee refund request — Liu Wei",        status: "in_progress" },
  { id: "TKT-003", agent: "Rahul Verma",     priority: "low",    issue: "SOP template update request",                    status: "resolved" },
  { id: "TKT-004", agent: "Sophie Laurent",  priority: "high",   issue: "Scholarship deadline missed — student error",     status: "open" },
  { id: "TKT-005", agent: "Ahmed Nasser",    priority: "medium", issue: "Visa rejection appeal for Fatima Hassan",        status: "in_progress" },
];

const ESCALATIONS = [
  { student: "Ahmad Khalid",   agent: "James Thornton", issue: "Document Upload Failure", priority: "high" },
  { student: "Priya Sharma",   agent: "Mei Lin",        issue: "Application Error",        priority: "medium" },
  { student: "Yusuf Adebayo",  agent: "Ahmed Nasser",   issue: "Visa Query",               priority: "low" },
];

const INIT_MESSAGES = [
  { from: "agent", text: "Hi Admin, I need help with Ahmad's document verification. The university portal is rejecting his transcripts.", time: "10:22 AM" },
  { from: "admin", text: "I'll look into it right away. Can you confirm the document format he used?", time: "10:24 AM" },
  { from: "agent", text: "He submitted PDF but the portal only accepts certified copies scanned at 300 DPI.", time: "10:25 AM" },
  { from: "admin", text: "Got it. I've updated the requirements guide. Ask him to re-scan and resubmit within 24h.", time: "10:26 AM" },
  { from: "agent", text: "Perfect, will do. Also — are we getting the new scholarship list for Q3? Three of my students are eligible.", time: "10:27 AM" },
];

const PRIORITY_MAP = {
  high:   "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const STATUS_MAP = {
  open:        "bg-red-500/15 text-red-400 border-red-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  resolved:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const DOT_COLOR = { online: "bg-emerald-400", away: "bg-yellow-400", offline: "bg-slate-600" };

export default function AdminLiveAgents() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS_LIST[0]);
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const msgEnd = useRef(null);
  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "admin", text: input.trim(), time: now() }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "agent", text: "Thanks Admin! I'll follow up with the student immediately.", time: now() }]);
    }, 1200);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 max-w-[1600px] mx-auto">
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2"><Headphones className="w-6 h-6 text-emerald-400" /> Live Agent Center</h1>
          <p className="text-slate-400 text-sm mt-1">CRM-style admin-agent communication & ticket management</p>
        </div>
      </motion.div>

      {/* Top KPI */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Online Agents",       val: "3",    color: "text-emerald-400", icon: Circle },
          { label: "Active Chats",        val: "8",    color: "text-blue-400",    icon: MessageSquare },
          { label: "Avg Response Time",   val: "2.4m", color: "text-violet-400",  icon: Clock },
          { label: "Student Satisfaction",val: "94.2%",color: "text-yellow-400",  icon: Star },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 3-Column CRM */}
      <motion.div variants={fade} className="grid grid-cols-1 xl:grid-cols-12 gap-4" style={{ height: "600px" }}>

        {/* LEFT: Agent List */}
        <div className="xl:col-span-3 rounded-2xl border overflow-hidden flex flex-col" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="p-4 border-b border-white/6"><p className="text-white font-bold text-sm">Online Agents</p></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {AGENTS_LIST.map((a, i) => (
              <button key={i} onClick={() => setSelectedAgent(a)}
                className={`w-full flex items-start gap-3 p-4 border-b border-white/4 transition-colors text-left ${selectedAgent.name === a.name ? "bg-violet-600/15 border-l-2 border-l-violet-500" : "hover:bg-white/3"}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/40 to-cyan-600/40 flex items-center justify-center text-xs font-bold text-blue-300 border border-blue-500/20">{a.avatar}</div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${DOT_COLOR[a.status]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-200 text-xs font-bold truncate">{a.name}</p>
                  <p className="text-slate-500 text-[10px]">{a.agency}</p>
                  <p className="text-slate-600 text-[10px] mt-1 truncate">{a.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Chat */}
        <div className="xl:col-span-5 rounded-2xl border overflow-hidden flex flex-col" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/6" style={{ background: "rgba(139,92,246,0.06)" }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/40 to-cyan-600/40 flex items-center justify-center text-xs font-bold text-blue-300">{selectedAgent.avatar}</div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${DOT_COLOR[selectedAgent.status]}`} />
            </div>
            <div>
              <p className="text-white text-sm font-bold">{selectedAgent.name}</p>
              <p className="text-slate-400 text-xs">{selectedAgent.agency} · {selectedAgent.students} students · ⚡ {selectedAgent.responseTime}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === "admin" ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-sm" : "bg-white/6 border border-white/8 text-slate-200 rounded-bl-sm"}`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === "admin" ? "text-violet-200" : "text-slate-500"}`}>{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={msgEnd} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:text-white transition-colors"><Paperclip className="w-4 h-4" /></button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder={`Message ${selectedAgent.name}...`}
                className="flex-1 bg-white/5 border border-white/8 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all" />
              <button onClick={send} className="p-2 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl text-white hover:opacity-90 transition-opacity"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* RIGHT: Agent Details */}
        <div className="xl:col-span-4 rounded-2xl border overflow-hidden flex flex-col" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="p-4 border-b border-white/6"><p className="text-white font-bold text-sm">Agent Details</p></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div className="p-3 rounded-xl border border-white/6 bg-white/2 space-y-2">
              {[
                ["Agency", selectedAgent.agency], ["Status", selectedAgent.status], ["Assigned Students", selectedAgent.students],
                ["Avg Response", selectedAgent.responseTime], ["Country", selectedAgent.name === "James Thornton" ? "🇬🇧 UK" : "🌍 International"],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200 font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Active Applications</p>
              {["Ahmad Khalid → Oxford MSc", "Priya Sharma → Melbourne MBA", "Liu Wei → Stanford PhD"].map((a, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-white/4 last:border-0">
                  <ChevronRight className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  <span className="text-slate-300 text-xs">{a}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Support Requests</p>
              <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <p className="text-red-300 text-xs font-bold">2 Open Tickets</p>
                <p className="text-slate-400 text-[10px] mt-1">Document verification · Scholarship query</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tickets */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <h2 className="text-lg font-bold text-white">Agent Tickets</h2>
          <span className="px-3 py-1 text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 rounded-full">3 Open</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead><tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
              {["Ticket ID","Agent","Priority","Issue","Status","Actions"].map(h => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
            </tr></thead>
            <tbody>
              {TICKETS.map((t, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3 text-violet-400 font-mono text-sm font-bold">{t.id}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{t.agent}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${PRIORITY_MAP[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-sm max-w-[250px] truncate">{t.issue}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${STATUS_MAP[t.status]}`}>{t.status.replace("_"," ")}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2.5 py-1 text-xs font-bold bg-blue-500/15 text-blue-400 rounded-lg hover:bg-blue-500/25 transition-colors">Reply</button>
                      <button className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors">Resolve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Escalations */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="p-5 border-b border-white/6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <h2 className="text-lg font-bold text-white">Escalation System</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead><tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
              {["Student","Assigned Agent","Issue Type","Priority","Actions"].map(h => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
            </tr></thead>
            <tbody>
              {ESCALATIONS.map((e, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3 text-slate-200 font-semibold text-sm">{e.student}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{e.agent}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{e.issue}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${PRIORITY_MAP[e.priority]}`}>{e.priority}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2.5 py-1 text-xs font-bold bg-orange-500/15 text-orange-400 rounded-lg hover:bg-orange-500/25 transition-colors">Reassign</button>
                      <button className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors">Resolve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
