import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Coins, 
  ExternalLink, 
  Eye, 
  RefreshCw,
  Filter,
  Check,
  X
} from "lucide-react";
import { formatBDT } from "../../utils/creditConstants";
import { api } from "../../lib/api";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const url = statusFilter && statusFilter !== "all" 
        ? `/api/admin/payments?status=${encodeURIComponent(statusFilter)}`
        : "/api/admin/payments";
      const data = await api.get(url);
      if (data?.success) {
        setPayments(data.data?.payments || []);
      } else {
        setErrorMsg(data?.message || "Failed to load payment orders from server.");
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
      setErrorMsg(err?.message || "Failed to load payment orders from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleApprove = async (orderId) => {
    if (!window.confirm("Approve this payment order? Purchased credits will be allocated immediately and any existing Free Welcome Credits for this student will be forfeited.")) {
      return;
    }
    setActionLoading(orderId);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const data = await api.post(`/api/admin/payments/${orderId}/approve`, {});
      if (data?.success) {
        setSuccessMsg(`Payment order approved successfully! ${data.data?.creditsAdded || ""} Credits deposited.`);
        fetchPayments();
      } else {
        setErrorMsg(data?.message || "Failed to approve payment.");
      }
    } catch (err) {
      console.error("Approval error:", err);
      setErrorMsg(err?.message || "Failed to approve payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModalOrder) return;
    setActionLoading(rejectModalOrder._id);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const data = await api.post(`/api/admin/payments/${rejectModalOrder._id}/reject`, {
        reason: rejectReason || "Payment verification failed"
      });
      if (data?.success) {
        setSuccessMsg(`Payment order ${rejectModalOrder.orderId} was marked as REJECTED.`);
        setRejectModalOrder(null);
        setRejectReason("");
        fetchPayments();
      } else {
        setErrorMsg(data?.message || "Failed to reject payment.");
      }
    } catch (err) {
      console.error("Rejection error:", err);
      setErrorMsg("Failed to reject payment.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const studentName = p.user?.name?.toLowerCase() || "";
    const studentEmail = p.user?.email?.toLowerCase() || "";
    const txn = p.transactionId?.toLowerCase() || "";
    const orderRef = p.orderId?.toLowerCase() || "";
    return studentName.includes(q) || studentEmail.includes(q) || txn.includes(q) || orderRef.includes(q);
  });

  const pendingCount = payments.filter(p => p.status === "PENDING_VERIFICATION").length;
  const approvedCount = payments.filter(p => p.status === "APPROVED").length;
  const totalBdtRevenue = payments
    .filter(p => p.status === "APPROVED")
    .reduce((sum, p) => sum + (p.finalAmount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Financial Administration</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Manual Verification Queue</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-purple-400" /> 
            <span>Payment & Credit Verification</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Verify manual bank/mobile transfers, prevent duplicate transaction IDs, and allocate official paid credits.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Orders
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-[#0B1228]">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Verification</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-amber-400">{pendingCount}</h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Needs Review
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-2">Average SLA: 1-2 hours review</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-[#0B1228]">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved Orders</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-emerald-400">{approvedCount}</h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Completed
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-2">Credits allocated server-side</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-[#0B1228]">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved Platform Revenue</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-black text-white">{formatBDT(totalBdtRevenue)}</h3>
            <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              BDT Total
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-2">100% in BDT • 0 USD</p>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")}><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#0B1228] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, Trx ID, or Order ID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          {["all", "PENDING_VERIFICATION", "APPROVED", "REJECTED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {status === "all" ? "All Statuses" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B1228] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                <th className="px-4 py-3.5">Order / Date</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Package</th>
                <th className="px-4 py-3.5">Amount (BDT)</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Proof</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading payment queue...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    No payment orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isPending = order.status === "PENDING_VERIFICATION";
                  const isApproved = order.status === "APPROVED";
                  const isRejected = order.status === "REJECTED";

                  return (
                    <tr key={order._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-purple-300">{order.orderId}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">{order.user?.name || "Unknown Student"}</div>
                        <div className="text-[11px] text-slate-400">{order.user?.email || "No email"}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-200">{order.packageName}</span>
                        <div className="text-[11px] text-purple-400 font-semibold">+{order.credits} CR</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-white">{formatBDT(order.finalAmount)}</div>
                        {order.discountAmount > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            Disc: -{formatBDT(order.discountAmount)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                          {order.paymentMethod?.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                          {order.transactionId}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {order.screenshotUrl ? (
                          <button
                            onClick={() => setPreviewImage(order.screenshotUrl)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" /> View
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs">No file</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(order._id)}
                              disabled={actionLoading === order._id}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-1 transition-all"
                              title="Approve & Allocate Credits"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => setRejectModalOrder(order)}
                              disabled={actionLoading === order._id}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold inline-flex items-center gap-1 transition-all"
                              title="Reject Payment"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : isApproved ? (
                          <div className="text-[11px] text-slate-500">
                            Verified on {new Date(order.verifiedDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-[11px] text-red-400">
                            {order.rejectionReason || "Verification failed"}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h4 className="text-white font-bold text-sm">Payment Screenshot Proof</h4>
                <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
                <img src={previewImage} alt="Payment Proof" className="max-w-full rounded object-contain" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Reject Payment Order</h3>
              <p className="text-slate-400 text-xs mb-4">
                Order <span className="font-mono text-purple-300 font-bold">{rejectModalOrder.orderId}</span> for {rejectModalOrder.user?.name}. State the reason for rejecting this transaction (e.g. invalid screenshot, unreceived deposit).
              </p>

              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (student will see this notice)..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-red-500/50 mb-4"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setRejectModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === rejectModalOrder._id}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
