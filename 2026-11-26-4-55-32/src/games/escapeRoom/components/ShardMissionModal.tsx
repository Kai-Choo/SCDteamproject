import React, { useState } from 'react';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';
import { X, Check } from 'lucide-react';

export type QuizMissionId = 'umjib' | 'quern' | 'pottery' | 'altar';

interface ShardMissionModalProps {
  missionId: QuizMissionId;
  onComplete: (shardNumber: 1 | 2 | 4 | 5) => void;
  onClose: () => void;
}

export const ShardMissionModal: React.FC<ShardMissionModalProps> = ({
  missionId,
  onComplete,
  onClose,
}) => {
  const [grindCount, setGrindCount] = useState(0);
  const [isGrindingAnim, setIsGrindingAnim] = useState(false);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const shardNumberMap: Record<QuizMissionId, 1 | 2 | 4 | 5> = {
    umjib: 1,
    quern: 2,
    pottery: 4,
    altar: 5,
  };
  const shardNum = shardNumberMap[missionId];
  const shardItemId = `pottery_shard_${shardNum}`;

  const handleChooseOption = (isCorrect: boolean, idx: number) => {
    if (solved) return;
    if (isCorrect) {
      sound.playSuccess();
      setSolved(true);
    } else {
      sound.playError();
      setWrongIdx(idx);
      setTimeout(() => setWrongIdx(null), 500);
    }
  };

  const handleGrindAcorn = () => {
    if (solved || isGrindingAnim) return;
    sound.playClick();
    setIsGrindingAnim(true);
    setTimeout(() => {
      setIsGrindingAnim(false);
      const next = grindCount + 1;
      setGrindCount(next);
      if (next >= 3) {
        sound.playSuccess();
        setSolved(true);
      }
    }, 240);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#fffaf0] border-4 border-[#4d2810] rounded-3xl shadow-2xl p-5 sm:p-6 text-[#3d1c06]">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-[#fff0d1] border-2 border-[#4d2810] text-[#4d2810] hover:bg-white cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {solved ? (
          <div className="py-3 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 rounded-full bg-[#fff3cc] border-3 border-[#4d2810] flex items-center justify-center shadow-lg animate-bounce">
              <ItemIcon itemId={shardItemId} className="w-16 h-16" />
            </div>
            <div className="space-y-1">
              <div className="text-xl font-black text-[#8c5228]">
                정답! 마법의 토기 조각 #{shardNum}
              </div>
              <div className="text-xs font-bold text-[#5c3a21]">
                {missionId === 'umjib' && '선사시대 사람들은 땅을 파고 지은 움집에서 살았어요!'}
                {missionId === 'quern' && '갈판과 갈돌로 도토리를 갈아 먹었어요!'}
                {missionId === 'pottery' && '고강동 유적의 대표 토기인 구멍무늬 토기예요!'}
                {missionId === 'altar' && '산 정상 적석환유구는 하늘에 제사를 지내던 곳이에요!'}
              </div>
            </div>
            <button
              onClick={() => {
                sound.playSuccess();
                onComplete(shardNum);
              }}
              className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-b from-[#ffb732] to-[#e68a00] border-2 border-[#4d2810] text-[#3d1c06] font-black text-sm shadow-[0_3px_0_#4d2810] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>조각 챙기기</span>
            </button>
          </div>
        ) : (
          <>
            {missionId === 'umjib' && (
              <div className="space-y-5 text-center">
                <h3 className="text-lg sm:text-xl font-black text-[#4d2810] pt-1">
                  선사시대 사람들이 살던 집은?
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChooseOption(true, 0)}
                    className="p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810]"
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <ellipse cx="40" cy="66" rx="32" ry="8" fill="#8c5832" />
                      <polygon points="40,12 10,64 70,64" fill="#e6b85c" stroke="#4d2810" strokeWidth="3" />
                      <path d="M25 38 L55 38 M18 51 L62 51" stroke="#a8762c" strokeWidth="2.5" />
                      <path d="M33 64 L33 48 Q40 42 47 48 L47 64 Z" fill="#5c3318" stroke="#4d2810" strokeWidth="2" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">움집</span>
                  </button>

                  <button
                    onClick={() => handleChooseOption(false, 1)}
                    className={`p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810] ${
                      wrongIdx === 1 ? 'animate-shake bg-red-200 border-red-600' : ''
                    }`}
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <rect x="20" y="12" width="40" height="58" rx="3" fill="#94a3b8" stroke="#4d2810" strokeWidth="3" />
                      <rect x="27" y="20" width="8" height="8" fill="#fef08a" stroke="#4d2810" strokeWidth="1.5" />
                      <rect x="45" y="20" width="8" height="8" fill="#fef08a" stroke="#4d2810" strokeWidth="1.5" />
                      <rect x="27" y="34" width="8" height="8" fill="#bae6fd" stroke="#4d2810" strokeWidth="1.5" />
                      <rect x="45" y="34" width="8" height="8" fill="#fef08a" stroke="#4d2810" strokeWidth="1.5" />
                      <rect x="27" y="48" width="8" height="8" fill="#bae6fd" stroke="#4d2810" strokeWidth="1.5" />
                      <rect x="45" y="48" width="8" height="8" fill="#bae6fd" stroke="#4d2810" strokeWidth="1.5" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">아파트</span>
                  </button>

                  <button
                    onClick={() => handleChooseOption(false, 2)}
                    className={`p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810] ${
                      wrongIdx === 2 ? 'animate-shake bg-red-200 border-red-600' : ''
                    }`}
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <ellipse cx="40" cy="48" rx="30" ry="12" fill="#cbd5e1" stroke="#4d2810" strokeWidth="3" />
                      <path d="M24 44 C26 26 54 26 56 44 Z" fill="#7dd3fc" stroke="#4d2810" strokeWidth="3" />
                      <circle cx="26" cy="50" r="3" fill="#fde047" />
                      <circle cx="40" cy="52" r="3" fill="#fde047" />
                      <circle cx="54" cy="50" r="3" fill="#fde047" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">우주선</span>
                  </button>
                </div>
              </div>
            )}

            {missionId === 'quern' && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-[#4d2810]">
                    돌을 눌러 도토리를 갈아주세요!
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ffca58] border-2 border-[#4d2810] text-[#4d2810] font-mono text-xs font-black">
                    {grindCount}/3
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGrindAcorn}
                  className="relative w-full h-52 rounded-2xl bg-[#eef7e1] border-3 border-[#4d2810] hover:bg-[#e3f2cf] flex flex-col items-center justify-center overflow-hidden cursor-pointer group shadow-inner"
                >
                  <svg viewBox="0 0 240 150" className="w-64 h-40">
                    <ellipse cx="120" cy="112" rx="92" ry="26" fill="#c7bfb5" stroke="#4d2810" strokeWidth="3.5" />
                    <ellipse cx="120" cy="104" rx="76" ry="18" fill="#dfd8cf" />
                    {grindCount > 0 && (
                      <ellipse
                        cx="120"
                        cy="104"
                        rx={18 + grindCount * 14}
                        ry={5 + grindCount * 3}
                        fill="#e6b86a"
                      />
                    )}
                    {grindCount < 1 && <text x="85" y="106" fontSize="22">🌰</text>}
                    {grindCount < 2 && <text x="115" y="109" fontSize="22">🌰</text>}
                    {grindCount < 3 && <text x="145" y="105" fontSize="22">🌰</text>}
                    <g
                      style={{
                        transform: `translateX(${isGrindingAnim ? 22 : -10}px)`,
                        transition: 'transform 0.2s ease-in-out',
                      }}
                    >
                      <rect
                        x="72"
                        y="64"
                        width="96"
                        height="30"
                        rx="15"
                        fill="#e6dfd5"
                        stroke="#4d2810"
                        strokeWidth="3.5"
                      />
                    </g>
                  </svg>

                  <span className="px-4 py-1 rounded-full bg-[#ffca58] border-2 border-[#4d2810] text-[#4d2810] font-black text-xs shadow group-hover:scale-105 transition-transform">
                    갈돌 문지르기 ({3 - grindCount}번 더)
                  </span>
                </button>
              </div>
            )}

            {missionId === 'pottery' && (
              <div className="space-y-5 text-center">
                <h3 className="text-lg sm:text-xl font-black text-[#4d2810] pt-1">
                  고강동 유적의 '구멍무늬 토기'는?
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChooseOption(false, 0)}
                    className={`p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810] ${
                      wrongIdx === 0 ? 'animate-shake bg-red-200 border-red-600' : ''
                    }`}
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <rect x="34" y="10" width="12" height="8" rx="2" fill="#2563eb" stroke="#4d2810" strokeWidth="2" />
                      <path d="M26 26 L34 18 L46 18 L54 26 L54 68 L26 68 Z" fill="#93c5fd" stroke="#4d2810" strokeWidth="3" />
                      <rect x="27" y="38" width="26" height="14" fill="#ffffff" opacity="0.9" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">플라스틱 병</span>
                  </button>

                  <button
                    onClick={() => handleChooseOption(true, 1)}
                    className="p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810]"
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <path d="M20 18 L60 18 C64 42 56 60 48 68 L32 68 C24 60 16 42 20 18 Z" fill="#c77242" stroke="#4d2810" strokeWidth="3" />
                      <ellipse cx="40" cy="18" rx="20" ry="5" fill="#8f4820" stroke="#4d2810" strokeWidth="2.5" />
                      <circle cx="27" cy="28" r="2.5" fill="#4d2810" />
                      <circle cx="35" cy="29" r="2.5" fill="#4d2810" />
                      <circle cx="45" cy="29" r="2.5" fill="#4d2810" />
                      <circle cx="53" cy="28" r="2.5" fill="#4d2810" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">구멍무늬 토기</span>
                  </button>

                  <button
                    onClick={() => handleChooseOption(false, 2)}
                    className={`p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810] ${
                      wrongIdx === 2 ? 'animate-shake bg-red-200 border-red-600' : ''
                    }`}
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <path d="M52 32 C64 32 64 54 52 54" fill="none" stroke="#4d2810" strokeWidth="4" />
                      <rect x="22" y="24" width="32" height="42" rx="4" fill="#e2e8f0" stroke="#4d2810" strokeWidth="3" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">유리 머그컵</span>
                  </button>
                </div>
              </div>
            )}

            {missionId === 'altar' && (
              <div className="space-y-5 text-center">
                <h3 className="text-lg sm:text-xl font-black text-[#4d2810] pt-1">
                  고천산 정상 '적석환유구'는 무엇일까요?
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChooseOption(true, 0)}
                    className="p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810]"
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <circle cx="40" cy="22" r="10" fill="#fbbf24" stroke="#4d2810" strokeWidth="2.5" />
                      <ellipse cx="40" cy="54" rx="28" ry="14" fill="none" stroke="#a8a29e" strokeWidth="5" strokeDasharray="7 4" />
                      <ellipse cx="40" cy="54" rx="15" ry="7" fill="#e7e5e4" stroke="#4d2810" strokeWidth="2.5" />
                      <circle cx="40" cy="52" r="4" fill="#f97316" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">하늘 제단</span>
                  </button>

                  <button
                    onClick={() => handleChooseOption(false, 1)}
                    className={`p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810] ${
                      wrongIdx === 1 ? 'animate-shake bg-red-200 border-red-600' : ''
                    }`}
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <rect x="14" y="20" width="52" height="44" rx="6" fill="#475569" stroke="#4d2810" strokeWidth="3" />
                      <text x="40" y="51" textAnchor="middle" fill="#38bdf8" fontSize="28" fontWeight="bold">P</text>
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">주차장</span>
                  </button>

                  <button
                    onClick={() => handleChooseOption(false, 2)}
                    className={`p-3 rounded-2xl bg-[#fff3d6] hover:bg-[#ffe9b3] border-3 border-[#4d2810] flex flex-col items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-[0_3px_0_#4d2810] ${
                      wrongIdx === 2 ? 'animate-shake bg-red-200 border-red-600' : ''
                    }`}
                  >
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <rect x="14" y="24" width="52" height="36" rx="6" fill="#38bdf8" stroke="#4d2810" strokeWidth="3" />
                      <path d="M20 38 Q30 33 40 38 T60 38" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                      <path d="M20 48 Q30 43 40 48 T60 48" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                    </svg>
                    <span className="text-xs sm:text-sm font-black text-[#4d2810]">수영장</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
