import React from "react";
import { motion } from "framer-motion";
function DashboardCard({ title, value, icon: Icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-primary-500/50 transition-colors"
    >
      {" "}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
        {" "}
        <Icon className="w-16 h-16 text-primary-400" />{" "}
      </div>{" "}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {" "}
        <div className="flex items-center gap-4 mb-4">
          {" "}
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            {" "}
            <Icon className="w-6 h-6 text-primary-400" />{" "}
          </div>{" "}
          <h3 className="text-slate-400 font-medium">{title}</h3>{" "}
        </div>{" "}
        <div>
          {" "}
          <p className="text-3xl font-bold text-white mb-1">{value}</p>{" "}
          {trend && (
            <p
              className={`text-sm ${trend.isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {" "}
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last month{" "}
            </p>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </motion.div>
  );
}
export default DashboardCard;
