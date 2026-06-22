import React from "react";
import { Search, MapPin, Building2, Globe2 } from "lucide-react";
function UniversityPage() {
  const unis = [
    {
      name: "Stanford University",
      country: "USA",
      students: "16,000+",
      type: "Private",
      img: "https://picsum.photos/seed/stanford/600/400",
    },
    {
      name: "University of Oxford",
      country: "UK",
      students: "24,000+",
      type: "Public",
      img: "https://picsum.photos/seed/oxford/600/400",
    },
    {
      name: "ETH Zurich",
      country: "Switzerland",
      students: "22,000+",
      type: "Public",
      img: "https://picsum.photos/seed/zurich/600/400",
    },
    {
      name: "University of Toronto",
      country: "Canada",
      students: "90,000+",
      type: "Public",
      img: "https://picsum.photos/seed/toronto/600/400",
    },
  ];
  return (
    <div className="space-y-8">
      {" "}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-white mb-2">
            Universities
          </h1>{" "}
          <p className="text-slate-400">
            Browse and discover global partner institutions.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Search Bar */}{" "}
      <div className="relative">
        {" "}
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />{" "}
        <input
          type="text"
          placeholder="Search by university name, country, or course..."
          className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
        />{" "}
      </div>{" "}
      {/* Grid */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {" "}
        {unis.map((uni, i) => (
          <div
            key={i}
            className="glass rounded-2xl overflow-hidden group hover:border-primary-500/50 transition-colors border border-slate-700/50"
          >
            {" "}
            <div className="h-40 relative overflow-hidden">
              {" "}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />{" "}
              <img
                src={uni.img}
                alt={uni.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />{" "}
            </div>{" "}
            <div className="p-5">
              {" "}
              <h3 className="text-lg font-bold text-white font-bold mb-2">
                {uni.name}
              </h3>{" "}
              <div className="space-y-2 mb-4">
                {" "}
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  {" "}
                  <MapPin className="w-4 h-4 text-primary-400" />{" "}
                  {uni.country}{" "}
                </div>{" "}
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  {" "}
                  <Building2 className="w-4 h-4 text-blue-400" />{" "}
                  {uni.type}{" "}
                </div>{" "}
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  {" "}
                  <Globe2 className="w-4 h-4 text-green-400" /> {uni.students}{" "}
                  Students{" "}
                </div>{" "}
              </div>{" "}
              <button className="w-full py-2 bg-slate-800/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-600 text-sm">
                {" "}
                View Profile{" "}
              </button>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
export default UniversityPage;
