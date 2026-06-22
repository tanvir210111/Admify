import React, { useState } from 'react';
import { Bell, Shield, Sparkles, MessageSquare, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function NotificationsPage() {
  const [tab, setTab] = useState('all');

  const notifications = [
    {
      id: 1,
      type: "agent",
      icon: MessageSquare,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      title: "Agent Review Complete",
      description: "Agent Sarah has reviewed your Stanford admission draft and left detailed academic feedbacks. Check your SOP & LOR Generator.",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "system",
      icon: Sparkles,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      title: "New AI Recommendation",
      description: "A new 95% profile match has been discovered: MIT M.S. Data Science. Deadline for submission is July 1st.",
      time: "1 day ago"
    },
    {
      id: 3,
      type: "scholarship",
      icon: Award,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      title: "Scholarship Match",
      description: "Congratulations! Your profile has qualified for the 'Global Excellence Initiative' scholarship ($15,000 award coverage).",
      time: "2 days ago"
    },
    {
      id: 4,
      type: "system",
      icon: Shield,
      iconColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      title: "Security Update",
      description: "Your session log from Windows Chrome IP 192.168.1.42 has been authenticated successfully.",
      time: "3 days ago"
    }
  ];

  const filteredNotifications = notifications.filter(n => tab === 'all' || n.type === tab);

  return (
    <div className="relative min-h-screen max-w-[1600px] mx-auto pb-20">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-400" /> Notifications
          </h1>
          <p className="text-slate-400">
            Stay updated with real-time profile alerts, agent communications, and application changes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-xl mb-8 w-fit">
        {['all', 'system', 'agent', 'scholarship'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl capitalize transition-all ${
              tab === t
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="space-y-4">
        {filteredNotifications.map((n, index) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="glass p-6 rounded-3xl border border-slate-700/50 bg-slate-900/80 flex gap-4 md:gap-6 items-start hover:border-slate-600 transition-colors"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${n.iconColor}`}>
              <n.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
                <h3 className="font-bold text-white text-base leading-tight">{n.title}</h3>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {n.time}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{n.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
