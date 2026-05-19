import React from 'react';
import DashboardCard from '../../components/ui/DashboardCard';
import { BookOpen, Target, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Welcome back, John! 👋</h1>
        <p className="text-slate-400">Here's what's happening with your applications today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Active Applications" value="3" icon={BookOpen} trend={{ value: 12, isPositive: true }} />
        <DashboardCard title="Profile Strength" value="85%" icon={Trophy} trend={{ value: 5, isPositive: true }} />
        <DashboardCard title="Pending Tasks" value="4" icon={Clock} trend={{ value: 2, isPositive: false }} />
        <DashboardCard title="Universities Matched" value="12" icon={Target} trend={{ value: 8, isPositive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-slate-200 font-medium">Application Updated - Stanford University</p>
                  <p className="text-slate-400 text-sm mt-1">Your document "Statement of Purpose" was successfully verified by our AI.</p>
                  <p className="text-slate-500 text-xs mt-2">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-6">AI Recommendations</h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-primary-500/50 transition-colors cursor-pointer">
                <h3 className="font-medium text-primary-400 mb-1">MIT</h3>
                <p className="text-sm text-slate-400 mb-3">Computer Science (MSc)</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-green-400">92% Match</span>
                  <span className="text-slate-500">Apply by Dec 15</span>
                </div>
              </div>
            ))}
            <button className="w-full py-3 mt-4 text-sm font-medium text-slate-300 hover:text-white glass rounded-xl transition-all">
              View All Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
