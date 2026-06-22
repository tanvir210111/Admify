import React from "react";
import DashboardCard from "../../components/ui/DashboardCard";
import { Users, FileText, CheckCircle, TrendingUp } from "lucide-react";
function AgentDashboard() {
  return (
    <div className="space-y-8">
      {" "}
      <div>
        {" "}
        <h1 className="text-3xl font-bold text-white mb-2">
          Agency Overview
        </h1>{" "}
        <p className="text-slate-400">
          Track your students' progress and agency performance.
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {" "}
        <DashboardCard
          title="Total Students"
          value="142"
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />{" "}
        <DashboardCard
          title="Active Applications"
          value="89"
          icon={FileText}
          trend={{ value: 8, isPositive: true }}
        />{" "}
        <DashboardCard
          title="Successful Admits"
          value="45"
          icon={CheckCircle}
          trend={{ value: 24, isPositive: true }}
        />{" "}
        <DashboardCard
          title="Revenue (Credits)"
          value="12,450"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />{" "}
      </div>{" "}
      {/* Add more agent specific components here */}{" "}
    </div>
  );
}
export default AgentDashboard;
