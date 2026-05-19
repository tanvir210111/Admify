import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
        Admify
      </Link>
      
      <div className="flex gap-4">
        <Link to="/login">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Login
          </motion.button>
        </Link>
        <Link to="/register">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-white font-medium shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all"
          >
            Get Started
          </motion.button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
