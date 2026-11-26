import React, { useState } from 'react';
import { sound } from '../services/soundService';
import { InventoryItem } from '../types/game';
import { HotspotMarker } from './HotspotMarker';
import { AmbientStageEffects } from './AmbientStageEffects';
import { Sparkles, Compass, Landmark, Zap, X } from 'lucide-react';

interface FinalStageReturnProps {
  onStageComplete: () => void;
  inventory: InventoryItem[];
  selectedItemId?: string | null;
  onSelectItem?: (item: InventoryItem) => void;
  showHotspotGlow?: boolean;
}

export const FinalStageReturn: React.FC<FinalStageReturnProps> = ({
  onStageComplete,
  showHotspotGlow = false
}) => {
  const [crystalAligned, setCrystalAligned] = useState<Record<string, boolean>>({
    space: true,
    artifact: true,
    time: true,
  });

  const [inputPasscode, setInputPasscode] = useState('2026');
  const [isActivating, setIsActivating] = useState(false);
  const [activeModal, setActiveModal] = useState<boolean>(false);

  const toggleCrystal = (key: 'space' | 'artifact' | 'time') => {
    sound.playClick();
    const updated = {
      ...crystalAligned,
      [key]: !crystalAligned[key]
    };
    setCrystalAligned(updated);
  };

  const handleFinalWarp = () => {
    sound.playSuccess();
    sound.playTimeWarp();
    setIsActivating(true);
    setActiveModal(false);

    setTimeout(() => {
      onStageComplete();
    }, 2400);
  };

  return (
    <div className={`relative w-full h-full min-h-[500px] flex-1 bg-black flex flex-col justify-between select-none overflow-hidden ${isActivating ? 'animate-time-warp brightness-200' : ''}`}>
      {/* Background Room View: Dimensional Vortex at the Altar */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url('/assets/escape-room/prehistoric_ritual_altar_1790923421228.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      <AmbientStageEffects theme="portal" />

      {/* Pure Point-and-Click Natural Hotspots (NO yellow boxes / NO permanent text) */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {/* 1. Space Location Crystal (Left) */}
        <HotspotMarker
          x={30}
          y={55}
          width={22}
          height={22}
          title="공간 좌표 크리스털 (고강동 고천산 86m)"
          showGlow={showHotspotGlow}
          onClick={() => toggleCrystal('space')}
        />

        {/* 2. Central Portal Vortex Core (Center) */}
        <HotspotMarker
          x={50}
          y={48}
          width={26}
          height={26}
          title="시공간 포털 제어기 (2026 귀환)"
          showGlow={showHotspotGlow}
          onClick={() => {
            sound.playClick();
            setActiveModal(true);
          }}
        />

        {/* 3. Relic Resonance Crystal (Right) */}
        <HotspotMarker
          x={70}
          y={55}
          width={22}
          height={22}
          title="유물 주파수 공명 크리스털"
          showGlow={showHotspotGlow}
          onClick={() => toggleCrystal('artifact')}
        />
      </div>

      {/* Portal Activation Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#161a24] border-2 border-stone-700 rounded-3xl p-6 text-stone-100 shadow-2xl relative text-center">
            <button
              onClick={() => setActiveModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-white bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              2026년 현대로의 시공간 귀환
            </span>
            <h3 className="text-base font-bold text-white mt-1 mb-2">
              체험관 제1연구실 귀환 연도: [2026]
            </h3>

            <div className="p-3 bg-black border-2 border-cyan-400 rounded-2xl text-2xl font-mono text-cyan-300 mb-3 tracking-widest shadow-inner">
              {inputPasscode}
            </div>

            <p className="text-xs text-stone-300 mb-4 font-serif">
              복원된 환유경 유물과 공간 좌표가 동기화되었습니다. 버튼을 누르면 2026년으로 귀환합니다.
            </p>

            <button
              onClick={handleFinalWarp}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl"
            >
              <Zap className="w-5 h-5" />
              <span>현대(2026) 연구실로 도약!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
