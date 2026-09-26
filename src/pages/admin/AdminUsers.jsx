import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Filter, Eye, Edit, Shield, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, X, ChevronRight, Coins, Mail, Phone,
  Calendar, Building2, UserCheck, ShieldAlert, Globe, MapPin,
  Briefcase, GraduationCap, Award, Info, Lock, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";

// Helper to determine if role is student
const isStudent = (role) => (role || "").toLowerCase() === "student";

// Helper to normalize verification badge styles
const getVerificationBadge = (vStatus = "PENDING") => {
  const s = (vStatus || "PENDING").toUpperCase();
  if (s === "VERIFIED" || s === "APPROVED") {
    return {
      label: s,
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  }
  if (s === "REJECTED") {
    return {
      label: s,
      className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    };
  }
  if (s === "UNDER_REVIEW") {
    return {
      label: "UNDER REVIEW",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
  }
  return {
    label: "PENDING",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
};

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

  // Edit form state (Strictly single Account Status, no redundant Operational Status)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    accountStatus: "ACTIVE",
    targetCountry: "",
    adminNotes: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/users?role=${activeTab}&status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      const isSuccess = res?.success || res?.data?.success;
      const userList = res?.data?.users || res?.users || [];
      if (isSuccess) {
        setUsers(userList);
      } else {
        toast.error(res?.message || res?.data?.message || "Failed to load users");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err?.message || "Failed to fetch users");
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
      const res = await api.get(`/api/admin/users/${user._id}`);
      const isSuccess = res?.success || res?.data?.success;
      const details = res?.data || res;
      if (isSuccess) {
        setDrawerData(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Open edit modal with role-specific baseline
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      accountStatus: user.accountStatus || (user.status === "active" ? "ACTIVE" : "PENDING"),
      targetCountry: user.targetCountry || "",
      adminNotes: user.adminNotes || "",
    });
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setActionLoading(true);

    // Sync operational status seamlessly with account status
    let syncedStatus = "active";
    if (editForm.accountStatus === "SUSPENDED") syncedStatus = "suspended";
    else if (editForm.accountStatus === "PENDING") syncedStatus = "pending";
    else if (editForm.accountStatus === "UNDER_REVIEW") syncedStatus = "in_review";

    const payload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      accountStatus: editForm.accountStatus,
      status: syncedStatus,
      adminNotes: editForm.adminNotes,
    };

    if (isStudent(editUser.role)) {
      payload.targetCountry = editForm.targetCountry;
    }

    try {
      const res = await api.put(`/api/admin/users/${editUser._id}`, payload);
      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        toast.success(res?.message || res?.data?.message || "User updated successfully");
        setEditUser(null);
        fetchUsers();
        if (selectedUser && selectedUser._id === editUser._id) {
          openDetailDrawer(res?.data?.user || res?.user || editUser);
        }
      } else {
        toast.error(res?.message || res?.data?.message || "Failed to update user");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Error updating user");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick toggle status (Suspend / Activate)
  const handleToggleSuspend = async (user) => {
    const isCurrentlySuspended = user.status === "suspended" || user.accountStatus === "SUSPENDED";
    const newStatus = isCurrentlySuspended ? "active" : "suspended";
    const newAccountStatus = isCurrentlySuspended ? "ACTIVE" : "SUSPENDED";

    if (!window.confirm(`Are you sure you want to ${isCurrentlySuspended ? "RESTORE" : "SUSPEND"} ${user.name}?`)) {
      return;
    }

    try {
      const res = await api.put(`/api/admin/users/${user._id}`, {
        status: newStatus,
        accountStatus: newAccountStatus,
        reason: `Admin ${isCurrentlySuspended ? "restored" : "suspended"} account access`,
      });
      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        toast.success(res?.message || res?.data?.message || `User ${user.name} is now ${newStatus}`);
        fetchUsers();
        if (selectedUser && selectedUser._id === user._id) {
          openDetailDrawer(res?.data?.user || res?.user || user);
        }
      } else {
        toast.error(res?.message || res?.data?.message || "Status change failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Status update error");
    }
  };

  // Render role-specific details in the table column
  const renderRoleDetails = (u) => {
    const role = (u.role || "").toLowerCase();

    // 1. STUDENTS: Credit Balance
    if (role === "student") {
      return (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
          <Coins className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{u.walletCredits ?? 0} CR</span>
        </div>
      );
    }

    // 2. AGENCIES: Verification Status & Type/City
    if (role === "agency") {
      const vStatus = u.agencyProfile?.verificationStatus || u.agencyVerificationStatus || "PENDING";
      const badge = getVerificationBadge(vStatus);
      const agencyType = u.agencyProfile?.agencyType || "Study Abroad Consultancy";
      const loc = [u.agencyProfile?.city || u.city, u.agencyProfile?.country || u.country].filter(Boolean).join(", ");

      return (
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Verification:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium truncate max-w-[210px]" title={agencyType + (loc ? ` • ${loc}` : "")}>
            {agencyType}{loc ? ` • ${loc}` : ""}
          </span>
        </div>
      );
    }

    // 3. AGENTS: Agency Name & Designation
    if (role === "agent") {
      const agencyName = u.agencyId?.name || u.agencyName || u.agentApplication?.agencyName || "Affiliated Agency";
      const designation = u.designation || u.agentApplication?.designation || "Educational Counselor";

      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-white text-xs font-semibold flex items-center gap-1.5 truncate max-w-[210px]" title={agencyName}>
            <Building2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            <span className="truncate">{agencyName}</span>
          </span>
          <span className="text-slate-400 text-[11px] truncate max-w-[210px]" title={designation}>
            {designation}
          </span>
        </div>
      );
    }

    // 4. UNI REPRESENTATIVES: University Name & Designation
    if (role === "university_rep" || role === "university" || role === "university representative") {
      const uniName = u.universityId?.name || u.universityDetails?.name || u.uniRepApplication?.university?.name || "Partner University";
      const designation = u.designation || u.uniRepApplication?.representative?.designation || "Admissions Representative";

      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-white text-xs font-semibold flex items-center gap-1.5 truncate max-w-[210px]" title={uniName}>
            <GraduationCap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="truncate">{uniName}</span>
          </span>
          <span className="text-slate-400 text-[11px] truncate max-w-[210px]" title={designation}>
            {designation}
          </span>
        </div>
      );
    }

    // 5. ADMINISTRATORS: Admin Role & Scope
    if (role === "admin") {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-white text-xs font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
            Platform Superadmin
          </span>
          <span className="text-slate-400 text-[11px]">
            Full Platform Governance
          </span>
        </div>
      );
    }

    return null;
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
            Role-aware directory across Students, Agencies, Agents, Uni Representatives, and Admins
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
          { id: "university_rep", label: "Uni Representatives", icon: GraduationCap },
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
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">User Information</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Role Details</th>
                <th className="px-4 py-3 font-bold">Registered</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading records from database...
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
                  const accStatus = (u.accountStatus || (u.status === "active" ? "ACTIVE" : "PENDING")).toUpperCase();

                  return (
                    <tr
                      key={u._id}
                      className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                    >
                      {/* 1. User Information */}
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

                      {/* 2. Role */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/20">
                          {u.role}
                        </span>
                      </td>

                      {/* 3. Account Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isSuspended
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : accStatus === "ACTIVE" || accStatus === "APPROVED"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : accStatus === "UNDER_REVIEW"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {isSuspended ? "SUSPENDED" : accStatus}
                        </span>
                      </td>

                      {/* 4. Role Details (Strictly Role-Aware) */}
                      <td className="px-4 py-3.5">
                        {renderRoleDetails(u)}
                      </td>

                      {/* 5. Registered */}
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>

                      {/* 6. Actions */}
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

                    {/* Shared Account Info (Applicable to all roles) */}
                    <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Account Credentials</p>
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
                          <span className="text-slate-500 text-[10px] block">Account Status</span>
                          <span className="text-slate-200 font-semibold">{selectedUser.accountStatus || selectedUser.status || "ACTIVE"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Joined Admify</span>
                          <span className="text-slate-300 text-[11px]">
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ────────────────── STUDENT VIEW ────────────────── */}
                    {isStudent(selectedUser.role) && (
                      <>
                        {/* Target & Wallet */}
                        <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                          <p className="text-[11px] font-bold uppercase text-slate-400">Student Profile & Wallet</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500 text-[10px] block">Target Destination</span>
                              <span className="text-slate-200 font-semibold">{selectedUser.targetCountry || "—"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block">Wallet Balance</span>
                              <span className="text-amber-400 font-bold font-mono text-sm">{selectedUser.walletCredits ?? 0} CR</span>
                            </div>
                            {selectedUser.gpa && (
                              <div>
                                <span className="text-slate-500 text-[10px] block">GPA</span>
                                <span className="text-slate-200">{selectedUser.gpa}</span>
                              </div>
                            )}
                            {selectedUser.ielts && (
                              <div>
                                <span className="text-slate-500 text-[10px] block">IELTS</span>
                                <span className="text-slate-200">{selectedUser.ielts}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Student Applications */}
                        {drawerData?.related?.applications && (
                          <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                            <p className="text-[11px] font-bold uppercase text-slate-400">
                              Applications ({drawerData.related.applications.length})
                            </p>
                            {drawerData.related.applications.length === 0 ? (
                              <p className="text-slate-500 text-xs">No applications submitted yet.</p>
                            ) : (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
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

                        {/* Recent Credit Activity */}
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
                      </>
                    )}

                    {/* ────────────────── AGENCY VIEW ────────────────── */}
                    {selectedUser.role === "agency" && (
                      <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase text-slate-400">Agency Profile & Verification</p>
                          {(() => {
                            const vStatus = drawerData?.related?.agencyProfile?.verificationStatus || selectedUser.agencyProfile?.verificationStatus || selectedUser.agencyVerificationStatus || "PENDING";
                            const badge = getVerificationBadge(vStatus);
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.className}`}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Agency Name</span>
                            <span className="text-slate-200 font-semibold">
                              {drawerData?.related?.agencyProfile?.agencyName || selectedUser.agencyProfile?.agencyName || selectedUser.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Agency Type</span>
                            <span className="text-slate-200">
                              {drawerData?.related?.agencyProfile?.agencyType || selectedUser.agencyProfile?.agencyType || "Consultancy"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Country</span>
                            <span className="text-slate-200">
                              {drawerData?.related?.agencyProfile?.country || selectedUser.agencyProfile?.country || selectedUser.country || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">City</span>
                            <span className="text-slate-200">
                              {drawerData?.related?.agencyProfile?.city || selectedUser.agencyProfile?.city || selectedUser.city || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Website</span>
                            <span className="text-slate-200 truncate block">
                              {drawerData?.related?.agencyProfile?.website || selectedUser.agencyProfile?.website || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Application / Verification ID</span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {drawerData?.related?.agencyProfile?.applicationId || selectedUser.agencyProfile?.applicationId || selectedUser._id}
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Agency verification decisions (Approve/Reject) are handled strictly via the dedicated <strong>Agency Verification</strong> module.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ────────────────── AGENT VIEW ────────────────── */}
                    {selectedUser.role === "agent" && (
                      <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-3">
                        <p className="text-[11px] font-bold uppercase text-slate-400">Agent Credentials</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Sponsoring Agency</span>
                            <span className="text-slate-200 font-semibold flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-violet-400" />
                              {selectedUser.agencyId?.name || selectedUser.agencyName || drawerData?.related?.agentApplication?.agencyName || "Affiliated Agency"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Designation</span>
                            <span className="text-slate-200">
                              {selectedUser.designation || drawerData?.related?.agentApplication?.designation || "Educational Counselor"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Experience</span>
                            <span className="text-slate-200">
                              {selectedUser.professional?.yearsOfExperience || drawerData?.related?.agentApplication?.experience || 0} years
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Primary Countries</span>
                            <span className="text-slate-200">
                              {(selectedUser.academicScope?.countriesRegionsHandled || drawerData?.related?.agentApplication?.countrySpecialization || []).join(", ") || "Global"}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 text-[10px] block">Areas of Expertise</span>
                            <span className="text-slate-300">
                              {(selectedUser.professional?.areasOfExpertise || []).join(", ") || "International Admissions, Visa Counseling"}
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300 flex items-start gap-2">
                          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Agent agency sponsorship is verified and bound to the sponsoring agency.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ────────────────── UNI REP VIEW ────────────────── */}
                    {(selectedUser.role === "university_rep" || selectedUser.role === "university" || selectedUser.role === "university representative") && (
                      <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase text-slate-400">University Accreditation</p>
                          {(() => {
                            const vStatus = drawerData?.related?.uniRepApplication?.status || selectedUser.uniRepVerificationStatus || "APPROVED";
                            const badge = getVerificationBadge(vStatus);
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.className}`}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 text-[10px] block">University</span>
                            <span className="text-slate-200 font-semibold flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                              {selectedUser.universityId?.name || drawerData?.related?.uniRepApplication?.university?.name || "Partner University"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Designation</span>
                            <span className="text-slate-200">
                              {selectedUser.designation || drawerData?.related?.uniRepApplication?.representative?.designation || "Admissions Officer"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Official Email</span>
                            <span className="text-slate-200">
                              {selectedUser.officialUniversityEmail || drawerData?.related?.uniRepApplication?.representative?.officialEmail || selectedUser.email}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Application ID</span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {selectedUser.universityRepApplicationId || drawerData?.related?.uniRepApplication?.applicationId || selectedUser._id}
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            University accreditation and verification workflows are governed in the dedicated <strong>Uni Representatives</strong> module.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ────────────────── ADMIN VIEW ────────────────── */}
                    {selectedUser.role === "admin" && (
                      <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-3">
                        <p className="text-[11px] font-bold uppercase text-slate-400">Platform Governance Scope</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Governance Role</span>
                            <span className="text-slate-200 font-semibold flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5 text-violet-400" />
                              Platform Superadmin
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Security Scope</span>
                            <span className="text-emerald-400 font-semibold">Full Platform Access</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 text-[10px] block">Permissions Summary</span>
                            <span className="text-slate-300 text-[11px]">
                              User Governance, Agency Verifications, University Applications, Payments, Credit Ledger, Audit Trail
                            </span>
                          </div>
                        </div>
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
                    selectedUser.status === "suspended" || selectedUser.accountStatus === "SUSPENDED"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30"
                  }`}
                >
                  {selectedUser.status === "suspended" || selectedUser.accountStatus === "SUSPENDED" ? "Restore" : "Suspend"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Role-Specific Edit Modal ── */}
      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/8">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-600/20 text-violet-300 border border-violet-500/30">
                    {editUser.role} Account
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">Edit User: {editUser.name}</h3>
                </div>
                <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">

                {/* Base Editable Information */}
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Full Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>

                  {/* Single Account Status Dropdown (Operational status removed completely) */}
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Account Status</label>
                    <select
                      value={editForm.accountStatus}
                      onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 font-semibold"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                {/* ────────────────── ROLE-SPECIFIC SECTIONS ────────────────── */}

                {/* 1. STUDENT SPECIFIC */}
                {isStudent(editUser.role) && (
                  <div className="p-3.5 rounded-xl border border-white/8 bg-white/2 space-y-3">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Student Information</p>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Target Country</label>
                      <input
                        value={editForm.targetCountry}
                        onChange={(e) => setEditForm({ ...editForm, targetCountry: e.target.value })}
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                        placeholder="e.g. United Kingdom, Canada, USA"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                      <span>Wallet / Credit Balance:</span>
                      <span className="font-mono font-bold">{editUser.walletCredits ?? 0} CR</span>
                    </div>
                  </div>
                )}

                {/* 2. AGENCY SPECIFIC (Verification is read-only) */}
                {editUser.role === "agency" && (
                  <div className="p-3.5 rounded-xl border border-white/8 bg-white/2 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Agency Information</p>
                      {(() => {
                        const vStatus = editUser.agencyProfile?.verificationStatus || editUser.agencyVerificationStatus || "PENDING";
                        const badge = getVerificationBadge(vStatus);
                        return (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500">Verification Status:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Agency Name</span>
                        <span className="font-semibold text-white">{editUser.agencyProfile?.agencyName || editUser.name}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Agency Type</span>
                        <span>{editUser.agencyProfile?.agencyType || "Study Abroad Consultancy"}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Country</span>
                        <span>{editUser.agencyProfile?.country || editUser.country || "—"}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">City</span>
                        <span>{editUser.agencyProfile?.city || editUser.city || "—"}</span>
                      </div>
                      <div className="col-span-2 p-2 rounded-lg bg-white/3 truncate">
                        <span className="text-slate-500 text-[10px] block">Website</span>
                        <span>{editUser.agencyProfile?.website || "—"}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Agency verification approval/rejection must be handled via the dedicated <strong>Agency Verification</strong> workflow.
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. AGENT SPECIFIC (Agency ownership immutable) */}
                {editUser.role === "agent" && (
                  <div className="p-3.5 rounded-xl border border-white/8 bg-white/2 space-y-3">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Agent Information</p>
                    <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Sponsoring Agency (Immutable)</span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-violet-400" />
                          {editUser.agencyId?.name || editUser.agencyName || editUser.agentApplication?.agencyName || "Affiliated Agency"}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Designation</span>
                        <span>{editUser.designation || editUser.agentApplication?.designation || "Educational Counselor"}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Years of Experience</span>
                        <span>{editUser.professional?.yearsOfExperience || editUser.agentApplication?.experience || 0} years</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Primary Countries</span>
                        <span>{(editUser.academicScope?.countriesRegionsHandled || editUser.agentApplication?.countrySpecialization || []).join(", ") || "Global"}</span>
                      </div>
                      <div className="col-span-2 p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Expertise</span>
                        <span>{(editUser.professional?.areasOfExpertise || []).join(", ") || "Admissions, Visa Processing"}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300 flex items-start gap-2">
                      <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Agency sponsorship is immutable from this modal to protect ownership integrity.
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. UNIVERSITY REPRESENTATIVE SPECIFIC (University ownership immutable) */}
                {(editUser.role === "university_rep" || editUser.role === "university" || editUser.role === "university representative") && (
                  <div className="p-3.5 rounded-xl border border-white/8 bg-white/2 space-y-3">
                    <p className="text-[11px] font-bold uppercase text-slate-400">University Information</p>
                    <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">University (Immutable)</span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                          {editUser.universityId?.name || editUser.universityDetails?.name || editUser.uniRepApplication?.university?.name || "Partner University"}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Designation</span>
                        <span>{editUser.designation || editUser.uniRepApplication?.representative?.designation || "Admissions Officer"}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Official University Email</span>
                        <span>{editUser.officialUniversityEmail || editUser.uniRepApplication?.representative?.officialEmail || editUser.email}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Application ID</span>
                        <span className="font-mono text-[11px]">{editUser.universityRepApplicationId || editUser.uniRepApplication?.applicationId || editUser._id}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        University ownership and verification remain controlled by the dedicated Uni Representatives workflow.
                      </span>
                    </div>
                  </div>
                )}

                {/* 5. ADMINISTRATOR SPECIFIC */}
                {editUser.role === "admin" && (
                  <div className="p-3.5 rounded-xl border border-white/8 bg-white/2 space-y-3">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Administrator Information</p>
                    <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Admin Role</span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-violet-400" />
                          Platform Superadmin
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Scope</span>
                        <span className="text-emerald-400 font-semibold">Full Governance</span>
                      </div>
                      <div className="col-span-2 p-2 rounded-lg bg-white/3">
                        <span className="text-slate-500 text-[10px] block">Permissions Summary</span>
                        <span className="text-slate-400 text-[11px]">System Administration, User Controls, Financial Management, Audit Logs</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-300 flex items-start gap-2">
                      <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Sensitive authentication and authorization parameters are protected and immutable here.
                      </span>
                    </div>
                  </div>
                )}

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
