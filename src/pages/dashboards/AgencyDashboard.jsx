import React, { useState, useEffect } from "react";
import DashboardCard from "../../components/ui/DashboardCard";
import {
  Building,
  Users,
  Briefcase,
  TrendingUp,
  UserCheck,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
  XCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

function AgencyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'partnerships'
  const [connections, setConnections] = useState([]);
  const [verifiedReps, setVerifiedReps] = useState([]);
  const [loadingPartnerships, setLoadingPartnerships] = useState(false);
  const [requestingRepId, setRequestingRepId] = useState(null);
  const [repSearch, setRepSearch] = useState("");

  const fullName = user?.user_metadata?.full_name || user?.name || "Agency Manager";
  const firstName = fullName.split(" ")[0];

  const fetchConnections = async () => {
    try {
      const res = await api.get("/api/agency/university-connections");
      if (res?.data?.connections) {
        setConnections(res.data.connections);
      } else if (Array.isArray(res?.data)) {
        setConnections(res.data);
      }
    } catch (err) {
      console.warn("Could not load agency connections", err);
    }
  };

  const fetchVerifiedReps = async () => {
    try {
      const res = await api.get("/api/agency/verified-university-reps");
      if (res?.data?.representatives) {
        setVerifiedReps(res.data.representatives);
      } else if (Array.isArray(res?.data)) {
        setVerifiedReps(res.data);
      }
    } catch (err) {
      console.warn("Could not load verified university reps", err);
    }
  };

  const loadPartnershipData = async () => {
    setLoadingPartnerships(true);
    await Promise.all([fetchConnections(), fetchVerifiedReps()]);
    setLoadingPartnerships(false);
  };

  useEffect(() => {
    if (activeTab === "partnerships") {
      loadPartnershipData();
    }
  }, [activeTab]);

  const handleSendConnectionRequest = async (rep) => {
    setRequestingRepId(rep._id);
    try {
      await api.post("/api/agency/university-connections", {
        universityRepresentativeId: rep._id,
        universityId: rep.universityId?._id || rep.universityId,
      });
      toast.success(`Partnership request dispatched to ${rep.name}!`);
      fetchConnections();
    } catch (err) {
      toast.error(err.message || "Failed to send connection request.");
    } finally {
      setRequestingRepId(null);
    }
  };

  const filteredReps = verifiedReps.filter((r) => {
    const q = repSearch.toLowerCase();
    const uniName = (r.universityId?.universityName || r.universityName || "").toLowerCase();
    const repName = (r.name || "").toLowerCase();
    return uniName.includes(q) || repName.includes(q);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Welcome back, {firstName}{" "}
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-slate-400">
            Manage agents, organizational performance, and official University partnerships.
          </p>
        </div>

        {/* Tab switcher */}
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
            onClick={() => setActiveTab("partnerships")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "partnerships"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            University Partnerships
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Agents"
              value="24"
              icon={Briefcase}
              trend={{ value: 5, isPositive: true }}
            />
            <DashboardCard
              title="Total Students"
              value="842"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <DashboardCard
              title="Partner Universities"
              value={String(connections.filter((c) => c.status === "ACCEPTED").length || "156")}
              icon={Building}
              trend={{ value: 2, isPositive: true }}
            />
            <DashboardCard
              title="Total Revenue"
              value="$45,200"
              icon={TrendingUp}
              trend={{ value: 18, isPositive: true }}
            />
          </div>

          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Top Performing Agents</h2>
            <div className="space-y-4">
              {[
                { name: "Sarah Jenkins", students: 145, successRate: "92%" },
                { name: "Michael Chen", students: 128, successRate: "88%" },
                { name: "David Smith", students: 95, successRate: "95%" },
              ].map((agent, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <span className="text-slate-200 font-medium">{agent.name}</span>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <span className="text-slate-400">
                      <span className="text-slate-200">{agent.students}</span> Students
                    </span>
                    <span className="text-slate-400">
                      <span className="text-green-400">{agent.successRate}</span> Success Rate
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "partnerships" && (
        <div className="space-y-8">
          {/* Active Partnerships Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Your University Representative Connections
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connections allow direct communication with verified institutional representatives.
                </p>
              </div>
              <button
                onClick={loadPartnershipData}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPartnerships ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase tracking-widest bg-slate-900/80">
                      <th className="px-5 py-3 font-bold">University</th>
                      <th className="px-5 py-3 font-bold">Representative</th>
                      <th className="px-5 py-3 font-bold">Status</th>
                      <th className="px-5 py-3 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {connections.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-slate-500 text-xs">
                          No active connections yet. Explore verified representatives below to send partnership requests.
                        </td>
                      </tr>
                    ) : (
                      connections.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-slate-200">
                              {c.universityId?.universityName || "Verified University"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-300">
                            {c.universityRepresentativeId?.name || "Official Representative"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
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
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Directory of Verified University Representatives */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-violet-400" />
                  Verified University Representatives Directory
                </h3>
                <p className="text-xs text-slate-400">
                  Connect with accredited institutional admissions officers.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={repSearch}
                  onChange={(e) => setRepSearch(e.target.value)}
                  placeholder="Search university or rep..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReps.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs bg-slate-900/30 rounded-2xl border border-slate-800">
                  No verified university representatives currently available.
                </div>
              ) : (
                filteredReps.map((rep) => {
                  const existingConn = connections.find(
                    (c) =>
                      String(c.universityRepresentativeId?._id || c.universityRepresentativeId) ===
                      String(rep._id)
                  );
                  return (
                    <div
                      key={rep._id}
                      className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white">{rep.name}</h4>
                            <p className="text-xs text-violet-400 font-medium">
                              {rep.universityId?.universityName || "Verified University"}
                            </p>
                          </div>
                          <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          {rep.designation || "Authorized Representative"} · {rep.universityId?.country || "International"}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        {existingConn ? (
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              existingConn.status === "ACCEPTED"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : existingConn.status === "PENDING"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {existingConn.status === "ACCEPTED"
                              ? "Connected"
                              : existingConn.status === "PENDING"
                              ? "Request Pending"
                              : "Declined"}
                          </span>
                        ) : (
                          <button
                            disabled={requestingRepId === rep._id}
                            onClick={() => handleSendConnectionRequest(rep)}
                            className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-900/30 flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            {requestingRepId === rep._id ? "Sending..." : "Request Partnership"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgencyDashboard;
