import React, { useState } from 'react';
import { ClueItem } from '../types/game';
import { X, BookOpen, Search, Landmark, Compass, Award, FileText } from 'lucide-react';
import { GOGANG_HISTORICAL_FACTS } from '../data/historicalData';
import { sound } from '../services/soundService';

interface ClueJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  clues: ClueItem[];
}

export const ClueJournalModal: React.FC<ClueJournalModalProps> = ({
  isOpen,
  onClose,
  clues
}) => {
  const [activeTab, setActiveTab] = useState<'clues' | 'encyclopedia' | 'history'>('clues');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredClues = clues.filter(c => 
    c.title.includes(searchQuery) || c.content.includes(searchQuery) || c.category.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-bold text-amber-100">발굴 조사 수첩 & 역사 아카이브</h2>
              <p className="text-xs text-stone-400">부천 고강선사유적 현장 기록 및 학술 조사 자료집</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-stone-800 bg-stone-950/40 px-5 gap-2">
          <button
            onClick={() => { sound.playClick(); setActiveTab('clues'); }}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'clues'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>수집한 단서 ({clues.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('encyclopedia'); }}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'encyclopedia'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>선사 유물 백과</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('history'); }}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>고강동 유적지 안내</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 max-h-[60vh] space-y-4">
          {activeTab === 'clues' && (
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="단서 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/80"
                />
              </div>

              {filteredClues.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-sm">
                  {searchQuery ? '일치하는 단서가 없습니다.' : '아직 발견된 단서가 없습니다.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredClues.map(c => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 hover:border-amber-900/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300 font-medium">
                          {c.category}
                        </span>
                        <span className="text-[11px] text-stone-500">{c.timestamp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-amber-100 font-editorial mb-1">
                        {c.title}
                      </h4>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'encyclopedia' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-400 leading-relaxed bg-stone-950/40 p-3 rounded-xl border border-stone-800">
                실제 고강선사유적체험관과 발굴 조사를 통해 확인된 청동기 및 신석기 대표 유물들의 학술 정보입니다. 게임 속 퍼즐의 단서로 직접 활용됩니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(GOGANG_HISTORICAL_FACTS.relics).map(([key, relic]) => (
                  <div key={key} className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-amber-200 font-editorial">{relic.name}</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                        {relic.era}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-amber-400/90 mb-1">
                      {relic.significance}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed mb-2">
                      {relic.description}
                    </p>
                    <div className="text-[11px] text-stone-400 bg-stone-900/90 p-2 rounded-lg border border-stone-800">
                      <strong className="text-amber-300">주요 특징:</strong> {relic.keyFeature}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-300">
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
                <h3 className="font-editorial text-base font-bold text-amber-200 mb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  부천 고강동 선사유적 개요
                </h3>
                <p className="leading-relaxed text-stone-300">
                  {GOGANG_HISTORICAL_FACTS.siteOverview}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
                <h3 className="font-editorial text-base font-bold text-amber-200 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  적석환유구(積石環遺構)의 학술적 가치
                </h3>
                <p className="leading-relaxed text-stone-300">
                  {GOGANG_HISTORICAL_FACTS.jeokseokhwanYugu}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
                <h3 className="font-editorial text-base font-bold text-amber-200 mb-2">
                  발굴 및 전시관 안내
                </h3>
                <p className="leading-relaxed text-stone-300">
                  {GOGANG_HISTORICAL_FACTS.excavationHistory} 현재 부천시 고강선사유적공원 내 고강선사유적체험관에서 출토 유물과 주거지 복원 모형, 적석환유구 축조 기법을 직접 관람하고 체험할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
