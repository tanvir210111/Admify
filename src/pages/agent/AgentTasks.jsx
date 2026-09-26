import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Clock,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  X,
  RefreshCw,
  Edit2,
  Trash2,
  FileCheck,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const PRIORITY_BADGES = {
  LOW: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  MEDIUM: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  URGENT: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function AgentTasks() {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, stuRes] = await Promise.all([
        api.get("/api/agent/tasks"),
        api.get("/api/agent/students"),
      ]);

      if (taskRes?.data?.success) {
        setTasks(taskRes.data.data.tasks || []);
      }
      if (stuRes?.data?.success) {
        setStudents(stuRes.data.data.students || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      toast.error("Failed to load tasks workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a task title.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/api/agent/tasks", {
        title: title.trim(),
        studentId: studentId || undefined,
        dueDate: dueDate || undefined,
        priority,
        notes: notes.trim(),
      });

      if (res?.data?.success) {
        toast.success("Task scheduled successfully.");
        setIsModalOpen(false);
        setTitle("");
        setStudentId("");
        setDueDate("");
        setPriority("MEDIUM");
        setNotes("");
        fetchData();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const res = await api.put(`/api/agent/tasks/${task._id}`, {
        status: nextStatus,
      });

      if (res?.data?.success) {
        toast.success(`Task marked as ${nextStatus.toLowerCase()}.`);
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      toast.error("Failed to update task status.");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (t.title || "").toLowerCase().includes(q) ||
      (t.student?.name || "").toLowerCase().includes(q) ||
      (t.notes || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (t.status || "PENDING").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-violet-400" /> Counselor Tasks & Deadlines
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Organize follow-up items, document requests, admissions deadlines, and visa verification milestones.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            Schedule New Task
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* KPI Counters */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks Scheduled", val: tasks.length, color: "text-blue-400" },
          {
            label: "Pending / In Progress",
            val: tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED").length,
            color: "text-yellow-400",
          },
          {
            label: "Urgent Priority",
            val: tasks.filter((t) => t.priority === "URGENT" && t.status !== "COMPLETED").length,
            color: "text-red-400",
          },
          {
            label: "Completed Milestones",
            val: tasks.filter((t) => t.status === "COMPLETED").length,
            color: "text-emerald-400",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border"
            style={{
              background: "rgba(11, 18, 40, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter / Search Bar */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl border"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks by title, student name, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-slate-200 focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </motion.div>

      {/* Task List */}
      <motion.div
        variants={fade}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
            Loading counselor tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-16 text-center">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Tasks Scheduled</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              {search || statusFilter !== "all"
                ? "No tasks match your search filters."
                : "You have no outstanding follow-up tasks on your agenda."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTasks.map((t) => {
              const isCompleted = t.status === "COMPLETED";
              const priorityClass =
                PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.MEDIUM;

              return (
                <div
                  key={t._id}
                  className={`p-4 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCompleted ? "opacity-60 bg-white/[0.01]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(t)}
                      className={`mt-0.5 p-1 rounded-lg border transition-colors ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-white/20 hover:border-violet-400 text-transparent"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <div
                        className={`text-sm font-bold text-white ${
                          isCompleted ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {t.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        {t.student && (
                          <span className="text-violet-300 font-semibold">
                            Student: {t.student.name}
                          </span>
                        )}
                        {t.dueDate && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Due: {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {t.notes && <span className="text-slate-500">· {t.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityClass}`}
                    >
                      {t.priority || "MEDIUM"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-white/10">
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modal: Schedule Task */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0B1228] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400" /> Schedule Counselor Task
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Task Title / Action Item *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Request missing IELTS certificate from applicant"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Related Student (Optional)
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">General Counselor Task (No specific student)</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Add operational notes or follow-up details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 disabled:opacity-50"
                  >
                    {saving ? "Scheduling..." : "Schedule Task"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
