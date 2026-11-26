import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, RotateCcw, Clock, Eye, EyeOff, Cloud } from 'lucide-react';
import { sound } from '../services/soundService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBgmMuted: boolean;
  isSfxMuted: boolean;
  showHotspotGlow: boolean;
  onToggleBgm: () => void;
  onToggleSfx: () => void;
  onToggleHotspotGlow: () => void;
  onResetGame: () => void;
  onOpenDrive?: () => void;
  playTimeSeconds: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isBgmMuted,
  isSfxMuted,
  showHotspotGlow,
  onToggleBgm,
  onToggleSfx,
  onToggleHotspotGlow,
  onResetGame,
  onOpenDrive,
  playTimeSeconds
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}분 ${s < 10 ? '0' : ''}${s}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-bold text-amber-100">게임 환경 설정</h2>
              <p className="text-xs text-stone-400">탐색 가이드 및 사운드 설정</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Play time tracker */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-950/60 border border-stone-800">
            <div className="flex items-center gap-2 text-stone-300 text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>현재 누적 탐사 시간</span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-amber-200">
              {formatTime(playTimeSeconds)}
            </span>
          </div>

          {/* Interaction Guide Toggle (Requested by User!) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-950/60 border border-stone-800">
            <div className="flex items-center gap-2 text-stone-300 text-xs sm:text-sm">
              {showHotspotGlow ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-stone-500" />}
              <div>
                <div className="font-bold text-stone-200">상호작용 가능한 물체 표시</div>
                <div className="text-[10px] text-stone-400">조사 가능한 물체 위에 은은한 안내선 표시</div>
              </div>
            </div>
            <button
              onClick={() => { sound.playClick(); onToggleHotspotGlow(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                showHotspotGlow
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-stone-950'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-400'
              }`}
            >
              {showHotspotGlow ? '켜짐' : '꺼짐'}
            </button>
          </div>

          {/* Sound Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-950/60 border border-stone-800">
              <div className="flex items-center gap-2 text-stone-300 text-xs sm:text-sm">
                {isBgmMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span>배경 음악 (BGM)</span>
              </div>
              <button
                onClick={() => { sound.playClick(); onToggleBgm(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  !isBgmMuted 
                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950' 
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-400'
                }`}
              >
                {!isBgmMuted ? '켜짐' : '꺼짐'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-950/60 border border-stone-800">
              <div className="flex items-center gap-2 text-stone-300 text-xs sm:text-sm">
                {isSfxMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span>효과음 (SFX)</span>
              </div>
              <button
                onClick={() => { sound.playClick(); onToggleSfx(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  !isSfxMuted 
                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950' 
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-400'
                }`}
              >
                {!isSfxMuted ? '켜짐' : '꺼짐'}
              </button>
            </div>
          </div>

          {/* Google Drive Cloud Save Section */}
          {onOpenDrive && (
            <div className="pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenDrive();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-700/60 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Google Drive 클라우드 저장 및 백업 관리</span>
              </button>
            </div>
          )}

          {/* Reset Game Section */}
          <div className="pt-2 border-t border-stone-800">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-red-900/60 bg-red-950/30 hover:bg-red-950/60 text-red-300 hover:text-red-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>처음부터 다시 시작하기 (진행 초기화)</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 space-y-2.5 text-center">
                <p className="text-xs text-red-200 font-medium">
                  수집한 모든 유물과 단서가 삭제됩니다. 정말 초기화할까요?
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      onResetGame();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                  >
                    확인하고 초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
