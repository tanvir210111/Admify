import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../components/layout/AuthLayout";
function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleRegister = (e) => {
    e.preventDefault();
    if (!termsAccepted) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 1500);
  };
  const roles = [
    { id: "student", label: "Student", desc: "Find & apply to universities" },
    { id: "agent", label: "Agent", desc: "Manage student applications" },
    { id: "agency", label: "Agency", desc: "Manage your agent team" },
    {
      id: "university",
      label: "Uni Rep",
      desc: "Review applications & profiles",
    },
  ];
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the AI-powered education revolution."
    >
      {" "}
      <form onSubmit={handleRegister} className="space-y-5">
        {" "}
        {/* Role Selection Grid */}{" "}
        <div className="grid grid-cols-2 gap-3 mb-6 relative">
          {" "}
          {roles.map((r) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-colors relative z-10 overflow-hidden ${role === r.id ? "border-primary-500 text-white" : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/50 text-slate-400"}`}
            >
              {" "}
              {role === r.id && (
                <motion.div
                  layoutId="active-register-role"
                  className="absolute inset-0 bg-primary-900/30 shadow-[0_0_15px_rgba(124,58,237,0.2)] -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}{" "}
              <span className="text-sm font-bold mb-1">{r.label}</span>{" "}
              <span
                className={`text-[10px] leading-tight hidden sm:block ${role === r.id ? "text-primary-200" : "text-slate-500"}`}
              >
                {r.desc}
              </span>{" "}
            </motion.button>
          ))}{" "}
        </div>{" "}
        {/* Inputs */}{" "}
        <div className="space-y-4">
          {" "}
          <div className="flex flex-col sm:flex-row gap-4">
            {" "}
            <motion.div
              whileTap={{ scale: 0.99 }}
              className="relative group flex-1"
            >
              {" "}
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />{" "}
              <input
                type="text"
                required
                placeholder="Full Name"
                className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
              />{" "}
            </motion.div>{" "}
            <motion.div
              whileTap={{ scale: 0.99 }}
              className="relative group flex-1"
            >
              {" "}
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />{" "}
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
              />{" "}
            </motion.div>{" "}
          </div>{" "}
          <motion.div whileTap={{ scale: 0.99 }} className="relative group">
            {" "}
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />{" "}
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
            />{" "}
          </motion.div>{" "}
          <motion.div whileTap={{ scale: 0.99 }} className="relative group">
            {" "}
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />{" "}
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Create Password"
              className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner text-sm"
            />{" "}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-400 transition-colors z-10 p-1"
            >
              {" "}
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}{" "}
            </button>{" "}
          </motion.div>{" "}
        </div>{" "}
        {/* Terms */}{" "}
        <div className="flex items-start gap-3 mt-4">
          {" "}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setTermsAccepted(!termsAccepted)}
            className="mt-1 flex-shrink-0 text-slate-500 hover:text-primary-400 transition-colors"
          >
            {" "}
            {termsAccepted ? (
              <CheckSquare className="w-5 h-5 text-primary-500" />
            ) : (
              <Square className="w-5 h-5" />
            )}{" "}
          </motion.button>{" "}
          <p className="text-xs text-slate-500 leading-relaxed">
            {" "}
            By creating an account, you agree to Admify's{" "}
            <a href="#" className="text-primary-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-400 hover:underline">
              Privacy Policy
            </a>
            .{" "}
          </p>{" "}
        </div>{" "}
        {/* Submit */}{" "}
        <motion.button
          whileHover={termsAccepted ? { scale: 1.01 } : {}}
          whileTap={termsAccepted ? { scale: 0.98 } : {}}
          type="submit"
          disabled={isLoading || !termsAccepted}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none relative overflow-hidden"
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
                Create Account <ArrowRight className="w-5 h-5" />{" "}
              </motion.div>
            )}{" "}
          </AnimatePresence>{" "}
        </motion.button>{" "}
        {/* Footer */}{" "}
        <p className="text-center text-slate-500 text-sm mt-8">
          {" "}
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-300 font-bold transition-colors hover:underline underline-offset-4"
          >
            {" "}
            Sign in{" "}
          </Link>{" "}
        </p>{" "}
      </form>{" "}
    </AuthLayout>
  );
}
export default Register;
