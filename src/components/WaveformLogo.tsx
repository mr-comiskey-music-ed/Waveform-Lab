import React from 'react';

export function WaveformLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-[#111318] border border-[#00ff9d]/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,255,157,0.2)] ${className}`}>
      {/* Background subtle grid/glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ff9d]/10 via-transparent to-purple-500/10 pointer-events-none" />
      
      {/* SVG Container representing multiple waveforms discussed in Waveform Lab */}
      <svg
        viewBox="0 0 64 64"
        className="w-8 h-8 relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sine Wave (Cyan) */}
        <path
          d="M 4 32 Q 12 16, 20 32 T 36 32 T 52 32 T 60 32"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-80"
        />
        
        {/* Square Wave (Yellow/Amber) */}
        <path
          d="M 4 20 L 16 20 L 16 44 L 28 44 L 28 20 L 40 20 L 40 44 L 52 44 L 52 20 L 60 20"
          stroke="#fbbf24"
          strokeWidth="1.75"
          strokeLinejoin="round"
          className="opacity-85"
        />

        {/* Sawtooth Wave (Purple/Pink) */}
        <path
          d="M 4 48 L 18 16 L 18 48 L 32 16 L 32 48 L 46 16 L 46 48 L 60 16"
          stroke="#c084fc"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="opacity-75"
        />

        {/* Triangle Wave (Neon Green - Primary Theme) */}
        <path
          d="M 4 32 L 12 16 L 20 48 L 28 16 L 36 48 L 44 16 L 52 48 L 60 32"
          stroke="#00ff9d"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_6px_rgba(0,255,157,0.8)]"
        />
      </svg>
    </div>
  );
}
