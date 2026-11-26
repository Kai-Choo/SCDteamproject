import React, { useState, useEffect, useRef } from 'react';
import { ArrowHit, BowConfig, GameMode, ArcheryTheme } from './types';
import { DEFAULT_BOW_CONFIG } from './utils/bowPresets';
import { GameHeader } from './components/GameHeader';
import { BowWorkshop } from './components/BowWorkshop';
import { ArcheryCanvas } from './components/ArcheryCanvas';
import { ScoreCard } from './components/ScoreCard';

interface RoundSummary {
  mode: GameMode;
  distance: number;
  arrows: ArrowHit[];
}

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
  const [selectedMode, setSelectedMode] = useState<GameMode>('olympic');
  const [selectedDistance, setSelectedDistance] = useState<number>(70);
  const [arrowHistory, setArrowHistory] = useState<ArrowHit[]>([]);
  const [roundStatus, setRoundStatus] = useState<'idle' | 'playing' | 'ending'>('idle');
  const [isArrowInFlight, setIsArrowInFlight] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [roundDialog, setRoundDialog] = useState<'setup' | 'results' | null>('setup');
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);
  const roundDeadlineRef = useRef<number | null>(null);

  const isRoundActive = roundStatus === 'playing';

  const handleShotFired = (hit: ArrowHit) => {
    setArrowHistory(prev => [...prev, hit]);
    setIsArrowInFlight(false);
    if (gameMode === 'olympic' && arrowHistory.length + 1 >= 9) {
      setRoundStatus('ending');
    }
  };

  const handleShotStarted = () => {
    setIsArrowInFlight(true);
  };

  const startRound = () => {
    setGameMode(selectedMode);
    setDistance(selectedDistance);
    setArrowHistory([]);
    setIsArrowInFlight(false);
    setRoundSummary(null);
    setRemainingSeconds(30);
    roundDeadlineRef.current = selectedMode === 'olympic' ? null : Date.now() + 30_000;
    setRoundStatus('playing');
    setRoundDialog(null);
  };

  const handleResetRound = () => {
    setArrowHistory([]);
    setIsArrowInFlight(false);
    setRoundSummary(null);
    setRemainingSeconds(30);
    roundDeadlineRef.current = gameMode === 'olympic' ? null : Date.now() + 30_000;
    setRoundStatus('playing');
    setRoundDialog(null);
  };

  const handleOpenModeSelection = () => {
    setSelectedMode(gameMode);
    setSelectedDistance(distance);
    setIsArrowInFlight(false);
    setRoundSummary(null);
    roundDeadlineRef.current = null;
    setRoundStatus('idle');
    setRoundDialog('setup');
  };

  useEffect(() => {
    if (roundStatus !== 'playing' || gameMode === 'olympic') return;

    const timer = window.setInterval(() => {
      const deadline = roundDeadlineRef.current;
      if (deadline === null) return;

      const millisecondsLeft = deadline - Date.now();
      if (millisecondsLeft <= 0) {
        window.clearInterval(timer);
        setRemainingSeconds(0);
        setRoundStatus('ending');
        return;
      }

      const secondsLeft = Math.ceil(millisecondsLeft / 1000);
      setRemainingSeconds(previous => previous === secondsLeft ? previous : secondsLeft);
    }, 100);

    return () => window.clearInterval(timer);
  }, [gameMode, roundStatus]);

  useEffect(() => {
    if (roundStatus !== 'ending' || isArrowInFlight) return;

    setRoundSummary({
      mode: gameMode,
      distance,
      arrows: arrowHistory,
    });
    setRoundStatus('idle');
    setRoundDialog('results');
    roundDeadlineRef.current = null;
  }, [arrowHistory, distance, gameMode, isArrowInFlight, roundStatus]);

  const handleSelectView = (view: 'workshop' | 'archery') => {
    if (view === 'workshop' && isArrowInFlight) {
      setIsArrowInFlight(false);
    }
    setActiveView(view);
  };

  const summaryModeLabel = roundSummary?.mode === 'horseback'
    ? '마상궁술'
    : roundSummary?.mode === 'moving_target'
      ? '이동 과녁'
      : '올림픽 공식 룰';

  return (
    <div className="min-h-screen wii-bg text-slate-800 flex flex-col selection:bg-sky-400 selection:text-white">
      {/* Global Navigation Header */}
      <GameHeader
        activeView={activeView}
        onSelectView={handleSelectView}
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
              onShotStarted={handleShotStarted}
              arrowHistory={arrowHistory}
              onResetRound={handleResetRound}
              onOpenModeSelection={handleOpenModeSelection}
              isRoundActive={isRoundActive}
              remainingSeconds={remainingSeconds}
              theme={rangeTheme}
              onToggleTheme={setRangeTheme}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-sky-200/70 bg-white/75 backdrop-blur-sm py-4 text-center text-xs text-slate-500 font-medium">
        <p>조선 전통 국궁 & 부천활박물관 유물 전시 • 마상궁술(기사) 및 올림픽 양궁 시뮬레이션</p>
      </footer>

      {activeView === 'archery' && roundDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6 backdrop-blur-sm"
          role="presentation"
        >
          <section
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="round-dialog-title"
          >
            <div className="mb-5 text-center">
              <h2 id="round-dialog-title" className="text-xl font-black text-slate-900 sm:text-2xl">
                {roundDialog === 'results' ? `${summaryModeLabel} 경기 결과` : '게임 모드 선택'}
              </h2>
              {roundSummary && roundDialog === 'results' && (
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {roundSummary.mode === 'olympic'
                    ? `${roundSummary.arrows.length}발 사격 완료`
                    : `30초 플레이 완료 · ${roundSummary.arrows.length}발 사격`}
                  {' · '}총점 {roundSummary.arrows.reduce((total, arrow) => total + arrow.score, 0)}점
                </p>
              )}
              {roundDialog === 'setup' && (
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {arrowHistory.length > 0
                    ? '현재 라운드는 종료됩니다. 새 게임을 시작하면 기록이 초기화됩니다.'
                    : '모드를 선택한 뒤 게임을 시작하세요.'}
                </p>
              )}
            </div>

            <ScoreCard
              arrowHistory={roundDialog === 'results' && roundSummary ? roundSummary.arrows : arrowHistory}
              currentMode={selectedMode}
              onSelectMode={setSelectedMode}
              currentDistance={selectedDistance}
              onSelectDistance={setSelectedDistance}
            />

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={startRound}
                className="rounded-2xl bg-sky-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-sky-700 active:scale-95"
              >
                {roundDialog === 'results' ? '선택한 모드로 다음 라운드 시작' : '게임 시작'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
