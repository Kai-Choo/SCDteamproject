import React, { useState, useEffect } from 'react';
import { ArrowHit, BowConfig, GameMode, ArcheryTheme } from './types';
import { DEFAULT_BOW_CONFIG } from './utils/bowPresets';
import { GameHeader } from './components/GameHeader';
import { BowWorkshop } from './components/BowWorkshop';
import { ArcheryCanvas } from './components/ArcheryCanvas';
import { ScoreCard } from './components/ScoreCard';

export default function App() {
  // Load saved bow from localStorage or fallback to default
  const [currentBow, setCurrentBow] = useState<BowConfig>(() => {
    try {
      const saved = localStorage.getItem('archery_custom_bow');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_BOW_CONFIG;
  });

  // Save bow changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('archery_custom_bow', JSON.stringify(currentBow));
    } catch {
      // ignore
    }
  }, [currentBow]);

  // Active View: 'workshop' (Customizer) or 'archery' (Shooting Game)
  const [activeView, setActiveView] = useState<'workshop' | 'archery'>('archery');

  // Game Settings: default to traditional theme as requested
  const [gameMode, setGameMode] = useState<GameMode>('olympic');
  const [rangeTheme, setRangeTheme] = useState<ArcheryTheme>('traditional');
  const [distance, setDistance] = useState<number>(70); // 70m standard
  const [arrowHistory, setArrowHistory] = useState<ArrowHit[]>([]);

  const handleShotFired = (hit: ArrowHit) => {
    setArrowHistory(prev => [...prev, hit]);
  };

  const handleResetRound = () => {
    setArrowHistory([]);
  };

  return (
    <div className="min-h-screen wii-bg text-slate-800 flex flex-col selection:bg-sky-400 selection:text-white">
      {/* Global Navigation Header */}
      <GameHeader
        activeView={activeView}
        onSelectView={setActiveView}
        theme={rangeTheme}
        onToggleTheme={setRangeTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {activeView === 'workshop' ? (
          <BowWorkshop
            currentBow={currentBow}
            onUpdateBow={setCurrentBow}
            onStartArchery={() => setActiveView('archery')}
          />
        ) : (
          <div className="space-y-6">
            {/* Archery Field Viewport */}
            <ArcheryCanvas
              bow={currentBow}
              mode={gameMode}
              distance={distance}
              onShotFired={handleShotFired}
              arrowHistory={arrowHistory}
              onResetRound={handleResetRound}
              theme={rangeTheme}
              onToggleTheme={setRangeTheme}
            />

            {/* Scorecard, Modes & Distance Controller */}
            <ScoreCard
              arrowHistory={arrowHistory}
              currentMode={gameMode}
              onSelectMode={setGameMode}
              currentDistance={distance}
              onSelectDistance={setDistance}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-sky-200/70 bg-white/75 backdrop-blur-sm py-4 text-center text-xs text-slate-500 font-medium">
        <p>조선 전통 국궁 & 부천활박물관 유물 전시 • 마상궁술(기사) 및 올림픽 양궁 시뮬레이션</p>
      </footer>
    </div>
  );
}
