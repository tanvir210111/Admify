import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Globe,
  Users,
  Trophy,
  ChevronLeft,
  Calendar,
} from "lucide-react";
function UniversityPage() {
  const { id } = useParams();
  return (
    <div className="space-y-6">
      {" "}
      <Link
        to="/recommendations"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4"
      >
        {" "}
        <ChevronLeft className="w-4 h-4" /> Back to Recommendations{" "}
      </Link>{" "}
      <div className="relative rounded-3xl overflow-hidden h-64 md:h-80">
        {" "}
        <div className="absolute inset-0 bg-gradient-to-t from-darkBlue via-darkBlue/50 to-transparent z-10" />{" "}
        <img
          src={`https://picsum.photos/seed/campus${id}/1200/400`}
          alt="University Cover"
          className="w-full h-full object-cover"
        />{" "}
        <div className="absolute bottom-8 left-8 z-20">
          {" "}
          <div className="flex items-center gap-4 mb-3">
            {" "}
            <div className="w-16 h-16 rounded-xl bg-slate-900 p-2 flex items-center justify-center">
              {" "}
              <span className="text-2xl font-bold text-white">SU</span>{" "}
            </div>{" "}
            <div>
              {" "}
              <h1 className="text-4xl font-bold text-white font-bold mb-1">
                Stanford University
              </h1>{" "}
              <p className="text-slate-300 flex items-center gap-2">
                {" "}
                <MapPin className="w-4 h-4" /> Stanford, California, USA{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        <div className="lg:col-span-2 space-y-8">
          {" "}
          <div className="glass p-8 rounded-2xl">
            {" "}
            <h2 className="text-2xl font-bold mb-4">About</h2>{" "}
            <p className="text-slate-300 leading-relaxed">
              {" "}
              Stanford University is a private research university in Stanford,
              California. The campus occupies 8,180 acres, among the largest in
              the United States, and enrolls over 17,000 students. Stanford is
              ranked among the best universities in the world by academic
              publications.{" "}
            </p>{" "}
          </div>{" "}
          <div className="glass p-8 rounded-2xl">
            {" "}
            <h2 className="text-2xl font-bold mb-6">Available Programs</h2>{" "}
            <div className="space-y-4">
              {" "}
              {[
                {
                  name: "M.S. in Computer Science",
                  deadline: "Dec 15, 2024",
                  duration: "2 Years",
                },
                {
                  name: "M.S. in Data Science",
                  deadline: "Jan 05, 2025",
                  duration: "1.5 Years",
                },
                { name: "MBA", deadline: "Sep 12, 2024", duration: "2 Years" },
              ].map((prog, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  {" "}
                  <div>
                    {" "}
                    <h3 className="font-bold text-slate-200">
                      {prog.name}
                    </h3>{" "}
                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-4">
                      {" "}
                      <span>
                        <Calendar className="w-3 h-3 inline mr-1" /> Deadline:{" "}
                        {prog.deadline}
                      </span>{" "}
                      <span>Duration: {prog.duration}</span>{" "}
                    </p>{" "}
                  </div>{" "}
                  <button className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                    {" "}
                    Apply Now{" "}
                  </button>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="space-y-6">
          {" "}
          <div className="glass p-6 rounded-2xl">
            {" "}
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>{" "}
            <div className="space-y-4">
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <Trophy className="w-5 h-5 text-primary-400" />{" "}
                <div>
                  {" "}
                  <p className="text-sm text-slate-400">Global Rank</p>{" "}
                  <p className="font-bold text-slate-200">#2 (QS 2024)</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center gap-3">
                {" "}
                <Users className="w-5 h-5 text-primary-400" />{" "}
                <div>
                  {" "}
                  <p className="text-sm text-slate-400">
                    International Students
                  </p>{" "}
                  <p className="font-bold text-slate-200">24%</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center gap-3">
                {" "}
                <Globe className="w-5 h-5 text-primary-400" />{" "}
                <div>
                  {" "}
                  <p className="text-sm text-slate-400">Acceptance Rate</p>{" "}
                  <p className="font-bold text-slate-200">4%</p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="glass p-6 rounded-2xl border-primary-500/30 bg-primary-900/10">
            {" "}
            <h3 className="text-lg font-bold mb-2">AI Match Analysis</h3>{" "}
            <div className="flex items-center gap-4 mb-4">
              {" "}
              <div className="text-4xl font-bold text-green-400">95%</div>{" "}
              <p className="text-sm text-slate-300">
                Excellent match for your academic profile.
              </p>{" "}
            </div>{" "}
            <ul className="space-y-2 text-sm text-slate-400">
              {" "}
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>{" "}
                GPA meets requirements
              </li>{" "}
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>{" "}
                Strong relevant coursework
              </li>{" "}
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>{" "}
                GRE score slightly below average
              </li>{" "}
            </ul>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default UniversityPage;
