import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, ChevronRight } from 'lucide-react';

function Login() {
  return (
    <div className="min-h-screen bg-darkBlue flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/30 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400">Sign in to continue your journey.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500" />
              <span className="text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-primary-400 hover:text-primary-300">Forgot password?</a>
          </div>

          <Link to="/student" className="block w-full">
            <button type="button" className="w-full flex justify-center items-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Sign In
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </form>

        <p className="text-center text-slate-400 mt-8 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
