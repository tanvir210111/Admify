import React from "react";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
} from "lucide-react";
import DashboardCard from "../../components/ui/DashboardCard";
function WalletPage() {
  const transactions = [
    {
      id: 1,
      type: "credit",
      amount: 50,
      desc: "Add Funds",
      date: "Oct 24, 2026",
      status: "Completed",
    },
    {
      id: 2,
      type: "debit",
      amount: 15,
      desc: "Premium Application Review",
      date: "Oct 22, 2026",
      status: "Completed",
    },
    {
      id: 3,
      type: "debit",
      amount: 5,
      desc: "SOP Generation",
      date: "Oct 20, 2026",
      status: "Completed",
    },
  ];
  return (
    <div className="space-y-8">
      {" "}
      <div className="flex justify-between items-center">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-white mb-2">
            Wallet & Credits
          </h1>{" "}
          <p className="text-slate-400">
            Manage your Admify credits and billing history.
          </p>{" "}
        </div>{" "}
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]">
          {" "}
          <Plus className="w-5 h-5" /> Add Credits{" "}
        </button>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        {/* Balance Card */}{" "}
        <div className="lg:col-span-1 bg-gradient-to-br from-primary-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
          {" "}
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />{" "}
          <div className="relative z-10 h-full flex flex-col justify-between">
            {" "}
            <div className="flex items-center gap-2 text-primary-100 mb-8">
              {" "}
              <CreditCard className="w-5 h-5" />{" "}
              <span className="font-medium tracking-wide uppercase text-sm">
                Available Credits
              </span>{" "}
            </div>{" "}
            <div>
              {" "}
              <h2 className="text-5xl font-black mb-2">
                124<span className="text-2xl text-primary-200">.00</span>
              </h2>{" "}
              <p className="text-primary-100 text-sm">≈ $124.00 USD</p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Quick Stats */}{" "}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {" "}
          <DashboardCard
            title="Total Spent"
            value="245 Credits"
            icon={ArrowUpRight}
            trend={{ value: 12, isPositive: false }}
          />{" "}
          <DashboardCard
            title="Total Added"
            value="369 Credits"
            icon={ArrowDownRight}
            trend={{ value: 8, isPositive: true }}
          />{" "}
        </div>{" "}
      </div>{" "}
      {/* Transaction History */}{" "}
      <div className="glass p-6 md:p-8 rounded-[2rem] border border-slate-700/50">
        {" "}
        <div className="flex items-center justify-between mb-8">
          {" "}
          <h2 className="text-xl font-bold text-white font-bold">
            Recent Transactions
          </h2>{" "}
          <button className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
            {" "}
            View All{" "}
          </button>{" "}
        </div>{" "}
        <div className="space-y-4">
          {" "}
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
            >
              {" "}
              <div className="flex items-center gap-4">
                {" "}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {" "}
                  {tx.type === "credit" ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="font-bold text-white font-bold">
                    {tx.desc}
                  </p>{" "}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {" "}
                    <Clock className="w-3 h-3" /> <span>{tx.date}</span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="text-right">
                {" "}
                <p
                  className={`font-bold ${tx.type === "credit" ? "text-green-400" : "text-slate-200"}`}
                >
                  {" "}
                  {tx.type === "credit" ? "+" : "-"}
                  {tx.amount}{" "}
                </p>{" "}
                <p className="text-xs text-slate-500">{tx.status}</p>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default WalletPage;
