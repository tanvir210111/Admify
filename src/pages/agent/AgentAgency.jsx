import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  Globe2,
  MapPin,
  Calendar,
  UserCheck,
  RefreshCw,
  Lock,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentAgency() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAgency = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/agency");
      if (res?.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load agency details:", err);
      toast.error("Failed to load affiliated agency credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgency();
  }, []);

  const agency = data?.agency;
  const myStatus = data?.myStatus;
  const profile = agency?.profile;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1200px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-violet-400" /> Sponsoring Agency Affiliation
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Official accreditation record and verified institution under which you practice global admissions counseling.
          </p>
        </div>

        <button
          onClick={fetchAgency}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm rounded-2xl border border-white/10 bg-[#0B1228]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
          Loading affiliated agency dossier...
        </div>
      ) : !agency ? (
        <div className="p-16 text-center rounded-2xl border border-white/10 bg-[#0B1228]">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base">No Linked Agency</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
            Your counselor profile is currently not linked to a verified sponsoring agency.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Agency Banner Card */}
          <motion.div
            variants={fade}
            className="p-6 rounded-2xl border relative overflow-hidden"
            style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-violet-600/30 shrink-0">
                  {agency.name ? agency.name.charAt(0) : "A"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{agency.name}</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      {agency.verificationStatus || "VERIFIED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {profile?.agencyType || "Global Education Advisory Agency"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Agency ID: {agency._id}
                  </p>
                </div>
              </div>

              {/* Immutable Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Backend-Controlled Association
              </div>
            </div>
          </motion.div>

          {/* Counselor Role & Accreditation Status */}
          <motion.div
            variants={fade}
            className="p-5 rounded-2xl border space-y-4"
            style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Counselor Appointment Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                <span className="text-slate-500 font-semibold">Official Designation</span>
                <div className="text-sm font-bold text-white">
                  {myStatus?.designation || "Senior Education Counselor"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                <span className="text-slate-500 font-semibold">Agent Application ID</span>
                <div className="text-sm font-mono font-bold text-violet-400">
                  {myStatus?.agentApplicationId || "APP-APPROVED"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                <span className="text-slate-500 font-semibold">Caseload Standing</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  Active Counselor ({myStatus?.status || "active"})
                </div>
              </div>
            </div>
          </motion.div>

          {/* Official Agency Contact & HQ Info */}
          <motion.div
            variants={fade}
            className="p-5 rounded-2xl border space-y-4"
            style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Agency Corporate Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Corporate Email</span>
                  <span className="text-white font-medium">{agency.email || "N/A"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                <Phone className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Official Phone</span>
                  <span className="text-white font-medium">{agency.phone || "N/A"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                <Globe2 className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Website Portal</span>
                  <span className="text-white font-medium">
                    {profile?.website || "https://admify.global"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Headquarters / Location</span>
                  <span className="text-white font-medium">
                    {profile?.city || "Dhaka"}, {profile?.country || "Bangladesh"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
