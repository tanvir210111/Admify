import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Award,
  BookOpen,
  MessageSquare,
  FileCheck,
  ChevronRight,
  X,
  UserCheck,
} from "lucide-react";

export default function AgencyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/agency/students?search=${encodeURIComponent(search)}`);
      if (res.success && res.data) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load assigned students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Assigned Students</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Students linked to your agency via active service bookings or direct admissions applications.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
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
            placeholder="Search students by name, email, target country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {students.length} authorized student{students.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Students Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading authorized students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-white text-sm font-semibold">No students assigned yet</p>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Students who book Agency Assistance, Managed Services, or submit applications to your agency will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Destination & Field</th>
                  <th className="py-3.5 px-4">Academic Score</th>
                  <th className="py-3.5 px-4">Assigned Counselor</th>
                  <th className="py-3.5 px-4">Active Pipeline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {st.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{st.name}</p>
                          <p className="text-slate-400 text-[11px]">
                            Joined {new Date(st.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{st.email}</span>
                        </div>
                        {st.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{st.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-white font-medium">{st.targetCountry || "Country Pending"}</p>
                        <p className="text-slate-400 text-[11px] truncate max-w-[160px]">
                          {st.targetCourse || "General Studies"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-slate-300">
                        <p>GPA: {st.gpa || "N/A"}</p>
                        <p className="text-slate-400 text-[11px]">IELTS: {st.ielts || "N/A"}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <UserCheck className="w-3.5 h-3.5 text-violet-400" />
                        <span>{typeof st.assignedAgent === "object" ? st.assignedAgent?.name : st.assignedAgent}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {st.activeApplication ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          App: {st.activeApplication.stage || "Submitted"}
                        </span>
                      ) : st.activeService ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Service: {st.activeService.status || "Active"}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Consultation</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => navigate(`/agency/messages?recipient=${st._id}`)}
                          className="p-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-colors"
                          title="Contact Student"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Profile Drawer / Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-base">
                  {selectedStudent.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Phone</span>
                  <span className="text-white font-medium">{selectedStudent.phone || "Not provided"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Target Study Destination</span>
                  <span className="text-white font-medium">{selectedStudent.targetCountry || "Any"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Preferred Program</span>
                  <span className="text-white font-medium">{selectedStudent.targetCourse || "General"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Undergraduate / High School GPA</span>
                  <span className="text-white font-medium">{selectedStudent.gpa || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">English Proficiency (IELTS/TOEFL)</span>
                  <span className="text-white font-medium">{selectedStudent.ielts || "N/A"}</span>
                </div>
                {selectedStudent.bio && (
                  <div className="py-2">
                    <span className="text-slate-400 block mb-1">Academic Statement</span>
                    <p className="text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5 text-[11px] leading-relaxed">
                      {selectedStudent.bio}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <button
                  onClick={() => {
                    const sId = selectedStudent._id;
                    setSelectedStudent(null);
                    navigate(`/agency/messages?recipient=${sId}`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Direct Message</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
