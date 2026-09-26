import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Loader2, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import AuthLayout from "../components/layout/AuthLayout";
import { api } from "../lib/api";

export default function ActivateUniversityRep() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'already_used' | 'error'
  const [message, setMessage] = useState("");
  const [repEmail, setRepEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No activation token was provided in the link. Please check your official email.");
      return;
    }

    const performActivation = async () => {
      try {
        const res = await api.post("/api/auth/activate-university-rep", { token });
        if (res?.success) {
          setStatus("success");
          setMessage(res.message || "Your Admify University Representative account is now active.");
          if (res?.data?.email) {
            setRepEmail(res.data.email);
          }
        } else {
          setStatus("error");
          setMessage(res?.message || "Failed to activate university representative account.");
        }
      } catch (err) {
        if (err.data?.alreadyUsed || err.message?.includes("already been used")) {
          setStatus("already_used");
          setMessage(err.message || "This activation link has already been used.");
        } else {
          setStatus("error");
          setMessage(err.message || "Activation link is invalid or expired.");
        }
      }
    };

    performActivation();
  }, [token]);

  return (
    <AuthLayout
      title="University Representative Activation"
      subtitle="Complete your institutional verification and activate your university portal access."
    >
      <div className="py-6 px-2 text-center space-y-6">
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-4 py-8"
          >
            <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.2)]">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Validating Activation Token</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please wait while we confirm your credentials with the institutional compliance registry...
              </p>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                Status: Account Activated
              </span>
              <h2 className="text-2xl font-black text-white">
                Account Activated Successfully!
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Your Admify University Representative account is now active. You have full access to manage student inquiries, review academic applications, and establish verified study-abroad agency partnerships.
              </p>
              {repEmail && (
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Activated for: <strong className="text-white">{repEmail}</strong>
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Next steps for your institution:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                <li>Log in using your official email and password.</li>
                <li>Connect with verified study-abroad agencies.</li>
                <li>Coordinate university admissions reviews.</li>
              </ul>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              Sign In to University Portal <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {status === "already_used" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(59,130,246,0.2)]">
              <ShieldCheck className="w-10 h-10 text-blue-400" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
                Already Activated
              </span>
              <h2 className="text-xl font-bold text-white">
                Account Is Already Active
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {message || "This activation link has already been used. Your University Representative account is ready for sign in."}
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Sign In <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(244,63,94,0.2)]">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
                Activation Error
              </span>
              <h2 className="text-xl font-bold text-white">
                Activation Link Invalid or Expired
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {message || "This activation link could not be verified. It may have expired or was incorrectly formatted."}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Please contact Admify Institutional Compliance at{" "}
                <a href="mailto:compliance@admify.world" className="text-primary-400 underline">
                  compliance@admify.world
                </a>{" "}
                to request a replacement activation link.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors"
              >
                Go to Sign In
              </button>
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
