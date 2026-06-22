import React from "react";
import DashboardCard from "../components/ui/DashboardCard";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
function WalletPage() {
  return (
    <div className="space-y-8">
      {" "}
      <div>
        {" "}
        <h1 className="text-3xl font-bold text-white mb-2">
          Wallet & Credits
        </h1>{" "}
        <p className="text-slate-400">
          Manage your credits for applications and premium services.
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {" "}
        <div className="glass p-8 rounded-2xl bg-gradient-to-br from-primary-900/40 to-blue-900/40 border-primary-500/30 relative overflow-hidden">
          {" "}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            {" "}
            <Wallet className="w-32 h-32 text-primary-400" />{" "}
          </div>{" "}
          <div className="relative z-10">
            {" "}
            <p className="text-slate-300 font-medium mb-2">
              Available Balance
            </p>{" "}
            <h2 className="text-5xl font-bold text-white font-bold mb-6">
              2,450 <span className="text-xl text-primary-400">CR</span>
            </h2>{" "}
            <div className="flex gap-4">
              {" "}
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                {" "}
                Buy Credits{" "}
              </button>{" "}
              <button className="px-6 py-3 glass hover:bg-slate-800/50 text-slate-200 rounded-xl font-medium transition-all">
                {" "}
                Redeem Code{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="glass p-8 rounded-2xl">
          {" "}
          <h3 className="text-xl font-bold mb-6">Quick Top-up</h3>{" "}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {" "}
            <button className="p-4 border border-slate-700/50 hover:border-primary-500 rounded-xl text-center transition-colors">
              {" "}
              <p className="text-2xl font-bold text-slate-200">
                500 <span className="text-sm text-primary-400">CR</span>
              </p>{" "}
              <p className="text-slate-500 text-sm mt-1">$49.99</p>{" "}
            </button>{" "}
            <button className="p-4 border border-primary-500 bg-primary-500/10 rounded-xl text-center transition-colors relative overflow-hidden">
              {" "}
              <div className="absolute top-0 right-0 bg-primary-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                POPULAR
              </div>{" "}
              <p className="text-2xl font-bold text-slate-200">
                1000 <span className="text-sm text-primary-400">CR</span>
              </p>{" "}
              <p className="text-slate-500 text-sm mt-1">$89.99</p>{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="glass p-6 rounded-2xl">
        {" "}
        <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>{" "}
        <div className="space-y-4">
          {" "}
          {[
            {
              title: "Application Fee - MIT",
              type: "deduction",
              amount: 50,
              date: "Today, 2:30 PM",
            },
            {
              title: "Credits Purchased",
              type: "addition",
              amount: 1000,
              date: "Yesterday, 10:00 AM",
            },
            {
              title: "Profile Review Premium",
              type: "deduction",
              amount: 20,
              date: "Oct 24, 2023",
            },
          ].map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
            >
              {" "}
              <div className="flex items-center gap-4">
                {" "}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "addition" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                >
                  {" "}
                  {tx.type === "addition" ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-slate-200 font-medium">{tx.title}</p>{" "}
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    {" "}
                    <Clock className="w-3 h-3" /> {tx.date}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <p
                className={`font-bold ${tx.type === "addition" ? "text-green-400" : "text-slate-300"}`}
              >
                {" "}
                {tx.type === "addition" ? "+" : "-"}
                {tx.amount} CR{" "}
              </p>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default WalletPage;
