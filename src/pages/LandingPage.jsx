import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Globe, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-darkBlue relative overflow-hidden">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px]" />
      
      <main className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="flex flex-col items-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary-400 mb-8 text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            AI-Powered Study Abroad Platform
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Your Global Education <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-primary-400 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              Powered by AI
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12"
          >
            Admify uses advanced machine learning to match you with your dream universities, simplify applications, and guide your international study journey.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link to="/register">
              <button className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium text-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                Start Your Journey
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-4 glass text-slate-200 hover:text-white rounded-xl font-medium text-lg transition-all hover:bg-slate-800/80">
                Sign In
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: Globe, title: "Global Reach", desc: "Access 10,000+ universities across 50+ countries." },
            { icon: BookOpen, title: "Smart Matching", desc: "AI algorithms find the perfect courses for your profile." },
            { icon: GraduationCap, title: "Expert Guidance", desc: "End-to-end support from admission to visa." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
              className="glass p-8 rounded-2xl hover:border-primary-500/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center mb-6 border border-primary-500/20">
                <feature.icon className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
