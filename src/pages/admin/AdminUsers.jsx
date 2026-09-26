import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Filter, Eye, Edit, Shield, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, X, ChevronRight, Coins, Mail, Phone,
  Calendar, Building2, UserCheck, ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("student"); // 'student' | 'agency' | 'agent' | 'university_rep' | 'admin'
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    accountStatus: "ACTIVE",
    targetCountry: "",
    adminNotes: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `/api/admin/users?role=${activeTab}&status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data?.users || []);
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Open user drawer
  const openDetailDrawer = async (user) => {
    setSelectedUser(user);
    setDrawerLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDrawerData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      status: user.status || "active",
      accountStatus: user.accountStatus || "ACTIVE",
      targetCountry: user.targetCountry || "",
      adminNotes: user.adminNotes || "",
    });
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${editUser._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User updated successfully");
        setEditUser(null);
        fetchUsers();
        if (selectedUser && selectedUser._id === editUser._id) {
          openDetailDrawer(data.data.user);
        }
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (err) {
      toast.error("Error updating user");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick toggle status (Suspend / Activate)
  const handleToggleSuspend = async (user) => {
    const isCurrentlySuspended = user.status === "suspended";
    const newStatus = isCurrentlySuspended ? "active" : "suspended";
    const newAccountStatus = isCurrentlySuspended ? "ACTIVE" : "SUSPENDED";

    if (!window.confirm(`Are you sure you want to ${isCurrentlySuspended ? "RESTORE" : "SUSPEND"} ${user.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          accountStatus: newAccountStatus,
          reason: `Admin ${isCurrentlySuspended ? "restored" : "suspended"} account access`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User ${user.name} is now ${newStatus}`);
        fetchUsers();
        if (selectedUser && selectedUser._id === user._id) {
          openDetailDrawer(data.data.user);
        }
      } else {
        toast.error(data.message || "Status change failed");
      }
    } catch (err) {
      toast.error("Status update error");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-violet-400" /> Central User Governance
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Unified directory across Students, Agencies, Agents, Uni Representatives, and Admins
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 border-b border-white/8 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: "student", label: "Students", icon: Users },
          { id: "agency", label: "Agencies", icon: Building2 },
          { id: "agent", label: "Agents", icon: UserCheck },
          { id: "university_rep", label: "Uni Representatives", icon: Building2 },
          { id: "admin", label: "Administrators", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar: Search + Filter */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}s by name, email, phone...`}
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 text-xs font-semibold">Status:</span>
          {["all", "active", "pending", "suspended"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                  : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">User Information</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Wallet / Credits</th>
                <th className="px-4 py-3 font-bold">Registered</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading records from backend database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No {activeTab} accounts found matching current query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuspended = u.status === "suspended" || u.accountStatus === "SUSPENDED";
                  return (
                    <tr
                      key={u._id}
                      className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs flex-shrink-0">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{u.name}</p>
                            <p className="text-slate-400 text-[11px]">{u.email}</p>
                            {u.phone && <p className="text-slate-500 text-[10px]">{u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isSuspended
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : u.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {isSuspended ? "Suspended" : u.status || "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-300">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{u.walletCredits || 0} CR</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailDrawer(u)}
                            className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuspended
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            }`}
                            title={isSuspended ? "Restore Account" : "Suspend Account"}
                          >
                            {isSuspended ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
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

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 p-6 overflow-y-auto custom-scrollbar border-l border-white/10 flex flex-col justify-between"
              style={{ background: "#070B1E" }}
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-white/8">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      {selectedUser.role} Profile
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedUser.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {drawerLoading ? (
                  <div className="py-16 text-center text-slate-400 text-xs">Loading related records...</div>
                ) : (
                  <div className="space-y-5 pt-4">
                    {/* Basic Info */}
                    <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Account Details</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Email</span>
                          <span className="text-slate-200 font-semibold">{selectedUser.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Phone</span>
                          <span className="text-slate-200 font-semibold">{selectedUser.phone || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Target Destination</span>
                          <span className="text-slate-200 font-semibold">{selectedUser.targetCountry || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Wallet Balance</span>
                          <span className="text-amber-400 font-bold font-mono">{selectedUser.walletCredits || 0} CR</span>
                        </div>
                      </div>
                    </div>

                    {/* Applications */}
                    {drawerData?.related?.applications && (
                      <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                        <p className="text-[11px] font-bold uppercase text-slate-400">
                          Applications ({drawerData.related.applications.length})
                        </p>
                        {drawerData.related.applications.length === 0 ? (
                          <p className="text-slate-500 text-xs">No applications submitted yet.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {drawerData.related.applications.map((ap, i) => (
                              <div key={i} className="p-2 rounded-lg bg-white/3 flex justify-between items-center text-xs">
                                <div>
                                  <p className="text-slate-200 font-bold">{ap.university}</p>
                                  <p className="text-[10px] text-slate-400">{ap.program}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-600/20 text-violet-300">
                                  {ap.stage}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recent Ledger Transactions */}
                    {drawerData?.related?.creditTransactions && (
                      <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                        <p className="text-[11px] font-bold uppercase text-slate-400">Recent Credit Activity</p>
                        {drawerData.related.creditTransactions.length === 0 ? (
                          <p className="text-slate-500 text-xs">No credit ledger records found.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                            {drawerData.related.creditTransactions.slice(0, 5).map((tx, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-white/3 flex justify-between items-center text-xs">
                                <span className="text-slate-300 text-[11px]">{tx.desc}</span>
                                <span className={`font-mono font-bold ${tx.credits > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                  {tx.credits > 0 ? `+${tx.credits}` : tx.credits} CR
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/8 flex gap-2">
                <button
                  onClick={() => openEditModal(selectedUser)}
                  className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
                >
                  Edit Information
                </button>
                <button
                  onClick={() => handleToggleSuspend(selectedUser)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    selectedUser.status === "suspended"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30"
                  }`}
                >
                  {selectedUser.status === "suspended" ? "Restore" : "Suspend"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">Edit User: {editUser.name}</h3>
                <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Full Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Email Address</label>
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Phone Number</label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Account Status</label>
                    <select
                      value={editForm.accountStatus}
                      onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Target Country</label>
                    <input
                      value={editForm.targetCountry}
                      onChange={(e) => setEditForm({ ...editForm, targetCountry: e.target.value })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setEditUser(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? "Saving..." : "Save Changes"}
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
