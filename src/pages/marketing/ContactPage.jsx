import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, Globe, MessageSquare, 
  Send, CheckCircle, ChevronDown, Sparkles, 
  HelpCircle
} from "lucide-react";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "admissions",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      q: "How fast will I receive my AI matching recommendations?",
      a: "Instantly. Once you register and input your GPA, test scores, and country preferences, our ML engine processes matches in under 3 seconds."
    },
    {
      q: "Is there a trial limit for the Statement of Purpose (SOP) generator?",
      a: "Yes. Free accounts can generate 1 standard outline draft. Upgrading to a Pro plan unlocks unlimited document creations and direct advisor chats."
    },
    {
      q: "How secure are my uploaded transcript and identity documents?",
      a: "Extremely secure. All documents uploaded to Admify are stored with AES-256 bank-grade encryption and are only visible to authorized partner university registrars."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: "", email: "", category: "admissions", message: "" });
    }, 1500);
  };

  const toggleFaq = (idx) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <div className="py-12 md:py-20 relative">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
          >
            <MessageSquare className="w-4 h-4 text-primary-400" />
            24/7 Global Assistance
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Get in <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Have questions about university recommendations, AI document creation, or subscription packages? Send us a message and our support team will respond shortly.
          </p>
        </div>

        {/* Contact two columns grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto mb-28 items-stretch">
          
          {/* Left Column: Direct Coordinates */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div className="glass p-8 rounded-3xl border border-slate-700/60 flex-grow flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl" />

              <div className="space-y-8">
                <h3 className="text-white font-extrabold text-xl mb-4">Contact Information</h3>

                {/* Email detail */}
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-primary-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Email Support</p>
                    <a href="mailto:support@admify.ai" className="text-white font-bold text-sm md:text-base hover:text-primary-400 transition-colors">
                      support@admify.ai
                    </a>
                  </div>
                </div>

                {/* Phone detail */}
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-primary-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Admissions Hotline</p>
                    <p className="text-white font-bold text-sm md:text-base">
                      +1 (800) 236-4392
                    </p>
                  </div>
                </div>

                {/* HQ Location detail */}
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-primary-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Global HQ Location</p>
                    <p className="text-white font-bold text-sm md:text-base leading-relaxed">
                      74 Old Street, London, EC1V 9HN (United Kingdom)
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels floating grid */}
              <div className="border-t border-slate-850 pt-8 mt-8">
                <p className="text-slate-550 text-[10px] uppercase font-black tracking-wider mb-4">Connect with our communities</p>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-650 hover:bg-slate-900 flex items-center justify-center transition-all shadow-md"
                  >
                    {/* Inline Twitter/X SVG */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-650 hover:bg-slate-900 flex items-center justify-center transition-all shadow-md"
                  >
                    {/* Inline LinkedIn SVG */}
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-650 hover:bg-slate-900 flex items-center justify-center transition-all shadow-md"
                  >
                    {/* Inline GitHub SVG */}
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-650 hover:bg-slate-900 flex items-center justify-center transition-all shadow-md"
                  >
                    <Globe className="w-4.5 h-4.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="lg:col-span-7">
            <div className="glass p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              
              {isSent ? (
                <div className="py-24 text-center space-y-6 flex flex-col justify-center items-center h-full">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-white font-extrabold text-xl md:text-2xl">Message Dispatched!</h4>
                  <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm">
                    Your inquiry has been successfully sent to our general advisory queue. An specialist will respond to you via email in under 12 hours.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold rounded-xl text-xs md:text-sm transition-all"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-white font-extrabold text-xl mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" /> Dispatch Inquiry
                  </h3>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Alex Mercer"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Inquiry Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                    >
                      <option value="admissions">Study Abroad Admissions Help</option>
                      <option value="technical">Technical Platform Issues</option>
                      <option value="partnership">University Partnership Inquiry</option>
                      <option value="billing">Subscription Billing Help</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Detailed Message</label>
                    <textarea
                      name="message"
                      required
                      rows="4"
                      placeholder="Describe your query in detail..."
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-bold rounded-2xl transition-all border border-primary-500/50 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Dispatching Message..." : "Dispatch Message"}
                    {!isSubmitting && <Send className="w-4.5 h-4.5" />}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Contact FAQ accordion Segment */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white font-extrabold text-2xl md:text-3xl text-center mb-12 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary-400" /> FAQ Preview Quick Answers
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="glass border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex justify-between items-center text-white hover:bg-slate-900/30 transition-all font-bold text-sm md:text-base gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${
                      isExpanded ? "rotate-180 text-primary-400" : ""
                    }`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden bg-slate-950/40 border-t border-slate-850"
                      >
                        <p className="p-6 text-slate-400 text-xs md:text-sm font-light leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ContactPage;
