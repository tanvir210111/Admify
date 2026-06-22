import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${scrolled ? "glass bg-slate-950 border-b border-slate-700/50 shadow-lg shadow-black/20 py-3" : "bg-transparent py-6"}`}
    >
      {" "}
      <div className="container mx-auto flex justify-between items-center">
        {" "}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2"
        >
          {" "}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            {" "}
            <span className="text-white text-lg leading-none font-black">
              A
            </span>{" "}
          </div>{" "}
          Admify{" "}
        </Link>{" "}
        <div className="hidden md:flex gap-8 items-center text-sm font-medium">
          {" "}
          <Link
            to="/features"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Features
          </Link>{" "}
          <Link
            to="/university-search"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Universities
          </Link>{" "}
          <Link
            to="/pricing"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>{" "}
        </div>{" "}
        <div className="flex gap-4 items-center">
          {" "}
          <Link to="/login">
            {" "}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium text-sm md:text-base"
            >
              {" "}
              Sign In{" "}
            </motion.button>{" "}
          </Link>{" "}
          <Link to="/register">
            {" "}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-primary-600 text-white font-bold font-medium shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-all text-sm md:text-base border border-primary-500/50"
            >
              {" "}
              Get Started{" "}
            </motion.button>{" "}
          </Link>{" "}
        </div>{" "}
      </div>{" "}
    </motion.nav>
  );
}
export default Navbar;
