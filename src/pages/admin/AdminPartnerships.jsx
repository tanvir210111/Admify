import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Handshake, Building2, UserCheck, Search, Filter, Eye, CheckCircle2,
  XCircle, AlertTriangle, ShieldAlert, RefreshCw, X, Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";

const STATUS_MAP = {
  PENDING: { label: "Pending Response", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  ACCEPTED: { label: "Active Partnership", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  REJECTED: { label: "Rejected", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  BLOCKED: { label: "Blocked", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  SUSPENDED: { label: "Suspended", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

export default function AdminPartnerships() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedConn, setSelectedConn] = useState(null);

  // Status update modal
  const [actionModal, setActionModal] = useState(null); // { conn, targetStatus }
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      const url = filter !== "all"
        ? `/api/admin/partnerships?status=${encodeURIComponent(filter)}`
        : "/api/admin/partnerships";
      const data = await api.get(url);
      if (data?.success) {
        setConnections(data.data?.connections || []);
      } else {
        toast.error(data?.message || "Failed to load partnerships");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load partnerships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
  }, [filter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!actionModal?.conn) return;

    setActionLoading(true);
    try {
      const data = await api.put(`/api/admin/partnerships/${actionModal.conn._id}/status`, {
        status: actionModal.targetStatus,
        notes: actionNotes.trim(),
      });

      if (data?.success) {
        toast.success(`Partnership status updated to ${actionModal.targetStatus}`);
        setActionModal(null);
        setActionNotes("");
        fetchPartnerships();
      } else {
        toast.error(data.message || "Failed to update partnership status");
      }
    } catch (err) {
      toast.error("Network error during status update");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = connections.filter((c) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      c.agencyId?.name?.toLowerCase().includes(s) ||
      c.universityId?.name?.toLowerCase().includes(s) ||
      c.universityRepresentativeId?.name?.toLowerCase().includes(s) ||
      c._id?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Handshake className="w-6 h-6 text-cyan-400" /> University ↔ Agency Partnerships
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Institutional agency representation agreements, connection requests, and status governance
          </p>
        </div>
        <button
          onClick={fetchPartnerships}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agency, university, or rep..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {["all", "PENDING", "ACCEPTED", "REJECTED", "BLOCKED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                filter === st
                  ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
              }`}
            >
              {st === "all" ? "All Partnerships" : STATUS_MAP[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Partnerships Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Agency Partner</th>
                <th className="px-4 py-3 font-bold">University & Representative</th>
                <th className="px-4 py-3 font-bold">Initiated By</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Requested Date</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading partnership connections...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No partnership connections found matching current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const statusInfo = STATUS_MAP[c.status] || STATUS_MAP.PENDING;
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-white text-xs">{c.agencyId?.name || "Agency Partner"}</p>
                            <p className="text-[10px] text-slate-400">{c.agencyId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-bold text-white text-xs">{c.universityId?.name || "Partner University"}</p>
                          <p className="text-[10px] text-cyan-400">
                            Rep: {c.universityRepresentativeId?.name || "Official Admissions Representative"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/4 text-slate-300">
                          {c.requestedByRole || "Agency"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status !== "ACCEPTED" && (
                            <button
                              onClick={() => setActionModal({ conn: c, targetStatus: "ACCEPTED" })}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-colors"
                            >
                              Accept
                            </button>
                          )}
                          {c.status !== "REJECTED" && (
                            <button
                              onClick={() => setActionModal({ conn: c, targetStatus: "REJECTED" })}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-colors"
                            >
                              Reject
                            </button>
                          )}
                          {c.status !== "BLOCKED" && (
                            <button
                              onClick={() => setActionModal({ conn: c, targetStatus: "BLOCKED" })}
                              className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[10px] font-bold transition-colors"
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Status Action Modal ── */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">
                  Update Partnership: {actionModal.targetStatus}
                </h3>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
                <p className="text-slate-300">
                  Change connection status between <strong className="text-white">{actionModal.conn.agencyId?.name}</strong> and{" "}
                  <strong className="text-white">{actionModal.conn.universityId?.name}</strong> to{" "}
                  <strong className="text-cyan-400">{actionModal.targetStatus}</strong>.
                </p>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Administrative Reason / Notes</label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Specify administrative rationale for status modification..."
                    className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "Updating..." : `Set ${actionModal.targetStatus}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
