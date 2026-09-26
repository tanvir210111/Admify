import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AuthLayout from "../components/layout/AuthLayout";
import { api } from "../lib/api";

export default function ActivateAgency() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'already_used' | 'error'
  const [message, setMessage] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No activation token was provided in the link. Please check your email.");
      return;
    }

    const performActivation = async () => {
      try {
        const res = await api.post("/api/auth/activate-agency", { token });
        if (res?.success) {
          setStatus("success");
          setMessage(res.message || "Your Admify Agency account is now active.");
          if (res?.data?.email) {
            setAgencyEmail(res.data.email);
          }
        } else {
          setStatus("error");
          setMessage(res?.message || "Failed to activate agency account.");
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
      title="Agency Account Activation"
      subtitle="Complete your verification and activate your agency portal access."
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
                Please wait while we confirm your credentials with the compliance registry...
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
                Your Admify Agency account is now active. You have full access to study-abroad student applications, commission tracking, and global university partners.
              </p>
              {agencyEmail && (
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Activated for: <strong className="text-white">{agencyEmail}</strong>
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                Proceed to Login <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {status === "already_used" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="w-10 h-10 text-amber-400" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                Already Activated
              </span>
              <h2 className="text-xl font-bold text-white">
                This Link Has Already Been Used
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Your agency account is already active. Please proceed directly to sign in with your email and password.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(244,63,94,0.2)]">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
                Activation Failed
              </span>
              <h2 className="text-xl font-bold text-white">
                Unable to Activate Account
              </h2>
              <p className="text-sm text-rose-300/90 mt-2 leading-relaxed">
                {message}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                If your link has expired (links expire after 48 hours), please contact <span className="text-primary-400">compliance@admify.world</span> for assistance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Link
                to="/login"
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center"
              >
                Return to Login
              </Link>
              <Link
                to="/register"
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center"
              >
                Register Agency
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
