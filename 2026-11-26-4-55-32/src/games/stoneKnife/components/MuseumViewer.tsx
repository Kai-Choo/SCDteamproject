import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createStoneKnifeMesh } from '../utils/threeHelpers';
import { sound } from '../utils/audio';
import { Info, RotateCw, Sparkles, BookOpen } from 'lucide-react';

interface Annotation {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  pos: THREE.Vector3;
}

const ANNOTATIONS: Annotation[] = [
  {
    id: 'edge',
    title: '연마된 인부 (刃部 · 날)',
    subtitle: '곡선형 마제 칼날',
    desc: '점판암을 정밀하게 숫돌로 갈아 만든 날입니다. 볏단을 통째로 베지 않고, 잘 익은 곡물의 이삭만을 골라 콕 집어 따내는 이삭따기(穗摘) 방식에 최적화되었습니다.',
    pos: new THREE.Vector3(0, -0.28, 0.15),
  },
  {
    id: 'holes',
    title: '유공 (有孔 · 끈 구멍)',
    subtitle: '마제 천공 기법',
    desc: '석기 중앙에 1~2개의 구멍을 뚫었습니다. 끈을 꿰어 가운데손가락이나 집게손가락에 걸치고 손바닥 안에 단단히 쥐고 작업할 수 있도록 설계된 인간공학적 도구입니다.',
    pos: new THREE.Vector3(-0.55, 0.28, 0.15),
  },
  {
    id: 'cord',
    title: '삼끈 (마섬유 결속 끈)',
    subtitle: '손가락 밀착용 끈',
    desc: '삼(대마)이나 칡 섬유를 꼬아 만든 끈으로, 손등이나 손가락에 걸면 칼을 놓치지 않고 수확할 수 있어 작업 능률을 획기적으로 높였습니다.',
    pos: new THREE.Vector3(0, 0.45, 0.25),
  },
  {
    id: 'material',
    title: '마제 점판암 (粘板岩)',
    subtitle: '청동기 석기의 정수',
    desc: '결을 따라 판 모양으로 얇게 쪼개지는 점판암이나 혈암을 채취하여, 정교하게 타제(깨뜨리기) 후 마제(갈기)하여 완성한 청동기 시대의 핵심 도구입니다.',
    pos: new THREE.Vector3(0.65, 0.15, 0.1),
  },
];

export const MuseumViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAnno, setSelectedAnno] = useState<Annotation | null>(ANNOTATIONS[0]);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [lightPreset, setLightPreset] = useState<'museum' | 'sunset'>('museum');

  const knifeRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Museum Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFEDD5, 2.8);
    dirLight.position.set(4, 6, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const rimLight = new THREE.DirectionalLight(0x94A3B8, 1.2);
    rimLight.position.set(-5, -3, -3);
    scene.add(rimLight);

    // Knife Model (Centered and scaled nicely)
    const knife = createStoneKnifeMesh();
    knife.scale.set(1.4, 1.4, 1.4);
    knife.position.set(0, 0, 0);
    scene.add(knife);
    knifeRef.current = knife;

    // Soft museum pedestal shadow plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -1.6;
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // Resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse drag rotation
    const onMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !knifeRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      knifeRef.current.rotation.y += dx * 0.008;
      knifeRef.current.rotation.x += dy * 0.008;
    };

    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isMouseDownRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isMouseDownRef.current || !knifeRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePosRef.current.x;
      const dy = e.touches[0].clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      knifeRef.current.rotation.y += dx * 0.008;
      knifeRef.current.rotation.x += dy * 0.008;
    };

    const onTouchEnd = () => {
      isMouseDownRef.current = false;
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // Render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (knifeRef.current && isAutoRotate && !isMouseDownRef.current) {
        knifeRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      scene.clear();
      renderer.dispose();
    };
  }, [isAutoRotate]);

  // Handle lighting toggle
  const toggleLight = (preset: 'museum' | 'sunset') => {
    setLightPreset(preset);
    sound.playClick();
    if (dirLightRef.current) {
      if (preset === 'sunset') {
        dirLightRef.current.color.setHex(0xF97316);
        dirLightRef.current.intensity = 3.2;
      } else {
        dirLightRef.current.color.setHex(0xFFEDD5);
        dirLightRef.current.intensity = 2.8;
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-stone-100 overflow-hidden">
      {/* 3D Viewport Zone */}
      <div ref={containerRef} className="relative flex-1 h-[55%] md:h-full cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Viewport Floating Controls */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 text-xs text-stone-300">
          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
          <span>마우스 또는 손가락으로 360° 회전</span>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-md p-1 rounded-lg border border-stone-800">
          <button
            onClick={() => {
              setIsAutoRotate(!isAutoRotate);
              sound.playClick();
            }}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              isAutoRotate ? 'bg-amber-600/30 text-amber-300 font-medium' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {isAutoRotate ? '자동 회전 중' : '회전 정지'}
          </button>
          <button
            onClick={() => toggleLight(lightPreset === 'museum' ? 'sunset' : 'museum')}
            className="px-2.5 py-1 text-xs rounded text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{lightPreset === 'museum' ? '박물관 조명' : '석양 빛'}</span>
          </button>
        </div>

        {/* Interactive Hotspot Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
          {ANNOTATIONS.map((anno) => {
            const isSelected = selectedAnno?.id === anno.id;
            return (
              <button
                key={anno.id}
                onClick={() => {
                  setSelectedAnno(anno);
                  sound.playClick();
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-md'
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                {anno.title.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Information Panel Zone */}
      <div className="w-full md:w-96 h-[45%] md:h-full bg-stone-900/90 border-t md:border-t-0 md:border-l border-stone-800/80 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
          <BookOpen className="w-4 h-4" />
          <span>청동기 시대 고고학 도감</span>
        </div>

        <h2 className="font-traditional text-2xl font-bold text-stone-100 mb-1">
          반달돌칼 (半月形石刀)
        </h2>
        <p className="text-xs text-stone-400 mb-4">
          기원전 약 15세기~기원전 3세기 · 한국 청동기 시대 대표 수확용 마제석기
        </p>

        {/* Selected Annotation Card */}
        {selectedAnno && (
          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="font-bold text-sm text-stone-200">{selectedAnno.title}</h3>
            </div>
            <p className="text-xs text-amber-400/90 mb-2">{selectedAnno.subtitle}</p>
            <p className="text-xs text-stone-300 leading-relaxed">{selectedAnno.desc}</p>
          </div>
        )}

        {/* Historical Insight Section */}
        <div className="mt-auto pt-4 border-t border-stone-800/80 text-xs text-stone-400 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-200 block mb-0.5">이삭따기(穗摘)란?</strong>
              곡식의 줄기째 베어내는 철기 시대의 낫과 달리, 반달돌칼은 가장 잘 여문 이삭만을 낱낱이 따내어 낟알 손실을 최소화하고 보관 기간을 늘리는 고대인의 지혜였습니다.
            </div>
          </div>
          <div className="text-[11px] text-stone-500 pt-1">
            출토 대표 유적: 충남 부여 송국리 유적, 경기 여주 흔암리 유적
          </div>
        </div>
      </div>
    </div>
  );
};
