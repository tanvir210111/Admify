import React from 'react';
import DashboardCard from '../../components/ui/DashboardCard';
import { GraduationCap, UserCheck, Calendar, FileCheck } from 'lucide-react';

function UniRepDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">University Representative</h1>
        <p className="text-slate-400">Manage incoming applications and student inquiries for your institution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Pending Applications" value="342" icon={FileCheck} trend={{ value: 14, isPositive: true }} />
        <DashboardCard title="Accepted Offers" value="85" icon={UserCheck} trend={{ value: 8, isPositive: true }} />
        <DashboardCard title="Upcoming Interviews" value="12" icon={Calendar} trend={{ value: 2, isPositive: false }} />
        <DashboardCard title="Enrolled Students" value="1,240" icon={GraduationCap} trend={{ value: 5, isPositive: true }} />
      </div>

      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400">
                <th className="py-3 px-4 font-medium">Applicant Name</th>
                <th className="py-3 px-4 font-medium">Program</th>
                <th className="py-3 px-4 font-medium">Match Score</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Alex Johnson', program: 'M.S. Computer Science', score: '95%', status: 'Under Review' },
                { name: 'Maria Garcia', program: 'MBA', score: '88%', status: 'Interview Scheduled' },
                { name: 'James Smith', program: 'M.S. Data Science', score: '92%', status: 'New' }
              ].map((app, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-200 font-medium">{app.name}</td>
                  <td className="py-3 px-4 text-slate-400">{app.program}</td>
                  <td className="py-3 px-4 text-green-400">{app.score}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                      app.status === 'Interview Scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UniRepDashboard;
