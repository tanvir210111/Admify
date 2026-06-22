import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Cpu, ShieldAlert, Users, Bell, Sliders } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1000px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-violet-400" /> Platform Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure study recommendations thresholds, manage admin accounts, and set security policies</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fade} className="flex flex-wrap gap-1 bg-white/3 p-1 rounded-xl border border-white/6">
        {[
          { id: "general", label: "General", icon: Globe },
          { id: "platform", label: "Platform Rules", icon: Sliders },
          { id: "ai", label: "AI Config", icon: Cpu },
          { id: "security", label: "Security", icon: ShieldAlert },
          { id: "accounts", label: "Admin Accounts", icon: Users },
          { id: "notifications", label: "Notifications", icon: Bell },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === t.id
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Settings Form Container */}
      <motion.div variants={fade} className="p-6 rounded-2xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <form onSubmit={handleSave} className="space-y-6 text-sm">
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-base border-b border-white/5 pb-2">General Platform Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Portal Title</label>
                  <input defaultValue="Admify Admin Portal" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Support Email Address</label>
                  <input defaultValue="admin@admify.study" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "platform" && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-base border-b border-white/5 pb-2">Global Admission Rules</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/4">
                  <div>
                    <p className="text-slate-200 font-bold">Auto-Review Applications</p>
                    <p className="text-slate-500 text-xs mt-0.5">Let AI pre-evaluate and flag low GPA/IELTS applicant files automatically</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-600 cursor-pointer" />
                </div>
                <div className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/4">
                  <div>
                    <p className="text-slate-200 font-bold">Require LOR Validation</p>
                    <p className="text-slate-500 text-xs mt-0.5">Enforce manual admin sign-off for academic recommendation letters</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-base border-b border-white/5 pb-2">AI Matchmaking Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Minimum Acceptance Probable Score</label>
                  <input defaultValue="75%" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Model Select Tier</label>
                  <select className="w-full bg-[#0b1228] border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50">
                    <option>Admify-V4-Pro (Fine-tuned)</option>
                    <option>GPT-4o-Mini Base API</option>
                    <option>Claude-3-Haiku Fast</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-base border-b border-white/5 pb-2">Security & Policies</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/4">
                  <div>
                    <p className="text-slate-200 font-bold">Enforce Two-Factor Authentication</p>
                    <p className="text-slate-500 text-xs mt-0.5">All agents and university reps must pass 2FA validation check</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "accounts" && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-base border-b border-white/5 pb-2">Admin Administrator Accounts</h3>
              <div className="space-y-2">
                {[
                  { name: "Super Admin", role: "System Administrator", email: "super@admify.study" },
                  { name: "Admissions Head", role: "Lead Reviewer", email: "reviewer.lead@admify.study" },
                ].map((a, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/4">
                    <div>
                      <p className="text-slate-200 font-bold">{a.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{a.email} · {a.role}</p>
                    </div>
                    <span className="text-xs text-violet-400 font-bold cursor-pointer hover:underline">Edit Access</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-base border-b border-white/5 pb-2">Notification Routing</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/4">
                  <div>
                    <p className="text-slate-200 font-bold">Email Alerts on New Partner Registration</p>
                    <p className="text-slate-500 text-xs mt-0.5">Forward agent & university requests to main support inbox</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-white/5 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {saving ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
