import React from 'react';
import DashboardCard from '../../components/ui/DashboardCard';
import { Activity, Server, Users, DollarSign } from 'lucide-react';

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">System Admin</h1>
        <p className="text-slate-400">Platform metrics and health overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Users" value="12,450" icon={Users} trend={{ value: 8, isPositive: true }} />
        <DashboardCard title="System Load" value="42%" icon={Activity} trend={{ value: 5, isPositive: false }} />
        <DashboardCard title="Active Services" value="9/10" icon={Server} />
        <DashboardCard title="Daily Revenue" value="$4,200" icon={DollarSign} trend={{ value: 12, isPositive: true }} />
      </div>

      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Recent System Logs</h2>
        <div className="space-y-2">
          {[
            { level: 'INFO', msg: 'Backup completed successfully', time: '10:00 AM' },
            { level: 'WARN', msg: 'High latency on ML Recommendation Service', time: '09:45 AM' },
            { level: 'INFO', msg: 'New university data sync completed', time: '08:30 AM' }
          ].map((log, i) => (
             <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-700/50 last:border-0 text-sm">
               <span className={`px-2 py-1 rounded text-xs font-bold ${log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'}`}>
                 {log.level}
               </span>
               <span className="text-slate-300 flex-1">{log.msg}</span>
               <span className="text-slate-500">{log.time}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
