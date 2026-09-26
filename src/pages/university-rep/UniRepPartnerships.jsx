import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Handshake,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Ban,
  Clock,
  Building2,
  Globe,
  MapPin,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Eye,
  Filter,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function UniRepPartnerships() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const navigate = useNavigate();

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/partnerships");
      if (res?.success && Array.isArray(res?.data?.connections)) {
        setConnections(res.data.connections);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load agency partnerships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      const res = await api.post(`/api/university-rep/partnerships/${id}/accept`);
      if (res?.success) {
        toast.success("Agency partnership request accepted!");
        fetchConnections();
      }
    } catch (err) {
      toast.error(err.message || "Failed to accept partnership.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      const res = await api.post(`/api/university-rep/partnerships/${id}/reject`);
      if (res?.success) {
        toast.success("Partnership request declined.");
        fetchConnections();
      }
    } catch (err) {
      toast.error(err.message || "Failed to decline partnership.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBlock = async (id) => {
    setProcessingId(id);
    try {
      const res = await api.post(`/api/university-rep/partnerships/${id}/block`);
      if (res?.success) {
        toast.success("Agency partnership blocked.");
        fetchConnections();
      }
    } catch (err) {
      toast.error(err.message || "Failed to block agency.");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = connections.filter((conn) => {
    const agency = conn.agencyId || conn.agency || {};
    const agencyName = agency.name || "Agency Partner";
    const country = agency.country || "";
    const matchesSearch =
      !search ||
      agencyName.toLowerCase().includes(search.toLowerCase()) ||
      country.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || conn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">ACCEPTED</span>;
      case "PENDING":
        return <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">PENDING REVIEW</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold">DECLINED</span>;
      case "BLOCKED":
        return <span className="px-2 py-0.5 rounded bg-slate-500/15 text-slate-300 border border-slate-500/30 text-[10px] font-bold">BLOCKED</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-500/15 text-slate-300 text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Recruitment Network
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Agency Partnerships
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage authorized educational agencies submitting student applications to your university.
          </p>
        </div>

        <button
          onClick={fetchConnections}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Requests
        </button>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agencies by name, country, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1228] border border-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Partnerships" },
            { id: "PENDING", label: "Pending Requests" },
            { id: "ACCEPTED", label: "Accepted" },
            { id: "REJECTED", label: "Declined" },
            { id: "BLOCKED", label: "Blocked" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-200"
                  : "bg-[#0B1228] border border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Partnership Cards List ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading partnership network...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <Handshake className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No partnership records found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {statusFilter === "PENDING"
              ? "No pending partnership requests at this moment. New requests from verified agencies will appear here."
              : "No agency partnerships match your selected filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((conn) => {
            const agency = conn.agencyId || conn.agency || {};
            const profile = conn.agencyProfileId || conn.agencyProfile || {};
            const agencyName = agency.name || "Agency Partner";
            const agencyEmail = agency.email || "";
            const isProcessing = processingId === conn._id;

            return (
              <motion.div
                key={conn._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 bg-[#0B1228] border border-white/5 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                      {agency.avatar ? (
                        <img src={agency.avatar} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    {getStatusBadge(conn.status)}
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

                  {conn.notes && (
                    <div className="p-2.5 rounded-lg bg-[#050B1F] border border-white/5 text-[11px] text-slate-300">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Request Note:</span>
                      "{conn.notes}"
                    </div>
                  )}

                  <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Contact:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{agencyEmail || "Secured"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Requested Date:</span>
                      <span className="text-slate-300">
                        {conn.createdAt ? new Date(conn.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                  {conn.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => handleAccept(conn._id)}
                        disabled={isProcessing}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(conn._id)}
                        disabled={isProcessing}
                        className="flex-1 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </>
                  ) : conn.status === "ACCEPTED" ? (
                    <>
                      <button
                        onClick={() => navigate(`/university-rep/messages?partner=${agency._id || agency.id}`)}
                        className="flex-1 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </button>
                      <button
                        onClick={() => handleBlock(conn._id)}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition text-xs"
                        title="Block Partnership"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-500 py-1">Partnership {conn.status.toLowerCase()}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
