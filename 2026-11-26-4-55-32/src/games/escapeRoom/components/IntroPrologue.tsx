import React, { useState, useEffect } from 'react';
import { sound } from '../services/soundService';
import { Sparkles, FastForward, ArrowRight } from 'lucide-react';

interface IntroPrologueProps {
  onComplete: () => void;
}

export const IntroPrologue: React.FC<IntroPrologueProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const scenes = [
    {
      caption: '2026년, 경기도 부천시 고강선사유적 발굴 현장 A1 구역',
      lines: [
        '부천 고강동 선사유적 발굴 조사를 진행하던 당신.',
        '깊이 120cm의 청동기 문화층 흙을 파내려가던 중, 마침내 3천 년 전 선사시대 대형 도자기를 발견하게 된다.'
      ],
      bgImage: '/assets/escape-room/prehistoric_pottery_excavation_1792070902654.jpg'
    },
    {
      caption: '도자기 곁에 파묻혀 있던 정체불명의 푸른 유물',
      lines: [
        '발굴 붓으로 도자기 주변의 흙을 조심스럽게 털어내자,',
        '도자기 바로 옆 흙 속에서 은은한 푸른빛과 에너지를 내뿜는 신비한 비취 곡옥 유물이 모습을 드러냈다.'
      ],
      bgImage: '/assets/escape-room/prehistoric_pottery_excavation_1792070902654.jpg'
    },
    {
      caption: '손을 댄 순간 일어난 시공간의 소용돌이',
      lines: [
        '호기심에 이끌려 도자기 곁의 유물을 조심스럽게 만진 순간,',
        '유물에서 눈부신 빛이 뿜어져 나오며 땅이 흔들리고 당신은 3천 년 전 과거 청동기시대로 빨려 들어가게 되는데...!'
      ],
      bgImage: '/assets/escape-room/prehistoric_village_scene_1790923408627.jpg'
    }
  ];

  const currentScene = scenes[step];

  useEffect(() => {
    sound.playRelicResonance();
    setIsTyping(true);
    setDisplayedText('');

    const fullText = currentScene.lines.join(' ');
    let charIdx = 0;

    const interval = setInterval(() => {
      if (charIdx < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(charIdx));
        charIdx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [step]);

  const handleNext = () => {
    sound.playClick();
    if (isTyping) {
      setDisplayedText(currentScene.lines.join(' '));
      setIsTyping(false);
      return;
    }

    if (step < scenes.length - 1) {
      setStep(prev => prev + 1);
    } else {
      sound.playSuccess();
      onComplete();
    }
  };

  const handleSkip = () => {
    sound.playClick();
    onComplete();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[540px] sm:h-[600px] rounded-3xl overflow-hidden border-2 border-[#824e2c] shadow-2xl bg-black flex flex-col justify-between p-6 sm:p-10 text-white select-none">
      {/* Background with crossfade transition */}
      <div 
        key={step}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-in fade-in"
        style={{ backgroundImage: `url('${currentScene.bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 pointer-events-none" />

      {/* Top Bar: Scene Indicator & Skip */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 border border-amber-600/70 text-amber-200 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>프롤로그 ({step + 1} / {scenes.length})</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs text-stone-300 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-700/80 transition-colors backdrop-blur-sm cursor-pointer"
        >
          <span>스킵</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Area: Cinematic Dialogue Box */}
      <div className="relative z-20 space-y-4 max-w-3xl">
        <div className="text-amber-400 text-xs sm:text-sm font-semibold tracking-wider font-mono uppercase">
          {currentScene.caption}
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-black/80 border border-[#824e2c] shadow-2xl backdrop-blur-md min-h-[110px] flex items-center">
          <p className="text-sm sm:text-base md:text-lg text-stone-100 leading-relaxed font-serif">
            {displayedText}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl active:scale-95 transition-transform cursor-pointer"
          >
            <span>{step === scenes.length - 1 ? '발굴 현장 조사 시작' : '다음 이야기'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
