import React from 'react';
import { ArcheryTheme } from '../types';
import { archeryAudio } from '../utils/audio';
import { Home, Target, Sliders, Volume2, VolumeX } from 'lucide-react';

interface GameHeaderProps {
  activeView: 'workshop' | 'archery';
  onSelectView: (view: 'workshop' | 'archery') => void;
  theme?: ArcheryTheme;
  onToggleTheme?: (theme: ArcheryTheme) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  activeView,
  onSelectView,
  theme = 'traditional',
  onToggleTheme,
}) => {
  const [isMuted, setIsMuted] = React.useState<boolean>(archeryAudio.getMuted());

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    archeryAudio.setMuted(next);
  };

  const returnHome = () => {
    archeryAudio.playClickSound();
    const returnTo = new URLSearchParams(window.location.search).get('returnTo');
    const portalBase = import.meta.env.VITE_PORTAL_BASE || '/';
    let destination = new URL(portalBase, window.location.origin);

    if (returnTo) {
      try {
        const requestedDestination = new URL(returnTo);
        if (
          requestedDestination.protocol === window.location.protocol &&
          requestedDestination.hostname === window.location.hostname
        ) {
          destination = requestedDestination;
        }
      } catch {
        destination = new URL(portalBase, window.location.origin);
      }
    }

    window.location.assign(destination.toString());
  };

  return (
    <header className="w-full bg-white/92 border-b-2 border-sky-200/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_20px_rgba(14,75,140,0.06)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={returnHome}
            className="p-2 rounded-xl bg-orange-400 border-2 border-orange-500 hover:bg-orange-500 hover:border-orange-600 text-white cursor-pointer transition-all shadow-sm active:scale-95 shrink-0"
            aria-label="홈으로 돌아가기"
            title="홈으로 돌아가기"
          >
            <Home className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-2xl wii-gloss-blue flex items-center justify-center text-white border border-sky-300 shrink-0">
            <Target className="w-5 h-5 stroke-[2.5] text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                나만의 활로 명중! 활쏘기
              </h1>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Sound Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Switcher */}
          {onToggleTheme && (
            <button
              id="toggle-range-theme-btn"
              type="button"
              onClick={() => {
                archeryAudio.playClickSound();
                onToggleTheme(theme === 'traditional' ? 'olympic' : 'traditional');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border-2 border-slate-200 hover:border-sky-400 text-slate-700 hover:text-sky-600 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
              title="배경 풍경 테마 전환 (조선 활터 / 올림픽)"
            >
              {theme === 'traditional' ? (
                <>
                  <span>🏛️</span>
                  <span className="hidden sm:inline">조선 활터 (풍락헌)</span>
                </>
              ) : (
                <>
                  <span>🏟️</span>
                  <span className="hidden sm:inline">올림픽 경기장</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/90">
            <button
              id="nav-workshop-btn"
              type="button"
              onClick={() => {
                archeryAudio.playClickSound();
                onSelectView('workshop');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                activeView === 'workshop'
                  ? 'wii-gloss-blue text-white border border-sky-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>활 공방</span>
            </button>

            <button
              id="nav-archery-btn"
              type="button"
              onClick={() => {
                archeryAudio.playClickSound();
                onSelectView('archery');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                activeView === 'archery'
                  ? 'wii-gloss-blue text-white border border-sky-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>활터 사격</span>
            </button>
          </div>

          <button
            id="global-audio-btn"
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-2xl bg-white border-2 border-slate-200 hover:border-sky-400 text-slate-600 hover:text-sky-600 cursor-pointer transition-all shadow-sm active:scale-95"
            title={isMuted ? '음소거 해제' : '사운드 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-sky-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
