import React, { useState, useEffect } from 'react';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';
import { Sparkles, CheckCircle2, ArrowRight, ShieldAlert, Award, X, ChevronLeft } from 'lucide-react';

export interface BowItemData {
  id: string;
  name: string;
  category: 'bow' | 'arrow';
  qr: string;
  hint: string;
  lore: string;
  quizType: 'choice' | 'ox' | 'drag';
  quizQuestion: string;
  // For 'choice'
  choiceOptions?: string[];
  // For 'ox'
  oxStatements?: string[];
  // For 'drag' (sequence or matching)
  dragSlots?: { label: string; placeholder: string }[];
  dragTokens?: { key: string; text: string }[];
  correctAnswers: string[];
}

export const BOW_ARROW_DATA: BowItemData[] = [
  {
    id: 'grip',
    name: '줌통',
    category: 'bow',
    qr: 'A',
    hint: '활을 쥘 때 궁사의 손이 꼭 맞게 쥐어지는 가장 중심부입니다.',
    lore: '활의 한가운데 손으로 잡는 손잡이 부분입니다. 땀이 배지 않도록 자작나무 껍질(화피)을 꼼꼼히 감아 쥐는 힘을 지탱합니다.',
    quizType: 'choice',
    quizQuestion: '활을 쏠 때 궁사가 직접 손으로 쥐는 한가운데 손잡이 부위의 올바른 명칭은 무엇일까요?',
    choiceOptions: [
      '활고자',
      '줌통 (Grip)',
      '오늬',
      '살대'
    ],
    correctAnswers: ['1']
  },
  {
    id: 'upper',
    name: '긴 활채',
    category: 'bow',
    qr: 'B',
    hint: '활의 중심에서 양 끝으로 뻗어나가며 구부러지는 주 탄성 날개입니다.',
    lore: '활의 주 몸체를 이루는 탄성체입니다. 참나무, 대나무, 물소 뿔, 소 힘줄을 여러 겹 덧대어 엄청난 복원력을 만들어냅니다.',
    quizType: 'ox',
    quizQuestion: '긴 활채의 구조와 특성에 대한 O/X 퀴즈를 풀어보세요.',
    oxStatements: [
      '긴 활채는 활을 잡아당길 때 강력한 탄성에너지를 축적하고 뿜어내는 핵심 몸체이다.',
      '선사시대 각궁 활채는 오직 철(쇠)로만 만들어져 전혀 휘어지지 않는다.',
      '활채의 바깥면에는 땀과 습기를 방지하기 위해 자작나무 껍질(화피)을 덧댄다.'
    ],
    correctAnswers: ['O', 'X', 'O']
  },
  {
    id: 'lower',
    name: '활고자',
    category: 'bow',
    qr: 'C',
    hint: '활의 양쪽 끝부분으로, 팽팽한 시위(활줄)의 고리를 걸어 고정하는 곳입니다.',
    lore: '활의 양쪽 끝에 단단한 뽕나무나 박달나무를 깎아 만든 부위입니다. 시위의 양 끝 고리를 든든하게 받쳐줍니다.',
    quizType: 'drag',
    quizQuestion: '활고자 부위의 핵심 역할을 올바른 위치에 채워 넣으세요.',
    dragSlots: [
      { label: '시위 연결부', placeholder: '활줄 고리를 거는 끝부분' },
      { label: '충격 완화부', placeholder: '시위의 진동을 받쳐주는 턱' }
    ],
    dragTokens: [
      { key: '0', text: '활고자 끝 고리 (시위 고정홈)' },
      { key: '1', text: '화살 통과 깃틀' },
      { key: '2', text: '돌칼 손잡이 홈' },
      { key: '3', text: '고자받이 (진동 흡수 턱)' }
    ],
    correctAnswers: ['0', '3']
  },
  {
    id: 'string',
    name: '시위',
    category: 'bow',
    qr: 'D',
    hint: '양 끝 고자에 걸려 화살을 앞으로 튕겨 보내는 강한 줄입니다.',
    lore: '활의 양 끝 고자를 연결하는 줄입니다. 질긴 명주실이나 꼬아 만든 삼실, 소 힘줄로 만들어 강력한 장력을 견딥니다.',
    quizType: 'drag',
    quizQuestion: '전통 국궁 시위(활줄)를 제작하여 장착하는 5단계 순서를 바르게 완성하세요.',
    dragSlots: [
      { label: '1단계', placeholder: '첫 번째 과정 선택' },
      { label: '2단계', placeholder: '두 번째 과정 선택' },
      { label: '3단계', placeholder: '세 번째 과정 선택' },
      { label: '4단계', placeholder: '네 번째 과정 선택' },
      { label: '5단계', placeholder: '다섯 번째 과정 선택' }
    ],
    dragTokens: [
      { key: '0', text: '시위 양쪽 끝에 튼튼한 고리를 매듭짓는다' },
      { key: '1', text: '질긴 명주실이나 삼실, 소 힘줄을 여러 겹 꼰다' },
      { key: '2', text: '화살 오늬가 닿는 한가운데에 절피실을 촘촘히 감는다' },
      { key: '3', text: '양쪽 활고자에 시위 고리를 걸어 활을 얹는다' },
      { key: '4', text: '밀랍이나 기름을 먹여 마찰과 습기를 방지한다' }
    ],
    correctAnswers: ['1', '4', '2', '0', '3']
  },
  {
    id: 'shaft',
    name: '살대',
    category: 'arrow',
    qr: 'E',
    hint: '가볍고 곧게 뻗은 대나무나 싸리나무로 깎은 화살의 긴 몸통대입니다.',
    lore: '화살의 몸통을 이루는 긴 대입니다. 곧고 결이 치밀한 대나무나 싸리나무를 불에 달궈 반듯하게 펴서 만듭니다.',
    quizType: 'choice',
    quizQuestion: '곧고 가벼우며 바람의 저항을 최소화하도록 매끄럽게 깎은 화살 몸통대의 주재료는?',
    choiceOptions: [
      '무거운 차돌 바위',
      '녹슬기 쉬운 무쇠 파이프',
      '부드러운 볏짚과 삼베 끈',
      '곧고 치밀한 싸리나무와 대나무'
    ],
    correctAnswers: ['3']
  },
  {
    id: 'arrowhead',
    name: '화살촉',
    category: 'arrow',
    qr: 'F',
    hint: '화살의 맨 앞머리에 장착되어 목표물을 꿰뚫는 칼날 부분입니다.',
    lore: '화살의 선단에 단단히 결합하는 촉입니다. 선사시대에는 흑요석이나 점판암을 정밀하게 갈아 살상력을 극대화했습니다.',
    quizType: 'ox',
    quizQuestion: '선사시대 화살촉에 관한 O/X 퀴즈를 풀어보세요.',
    oxStatements: [
      '화살촉은 화살의 맨 앞머리에 결합되어 관통력을 결정짓는 핵심 부품이다.',
      '고강동 선사 유적에서는 흑색 점판암을 정밀하게 갈아 만든 간돌화살촉(마제석촉)이 출토되었다.',
      '선사시대에는 살촉을 살대에 묶지 않고 헐겁게 올려놓기만 했다.'
    ],
    correctAnswers: ['O', 'O', 'X']
  },
  {
    id: 'feather',
    name: '깃과 오늬',
    category: 'arrow',
    qr: 'G',
    hint: '화살 뒤편의 비행 안정용 꿩 깃털과 활줄을 물리는 V자 홈입니다.',
    lore: '화살 뒤편에 붙이는 3장의 꿩 깃털(비행 안정)과, 시위에 화살을 단단히 끼우기 위해 파낸 V자 홈(오늬)입니다.',
    quizType: 'drag',
    quizQuestion: '화살 뒤편의 비행 안정 부재를 올바른 자리에 배치하세요.',
    dragSlots: [
      { label: '비행 회전', placeholder: '바람을 가르며 회전시키는 깃털' },
      { label: '시위 결합', placeholder: '활줄에 물리는 V자 홈' },
      { label: '마감 고정', placeholder: '깃을 단단히 고정하는 옻칠 실' }
    ],
    dragTokens: [
      { key: '0', text: '오늬 (활줄을 물리는 V자 홈)' },
      { key: '1', text: '화살깃 (비행 안정을 위한 꿩 깃털 3장)' },
      { key: '2', text: '도박실 및 천연 옻칠 마감' }
    ],
    correctAnswers: ['1', '0', '2']
  }
];

