import React from 'react';
import { sound } from '../services/soundService';

interface RustyClueBookModalProps {
  subtitle: string;
  leftPageTitle?: string;
  leftPageLines: string[];
  rightPageTitle?: string;
  rightPageLines: string[];
  onClose: () => void;
}

export const RustyClueBookModal: React.FC<RustyClueBookModalProps> = ({
  subtitle,
  leftPageTitle,
  leftPageLines,
  rightPageTitle,
  rightPageLines,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      {/* Container matching the uploaded screenshot */}
      <div className="relative w-full max-w-3xl aspect-[16/10] bg-[#cfcfcf] rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl border-4 border-[#333333] overflow-hidden">
        {/* Top-Left Black Rounded Subtitle Pill (Exact match to screenshot!) */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-4 py-1.5 rounded-xl bg-black text-white text-xs sm:text-sm font-serif font-bold shadow-lg tracking-wide">
            {subtitle}
          </div>
        </div>

        {/* Center: Open Two-Page Parchment Book */}
        <div className="flex-1 w-full flex items-center justify-center pt-8 pb-4">
          <div className="w-full h-full max-w-2xl flex flex-row gap-3 sm:gap-4 items-stretch justify-center">
            {/* Left Page */}
            <div className="flex-1 bg-[#f4ebd9] border-2 border-[#2b2520] shadow-md rounded-l-md p-4 sm:p-6 flex flex-col justify-between text-[#2e261f] font-serif leading-relaxed rotate-[-0.5deg]">
              {leftPageTitle && (
                <div className="text-xs sm:text-sm font-bold border-b border-[#2b2520]/20 pb-1 mb-2 text-center text-[#593d25]">
                  {leftPageTitle}
                </div>
              )}
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                {leftPageLines.map((line, idx) => (
                  <p key={idx} className="italic">
                    {line}
                  </p>
                ))}
              </div>
              <div className="text-right text-[10px] text-stone-500 font-mono">
                1
              </div>
            </div>

            {/* Book Spine Divider */}
            <div className="w-1.5 sm:w-2 bg-[#2b2520] rounded-sm shadow-inner self-stretch" />

            {/* Right Page */}
            <div className="flex-1 bg-[#f4ebd9] border-2 border-[#2b2520] shadow-md rounded-r-md p-4 sm:p-6 flex flex-col justify-between text-[#2e261f] font-serif leading-relaxed rotate-[0.5deg]">
              {rightPageTitle && (
                <div className="text-xs sm:text-sm font-bold border-b border-[#2b2520]/20 pb-1 mb-2 text-center text-[#593d25]">
                  {rightPageTitle}
                </div>
              )}
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                {rightPageLines.map((line, idx) => (
                  <p key={idx} className="italic">
                    {line}
                  </p>
                ))}
              </div>
              <div className="text-right text-[10px] text-stone-500 font-mono">
                2
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Center Black Down Arrow '▼' (Exact match to screenshot!) */}
        <div className="flex justify-center -mb-1">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-7 rounded-t-lg bg-black text-white hover:bg-stone-800 flex items-center justify-center transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg"
            title="방으로 돌아가기 (▼)"
          >
            <span className="text-sm font-black">▼</span>
          </button>
        </div>
      </div>
    </div>
  );
};
