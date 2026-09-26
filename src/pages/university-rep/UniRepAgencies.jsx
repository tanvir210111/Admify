import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users2,
  Search,
  MessageSquare,
  ShieldCheck,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Ban,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function UniRepAgencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAgency, setSelectedAgency] = useState(null);
  const navigate = useNavigate();

  const fetchConnectedAgencies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/agencies");
      if (res?.success && Array.isArray(res?.data?.connectedAgencies)) {
        setAgencies(res.data.connectedAgencies);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load connected agencies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectedAgencies();
  }, []);

  const handleBlock = async (connectionId) => {
    try {
      const res = await api.post(`/api/university-rep/partnerships/${connectionId}/block`);
      if (res?.success) {
        toast.success("Agency partnership disconnected.");
        fetchConnectedAgencies();
        setSelectedAgency(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to block agency.");
    }
  };

  const filtered = agencies.filter((conn) => {
    const a = conn.agencyId || conn.agency || {};
    const name = a.name || "";
    const country = a.country || "";
    const city = a.city || "";
    return (
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      country.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Active Recruitment Partners
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Connected Agencies
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified agencies authorized to counsel applicants and submit applications to your university.
          </p>
        </div>

        <button
          onClick={fetchConnectedAgencies}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Network
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search connected partners by agency name, country, or location..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1228] border border-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* ── Connected Agencies Grid ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading connected agency network...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <Users2 className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No connected agencies yet</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When you accept partnership requests from verified agencies, they will appear here as active recruitment channels.
          </p>
          <button
            onClick={() => navigate("/university-rep/partnerships")}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Review Partnership Requests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((conn) => {
            const agency = conn.agencyId || conn.agency || {};
            const profile = conn.agencyProfileId || conn.agencyProfile || {};
            const agencyName = agency.name || "Agency Partner";
            const agencyEmail = agency.email || "";
            const agencyPhone = agency.phone || "";

            return (
              <motion.div
                key={conn._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 bg-[#0B1228] border border-white/5 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-base shrink-0">
                      {agency.avatar ? (
                        <img src={agency.avatar} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      ACTIVE PARTNER
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                      <span>{agencyName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" title="Verified Agency" />
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {agency.city ? `${agency.city}, ${agency.country}` : agency.country || "International"}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-white/5">
                    {agencyEmail && (
                      <div className="flex items-center gap-2 text-slate-400 truncate">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{agencyEmail}</span>
                      </div>
                    )}
                    {agencyPhone && (
                      <div className="flex items-center gap-2 text-slate-400 truncate">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{agencyPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>Connected since {conn.createdAt ? new Date(conn.createdAt).toLocaleDateString() : "Recent"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/university-rep/messages?partner=${agency._id || agency.id}`)}
                    className="flex-1 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                  <button
                    onClick={() => setSelectedAgency({ conn, agency, profile })}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="View Agency Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleBlock(conn._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Block Agency Relationship"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Agency Details Modal */}
      <AnimatePresence>
        {selectedAgency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#0B1228] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-base">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {selectedAgency.agency?.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedAgency.agency?.city}, {selectedAgency.agency?.country}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgency(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Official Email</span>
                  <span className="text-white font-medium">{selectedAgency.agency?.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Phone</span>
                  <span className="text-white font-medium">{selectedAgency.agency?.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Partnership Standing</span>
                  <span className="text-emerald-400 font-semibold">Active Authorized Recruiter</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setSelectedAgency(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigate(`/university-rep/messages?partner=${selectedAgency.agency?._id || selectedAgency.agency?.id}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Open Direct Conversation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
