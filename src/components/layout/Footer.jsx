import React from "react";
import { Link } from "react-router-dom";
import { Globe, Mail, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-700/50 bg-slate-950 pt-24 pb-12">
      {" "}
      <div className="container mx-auto px-6">
        {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          {" "}
          <div className="lg:col-span-1">
            {" "}
            <Link
              to="/"
              className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent inline-block mb-6 flex items-center gap-2"
            >
              {" "}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
                {" "}
                <span className="text-white text-lg leading-none font-black">
                  A
                </span>{" "}
              </div>{" "}
              Admify{" "}
            </Link>{" "}
            <p className="text-slate-300 mb-8 leading-relaxed font-light text-lg">
              {" "}
              Empowering global education through artificial intelligence. We
              make studying abroad accessible, predictable, and
              stress-free.{" "}
            </p>{" "}
            <div className="flex gap-4">
              {" "}
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary-600 hover:border-primary-500 transition-all "
              >
                {" "}
                <Globe className="w-5 h-5" />{" "}
              </a>{" "}
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary-600 hover:border-primary-500 transition-all "
              >
                {" "}
                <MessageCircle className="w-5 h-5" />{" "}
              </a>{" "}
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-slate-800/40 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-primary-600 hover:border-primary-500 transition-all "
              >
                {" "}
                <Mail className="w-5 h-5" />{" "}
              </a>{" "}
            </div>{" "}
          </div>{" "}
          <div>
            {" "}
            <h4 className="font-bold text-white text-lg mb-8">Product</h4>{" "}
            <ul className="space-y-5">
              {" "}
              <li>
                <Link
                  to="/features"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  Features
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="/pricing"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  Pricing
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="/university-search"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  University Search
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="/ai-document-prep"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  AI Document Prep
                </Link>
              </li>{" "}
            </ul>{" "}
          </div>{" "}
          <div>
            {" "}
            <h4 className="font-bold text-white text-lg mb-8">Company</h4>{" "}
            <ul className="space-y-5">
              {" "}
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  About Us
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="/careers"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  Careers
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="/blog"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  Blog
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="/contact"
                  className="text-slate-300 hover:text-primary-400 transition-colors font-light text-base md:text-lg"
                >
                  Contact
                </Link>
              </li>{" "}
            </ul>{" "}
          </div>{" "}
          <div>
            {" "}
            <h4 className="font-bold text-white text-lg mb-8">
              Newsletter
            </h4>{" "}
            <p className="text-slate-300 mb-6 font-light text-base md:text-lg leading-relaxed">
              Subscribe to get the latest updates on scholarships and deadlines.
            </p>{" "}
            <div className="flex gap-3">
              {" "}
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-900 border border-slate-700/50 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-full transition-all"
              />{" "}
              <button className="bg-primary-600 text-white font-bold rounded-xl px-5 py-4 transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] flex-shrink-0 flex items-center justify-center">
                {" "}
                <ArrowRight className="w-6 h-6" />{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="border-t border-slate-700/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {" "}
          <p className="text-slate-400 text-sm md:text-base font-light">
            © {new Date().getFullYear()} Admify AI Inc. All rights reserved.
          </p>{" "}
          <div className="flex gap-8 text-sm md:text-base text-slate-400 font-light items-center">
            {" "}
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>{" "}
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>{" "}
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors text-xs font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </Link>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </footer>
  );
}
export default Footer;
