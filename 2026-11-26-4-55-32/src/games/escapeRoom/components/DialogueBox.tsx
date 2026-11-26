import React, { useState, useEffect } from 'react';
import { sound } from '../services/soundService';
import { ChevronRight, FastForward, User, Sparkles } from 'lucide-react';

interface DialogueBoxProps {
  dialogues: {
    speaker: string;
    text: string;
    avatar?: string;
  }[];
  onComplete: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogues, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentDialogue = dialogues[currentIndex] || dialogues[0];

  useEffect(() => {
    if (!currentDialogue) return;
    setIsTyping(true);
    setDisplayedText('');

    let charIdx = 0;
    const fullText = currentDialogue.text;

    const interval = setInterval(() => {
      if (charIdx < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(charIdx));
        charIdx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [currentIndex, currentDialogue]);

  const handleNext = () => {
    sound.playClick();
    if (isTyping) {
      setDisplayedText(currentDialogue.text);
      setIsTyping(false);
      return;
    }

    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkipAll = () => {
    sound.playClick();
    onComplete();
  };

  if (!currentDialogue) return null;

  const isPlayer = currentDialogue.speaker.startsWith('나');

  return (
    <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-35 animate-in slide-in-from-bottom-3 duration-300">
      <div className="relative rounded-2xl bg-stone-950/95 border border-amber-600/60 shadow-2xl p-4 sm:p-5 backdrop-blur-xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isPlayer ? 'bg-amber-900/80 text-amber-200' : 'bg-emerald-950 text-emerald-300'}`}>
              {isPlayer ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>
            <span className="font-bold text-sm sm:text-base text-amber-200 font-editorial">
              {currentDialogue.speaker}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-mono">
              {currentIndex + 1} / {dialogues.length}
            </span>
            <button
              onClick={handleSkipAll}
              className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 transition-colors"
            >
              <FastForward className="w-3 h-3" />
              <span>건너뛰기</span>
            </button>
          </div>
        </div>

        {/* Text body */}
        <div 
          onClick={handleNext} 
          className="min-h-[50px] sm:min-h-[56px] text-stone-100 text-xs sm:text-sm sm:leading-relaxed cursor-pointer select-none font-sans"
        >
          {displayedText}
          {isTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-amber-400 animate-pulse align-middle" />}
        </div>

        {/* Action button */}
        <div className="mt-2.5 flex justify-end">
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md active:scale-95"
          >
            <span>{isTyping ? '전체 보기' : currentIndex < dialogues.length - 1 ? '계속하기' : '탐사 시작'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
