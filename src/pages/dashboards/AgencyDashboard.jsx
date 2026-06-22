import React from "react";
import DashboardCard from "../../components/ui/DashboardCard";
import { Building, Users, Briefcase, TrendingUp } from "lucide-react";
function AgencyDashboard() {
  return (
    <div className="space-y-8">
      {" "}
      <div>
        {" "}
        <h1 className="text-3xl font-bold text-white mb-2">
          Agency Overview
        </h1>{" "}
        <p className="text-slate-400">
          Manage all your agents and overall organizational performance.
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {" "}
        <DashboardCard
          title="Total Agents"
          value="24"
          icon={Briefcase}
          trend={{ value: 5, isPositive: true }}
        />{" "}
        <DashboardCard
          title="Total Students"
          value="842"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />{" "}
        <DashboardCard
          title="Partner Universities"
          value="156"
          icon={Building}
          trend={{ value: 2, isPositive: true }}
        />{" "}
        <DashboardCard
          title="Total Revenue"
          value="$45,200"
          icon={TrendingUp}
          trend={{ value: 18, isPositive: true }}
        />{" "}
      </div>{" "}
      <div className="glass p-6 rounded-2xl">
        {" "}
        <h2 className="text-xl font-bold mb-4">Top Performing Agents</h2>{" "}
        <div className="space-y-4">
          {" "}
          {[
            { name: "Sarah Jenkins", students: 145, successRate: "92%" },
            { name: "Michael Chen", students: 128, successRate: "88%" },
            { name: "David Smith", students: 95, successRate: "95%" },
          ].map((agent, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0"
            >
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                  {" "}
                  {agent.name.charAt(0)}{" "}
                </div>{" "}
                <span className="text-slate-200 font-medium">
                  {agent.name}
                </span>{" "}
              </div>{" "}
              <div className="flex gap-8 text-sm">
                {" "}
                <span className="text-slate-400">
                  <span className="text-slate-200">{agent.students}</span>{" "}
                  Students
                </span>{" "}
                <span className="text-slate-400">
                  <span className="text-green-400">{agent.successRate}</span>{" "}
                  Success Rate
                </span>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default AgencyDashboard;
