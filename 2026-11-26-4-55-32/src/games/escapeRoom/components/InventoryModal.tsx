import React, { useState } from 'react';
import { InventoryItem } from '../types/game';
import { X, Backpack, Sparkles, Layers, BookOpen, Map, Hammer, Key } from 'lucide-react';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onCombineItems?: (item1Id: string, item2Id: string) => boolean;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onCombineItems
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(inventory[0] || null);
  const [combineMode, setCombineMode] = useState(false);
  const [combineTarget, setCombineTarget] = useState<string | null>(null);
  const [combineMessage, setCombineMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (item: InventoryItem) => {
    sound.playClick();
    if (combineMode && combineTarget) {
      if (combineTarget === item.id) {
        setCombineTarget(null);
        return;
      }
      // Attempt combination
      if (onCombineItems) {
        const success = onCombineItems(combineTarget, item.id);
        if (success) {
          sound.playSuccess();
          setCombineMessage('도구 조합에 성공하였습니다!');
          setCombineMode(false);
          setCombineTarget(null);
        } else {
          sound.playError();
          setCombineMessage('이 아이템들은 서로 조합할 수 없습니다.');
        }
      }
      return;
    }

    setSelectedItem(item);
    setCombineMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400">
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-bold text-amber-100">조사원 소지품 보관함</h2>
              <p className="text-xs text-stone-400">발굴 조사 및 선사시대 탐사 중 획득한 귀중한 유물과 단서 목록</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area: Split Grid / Detail */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Grid: Item List */}
          <div className="md:col-span-5 p-4 border-b md:border-b-0 md:border-r border-stone-800 overflow-y-auto max-h-[280px] md:max-h-[500px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                보관 물품 ({inventory.length})
              </span>
              {combineMessage && (
                <span className="text-xs text-amber-400 font-medium">{combineMessage}</span>
              )}
            </div>

            {inventory.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-sm">
                보관된 물품이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {inventory.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  const isCombineSource = combineTarget === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        isCombineSource
                          ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/50'
                          : isSelected
                          ? 'bg-stone-800/90 border-amber-600/70 text-white shadow-md'
                          : 'bg-stone-900/60 border-stone-800/90 text-stone-300 hover:bg-stone-800/50 hover:border-stone-700'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-stone-950/80 border border-stone-800 shrink-0">
                        <ItemIcon itemId={item.id} className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate text-amber-200">{item.name}</div>
                        <div className="text-xs text-stone-400 truncate mt-0.5">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Detailed Inspection View */}
          <div className="md:col-span-7 p-5 overflow-y-auto max-h-[360px] md:max-h-[500px] flex flex-col justify-between bg-stone-950/30">
            {selectedItem ? (
              <div className="space-y-4">
                {/* Item Display Frame */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-stone-800/40 to-stone-900/80 border border-stone-800/80 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-stone-950/90 border border-amber-900/50 flex items-center justify-center mb-3 shadow-inner">
                    <ItemIcon itemId={selectedItem.id} className="w-14 h-14" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-100 font-editorial">
                    {selectedItem.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-400">
                    <span className="capitalize">{selectedItem.category}</span>
                    <span>·</span>
                    <span>획득 위치: {selectedItem.acquiredAtStage.replace('STAGE_', '단계 ')}</span>
                  </div>
                </div>

                {/* Lore & Details */}
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
                      유물 및 아이템 설명
                    </h4>
                    <p className="text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-800">
                      {selectedItem.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      학술 고증 및 현장 관찰 기록
                    </h4>
                    <p className="text-xs text-stone-400 leading-relaxed bg-stone-900/40 p-3 rounded-xl border border-stone-800/60">
                      {selectedItem.detailedLore}
                    </p>
                  </div>
                </div>

                {/* Optional Combination trigger */}
                {selectedItem.combinableWith && selectedItem.combinableWith.length > 0 && onCombineItems && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCombineMode(true);
                        setCombineTarget(selectedItem.id);
                        setCombineMessage('조합할 다른 아이템을 목록에서 선택하세요.');
                      }}
                      className="w-full py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      <span>다른 재료와 결합하기</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-500 text-sm">
                조사할 물품을 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
