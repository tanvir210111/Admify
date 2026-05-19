import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, User, Wallet, Bell, Award, LogOut, Building, GraduationCap } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Student Dashboard', path: '/student' },
  { icon: Users, label: 'Agent Dashboard', path: '/agent' },
  { icon: Building, label: 'Agency Dashboard', path: '/agency' },
  { icon: GraduationCap, label: 'Uni Rep Dashboard', path: '/unirep' },
  { icon: User, label: 'Admin Dashboard', path: '/admin' },
  { icon: Award, label: 'Recommendations', path: '/recommendations' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
];

function Sidebar() {
  return (
    <aside className="w-64 glass h-screen sticky top-0 flex flex-col pt-6 z-40 border-r border-slate-700/50">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
          Admify
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
