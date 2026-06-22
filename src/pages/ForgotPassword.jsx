import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../components/layout/AuthLayout";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };
  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent password reset instructions to your inbox."
      >
        {" "}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          {" "}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30"
          >
            {" "}
            <CheckCircle2 className="w-8 h-8 text-green-400" />{" "}
          </motion.div>{" "}
          <p className="text-slate-300 text-sm leading-relaxed">
            {" "}
            If an account exists for{" "}
            <span className="font-bold text-white font-bold">{email}</span>, you
            will receive an email with instructions on how to reset your
            password.{" "}
          </p>{" "}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            {" "}
            <Link
              to="/login"
              className="w-full py-3.5 bg-slate-800/50 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700/50 flex items-center justify-center gap-2"
            >
              {" "}
              <ArrowLeft className="w-5 h-5" /> Back to Login{" "}
            </Link>{" "}
          </motion.div>{" "}
        </motion.div>{" "}
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions."
    >
      {" "}
      <form onSubmit={handleSubmit} className="space-y-6">
        {" "}
        <motion.div whileTap={{ scale: 0.99 }} className="relative group">
          {" "}
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-400 transition-colors z-10" />{" "}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner"
          />{" "}
        </motion.div>{" "}
        <motion.button
          whileHover={email ? { scale: 1.01 } : {}}
          whileTap={email ? { scale: 0.98 } : {}}
          type="submit"
          disabled={isLoading || !email}
          className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] overflow-hidden relative"
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
                Send Instructions <ArrowRight className="w-5 h-5" />{" "}
              </motion.div>
            )}{" "}
          </AnimatePresence>{" "}
        </motion.button>{" "}
        <div className="text-center pt-2">
          {" "}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors text-sm font-medium hover:underline underline-offset-4"
          >
            {" "}
            <ArrowLeft className="w-4 h-4" /> Back to Login{" "}
          </Link>{" "}
        </div>{" "}
      </form>{" "}
    </AuthLayout>
  );
}
export default ForgotPassword;
