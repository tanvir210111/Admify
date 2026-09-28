import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, Building2, Search, Filter, Eye, CheckCircle2,
  XCircle, AlertTriangle, ShieldCheck, RefreshCw, X, Clock,
  ChevronRight, Phone, Mail, Award, Calendar, Hash, Users,
  Trash2, ShieldAlert, AlertCircle, Ban, ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import { useAdminBadges } from "../../context/AdminBadgeContext";
import AdminAgentApplicationsTab from "../../components/admin/AdminAgentApplicationsTab";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STATUS_MAP = {
  ACTIVE: { label: "Active", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  PENDING: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  SUSPENDED: { label: "Suspended", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  suspended: { label: "Suspended", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

export default function AdminAgents() {
  const { getStatusCount, markEntityAsSeen } = useAdminBadges();
  const [activeTab, setActiveTab] = useState("roster"); // 'roster' | 'applications'
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Suspend / Restore modal state
  const [statusModal, setStatusModal] = useState(null); // { agent, targetStatus }
  const [statusLoading, setStatusLoading] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(null); // agent object
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter && filter !== "all") params.append("status", filter);
      if (search && search.trim()) params.append("search", search.trim());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const url = `/api/admin/agents${queryString}`;
      const res = await api.get(url);
      const isSuccess = res?.success || res?.data?.success;
      const list = res?.data?.agents || res?.agents || [];
      if (isSuccess || Array.isArray(list)) {
        setAgents(list);
      } else {
        toast.error(res?.message || "Failed to load agent directory.");
      }
    } catch (err) {
      console.error("Agents fetch error:", err);
      toast.error(err?.message || "Failed to connect to agent records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "roster") {
      const timer = setTimeout(() => {
        fetchAgents();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab, filter, search]);

  const handleToggleStatus = async () => {
    if (!statusModal?.agent) return;
    setStatusLoading(true);
    try {
      const agentId = statusModal.agent._id;
      const newStatus = statusModal.targetStatus.toLowerCase();
      const newAccountStatus = statusModal.targetStatus.toUpperCase();

      const res = await api.put(`/api/admin/users/${agentId}/status`, {
        status: newStatus,
        accountStatus: newAccountStatus,
      });

      if (res?.success) {
        toast.success(`Agent ${statusModal.agent.name} is now ${newAccountStatus}.`);
        setStatusModal(null);
        fetchAgents();
        if (selectedAgent && selectedAgent._id === agentId) {
          setSelectedAgent({ ...selectedAgent, status: newStatus, accountStatus: newAccountStatus });
        }
      } else {
        toast.error(res?.message || "Failed to update agent status.");
      }
    } catch (err) {
      toast.error(err?.message || "Status update failed.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!deleteModal) return;
    if (confirmInput.toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm permanent deletion.");
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/admin/users/${deleteModal._id}`);
      if (res?.success) {
        toast.success("Agent account permanently deleted.");
        setDeleteModal(null);
        setConfirmInput("");
        if (selectedAgent?._id === deleteModal._id) setSelectedAgent(null);
        fetchAgents();
      } else {
        toast.error(res?.message || "Failed to delete agent.");
      }
    } catch (err) {
      const status = err?.status;
      if (status === 409) {
        toast.error("Agent must be suspended before deletion.");
      } else {
        toast.error(err?.message || "Deletion failed.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // KPIs
  const totalCount = agents.length;
  const activeCount = agents.filter(
    (a) => (a.accountStatus || a.status || "").toUpperCase() === "ACTIVE"
  ).length;
  const pendingCount = agents.filter(
    (a) => (a.accountStatus || a.status || "").toUpperCase() === "PENDING"
  ).length;
  const suspendedCount = agents.filter(
    (a) => (a.accountStatus || a.status || "").toUpperCase() === "SUSPENDED"
  ).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-100 min-w-0">
      {/* Page Header */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/6 pb-5"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-violet-400" />
            Agent Management & Directory
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage certified educational agents, affiliated agency counselors, verification IDs, and counselor rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAgents()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700/80 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-white/6 pb-2">
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "roster"
              ? "bg-violet-600/25 border-violet-500/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              : "bg-transparent border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-violet-400" />
          Accredited Agents Directory ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "applications"
              ? "bg-violet-600/25 border-violet-500/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              : "bg-transparent border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>Agent Applications & Codes</span>
          {getStatusCount("agents", "all") > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              [{getStatusCount("agents", "all")}]
            </span>
          )}
        </button>
      </div>

      {activeTab === "applications" ? (
        <AdminAgentApplicationsTab />
      ) : (
        <>
          {/* KPI Summary Cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { label: "Total Agents", val: totalCount, icon: Users, color: "text-blue-400", border: "border-blue-500/20" },
              { label: "Active & Licensed", val: activeCount, icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500/20" },
              { label: "Pending Activation", val: pendingCount, icon: Clock, color: "text-amber-400", border: "border-amber-500/20" },
              { label: "Suspended", val: suspendedCount, icon: Ban, color: "text-rose-400", border: "border-rose-500/20" },
            ].map((kpi, idx) => (
              <motion.div
                key={idx}
                variants={fade}
                className={`p-4 rounded-2xl border ${kpi.border} bg-white/2 backdrop-blur-sm relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-black text-white mt-1.5">{kpi.val}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Search & Filter Toolbar */}
          <div className="p-3.5 rounded-2xl bg-white/2 border border-white/6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search agent name, email, phone, agency, agent ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {["all", "active", "pending", "suspended"].map((st) => {
                const count = getStatusCount("agents", st);
                return (
                  <button
                    key={st}
                    onClick={() => setFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border flex items-center gap-1.5 ${
                      filter === st
                        ? "bg-violet-600/30 text-violet-300 border-violet-500/50 shadow-sm"
                        : "bg-white/3 text-slate-400 border-white/5 hover:text-white hover:bg-white/6"
                    }`}
                  >
                    <span>{st}</span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        [{count}]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agents Roster Table */}
          <div className="rounded-2xl border border-white/8 bg-black/30 overflow-hidden shadow-2xl">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap min-w-[900px]">
                <thead className="bg-white/4 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/8">
                  <tr>
                    <th className="py-3.5 px-4">Agent Identity</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Affiliated Agency</th>
                    <th className="py-3.5 px-4">Agent ID / Code</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Registered</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
                          <span className="text-xs">Loading accredited agents...</span>
                        </div>
                      </td>
                    </tr>
                  ) : agents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserCheck className="w-8 h-8 text-slate-600 mb-1" />
                          <p className="text-sm font-bold text-slate-300">No agent records found</p>
                          <p className="text-xs text-slate-500">
                            {search || filter !== "all"
                              ? "Try adjusting your search query or status filter."
                              : "No agents registered in the database yet."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    agents.map((agent) => {
                      const stKey = (agent.accountStatus || agent.status || "ACTIVE").toUpperCase();
                      const stBadge = STATUS_MAP[stKey] || STATUS_MAP.ACTIVE;
                      const isSuspended = stKey === "SUSPENDED";
                      const agencyTitle = agent.agencyName || agent.agencyId?.name || "Independent / Unassigned";
                      const appId = agent.agentApplicationId || agent.agentApplication?.applicationId || "N/A";
                      const isUnseen = !agent.isSeenByAdmin;

                      return (
                        <tr
                          key={agent._id}
                          onClick={() => {
                            setSelectedAgent(agent);
                            if (!agent.isSeenByAdmin) {
                              agent.isSeenByAdmin = true;
                              markEntityAsSeen("agent_user", agent._id);
                            }
                          }}
                          className={`transition-colors border-b border-white/5 cursor-pointer ${
                            isUnseen
                              ? "bg-violet-950/30 border-l-4 border-l-violet-500 shadow-[inset_0_0_24px_rgba(139,92,246,0.12)] hover:bg-violet-950/40"
                              : "hover:bg-white/2"
                          }`}
                        >
                          {/* Agent Name & Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs shrink-0">
                                {agent.name?.charAt(0)?.toUpperCase() || "A"}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  {agent.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {agent.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              {agent.phone || "N/A"}
                            </div>
                          </td>

                          {/* Affiliated Agency */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-200">{agencyTitle}</span>
                                {agent.agencyId?.applicationId && (
                                  <span className="block text-[10px] text-slate-500 font-mono">
                                    {agent.agencyId.applicationId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Agent ID / Application ID */}
                          <td className="py-3.5 px-4 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-violet-300 border border-white/10 font-bold">
                              {appId}
                            </span>
                          </td>

                          {/* Designation */}
                          <td className="py-3.5 px-4 text-slate-300">
                            {agent.designation || "Educational Counselor"}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${stBadge.cls}`}
                            >
                              {stBadge.label}
                            </span>
                          </td>

                          {/* Registered Date */}
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {agent.createdAt
                              ? new Date(agent.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedAgent(agent)}
                                title="View Agent Profile"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Activate Toggle */}
                              {isSuspended ? (
                                <button
                                  onClick={() => setStatusModal({ agent, targetStatus: "ACTIVE" })}
                                  title="Restore / Reactivate Account"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setStatusModal({ agent, targetStatus: "SUSPENDED" })}
                                  title="Suspend Agent Account"
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete Safeguard: ONLY enabled when suspended */}
                              <button
                                onClick={() => {
                                  if (isSuspended) {
                                    setDeleteModal(agent);
                                    setConfirmInput("");
                                  } else {
                                    toast.error("User must be suspended before deletion.");
                                  }
                                }}
                                disabled={!isSuspended}
                                title={
                                  isSuspended
                                    ? "Permanently delete agent account"
                                    : "User must be suspended before deletion"
                                }
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isSuspended
                                    ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/30 cursor-pointer"
                                    : "bg-white/2 text-slate-600 border-white/5 cursor-not-allowed opacity-50"
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </>
      )}

      {/* ── Slide-over Drawer: Agent Details ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-lg bg-slate-900 border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 shadow-2xl text-slate-100 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center font-bold text-violet-300 text-sm">
                      {selectedAgent.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">{selectedAgent.name}</h2>
                      <p className="text-xs text-slate-400 font-mono">{selectedAgent.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Section 1: Profile Details */}
                <div className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Agent Credentials
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Role</span>
                      <span className="font-semibold text-white capitalize">Agent</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Account Status</span>
                      <span className="font-semibold text-white uppercase">
                        {selectedAgent.accountStatus || selectedAgent.status || "ACTIVE"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone Number</span>
                      <span className="font-semibold text-white">{selectedAgent.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Agent App ID</span>
                      <span className="font-semibold text-violet-300 font-mono">
                        {selectedAgent.agentApplicationId || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Designation</span>
                      <span className="font-semibold text-white">
                        {selectedAgent.designation || "Educational Counselor"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Wallet / Credits</span>
                      <span className="font-semibold text-slate-400">N/A (Agent role)</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Affiliated Agency */}
                <div className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Sponsoring Agency Affiliation
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-400">Agency Name</span>
                      <span className="font-bold text-white">
                        {selectedAgent.agencyName || selectedAgent.agencyId?.name || "Independent"}
                      </span>
                    </div>
                    {selectedAgent.agencyId?.email && (
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-400">Agency Official Email</span>
                        <span className="font-mono text-slate-300">{selectedAgent.agencyId.email}</span>
                      </div>
                    )}
                    {selectedAgent.agencyId?.phone && (
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-400">Agency Phone</span>
                        <span className="font-mono text-slate-300">{selectedAgent.agencyId.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Specializations */}
                {selectedAgent.countrySpecialization && selectedAgent.countrySpecialization.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Country Specializations
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAgent.countrySpecialization.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-slate-200 border border-white/10 text-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-white/10 pt-4 flex gap-2">
                {(selectedAgent.accountStatus || selectedAgent.status || "").toUpperCase() === "SUSPENDED" ? (
                  <>
                    <button
                      onClick={() => {
                        setStatusModal({ agent: selectedAgent, targetStatus: "ACTIVE" });
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Restore Agent
                    </button>
                    <button
                      onClick={() => {
                        setDeleteModal(selectedAgent);
                      }}
                      className="px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setStatusModal({ agent: selectedAgent, targetStatus: "SUSPENDED" });
                    }}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Suspend Agent
                  </button>
                )}
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Status Change Confirmation Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    statusModal.targetStatus === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {statusModal.targetStatus === "ACTIVE" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Ban className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {statusModal.targetStatus === "ACTIVE" ? "Restore Agent Account" : "Suspend Agent Account"}
                  </h3>
                  <p className="text-xs text-slate-400">{statusModal.agent.name}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                {statusModal.targetStatus === "ACTIVE"
                  ? "Are you sure you want to reactivate this agent? They will regain counselor portal access."
                  : "Suspending this agent will temporarily disable their portal login and client authorizations. You may permanently delete the account once suspended."}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModal(null)}
                  disabled={statusLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={statusLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                    statusModal.targetStatus === "ACTIVE"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-amber-600 hover:bg-amber-500"
                  }`}
                >
                  {statusLoading ? "Processing..." : `Confirm ${statusModal.targetStatus}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Permanent Delete Confirmation Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Permanent Agent Deletion</h3>
                  <p className="text-xs text-rose-400">Irreversible Action</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                <p className="font-bold">You are deleting:</p>
                <p>Name: <span className="font-semibold text-white">{deleteModal.name}</span></p>
                <p>Email: <span className="font-semibold text-white">{deleteModal.email}</span></p>
                <p>Agency: <span className="font-semibold text-white">{deleteModal.agencyName || "N/A"}</span></p>
              </div>

              <p className="text-xs text-slate-400">
                To prevent accidental destruction of records, type <strong className="text-white">DELETE</strong> to confirm permanent database removal.
              </p>

              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-rose-500/30 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModal(null);
                    setConfirmInput("");
                  }}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAgent}
                  disabled={deleteLoading || confirmInput.toUpperCase() !== "DELETE"}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white transition-all shadow-lg shadow-rose-600/20"
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
