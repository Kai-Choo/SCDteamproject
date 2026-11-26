import React from 'react';

interface AmbientStageEffectsProps {
  theme: 'lab' | 'village' | 'workshop' | 'altar' | 'portal';
}

export const AmbientStageEffects: React.FC<AmbientStageEffectsProps> = ({ theme }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
      {/* 1. Volumetric Light Ray Beams / Dispersion */}
      {theme === 'lab' && (
        <>
          {/* Subtle warm examination desk light ray */}
          <div 
            className="absolute -top-20 left-1/4 w-72 sm:w-96 h-[600px] bg-gradient-to-b from-amber-200/20 via-amber-300/5 to-transparent animate-light-beam blur-2xl transform origin-top-left"
          />
          {/* Subtle cool blue artifact resonance glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"
          />
        </>
      )}

      {theme === 'village' && (
        <>
          {/* Natural morning dawn light filter */}
          <div 
            className="absolute -top-10 -left-10 w-full h-96 bg-gradient-to-br from-amber-100/15 via-emerald-950/10 to-transparent blur-3xl animate-light-beam"
          />
          {/* Low mountain mist drifting across village */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-stone-900/70 via-stone-800/20 to-transparent animate-fog-drift blur-xl"
          />
          <div 
            className="absolute bottom-10 -left-20 -right-20 h-40 bg-gradient-to-t from-amber-950/20 via-stone-900/30 to-transparent animate-fog-drift-reverse blur-2xl"
          />
        </>
      )}

      {theme === 'workshop' && (
        <>
          {/* Warm hearth fire glow & ambient flicker */}
          <div 
            className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-gradient-to-t from-orange-600/25 via-amber-700/15 to-transparent blur-3xl animate-hearth-flicker"
          />
          {/* Hearth smoke haze layer */}
          <div 
            className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-stone-900/60 via-stone-950/20 to-transparent animate-fog-drift blur-2xl"
          />
        </>
      )}

      {theme === 'altar' && (
        <>
          {/* Mystic celestial starlight rays shining down onto the altar */}
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-[650px] bg-gradient-to-b from-amber-200/25 via-teal-300/10 to-transparent animate-light-beam blur-2xl transform origin-top"
          />
          {/* Circular altar sacred aura */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-amber-500/15 blur-3xl animate-pulse"
          />
          {/* Ground level twilight mist */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-stone-950/80 via-stone-900/30 to-transparent animate-fog-drift blur-xl"
          />
        </>
      )}

      {theme === 'portal' && (
        <>
          {/* High energy dimensional distortion vortex */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-r from-amber-400/20 via-purple-600/20 to-cyan-400/20 blur-3xl animate-spin duration-1000"
          />
          <div 
            className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-stone-950/60 animate-pulse"
          />
        </>
      )}

      {/* 2. Floating Atmospheric Dust Motes & Embers */}
      <div className="absolute inset-0">
        {/* Mote 1 */}
        <div 
          className="absolute left-[18%] bottom-[25%] w-2 h-2 rounded-full bg-amber-400/50 blur-[0.5px] animate-mote-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
        />
        {/* Mote 2 */}
        <div 
          className="absolute left-[32%] bottom-[15%] w-1.5 h-1.5 rounded-full bg-amber-300/60 blur-[0.5px] animate-mote-2 shadow-[0_0_6px_rgba(252,211,77,0.7)]"
        />
        {/* Mote 3 */}
        <div 
          className="absolute left-[54%] bottom-[20%] w-2.5 h-2.5 rounded-full bg-yellow-400/40 blur-[1px] animate-mote-3 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
        />
        {/* Mote 4 */}
        <div 
          className="absolute left-[68%] bottom-[30%] w-1.5 h-1.5 rounded-full bg-amber-400/50 blur-[0.5px] animate-mote-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
        />
        {/* Mote 5 */}
        <div 
          className="absolute left-[82%] bottom-[18%] w-2 h-2 rounded-full bg-amber-200/40 blur-[0.5px] animate-mote-2 shadow-[0_0_6px_rgba(253,230,138,0.6)]"
        />
        {/* Mote 6 (Small extra particle) */}
        <div 
          className="absolute left-[44%] bottom-[35%] w-1 h-1 rounded-full bg-white/60 blur-[0.5px] animate-mote-3"
        />
      </div>
    </div>
  );
};
