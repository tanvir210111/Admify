import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-darkBlue relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar />
      
      <main className="flex-1 flex flex-col relative z-10">
        <header className="h-20 glass border-b border-slate-700/50 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search universities, programs..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 border-2 border-transparent">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full rounded-full" />
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-200">John Doe</p>
                <p className="text-xs text-slate-400">Student Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
