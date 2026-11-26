import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { sound } from '../utils/audio';

import artifactImg from '../assets/images/bandaldolkal_artifact_1790924689859.jpg';
import potteryImg from '../assets/images/mumun_pottery_harvest_1790924701235.jpg';

interface LoreModalProps {
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl text-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
          <BookOpen className="w-4 h-4" />
          <span>청동기 시대 역사와 도구</span>
        </div>

        <h2 className="font-traditional text-2xl md:text-3xl font-bold text-stone-100 mb-4">
          반달돌칼과 고대인의 풍년 수확
        </h2>

        {/* Section 1: 반달돌칼 유물 사진 및 설명 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
          <div className="w-full sm:w-44 h-40 shrink-0 rounded-lg overflow-hidden border border-stone-800">
            <img
              src={artifactImg}
              alt="반달돌칼 유물"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs space-y-2 leading-relaxed text-stone-300">
            <strong className="text-sm font-traditional text-amber-300 block">
              왜 굳이 반달 모양의 돌칼을 썼을까?
            </strong>
            <p>
              한국의 청동기 시대(기원전 15세기~기원전 3세기)에는 벼농사가 본격화되었습니다. 
              하지만 당시의 청동은 매우 귀한 금속으로 지배층의 의기(청동검, 청동거울)에만 쓰였고, 
              농민들은 여전히 고도로 발달한 <strong>마제 석기(간석기)</strong>를 만들어 사용했습니다.
            </p>
            <p>
              반달돌칼은 가운데 뚫린 두 개의 구멍에 끈을 꿰어 집게손가락이나 가운데손가락에 건 뒤 손바닥으로 쥐었습니다.
            </p>
          </div>
        </div>

        {/* Section 2: 이삭따기 수확 기법 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
          <div className="w-full sm:w-44 h-40 shrink-0 rounded-lg overflow-hidden border border-stone-800 order-last sm:order-first">
            <img
              src={potteryImg}
              alt="민무늬 토기와 수확된 곡식"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs space-y-2 leading-relaxed text-stone-300">
            <strong className="text-sm font-traditional text-amber-300 block">
              이삭따기(穗摘)의 과학적 지혜
            </strong>
            <p>
              현대의 콤바인이나 철기 시대의 낫은 줄기를 밑동부터 베어내지만, 
              고대 품종의 벼와 조는 이삭마다 익는 시기가 제각각이었습니다.
            </p>
            <p>
              따라서 줄기를 통째로 베지 않고, <strong>매일매일 가장 알차게 여문 이삭만을 골라 콕 집어 따내는</strong> 이삭따기를 통해 낟알이 땅에 떨어져 버려지는 손실을 극적으로 줄였습니다.
            </p>
          </div>
        </div>

        {/* Section 3: 주요 수확 곡물 */}
        <div className="mb-4">
          <h3 className="font-traditional text-base font-bold text-stone-200 mb-2">
            게임에 등장하는 청동기 시대 4대 곡물
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-amber-400 font-bold block mb-1">벼 (쌀)</span>
              <p className="text-[11px] text-stone-400">송국리 유적에서 탄화미로 다수 발굴된 주곡 작물</p>
            </div>
            <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-yellow-300 font-bold block mb-1">보리</span>
              <p className="text-[11px] text-stone-400">긴 수염(까락)이 있으며 척박한 가뭄에 강한 식량</p>
            </div>
            <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-orange-400 font-bold block mb-1">조와 기장</span>
              <p className="text-[11px] text-stone-400">작고 단단한 알갱이가 촘촘히 열리는 오랜 전통 오곡</p>
            </div>
            <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
              <span className="text-red-400 font-bold block mb-1">붉은 수수</span>
              <p className="text-[11px] text-stone-400">붉은 색감의 알곡으로 흉년을 이겨내게 한 구황작물</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
