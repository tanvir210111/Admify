import React from "react";
import { Sparkles, MapPin, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
function RecommendationPage() {
  return (
    <div className="space-y-8">
      {" "}
      <div className="flex justify-between items-end">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            {" "}
            <Sparkles className="w-8 h-8 text-primary-400" /> AI
            Recommendations{" "}
          </h1>{" "}
          <p className="text-slate-400">
            Personalized university matches based on your profile and
            preferences.
          </p>{" "}
        </div>{" "}
        <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/50">
          {" "}
          Update Profile Data{" "}
        </button>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {" "}
        {[
          {
            name: "Stanford University",
            loc: "California, USA",
            match: 95,
            color: "text-green-400",
          },
          {
            name: "MIT",
            loc: "Massachusetts, USA",
            match: 92,
            color: "text-green-400",
          },
          {
            name: "University of Oxford",
            loc: "Oxford, UK",
            match: 88,
            color: "text-yellow-400",
          },
          {
            name: "ETH Zurich",
            loc: "Zurich, Switzerland",
            match: 85,
            color: "text-yellow-400",
          },
          {
            name: "University of Toronto",
            loc: "Ontario, Canada",
            match: 79,
            color: "text-orange-400",
          },
        ].map((uni, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="glass rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all group cursor-pointer"
          >
            {" "}
            <div className="h-32 bg-slate-800/50 relative overflow-hidden">
              {" "}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />{" "}
              <img
                src={`https://picsum.photos/seed/uni${i}/400/200`}
                alt={uni.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />{" "}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                {" "}
                <div
                  className={`px-2 py-1 rounded bg-slate-900 backdrop-blur text-xs font-bold ${uni.color}`}
                >
                  {" "}
                  {uni.match}% Match{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="p-5">
              {" "}
              <h3 className="text-lg font-bold text-slate-200 mb-1">
                {uni.name}
              </h3>{" "}
              <p className="text-sm text-slate-400 flex items-center gap-1 mb-4">
                {" "}
                <MapPin className="w-3 h-3" /> {uni.loc}{" "}
              </p>{" "}
              <div className="flex gap-2 mb-4">
                {" "}
                <span className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded border border-slate-700/50">
                  Computer Science
                </span>{" "}
                <span className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded border border-slate-700/50">
                  Fall 2024
                </span>{" "}
              </div>{" "}
              <Link to={`/university/${i}`} className="block">
                {" "}
                <button className="w-full py-2 bg-primary-600/10 hover:bg-primary-600/20 text-primary-400 rounded-lg flex justify-center items-center gap-2 transition-colors border border-primary-500/20">
                  {" "}
                  View Details <ArrowRight className="w-4 h-4" />{" "}
                </button>{" "}
              </Link>{" "}
            </div>{" "}
          </motion.div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
export default RecommendationPage;
