import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../components/layout/AuthLayout";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (role === "student") navigate("/student/dashboard");
      else if (role === "agent") navigate("/agent/dashboard");
      else if (role === "agency") navigate("/agency/dashboard");
      else if (role === "university") navigate("/university/dashboard");
    }, 1500);
  };

  const roles = ["student", "agent", "agency", "university"];

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your global journey."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Role Selection */}
        <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 mb-6 overflow-x-auto custom-scrollbar relative">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg capitalize whitespace-nowrap transition-colors relative z-10 ${
                role === r
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {role === r && (
                <motion.div
                  layoutId="active-login-role"
                  className="absolute inset-0 bg-primary-600 rounded-lg shadow-md -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {r === "university" ? "Uni Rep" : r}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <motion.div whileTap={{ scale: 0.99 }} className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
            <input
              type="email"
              required
              placeholder="Email address"
              className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner"
            />
          </motion.div>

          <motion.div whileTap={{ scale: 0.99 }} className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors z-10" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="w-full relative z-0 bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-slate-800/50 transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-400 transition-colors z-10 p-1"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-me"
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-900 bg-slate-800/50 transition-all cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-primary-400 hover:text-primary-300 transition-colors font-medium hover:underline underline-offset-4"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden relative border border-primary-500/30"
        >
          <AnimatePresence mode="wait">
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
                Sign In <ArrowRight className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Divider */}
        <div className="relative my-6 flex items-center py-2">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              aria-hidden="true"
            >
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="text-sm font-medium">LinkedIn</span>
          </motion.button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-400 hover:text-primary-300 font-bold transition-colors hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
