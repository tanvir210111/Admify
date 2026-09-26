import React, { useState, useEffect } from "react";
import DashboardCard from "../../components/ui/DashboardCard";
import {
  GraduationCap,
  UserCheck,
  Calendar,
  FileCheck,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  RefreshCw,
  ExternalLink,
  Award
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

function UniRepDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'connections' | 'profile'
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fullName = profile?.fullName || user?.user_metadata?.full_name || user?.name || "University Representative";
  const firstName = fullName.split(" ")[0];

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get("/api/university-rep/profile");
      if (res?.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.warn("Could not load Uni Rep profile", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const res = await api.get("/api/university-rep/connections");
      if (res?.data?.connections) {
        setConnections(res.data.connections);
      } else if (Array.isArray(res?.data)) {
        setConnections(res.data);
      }
    } catch (err) {
      console.warn("Could not load connections", err);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchConnections();
  }, []);

  const handleAcceptConnection = async (connectionId) => {
    setProcessingId(connectionId);
    try {
      await api.post(`/api/university-rep/connections/${connectionId}/accept`);
      toast.success("Agency connection accepted!");
      fetchConnections();
    } catch (err) {
      toast.error(err.message || "Failed to accept connection.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConnection = async (connectionId) => {
    setProcessingId(connectionId);
    try {
      await api.post(`/api/university-rep/connections/${connectionId}/reject`);
      toast.success("Agency connection request rejected.");
      fetchConnections();
    } catch (err) {
      toast.error(err.message || "Failed to reject connection.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Welcome back, {firstName}{" "}
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-slate-400">
            {profile?.university?.universityName ? (
              <span className="text-violet-400 font-semibold">
                Official Representative · {profile.university.universityName}
              </span>
            ) : (
              "Manage incoming applications, university profile, and verified agency partnerships."
            )}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "connections"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Agency Connections
            {connections.filter((c) => c.status === "PENDING").length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">
                {connections.filter((c) => c.status === "PENDING").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Official Profile
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Pending Applications"
              value="342"
              icon={FileCheck}
              trend={{ value: 14, isPositive: true }}
            />
            <DashboardCard
              title="Accepted Offers"
              value="85"
              icon={UserCheck}
              trend={{ value: 8, isPositive: true }}
            />
            <DashboardCard
              title="Connected Agencies"
              value={String(connections.filter((c) => c.status === "ACCEPTED").length)}
              icon={Users}
              trend={{ value: 4, isPositive: true }}
            />
            <DashboardCard
              title="Enrolled Students"
              value="1,240"
              icon={GraduationCap}
              trend={{ value: 5, isPositive: true }}
            />
          </div>

          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-400">
                    <th className="py-3 px-4 font-medium">Applicant Name</th>
                    <th className="py-3 px-4 font-medium">Program</th>
                    <th className="py-3 px-4 font-medium">Match Score</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Alex Johnson",
                      program: "M.S. Computer Science",
                      score: "95%",
                      status: "Under Review",
                    },
                    {
                      name: "Maria Garcia",
                      program: "MBA",
                      score: "88%",
                      status: "Interview Scheduled",
                    },
                    {
                      name: "James Smith",
                      program: "M.S. Data Science",
                      score: "92%",
                      status: "New",
                    },
                  ].map((app, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {app.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{app.program}</td>
                      <td className="py-3 px-4 text-green-400">{app.score}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            app.status === "New"
                              ? "bg-blue-500/20 text-blue-400"
                              : app.status === "Interview Scheduled"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "connections" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                Verified Agency Connections
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Establish direct partnerships with accredited study abroad consultancies without changing university ownership.
              </p>
            </div>
            <button
              onClick={fetchConnections}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loadingConnections ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase tracking-widest bg-slate-900/80">
                    <th className="px-5 py-3.5 font-bold">Agency Name</th>
                    <th className="px-5 py-3.5 font-bold">Email</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold">Requested Date</th>
                    <th className="px-5 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loadingConnections ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" />
                        Loading agency relationships...
                      </td>
                    </tr>
                  ) : connections.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500 text-sm">
                        No agency connection requests at this time. Verified agencies can request partnerships directly through their directory.
                      </td>
                    </tr>
                  ) : (
                    connections.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-slate-200">
                            {c.agencyId?.agencyName || c.agencyId?.name || "Verified Agency Partner"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {c.agencyId?.email || "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              c.status === "ACCEPTED"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : c.status === "PENDING"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {c.status === "PENDING" && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={processingId === c._id}
                                onClick={() => handleAcceptConnection(c._id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Accept
                              </button>
                              <button
                                disabled={processingId === c._id}
                                onClick={() => handleRejectConnection(c._id)}
                                className="px-3 py-1 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-700/50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          )}
                          {c.status === "ACCEPTED" && (
                            <span className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                            </span>
                          )}
                          {c.status === "REJECTED" && (
                            <span className="text-xs text-rose-400 flex items-center justify-end gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Declined
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-900/40">
                {firstName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{fullName}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Representative
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {profile?.designation || "Authorized University Representative"} ·{" "}
                  <span className="text-violet-300 font-medium">
                    {profile?.university?.universityName || "Verified Institution"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* University Affiliation */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-400" />
                Verified University Affiliation
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">University Name</span>
                  <span className="text-slate-200 font-semibold text-sm">{profile?.university?.universityName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="text-slate-300">{profile?.university?.city}, {profile?.university?.country}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Official Domain</span>
                  <span className="text-violet-400 font-mono">@{profile?.university?.officialEmailDomain || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Representative ID</span>
                  <span className="text-slate-300 font-mono">{profile?.employeeId || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Academic Scope */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Academic Scope & Admissions
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Study Levels Managed</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.academicScope?.studyLevels?.map((lvl) => (
                      <span key={lvl} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md">
                        {lvl}
                      </span>
                    )) || <span className="text-slate-500">Undergraduate, Master's</span>}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Programs / Departments</span>
                  <span className="text-slate-300">{profile?.academicScope?.programsHandled || "All University Faculties"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Recruitment Regions</span>
                  <span className="text-slate-300">{profile?.academicScope?.countriesHandled?.join(", ") || "International"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniRepDashboard;