interface BowArrowEscapeWorkshopProps {
  onEscapeComplete: () => void;
  onAcquireComponent?: (id: string, name: string) => void;
  isBoulderBlocked: boolean;
  onClose?: () => void;
}

export const BowArrowEscapeWorkshop: React.FC<BowArrowEscapeWorkshopProps> = ({
  onEscapeComplete,
  onAcquireComponent,
  isBoulderBlocked,
  onClose
}) => {
  const STORAGE_KEY = 'museumBowGame';

  const [collectedIds, setCollectedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [activeCategory, setActiveCategory] = useState<'bow' | 'arrow'>('bow');
  const [selectedItemForQuiz, setSelectedItemForQuiz] = useState<BowItemData | null>(null);

  // Quiz input states
  const [choiceAnswer, setChoiceAnswer] = useState<string | null>(null);
  const [oxAnswers, setOxAnswers] = useState<string[]>([]);
  const [dragSlotValues, setDragSlotValues] = useState<string[]>([]);

  // Feedback & Reward Modal
  const [quizFeedbackMessage, setQuizFeedbackMessage] = useState<string | null>(null);
  const [isWrongAnswer, setIsWrongAnswer] = useState(false);
  const [rewardItem, setRewardItem] = useState<BowItemData | null>(null);

  // Shooting Animation
  const [isShootingAnimation, setIsShootingAnimation] = useState(false);
  const [boulderCracked, setBoulderCracked] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectedIds));
    } catch {}
  }, [collectedIds]);

  const isItemOwned = (id: string) => collectedIds.includes(id);
  const totalCount = BOW_ARROW_DATA.length;
  const collectedCount = collectedIds.length;
  const isAllCollected = collectedCount === totalCount;

  // On initial mount: automatically pick the first uncollected item if any
  useEffect(() => {
    if (!selectedItemForQuiz && collectedIds.length < totalCount) {
      const firstUncollected = BOW_ARROW_DATA.find(d => !collectedIds.includes(d.id));
      if (firstUncollected) {
        handleOpenQuiz(firstUncollected);
      }
    }
  }, []);

  const handleOpenQuiz = (item: BowItemData) => {
    sound.playClick();
    setSelectedItemForQuiz(item);
    setActiveCategory(item.category);
    setChoiceAnswer(null);
    setOxAnswers(item.oxStatements ? new Array(item.oxStatements.length).fill('') : []);
    setDragSlotValues(item.dragSlots ? new Array(item.dragSlots.length).fill('') : []);
    setQuizFeedbackMessage(null);
    setIsWrongAnswer(false);
  };

  const handleNextQuiz = () => {
    sound.playClick();
    setRewardItem(null);
    const nextItem = BOW_ARROW_DATA.find(d => !collectedIds.includes(d.id) && d.id !== selectedItemForQuiz?.id);
    if (nextItem) {
      handleOpenQuiz(nextItem);
    } else {
      setSelectedItemForQuiz(null);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!selectedItemForQuiz) return;
    const { quizType, correctAnswers, id, name } = selectedItemForQuiz;

    let userAnswers: string[] = [];
    if (quizType === 'choice') {
      if (choiceAnswer === null) {
        setQuizFeedbackMessage('답안을 선택해주세요.');
        setIsWrongAnswer(true);
        return;
      }
      userAnswers = [choiceAnswer];
    } else if (quizType === 'ox') {
      if (oxAnswers.some(a => !a)) {
        setQuizFeedbackMessage('모든 문항의 O 또는 X를 선택해주세요.');
        setIsWrongAnswer(true);
        return;
      }
      userAnswers = oxAnswers;
    } else if (quizType === 'drag') {
      if (dragSlotValues.some(v => !v)) {
        setQuizFeedbackMessage('모든 빈칸에 알맞은 조각을 채워주세요.');
        setIsWrongAnswer(true);
        return;
      }
      userAnswers = dragSlotValues;
    }

    const isCorrect = userAnswers.length === correctAnswers.length &&
      userAnswers.every((val, idx) => val === correctAnswers[idx]);

    if (!isCorrect) {
      sound.playError();
      setIsWrongAnswer(true);
      setQuizFeedbackMessage('아쉽지만 틀렸어요! 답안을 바꾸고 다시 도전해보세요.');
      return;
    }

    // Correct!
    sound.playSuccess();
    setIsWrongAnswer(false);
    setQuizFeedbackMessage('');

    if (!collectedIds.includes(id)) {
      const next = [...collectedIds, id];
      setCollectedIds(next);
      if (onAcquireComponent) {
        onAcquireComponent(id, name);
      }
    }

    // Show authentic Friend's Reward Modal!
    setRewardItem(selectedItemForQuiz);
  };

  // Assemble and shoot arrow to break trapped cave rock
  const handleTriggerShoot = () => {
    sound.playSuccess();
    setIsShootingAnimation(true);

    setTimeout(() => {
      setBoulderCracked(true);
      sound.playError(); // rock crumble sound
      setTimeout(() => {
        sound.playSuccess();
        setTimeout(() => {
          onEscapeComplete();
        }, 1600);
      }, 1200);
    }, 1400);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col justify-between overflow-y-auto select-none bg-[#e8e2d7] text-[#3f3026] font-sans p-3 sm:p-5">
      {/* ================= TOP NAVIGATION / MASTHEAD ================= */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
        <header className="flex items-center justify-between pb-3 border-b border-[#ded5c5]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#45694f]" />
            <span className="text-[11px] font-bold tracking-widest text-[#45694f] uppercase">
              부천 고강동 선사 유적 · 전통 국궁 탐험
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-full bg-[#fffdf7] border border-[#ded5c5] hover:bg-[#eee8dc] text-[#3f3026] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>마을 광장으로</span>
            </button>
          )}
        </header>

        {/* Cave Trap Context Banner */}
        <div className="bg-[#fffdf7] border border-[#ded5c5] rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#b58343] uppercase">
                Cave Escape Mission
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#3f3026] leading-snug">
                동굴 탈출을 위한 선사 신궁(神弓) 복원
              </h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#e9efdf] border border-[#45694f]/40 text-[#45694f] text-xs font-bold shrink-0">
              {collectedCount} / {totalCount} 완료
            </div>
          </div>
          <p className="text-xs text-[#807260] leading-relaxed">
            무너진 동굴 출구를 뚫으려면 3천 년 전 선사 궁사의 지혜가 담긴 
            <strong className="text-[#3f3026]"> 활(4부품)</strong>과 <strong className="text-[#3f3026]">화살(3부품)</strong> 총 7개의 부품 수수께끼를 풀어 신궁을 완성해야 합니다.
          </p>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-[#eee8dc] rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-[#45694f] transition-all duration-500 rounded-full"
              style={{ width: `${(collectedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* ================= QUIZ CARD INTERFACE (If an item is selected) ================= */}
        {selectedItemForQuiz && (
          <div className="bg-[#f7f2e8] border border-[#ded5c5] rounded-3xl p-4 sm:p-5 shadow-md flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Header with Reward Preview */}
            <div className="flex items-center justify-between border-b border-[#ded5c5] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#fffdf7] border border-[#ded5c5] flex items-center justify-center shrink-0">
                  <ItemIcon itemId={selectedItemForQuiz.id} className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-[10px] text-[#45694f] font-bold tracking-wider">
                    {selectedItemForQuiz.category === 'bow' ? '🏹 활 부품 복원 수수께끼' : '🎯 화살 부품 복원 수수께끼'}
                  </span>
                  <h3 className="text-lg font-black text-[#3f3026]">
                    {selectedItemForQuiz.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForQuiz(null)}
                className="text-xs text-[#807260] hover:text-[#3f3026] flex items-center gap-1 font-bold"
              >
                <span>전체 보기</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hint & Lore Box */}
            <div className="bg-[#eee8dc] rounded-xl p-3 text-xs leading-relaxed text-[#3f3026]">
              <div className="font-bold text-[#b58343] mb-1">💡 궁사의 지혜 / 전시 힌트</div>
              <p>{selectedItemForQuiz.hint}</p>
              <p className="mt-1.5 pt-1.5 border-t border-[#ded5c5] text-[#807260]">
                {selectedItemForQuiz.lore}
              </p>
            </div>

            {/* Question Text */}
            <div className="bg-[#fffdf7] border border-[#ded5c5] rounded-2xl p-4 shadow-xs">
              <h4 className="font-bold text-sm sm:text-base text-[#3f3026] mb-3 leading-snug">
                {selectedItemForQuiz.quizQuestion}
              </h4>

              {/* 1. TYPE: CHOICE */}
              {selectedItemForQuiz.quizType === 'choice' && selectedItemForQuiz.choiceOptions && (
                <div className="space-y-2">
                  {selectedItemForQuiz.choiceOptions.map((opt, idx) => {
                    const isSelected = choiceAnswer === String(idx);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e9efdf] border-[#45694f] text-[#3f3026] font-bold shadow-xs'
                            : 'bg-[#fffdf7] border-[#ded5c5] hover:bg-[#f7f2e8] text-[#3f3026]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="choice-quiz"
                          value={String(idx)}
                          checked={isSelected}
                          onChange={() => {
                            sound.playClick();
                            setChoiceAnswer(String(idx));
                          }}
                          className="mt-0.5 accent-[#45694f]"
                        />
                        <span>{idx + 1}. {opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 2. TYPE: OX STATEMENTS */}
              {selectedItemForQuiz.quizType === 'ox' && selectedItemForQuiz.oxStatements && (
                <div className="space-y-3">
                  {selectedItemForQuiz.oxStatements.map((stmt, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#f7f2e8] border border-[#ded5c5] flex flex-col gap-2">
                      <p className="text-xs sm:text-sm text-[#3f3026] font-medium leading-relaxed">
                        <strong className="text-[#45694f] mr-1.5 font-bold">문항 {idx + 1}.</strong>
                        {stmt}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {['O', 'X'].map(val => {
                          const isChecked = oxAnswers[idx] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                const next = [...oxAnswers];
                                next[idx] = val;
                                setOxAnswers(next);
                              }}
                              className={`py-2 rounded-xl border font-black text-base flex items-center justify-center transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-[#45694f] text-white border-[#45694f] shadow-sm'
                                  : 'bg-[#fffdf7] text-[#3f3026] border-[#ded5c5] hover:bg-[#eee8dc]'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. TYPE: DRAG / MATCHING SLOTS */}
              {selectedItemForQuiz.quizType === 'drag' && selectedItemForQuiz.dragSlots && selectedItemForQuiz.dragTokens && (
                <div className="space-y-3">
                  <p className="text-[11px] text-[#807260] mb-1">
                    아래 부재 조각을 터치하여 각 슬롯에 순서대로 채워 넣으세요:
                  </p>

                  {/* Target Slots */}
                  <div className="space-y-2">
                    {selectedItemForQuiz.dragSlots.map((slot, sIdx) => {
                      const filledKey = dragSlotValues[sIdx];
                      const tokenObj = selectedItemForQuiz.dragTokens?.find(t => t.key === filledKey);
                      return (
                        <div key={sIdx} className="flex items-center gap-2">
                          <span className="w-12 text-center text-xs font-bold text-[#45694f] shrink-0">
                            {slot.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (filledKey) {
                                sound.playClick();
                                const next = [...dragSlotValues];
                                next[sIdx] = '';
                                setDragSlotValues(next);
                              }
                            }}
                            className={`flex-1 min-h-[44px] p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                              filledKey
                                ? 'bg-[#e9efdf] border-[#45694f] text-[#3f3026] font-bold shadow-xs'
                                : 'bg-[#eee8dc] border-dashed border-[#a89b83] text-[#807260]'
                            }`}
                          >
                            <span>{tokenObj ? tokenObj.text : slot.placeholder}</span>
                            {filledKey && <span className="text-[10px] text-[#45694f]">✕ 취소</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Token Bank */}
                  <div className="mt-3 p-3 bg-[#eee8dc] rounded-2xl border border-[#ded5c5]">
                    <h5 className="text-[11px] font-bold text-[#807260] mb-2">선택 가능한 조각:</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedItemForQuiz.dragTokens.map(token => {
                        const isUsed = dragSlotValues.includes(token.key);
                        return (
                          <button
                            key={token.key}
                            type="button"
                            disabled={isUsed}
                            onClick={() => {
                              sound.playClick();
                              const emptyIdx = dragSlotValues.findIndex(v => !v);
                              if (emptyIdx !== -1) {
                                const next = [...dragSlotValues];
                                next[emptyIdx] = token.key;
                                setDragSlotValues(next);
                              }
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                              isUsed
                                ? 'opacity-30 border-dashed border-[#cabeab] bg-transparent cursor-not-allowed'
                                : 'bg-[#fffdf7] border-[#cabeab] text-[#3f3026] hover:border-[#45694f] shadow-xs cursor-pointer'
                            }`}
                          >
                            {token.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Message */}
              {quizFeedbackMessage && (
                <div className={`mt-3 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  isWrongAnswer
                    ? 'bg-[#fdf2f2] border border-[#e05252] text-[#c53030]'
                    : 'bg-[#e9efdf] border border-[#45694f] text-[#45694f]'
                }`}>
                  {isWrongAnswer ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{quizFeedbackMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitAnswer}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#45694f] hover:bg-[#34523c] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>답안 제출하고 부품 획득하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= COMPONENT GRID (Friend's 2-column museum collection) ================= */}
        {!selectedItemForQuiz && (
          <div className="flex flex-col gap-3">
            {/* Category Tabs: Bow (4) vs Arrow (3) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveCategory('bow');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCategory === 'bow'
                    ? 'bg-[#45694f] text-white border-[#45694f] shadow'
                    : 'bg-[#fffdf7] text-[#3f3026] border-[#ded5c5] hover:bg-[#f7f2e8]'
                }`}
              >
                <span>🏹 활의 4대 부품</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === 'bow' ? 'bg-white/20' : 'bg-[#eee8dc]'
                }`}>
                  {collectedIds.filter(id => BOW_ARROW_DATA.find(d => d.id === id)?.category === 'bow').length} / 4
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveCategory('arrow');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCategory === 'arrow'
                    ? 'bg-[#45694f] text-white border-[#45694f] shadow'
                    : 'bg-[#fffdf7] text-[#3f3026] border-[#ded5c5] hover:bg-[#f7f2e8]'
                }`}
              >
                <span>🎯 화살의 3대 부품</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === 'arrow' ? 'bg-white/20' : 'bg-[#eee8dc]'
                }`}>
                  {collectedIds.filter(id => BOW_ARROW_DATA.find(d => d.id === id)?.category === 'arrow').length} / 3
                </span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3">
              {BOW_ARROW_DATA.filter(item => item.category === activeCategory).map(item => {
                const owned = isItemOwned(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenQuiz(item)}
                    className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border transition-all text-center cursor-pointer min-h-[175px] ${
                      owned
                        ? 'bg-[#f4f7ed] border-[#9bae91] shadow-xs hover:border-[#45694f]'
                        : 'bg-[#fffdf7] border-[#ded5c5] hover:border-[#b58343] shadow-xs'
                    }`}
                  >
                    <div className={`w-16 h-16 flex items-center justify-center my-1 transition-all ${
                      owned ? 'scale-105' : 'grayscale opacity-40'
                    }`}>
                      <ItemIcon itemId={item.id} className="w-14 h-14" />
                    </div>

                    <div className="w-full mt-1">
                      <div className="font-bold text-sm text-[#3f3026]">{item.name}</div>
                      <div className={`text-[11px] mt-1 font-medium ${
                        owned ? 'text-[#45694f] font-bold' : 'text-[#807260]'
                      }`}>
                        {owned ? '✓ 획득 완료' : '미획득 (터치하여 풀기)'}
                      </div>
                    </div>

                    {owned && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#45694f] text-white flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ASSEMBLE & BLAST WHEN 7/7 COLLECTED ================= */}
        {isAllCollected && (
          <div className="bg-[#f4f7ed] border-2 border-[#45694f] rounded-2xl p-4 text-center shadow-lg animate-in zoom-in-95 duration-500 mt-2">
            <div className="flex items-center justify-center gap-2 text-[#45694f] font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-[#b58343] animate-spin-slow" />
              <span>7대 신궁 부품 수집 100% 완성!</span>
            </div>
            <h3 className="text-base font-black text-[#3f3026] mb-2">
              선사 신궁과 화살이 완벽히 조립되었습니다!
            </h3>
            <p className="text-xs text-[#807260] mb-3 leading-relaxed">
              신궁의 시위를 당겨 무너져 내린 동굴 입구 바위의 균열을 조준하여 산산조각 내고 탈출하세요!
            </p>
            <button
              onClick={handleTriggerShoot}
              disabled={isShootingAnimation}
              className="w-full py-3.5 px-4 rounded-xl bg-[#45694f] hover:bg-[#34523c] text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>🏹 신궁 조준 & 바위 격파 발사!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================= AUTHENTIC FRIEND'S REWARD MODAL (reward_751042de.css) ================= */}
      {rewardItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="relative w-full max-w-[360px] border border-[#d5b77d] rounded-[28px] p-6 sm:p-8 bg-radial from-[#fff9e9] via-[#f5ebd6] to-[#ecdfc5] text-[#3f3026] text-center shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Top kicker */}
            <p className="text-[10px] tracking-[2px] font-bold text-[#8e6b38] uppercase mb-2">
              탐험의 조각을 찾았어요
            </p>

            {/* Title */}
            <h2 className="text-3xl font-black text-[#3f3026] tracking-tight leading-tight mb-3">
              정답!
            </h2>

            {/* Item Stage with Halo & Floating Sparkles */}
            <div className="relative flex items-center justify-center h-[210px] my-1">
              {/* Circular Halo */}
              <div className="absolute w-[160px] h-[160px] rounded-full bg-radial from-[#ffe3a1] via-[#e8c975]/30 to-transparent" />
              <div className="absolute w-[140px] h-[140px] rounded-full border border-[#c9a76a]/60 flex items-center justify-center">
                <div className="w-[120px] h-[120px] rounded-full border border-dashed border-[#c9a76a]/70" />
              </div>

              {/* 7 Floating Sparkles */}
              <span className="absolute left-[20%] top-[20%] text-[#b58b3f] text-base animate-pulse">✦</span>
              <span className="absolute right-[20%] top-[18%] text-[#b58b3f] text-xs animate-ping">✦</span>
              <span className="absolute left-[15%] bottom-[30%] text-[#b58b3f] text-sm animate-pulse delay-200">✦</span>
              <span className="absolute right-[15%] bottom-[25%] text-[#b58b3f] text-base animate-pulse delay-500">✦</span>
              <span className="absolute left-[30%] bottom-[12%] text-[#b58b3f] text-xs animate-ping delay-700">✦</span>
              <span className="absolute right-[30%] bottom-[10%] text-[#b58b3f] text-xs animate-pulse delay-300">✦</span>
              <span className="absolute top-[8%] text-[#b58b3f] text-sm animate-pulse delay-100">✦</span>

              {/* Reward Item Illustration */}
              <div className="relative z-10 w-36 h-36 flex items-center justify-center drop-shadow-xl animate-bounce duration-1000">
                <ItemIcon itemId={rewardItem.id} className="w-28 h-28" />
              </div>
            </div>

            {/* Reward Seal */}
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#45694f] mb-6">
              ✦ {rewardItem.name} 획득 ✦
            </p>

            {/* Action Return Button */}
            <button
              type="button"
              onClick={handleNextQuiz}
              className="w-full min-h-[52px] rounded-xl bg-[#45694f] hover:bg-[#34523c] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {collectedCount < totalCount ? (
                <>
                  <span>다음 수수께끼 풀기</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>신궁 완성 및 격파하러 가기</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= SHOOTING & ROCK SHATTER ANIMATION ================= */}
      {isShootingAnimation && (
        <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4 select-none">
          <div className="relative w-full max-w-md flex flex-col items-center text-center">
            <div className={`transition-all duration-700 ${boulderCracked ? 'scale-125 opacity-0' : 'scale-100 opacity-100'}`}>
              <div className="w-24 h-24 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center animate-ping">
                <ItemIcon itemId="divine_bow" className="w-16 h-16 text-amber-200" />
              </div>
              <h2 className="text-xl font-black text-amber-200 mt-4 animate-pulse">
                🏹 선사 신궁 발사!!
              </h2>
              <p className="text-xs text-amber-100/80 mt-1">
                신비한 황금빛 화살이 무너진 바위 장벽의 균열로 날아갑니다!
              </p>
            </div>

            {boulderCracked && (
              <div className="animate-in zoom-in duration-500 flex flex-col items-center">
                <div className="text-5xl my-2">💥</div>
                <h2 className="text-2xl font-black text-white drop-shadow-[0_0_15px_#ffe066]">
                  콰과과광——!!
                </h2>
                <p className="text-sm font-bold text-amber-300 mt-2">
                  무너져 내렸던 거대한 바위들이 산산조각나며 동굴 출구가 열렸습니다!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
