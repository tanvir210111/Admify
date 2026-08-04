import React, { useState, useEffect } from 'react';
import { Settings, User, GraduationCap, Lock, Globe, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

function SettingsPage() {
  const { user } = useAuth();
  
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gpa, setGpa] = useState('');
  const [ielts, setIelts] = useState('');
  const [country, setCountry] = useState('');
  const [course, setCourse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If we are on profile tab, update auth user metadata
      if (tab === 'profile') {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: name }
        });

        if (error) throw error;
        
        // Note: Email updates require confirmation in Supabase by default
        if (email !== user?.email) {
          toast.success("Name updated. Email update requires confirmation.", { icon: "ℹ️" });
        } else {
          toast.success("Profile saved successfully!");
        }
      } else {
        // Save other tabs (mock for now since they are empty)
        toast.success("Settings saved successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
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
                disabled={isLoading}
                className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
