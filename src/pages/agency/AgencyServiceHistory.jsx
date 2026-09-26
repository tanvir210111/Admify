import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  History,
  Coins,
  CheckCircle2,
  RefreshCw,
  Search,
  Calendar,
  FileCheck,
  CreditCard,
} from "lucide-react";

export default function AgencyServiceHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agency/service-history");
      if (res.success && res.data) {
        setOrders(res.data.serviceOrders || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load service history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Service Order Ledger & History</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Immutable financial audit trail of credit-backed agency bookings and fulfillment dates.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* History Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading ledger...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-white text-sm font-semibold">No historical service transactions</p>
            <p className="text-slate-500 text-xs mt-1">Completed student service orders will be cataloged here permanently.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Service Tier</th>
                  <th className="py-3.5 px-4">Credits Verified</th>
                  <th className="py-3.5 px-4">Assigned Counselor</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-[11px] text-violet-400">
                        {ord.orderId || `ORD-${ord._id.slice(-6).toUpperCase()}`}
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        {new Date(ord.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-white font-medium">{ord.user?.name || "Student"}</p>
                      <p className="text-slate-400 text-[11px]">{ord.user?.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {ord.serviceName || "Agency Service"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-amber-300 font-bold text-xs">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{ord.creditsCharged || 0} CR</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {ord.assignedAgency?.agentName || "General Consultancy"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          ord.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {ord.status || "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
