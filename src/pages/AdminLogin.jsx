import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/admin/dashboard");
    }, 1500);
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      {" "}
      {/* Admin specific background */}{" "}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {" "}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none"
        />{" "}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />{" "}
      </div>{" "}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", damping: 20 }}
        className="w-full max-w-md relative z-10"
      >
        {" "}
        <div className="bg-slate-900 border border-slate-700/50 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-red-900/10 relative overflow-hidden">
          {" "}
          {/* Top border accent */}{" "}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />{" "}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="flex justify-center mb-6"
          >
            {" "}
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700/50 flex items-center justify-center shadow-lg shadow-red-900/30">
              {" "}
              <ShieldCheck className="w-8 h-8 text-red-500" />{" "}
            </div>{" "}
          </motion.div>{" "}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            {" "}
            <h1 className="text-2xl font-bold text-white font-bold mb-2">
              System Admin Access
            </h1>{" "}
            <p className="text-slate-500 text-sm">
              Authorized personnel only.
            </p>{" "}
          </motion.div>{" "}
          <form onSubmit={handleLogin} className="space-y-6">
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {" "}
              <motion.div whileTap={{ scale: 0.99 }} className="relative group">
                {" "}
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors z-10" />{" "}
                <input
                  type="email"
                  required
                  placeholder="Admin Email"
                  className="w-full relative z-0 bg-slate-950 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 focus:bg-slate-950 transition-all shadow-inner font-mono text-sm"
                />{" "}
              </motion.div>{" "}
              <motion.div whileTap={{ scale: 0.99 }} className="relative group">
                {" "}
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors z-10" />{" "}
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Admin Password"
                  className="w-full relative z-0 bg-slate-950 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 focus:bg-slate-950 transition-all shadow-inner font-mono text-sm"
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors z-10 p-1"
                >
                  {" "}
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}{" "}
                </button>{" "}
              </motion.div>{" "}
            </motion.div>{" "}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {" "}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden relative"
              >
                {" "}
                <AnimatePresence mode="wait">
                  {" "}
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    />
                  ) : (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      {" "}
                      Authenticate <ArrowRight className="w-5 h-5" />{" "}
                    </motion.div>
                  )}{" "}
                </AnimatePresence>{" "}
              </motion.button>{" "}
            </motion.div>{" "}
          </form>{" "}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            {" "}
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium hover:underline underline-offset-4"
            >
              {" "}
              Return to Public Site{" "}
            </Link>{" "}
          </motion.div>{" "}
        </div>{" "}
      </motion.div>{" "}
    </div>
  );
}
export default AdminLogin;
