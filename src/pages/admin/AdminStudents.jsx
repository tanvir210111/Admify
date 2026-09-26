import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Search, Filter, Eye, Edit, Shield, CheckCircle,
  XCircle, AlertTriangle, RefreshCw, X, ChevronRight, Coins, Mail,
  Phone, Calendar, Plus, ExternalLink, Download,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Credit Adjustment Modal state
  const [adjustModalStudent, setAdjustModalStudent] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState("paid");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Edit Student Modal state
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    targetCountry: "",
    targetCourse: "",
    gpa: "",
    ielts: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `/api/admin/users?role=student&status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data?.users || []);
      } else {
        toast.error(data.message || "Failed to load students");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to student records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const openStudentDrawer = async (student) => {
    setSelectedStudent(student);
    setDrawerLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${student._id}`, {
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

  // Perform controlled credit adjustment
  const handleCreditAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustModalStudent) return;
    const delta = Number(adjustAmount);
    if (isNaN(delta) || delta === 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }
    if (!adjustReason.trim() || adjustReason.trim().length < 5) {
      toast.error("Please provide a reason of at least 5 characters for audit compliance");
      return;
    }

    setAdjustLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/credits/adjust", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: adjustModalStudent._id,
          amount: delta,
          creditType: adjustType,
          reason: adjustReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Credits adjusted successfully");
        setAdjustModalStudent(null);
        setAdjustAmount("");
        setAdjustReason("");
        fetchStudents();
        if (selectedStudent && selectedStudent._id === adjustModalStudent._id) {
          openStudentDrawer(data.data.user);
        }
      } else {
        toast.error(data.message || "Credit adjustment failed");
      }
    } catch (err) {
      toast.error("Credit adjustment error");
    } finally {
      setAdjustLoading(false);
    }
  };

  // Save student edit
  const handleSaveStudentEdit = async (e) => {
    e.preventDefault();
    if (!editStudent) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${editStudent._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Student updated successfully");
        setEditStudent(null);
        fetchStudents();
        if (selectedStudent && selectedStudent._id === editStudent._id) {
          openStudentDrawer(data.data.user);
        }
      } else {
        toast.error(data.message || "Failed to update student");
      }
    } catch (err) {
      toast.error("Error updating student");
    } finally {
      setEditLoading(false);
    }
  };

  // Suspend / Restore Student
  const handleToggleSuspend = async (student) => {
    const isSuspended = student.status === "suspended";
    const nextStatus = isSuspended ? "active" : "suspended";
    if (!window.confirm(`Are you sure you want to ${isSuspended ? "RESTORE" : "SUSPEND"} student ${student.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${student._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          accountStatus: nextStatus === "active" ? "ACTIVE" : "SUSPENDED",
          reason: `Admin ${isSuspended ? "restored" : "suspended"} student account`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Student is now ${nextStatus}`);
        fetchStudents();
      } else {
        toast.error(data.message || "Failed to update status");
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
            <GraduationCap className="w-6 h-6 text-violet-400" /> Student Directory & Records
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Real student applications, profile metrics, academic scores, and wallet credit management
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, phone..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </form>

        <div className="flex items-center gap-2">
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

      {/* Students Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Student</th>
                <th className="px-4 py-3 font-bold">Target Study</th>
                <th className="px-4 py-3 font-bold">Scores</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Wallet Balance</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading student data from server...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No students found matching current criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-xs flex-shrink-0">
                          {s.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{s.name}</p>
                          <p className="text-slate-400 text-[11px]">{s.email}</p>
                          {s.phone && <p className="text-slate-500 text-[10px]">{s.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-200">{s.targetCountry || "Not specified"}</p>
                      <p className="text-slate-500 text-[11px]">{s.targetCourse || "General Studies"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/4 text-slate-300 font-mono text-[10px]">
                          GPA: {s.gpa || "—"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/4 text-slate-300 font-mono text-[10px]">
                          IELTS: {s.ielts || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          s.status === "suspended"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : s.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {s.status || "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-300">{s.walletCredits || 0} CR</span>
                        <button
                          onClick={() => setAdjustModalStudent(s)}
                          className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] font-semibold transition-colors"
                          title="Adjust Credits"
                        >
                          ± Adjust
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openStudentDrawer(s)}
                          className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                          title="View Profile Drawer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditStudent(s);
                            setEditForm({
                              name: s.name || "",
                              email: s.email || "",
                              phone: s.phone || "",
                              targetCountry: s.targetCountry || "",
                              targetCourse: s.targetCourse || "",
                              gpa: s.gpa || "",
                              ielts: s.ielts || "",
                            });
                          }}
                          className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                          title="Edit Student Info"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(s)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.status === "suspended"
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          }`}
                          title={s.status === "suspended" ? "Restore Account" : "Suspend Account"}
                        >
                          {s.status === "suspended" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Student Detail Drawer ── */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 p-6 overflow-y-auto custom-scrollbar border-l border-white/10 flex flex-col justify-between"
              style={{ background: "#070B1E" }}
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-white/8">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-600/20 text-blue-300 border border-blue-500/30">
                      Student Dossier
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedStudent.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {drawerLoading ? (
                  <div className="py-16 text-center text-slate-400 text-xs">Loading student records...</div>
                ) : (
                  <div className="space-y-4 pt-4 text-xs">
                    {/* Academic Profile */}
                    <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Academic & Preferences</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Target Destination</span>
                          <span className="text-slate-200 font-semibold">{selectedStudent.targetCountry || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Preferred Degree</span>
                          <span className="text-slate-200 font-semibold">{selectedStudent.targetCourse || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">CGPA</span>
                          <span className="text-slate-200 font-semibold">{selectedStudent.gpa || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">English Test</span>
                          <span className="text-slate-200 font-semibold">{selectedStudent.ielts ? `IELTS ${selectedStudent.ielts}` : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Breakdown */}
                    <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] font-bold uppercase text-slate-400">Wallet & Credits</p>
                        <button
                          onClick={() => setAdjustModalStudent(selectedStudent)}
                          className="text-amber-400 hover:underline font-bold text-[11px]"
                        >
                          ± Adjust
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded bg-white/3 text-center">
                          <span className="text-slate-500 text-[9px] block">Total</span>
                          <span className="text-amber-400 font-bold font-mono text-sm">{selectedStudent.walletCredits || 0}</span>
                        </div>
                        <div className="p-2 rounded bg-white/3 text-center">
                          <span className="text-slate-500 text-[9px] block">Free</span>
                          <span className="text-slate-300 font-bold font-mono text-sm">{selectedStudent.freeCredits || 0}</span>
                        </div>
                        <div className="p-2 rounded bg-white/3 text-center">
                          <span className="text-slate-500 text-[9px] block">Paid</span>
                          <span className="text-emerald-400 font-bold font-mono text-sm">{selectedStudent.paidCredits || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Applications */}
                    <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2">
                      <p className="text-[11px] font-bold uppercase text-slate-400">
                        Applications ({drawerData?.related?.applications?.length || 0})
                      </p>
                      {drawerData?.related?.applications?.length === 0 ? (
                        <p className="text-slate-500 text-xs">No applications filed yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                          {drawerData?.related?.applications?.map((a, i) => (
                            <div key={i} className="p-2 rounded bg-white/3 flex justify-between items-center">
                              <div>
                                <p className="text-white font-bold">{a.university}</p>
                                <p className="text-[10px] text-slate-400">{a.program}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-600/20 text-violet-300">
                                {a.stage}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/8 flex gap-2">
                <button
                  onClick={() => {
                    setEditStudent(selectedStudent);
                    setEditForm({
                      name: selectedStudent.name || "",
                      email: selectedStudent.email || "",
                      phone: selectedStudent.phone || "",
                      targetCountry: selectedStudent.targetCountry || "",
                      targetCourse: selectedStudent.targetCourse || "",
                      gpa: selectedStudent.gpa || "",
                      ielts: selectedStudent.ielts || "",
                    });
                  }}
                  className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => handleToggleSuspend(selectedStudent)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    selectedStudent.status === "suspended"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30"
                  }`}
                >
                  {selectedStudent.status === "suspended" ? "Restore" : "Suspend"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Controlled Credit Adjustment Modal ── */}
      <AnimatePresence>
        {adjustModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" /> Credit Adjustment
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Target: {adjustModalStudent.name}</p>
                </div>
                <button onClick={() => setAdjustModalStudent(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreditAdjustment} className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300">
                  <p className="font-semibold text-xs">Current Balance: {adjustModalStudent.walletCredits || 0} CR</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Enter positive numbers to grant credits (e.g. +50) or negative numbers to deduct (e.g. -20).
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Credit Amount (+ / -)</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="e.g. 50 or -20"
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Wallet Sub-Balance</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="paid">Paid Credits (Non-expiring)</option>
                    <option value="free">Free Welcome Credits</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Mandatory Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Provide a compliant reason (e.g., Customer support compensation, test waiver, bank reversal)..."
                    className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setAdjustModalStudent(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjustLoading}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                  >
                    {adjustLoading ? "Applying..." : "Confirm Ledger Adjustment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Student Modal ── */}
      <AnimatePresence>
        {editStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">Edit Student: {editStudent.name}</h3>
                <button onClick={() => setEditStudent(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStudentEdit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Email</label>
                  <input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    type="email"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Phone</label>
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">CGPA</label>
                    <input
                      value={editForm.gpa}
                      onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })}
                      placeholder="e.g. 3.85"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">IELTS Score</label>
                    <input
                      value={editForm.ielts}
                      onChange={(e) => setEditForm({ ...editForm, ielts: e.target.value })}
                      placeholder="e.g. 7.5"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setEditStudent(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-colors disabled:opacity-50"
                  >
                    {editLoading ? "Saving..." : "Save Profile"}
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
