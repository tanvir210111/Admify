import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ChevronRight,
  X,
  Send,
  AlertCircle,
} from "lucide-react";

export default function AgencyServiceRequests() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Manage Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionStatus, setActionStatus] = useState("");
  const [assignAgentId, setAssignAgentId] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/agency/service-requests?status=${statusFilter}`);
      if (res.success && res.data) {
        setOrders(res.data.serviceOrders || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get("/api/agency/agents");
      if (res.success && res.data) {
        setAgents(res.data.registeredAgents || []);
      }
    } catch (err) {
      console.warn("Could not load counselors for service assignment:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, [statusFilter]);

  const handleOpenManage = (ord) => {
    setSelectedOrder(ord);
    setActionStatus(ord.status || "IN_PROGRESS");
    setAssignAgentId("");
    setOrderNotes(ord.notes || "");
  };

  const handleQuickAccept = async (ordId) => {
    try {
      const res = await api.put(`/api/agency/service-requests/${ordId}`, { action: "ACCEPT" });
      if (res.success) {
        toast.success("Service request accepted and assigned to your agency!");
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || "Failed to accept service request");
    }
  };

  const handleQuickReject = async (ordId) => {
    try {
      const res = await api.put(`/api/agency/service-requests/${ordId}`, { action: "REJECT" });
      if (res.success) {
        toast.success("Service request declined.");
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || "Failed to decline service request");
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSaving(true);
    try {
      const payload = {
        status: actionStatus,
        agentId: assignAgentId || undefined,
        notes: orderNotes || undefined,
      };

      const res = await api.put(`/api/agency/service-requests/${selectedOrder._id}`, payload);
      if (res.success) {
        toast.success("Service order updated successfully.");
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update service order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Agency Service Bookings</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Credit-based student bookings for Agency Assistance (800 CR) and Full Managed Services (1,500 CR).
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Credit Pricing Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Fixed Credit Package</span>
            <p className="text-white font-bold text-sm">Agency Assistance</p>
            <p className="text-slate-400 text-xs mt-0.5">Application document review & visa filing guidance</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-violet-300">800 CR</span>
            <p className="text-[11px] text-slate-400">৳80,000 equivalent</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Fixed Credit Package</span>
            <p className="text-white font-bold text-sm">Full Agency Managed Service</p>
            <p className="text-slate-400 text-xs mt-0.5">End-to-end counselor-led admissions & visa processing</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-cyan-300">1,500 CR</span>
            <p className="text-[11px] text-slate-400">৳1,50,000 equivalent</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-4 rounded-2xl border flex items-center justify-between gap-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Service Statuses</option>
            <option value="ACTIVE">Active / Unassigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DOCUMENTS_REQUIRED">Documents Required</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {orders.length} service booking{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Service Orders Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading service requests...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-white text-sm font-semibold">No service requests yet</p>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              When students redeem their credits for Agency Assistance (800 CR) or Full Managed Service (1500 CR), requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Service Package</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Credits Verified</th>
                  <th className="py-3.5 px-4">Assigned Counselor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {orders.map((ord) => {
                  const isAssigned = !!ord.assignedAgency?.agencyId;
                  return (
                    <tr key={ord._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-white font-semibold">{ord.serviceName || "Agency Service"}</p>
                          <p className="text-slate-400 text-[11px]">
                            Booked on {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium">{ord.user?.name || "Student"}</p>
                        <p className="text-slate-400 text-[11px]">{ord.user?.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>{ord.creditsCharged || 0} CR</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>{ord.assignedAgency?.agentName || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : ord.status === "IN_PROGRESS"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              : ord.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {ord.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isAssigned && ord.status === "ACTIVE" && (
                            <button
                              onClick={() => handleQuickAccept(ord._id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 transition-colors"
                            >
                              Accept Order
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenManage(ord)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Service Order Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">{selectedOrder.serviceName || "Service Booking"}</h3>
                <p className="text-xs text-slate-400">
                  Student: {selectedOrder.user?.name} ({selectedOrder.user?.email})
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span>{selectedOrder.creditsCharged || 0} Credits Backend-Validated</span>
                </div>
              </div>

              <form onSubmit={handleSaveModal} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Status</label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="IN_PROGRESS">IN_PROGRESS — Active Consultation</option>
                    <option value="DOCUMENTS_REQUIRED">DOCUMENTS_REQUIRED — Transcripts / Passport Needed</option>
                    <option value="COMPLETED">COMPLETED — Admissions Filing Concluded</option>
                    <option value="CANCELLED">CANCELLED — Student Withdrawn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assign Agency Counselor</label>
                  <select
                    value={assignAgentId}
                    onChange={(e) => setAssignAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Keep current ({selectedOrder.assignedAgency?.agentName || "Unassigned"})</option>
                    {agents.map((ag) => (
                      <option key={ag._id} value={ag._id}>
                        {ag.name} ({ag.designation || "Counselor"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Internal Counselor Notes</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Log progress, notes, or student requirements..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/30"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Save Service Order</span>
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
