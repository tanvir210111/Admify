import React from "react";
import { motion } from "framer-motion";

/**
 * GlobalEducationBackground
 * A subtle, elegant global education network background.
 * Renders an ultra-subtle geographic world map with glowing city nodes
 * (Dhaka origin, London, Toronto, Tokyo, Berlin, Sydney, New York),
 * delicate curved flight routes with animated light pulses, and gentle cyan/blue ambient light.
 */
export default function GlobalEducationBackground() {
  // SVG coordinate system: 1200 x 600 equirectangular map projection
  // Node coordinates:
  const dhaka = { x: 800, y: 310, label: "Dhaka", isOrigin: true };
  const london = { x: 570, y: 200, label: "London" };
  const toronto = { x: 310, y: 220, label: "Toronto" };
  const newYork = { x: 330, y: 240, label: "New York" };
  const berlin = { x: 610, y: 195, label: "Berlin" };
  const tokyo = { x: 970, y: 260, label: "Tokyo" };
  const sydney = { x: 1020, y: 480, label: "Sydney" };

  const routes = [
    { from: dhaka, to: london, curve: "M 800 310 Q 690 170 570 200" },
    { from: dhaka, to: toronto, curve: "M 800 310 Q 540 120 310 220" },
    { from: dhaka, to: berlin, curve: "M 800 310 Q 710 180 610 195" },
    { from: dhaka, to: tokyo, curve: "M 800 310 Q 890 240 970 260" },
    { from: dhaka, to: sydney, curve: "M 800 310 Q 920 390 1020 480" },
  ];

  const nodes = [dhaka, london, toronto, newYork, berlin, tokyo, sydney];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. Deep Space Ambient Blooms */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-cyan-900/15 rounded-full blur-[140px]" />
      <div className="absolute top-[35%] right-[-10%] w-[40%] h-[50%] bg-blue-900/15 rounded-full blur-[160px]" />
      <div className="absolute bottom-[10%] left-[15%] w-[40%] h-[40%] bg-purple-900/12 rounded-full blur-[150px]" />

      {/* 2. Global Geographic Map & Flight Network (Subtle SVG) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] mix-blend-screen select-none">
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full object-cover max-w-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Soft Glow Filter */}
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Route Gradient */}
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Realistic Equirectangular Satellite Landmass Overlay */}
          <image
            href="/realistic_satellite_world_map.jpg"
            x="0"
            y="0"
            width="1200"
            height="600"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.55"
          />

          {/* Delicate Flight Routes */}
          {routes.map((route, i) => (
            <g key={i}>
              {/* Underlying Subtle Trajectory */}
              <path
                d={route.curve}
                fill="none"
                stroke="url(#route-gradient)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                opacity="0.65"
              />

              {/* Animated Light Pulse traveling along the route */}
              <motion.circle
                r="3"
                fill="#22D3EE"
                filter="url(#node-glow)"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 1.5,
                }}
                style={{
                  offsetPath: `path("${route.curve}")`,
                }}
              />
            </g>
          ))}

          {/* City Nodes */}
          {nodes.map((node, i) => (
            <g key={i} transform={`translate(${node.x}, ${node.y})`}>
              {/* Outer Pulse Ring */}
              <circle
                r={node.isOrigin ? "8" : "5"}
                fill={node.isOrigin ? "#22D3EE" : "#60A5FA"}
                opacity="0.3"
                className="animate-ping"
              />
              {/* Inner Core */}
              <circle
                r={node.isOrigin ? "4" : "2.5"}
                fill={node.isOrigin ? "#22D3EE" : "#FFFFFF"}
                filter="url(#node-glow)"
              />
              {/* City Label */}
              <text
                x="8"
                y="3"
                fill={node.isOrigin ? "#22D3EE" : "#94A3B8"}
                fontSize={node.isOrigin ? "10" : "8"}
                fontWeight={node.isOrigin ? "700" : "500"}
                letterSpacing="1px"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                opacity="0.85"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 3. Subtle Dot Matrix Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />
    </div>
  );
}
