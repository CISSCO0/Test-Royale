"use client";

import { useEffect, useState } from "react";

export default function BackgroundEffects() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

   return (

    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: "orange",
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite, glow 2s ease-in-out infinite`,
              transformOrigin: `${50 + Math.random() * 50}% ${
                50 + Math.random() * 50
              }%`,
              boxShadow: "0 0 8px var(--glow-orange)",
            }}
          />
        ))}
      </div>
    </div>
  );
}