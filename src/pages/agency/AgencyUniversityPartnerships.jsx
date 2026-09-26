import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  Handshake,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Globe,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  ExternalLink,
} from "lucide-react";

export default function AgencyUniversityPartnerships() {
  const [activeTab, setActiveTab] = useState("my"); // 'my' | 'discover'
  const [connections, setConnections] = useState([]);
  const [verifiedReps, setVerifiedReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [requestingRepId, setRequestingRepId] = useState(null);

  const fetchConnections = async () => {
    try {
      const res = await api.get("/api/agency/university-connections");
      if (res.success && res.data) {
        setConnections(res.data.connections || []);
      }
    } catch (err) {
      console.warn("Could not load partnerships:", err);
    }
  };

  const fetchVerifiedReps = async () => {
    try {
      const res = await api.get("/api/agency/verified-universities");
      if (res.success && res.data) {
        setVerifiedReps(res.data.representatives || []);
      }
    } catch (err) {
      console.warn("Could not load university reps directory:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchConnections(), fetchVerifiedReps()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendConnection = async (rep) => {
    setRequestingRepId(rep._id);
    try {
      const res = await api.post("/api/agency/university-connections", {
        universityRepresentativeId: rep._id,
        universityId: rep.universityId?._id || rep.universityId,
      });
      if (res.success) {
        toast.success(`Partnership request sent to ${rep.name}!`);
        await fetchConnections();
      }
    } catch (err) {
      toast.error(err.message || "Failed to send partnership request");
    } finally {
      setRequestingRepId(null);
    }
  };

  const handleCancelConnection = async (connId) => {
    try {
      const res = await api.delete(`/api/agency/university-connections/${connId}`);
      if (res.success) {
        toast.success("Partnership request cancelled.");
        await fetchConnections();
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel partnership request");
    }
  };

  const connectedRepIds = new Set(
    connections.map((c) => (c.universityRepresentativeId?._id || c.universityRepresentativeId)?.toString())
  );

  const filteredConnections = connections.filter((c) => {
    const q = search.toLowerCase();
    const uName = (c.university?.name || "").toLowerCase();
    const rName = (c.universityRepresentative?.name || "").toLowerCase();
    return uName.includes(q) || rName.includes(q);
  });

  const filteredReps = verifiedReps.filter((r) => {
    const q = search.toLowerCase();
    const uName = (r.universityId?.name || r.universityName || "").toLowerCase();
    const rName = (r.name || "").toLowerCase();
    const rCountry = (r.universityId?.country || r.country || "").toLowerCase();
    return uName.includes(q) || rName.includes(q) || rCountry.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">University Representative Partnerships</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Establish bilateral recruitment partnerships with official institution representatives worldwide.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("my")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "my"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>My Partnerships ({connections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("discover")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "discover"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-bold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Discover Representatives ({verifiedReps.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="p-4 rounded-2xl border flex items-center justify-between gap-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "my"
                ? "Search active or pending partnerships..."
                : "Search institutional representatives by university, name, or country..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* TAB A: My Partnerships */}
      {activeTab === "my" && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading partnerships...</div>
          ) : filteredConnections.length === 0 ? (
            <div className="p-12 text-center">
              <Handshake className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-white text-sm font-semibold">No partnerships established yet</p>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                Explore the verified representative directory to send your agency's connection requests.
              </p>
              <button
                onClick={() => setActiveTab("discover")}
                className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-all inline-flex items-center gap-1.5"
              >
                <span>Browse Directory</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                    <th className="py-3.5 px-4">University Partner</th>
                    <th className="py-3.5 px-4">Representative</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timeline</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredConnections.map((conn) => (
                    <tr key={conn._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xs shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{conn.university?.name || "Partner University"}</p>
                            <p className="text-slate-400 text-[11px]">{conn.university?.country || "Global"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium">
                          {conn.universityRepresentative?.name || "Institutional Rep"}
                        </p>
                        <p className="text-slate-400 text-[11px]">{conn.universityRepresentative?.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {conn.universityRepresentative?.designation || "Admissions Officer"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            conn.status === "ACCEPTED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : conn.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {conn.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        Requested {new Date(conn.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {conn.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelConnection(conn._id)}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold border border-red-500/20 transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB B: Discover Verified University Representatives */}
      {activeTab === "discover" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              Loading verified institution representatives...
            </div>
          ) : filteredReps.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl border"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}>
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-white text-sm font-semibold">No university representatives match query</p>
              <p className="text-slate-500 text-xs mt-1">Check back later as new institutions complete verification.</p>
            </div>
          ) : (
            filteredReps.map((rep) => {
              const alreadyConnected = connectedRepIds.has(rep._id?.toString());
              const isRequesting = requestingRepId === rep._id;

              return (
                <div
                  key={rep._id}
                  className="p-5 rounded-2xl border flex flex-col justify-between"
                  style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                        {rep.name?.charAt(0) || "U"}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        VERIFIED REP
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-sm font-bold text-white">{rep.name}</h3>
                      <p className="text-xs text-slate-400">{rep.designation || "Admissions Officer"}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{rep.universityId?.name || rep.universityName || "University"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{rep.universityId?.country || rep.country || "Global"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{rep.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5">
                    {alreadyConnected ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold border border-white/5 flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Request Already Sent</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendConnection(rep)}
                        disabled={isRequesting}
                        className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-1.5"
                      >
                        {isRequesting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Send Connection Request</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
