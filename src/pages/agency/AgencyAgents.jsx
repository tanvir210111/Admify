import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  UserCheck,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  X,
  FileText,
  ShieldAlert,
  Send,
} from "lucide-react";

export default function AgencyAgents() {
  const [agents, setAgents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Drawer / Modals
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);

  // New Agent Application Form State
  const [applyForm, setApplyForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "Senior Admissions Counselor",
    experienceYears: "3",
    countrySpecialization: "United States, United Kingdom, Canada",
    notes: "",
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agency/agents");
      if (res.success && res.data) {
        setAgents(res.data.registeredAgents || []);
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load agency agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleStatusChange = async (agentId, newStatus) => {
    try {
      const res = await api.put(`/api/agency/agents/${agentId}/status`, { status: newStatus });
      if (res.success) {
        toast.success(res.message || `Agent status updated to ${newStatus}`);
        fetchAgents();
        if (selectedAgent && selectedAgent._id === agentId) {
          setSelectedAgent({ ...selectedAgent, status: newStatus });
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to update agent status");
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.email || !applyForm.phone) {
      return toast.error("Please fill in agent's name, email, and contact number");
    }

    setSubmittingApply(true);
    try {
      const res = await api.post("/api/agency/agent-applications", applyForm);
      if (res.success) {
        toast.success("Agent application submitted to Admin for verification and approval!");
        setShowApplyModal(false);
        setApplyForm({
          name: "",
          email: "",
          phone: "",
          designation: "Senior Admissions Counselor",
          experienceYears: "3",
          countrySpecialization: "United States, United Kingdom, Canada",
          notes: "",
        });
        fetchAgents();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit agent application");
    } finally {
      setSubmittingApply(false);
    }
  };

  const filteredAgents = agents.filter((ag) => {
    const q = search.toLowerCase();
    const matchQuery =
      ag.name?.toLowerCase().includes(q) ||
      ag.email?.toLowerCase().includes(q) ||
      ag.phone?.toLowerCase().includes(q) ||
      ag.designation?.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && ag.status === "active") ||
      (statusFilter === "inactive" && ag.status === "inactive") ||
      (statusFilter === "suspended" && (ag.status === "suspended" || ag.accountStatus === "SUSPENDED"));

    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Agents & Counselors</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage your agency's counselors, track performance, and submit new agent applications for Admin review.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAgents}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Submit Agent Application</span>
          </button>
        </div>
      </div>

      {/* Admin Verification Notice */}
      <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="text-white font-semibold">Official Admify Agent Onboarding Lifecycle</p>
          <p className="text-slate-400 mt-0.5">
            To maintain international standards, Agencies submit Agent Applications for Admin review. Upon Admin approval,
            an official Activation Code is issued for the agent to register and bind to your agency.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agent by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading agents roster...</div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-white text-sm font-semibold">No registered agents found</p>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Your agency has not onboarded any active agents yet, or none match the selected filter.
            </p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/40 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Submit First Agent Application</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Counselor</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredAgents.map((ag) => (
                  <tr key={ag._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {ag.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{ag.name}</p>
                          <p className="text-slate-400 text-[11px]">Member since {new Date(ag.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {ag.designation || "Admissions Counselor"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{ag.email}</span>
                        </div>
                        {ag.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{ag.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {ag.countrySpecialization || "Global"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          ag.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : ag.status === "suspended"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {ag.status === "active" && <CheckCircle2 className="w-3 h-3" />}
                        {ag.status === "suspended" && <XCircle className="w-3 h-3" />}
                        {ag.status?.toUpperCase() || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAgent(ag)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
                        >
                          View
                        </button>

                        {ag.status !== "active" ? (
                          <button
                            onClick={() => handleStatusChange(ag._id, "active")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 transition-colors"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(ag._id, "inactive")}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-semibold border border-amber-500/20 transition-colors"
                          >
                            Deactivate
                          </button>
                        )}

                        {ag.status !== "suspended" && (
                          <button
                            onClick={() => handleStatusChange(ag._id, "suspended")}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold border border-red-500/20 transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submitted Agent Applications Pending Admin Approval */}
      {applications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Agent Applications Awaiting Admin Approval</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {applications.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-xl border"
                style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-bold text-xs">{app.name}</p>
                    <p className="text-slate-400 text-[11px]">{app.email}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      app.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : app.status === "rejected"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {app.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 text-[11px] text-slate-400 flex justify-between">
                  <span>{app.designation || "Counselor"}</span>
                  <span>Submitted {new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                {app.activationCode && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex justify-between items-center">
                    <span>Activation Code:</span>
                    <span className="font-mono font-bold tracking-wider">{app.activationCode}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <button
                onClick={() => setSelectedAgent(null)}
                className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-base">
                  {selectedAgent.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedAgent.name}</h3>
                  <p className="text-xs text-slate-400">{selectedAgent.designation || "Counselor"}</p>
                </div>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Email Address</span>
                  <span className="text-white font-medium">{selectedAgent.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Phone Number</span>
                  <span className="text-white font-medium">{selectedAgent.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Current Status</span>
                  <span className="text-emerald-400 font-bold uppercase">{selectedAgent.status || "ACTIVE"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Country Specialization</span>
                  <span className="text-white font-medium">{selectedAgent.countrySpecialization || "Global"}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Agent Application Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Submit Agent Application to Admin</h3>
                  <p className="text-[11px] text-slate-400">Admin reviews and issues activation code for agent registration</p>
                </div>
              </div>

              <form onSubmit={handleApplySubmit} className="pt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={applyForm.name}
                    onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      placeholder="agent@consultancy.com"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      placeholder="+8801700000000"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                    <input
                      type="text"
                      value={applyForm.designation}
                      onChange={(e) => setApplyForm({ ...applyForm, designation: e.target.value })}
                      placeholder="Senior Counselor"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={applyForm.experienceYears}
                      onChange={(e) => setApplyForm({ ...applyForm, experienceYears: e.target.value })}
                      placeholder="3"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country Specialization</label>
                  <input
                    type="text"
                    value={applyForm.countrySpecialization}
                    onChange={(e) => setApplyForm({ ...applyForm, countrySpecialization: e.target.value })}
                    placeholder="United States, Canada, UK, Australia"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Internal Recommendation Note</label>
                  <textarea
                    rows={2}
                    value={applyForm.notes}
                    onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                    placeholder="Why this counselor is being onboarded..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApply}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/30"
                  >
                    {submittingApply ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Submit Application</span>
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
