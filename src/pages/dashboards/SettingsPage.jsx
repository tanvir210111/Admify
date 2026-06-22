import React, { useState } from 'react';
import { Settings, User, GraduationCap, Lock, Globe, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState('Alex Doe');
  const [email, setEmail] = useState('alex.doe@student.admify.com');
  const [gpa, setGpa] = useState('3.8');
  const [ielts, setIelts] = useState('7.5');
  const [country, setCountry] = useState('United States');
  const [course, setCourse] = useState('Computer Science');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Settings saved successfully!", {
      style: {
        borderRadius: "10px",
        background: "#1e293b",
        color: "#fff",
        border: "1px solid rgba(51, 65, 85, 0.5)"
      }
    });
  };

  return (
    <div className="relative min-h-screen max-w-[1600px] mx-auto pb-20">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary-400" /> Settings
          </h1>
          <p className="text-slate-400">
            Manage your personal credentials, study abroad requirements, academic credentials, and alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-2">
          {[
            { id: 'profile', label: 'Personal Details', icon: User },
            { id: 'academic', label: 'Academic Scores', icon: GraduationCap },
            { id: 'security', label: 'Security & Password', icon: Lock },
            { id: 'preferences', label: 'Country & Subject', icon: Globe }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all border ${
                tab === t.id
                  ? 'bg-primary-600/20 border-primary-500/30 text-white shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <t.icon className={`w-5 h-5 ${tab === t.id ? 'text-primary-400' : ''}`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Form */}
        <div className="lg:col-span-3 bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-700/50 backdrop-blur-xl h-fit">
          <form onSubmit={handleSave} className="space-y-6">
            {tab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-white mb-4">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'academic' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-white mb-4">Academic Scores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">CGPA / GPA Score</label>
                    <input
                      type="text"
                      required
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">IELTS / TOEFL Band</label>
                    <input
                      type="text"
                      required
                      value={ielts}
                      onChange={(e) => setIelts(e.target.value)}
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-white mb-4">Security Settings</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-white mb-4">Study Abroad Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">Preferred Destination Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase font-black mb-2">Target Course / Specialization</label>
                    <input
                      type="text"
                      required
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center gap-2"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
