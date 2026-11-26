import React, { useState, useEffect } from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { sound } from '../services/soundService';
import { ChevronDown, FastForward } from 'lucide-react';

interface ClassicDialogueBoxProps {
  dialogues?: {
    speaker: string;
    text: string;
    avatar?: string;
  }[];
  activeThought?: string; // fallback monologue when no active dialogue script is running
  onComplete?: () => void;
}

export const ClassicDialogueBox: React.FC<ClassicDialogueBoxProps> = ({
  dialogues = [],
  activeThought,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const hasScript = dialogues && dialogues.length > 0 && currentIndex < dialogues.length;
  const currentDialogue = hasScript ? dialogues[currentIndex] : null;
  const rawText = currentDialogue ? currentDialogue.text : activeThought || '주변을 주의 깊게 살펴보자... 수상한 곳을 클릭해 단서를 찾아야 해.';
  const speakerName = currentDialogue ? currentDialogue.speaker : '한유나 연구원';

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');

    let charIdx = 0;
    const fullText = rawText;

    const interval = setInterval(() => {
      if (charIdx < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(charIdx));
        charIdx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [rawText, currentIndex]);

  const handleAdvance = () => {
    sound.playClick();
    if (isTyping) {
      setDisplayedText(rawText);
      setIsTyping(false);
      return;
    }

    if (hasScript) {
      if (currentIndex < dialogues.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        if (onComplete) onComplete();
      }
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (onComplete) onComplete();
  };

  return (
    <div className="relative w-full z-30 select-none pt-4">
      {/* Decorative Damask/Textured Bottom Strip */}
      <div className="relative w-full bg-[#3d2024]/90 border-t-2 border-[#80464f] p-2 sm:p-3 shadow-2xl backdrop-blur-sm">
        {/* Ornate Filigree Crest centered on top border */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <svg className="w-12 h-6 text-[#d87c88] drop-shadow-md" viewBox="0 0 60 30" fill="currentColor">
            <path d="M30 0 C24 10 10 8 0 15 C12 18 20 28 30 30 C40 28 48 18 60 15 C50 8 36 10 30 0 Z" />
            <circle cx="30" cy="14" r="3" fill="#ffccd4" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto flex items-end gap-2 sm:gap-4 relative">
          {/* Character Bust Portrait on Bottom-Left */}
          <div className="relative shrink-0 -mb-2 sm:-mb-3 -ml-1 sm:ml-0 z-20">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#e8a2ac] shadow-2xl bg-stone-900 ring-2 ring-stone-950/60">
              <img 
                src={publicAsset('/assets/escape-room/archaeologist_heroine_bust_1790926437229.jpg')}
                alt="한유나 연구원"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform"
              />
            </div>
            {/* Name Tag Pill */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#522129] border border-[#d87c88] text-[#ffedf0] text-[10px] sm:text-[11px] font-bold whitespace-nowrap shadow-md">
              {speakerName}
            </div>
          </div>

          {/* White Speech Bubble Box matching the classic reference */}
          <div 
            onClick={handleAdvance}
            className="flex-1 bg-white border border-[#9b5863] rounded-2xl p-3 sm:p-4 text-stone-900 shadow-xl cursor-pointer relative min-h-[76px] sm:min-h-[84px] flex flex-col justify-between group hover:border-[#b86270] transition-colors"
          >
            {/* Dialogue Text in Classic Game Font */}
            <div className="text-xs sm:text-sm md:text-[15px] font-serif font-bold text-[#361c20] leading-relaxed pr-6">
              {displayedText}
              {isTyping && <span className="inline-block w-1 h-3.5 ml-1 bg-[#8c3b47] animate-pulse" />}
            </div>

            {/* Bottom Controls / Blinking Advance Arrow */}
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-200/80 text-[11px] text-stone-500">
              <span className="text-[10px] text-stone-400 font-sans">
                {hasScript ? `(${currentIndex + 1}/${dialogues.length})` : '화면을 클릭하여 단서 탐색'}
              </span>

              <div className="flex items-center gap-2">
                {hasScript && (
                  <button
                    onClick={handleSkip}
                    className="text-[10px] text-[#80464f] hover:text-[#522129] flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-stone-100 font-sans"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>건너뛰기</span>
                  </button>
                )}

                {/* Blinking Downward Chevron Arrow (Just like the 'v' in the screenshot) */}
                <div className="text-[#80464f] animate-bounce">
                  <ChevronDown className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
