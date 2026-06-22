import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
function AuthLayout({ children, title, subtitle }) {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
      color:
        i % 3 === 0
          ? "bg-primary-400"
          : i % 3 === 1
            ? "bg-blue-400"
            : "bg-purple-400",
    }));
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      {" "}
      {/* Animated Background */}{" "}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {" "}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -50, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary-900/20 rounded-full blur-[120px]"
        />{" "}
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/20 rounded-full blur-[120px]"
        />{" "}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />{" "}
        {/* Floating Glowing Particles */}{" "}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, -30, 0],
              x: [0, p.id % 2 === 0 ? 15 : -15, 0],
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
            className={`absolute rounded-full blur-[1px] ${p.color}`}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: `${p.top}%`,
              left: `${p.left}%`,
            }}
          />
        ))}{" "}
      </div>{" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {" "}
        {/* Logo */}{" "}
        <div className="flex justify-center mb-8">
          {" "}
          <Link to="/" className="flex items-center gap-3 group">
            {" "}
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]"
            >
              {" "}
              <span className="text-white text-xl font-black origin-center block">
                A
              </span>{" "}
            </motion.div>{" "}
            <span className="text-3xl font-extrabold text-white tracking-tight">
              Admify
            </span>{" "}
          </Link>{" "}
        </div>{" "}
        {/* Card */}{" "}
        <div className="glass border border-slate-700/50 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-primary-900/20 bg-slate-900 backdrop-blur-xl relative overflow-hidden">
          {" "}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            {" "}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {title}
            </h1>{" "}
            <p className="text-slate-500 text-sm sm:text-base">
              {subtitle}
            </p>{" "}
          </motion.div>{" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {" "}
            {children}{" "}
          </motion.div>{" "}
        </div>{" "}
      </motion.div>{" "}
    </div>
  );
}
export default AuthLayout;
