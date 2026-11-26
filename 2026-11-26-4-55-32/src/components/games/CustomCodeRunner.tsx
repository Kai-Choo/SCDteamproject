import React, { useRef, useState } from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { CustomCodeConfig, GameId } from '../../types/game';
import { RefreshCw, ExternalLink, Code2 } from 'lucide-react';

interface CustomCodeRunnerProps {
  gameId: GameId;
  config: CustomCodeConfig;
  onOpenEditor: () => void;
}

export const CustomCodeRunner: React.FC<CustomCodeRunnerProps> = ({
  gameId,
  config,
  onOpenEditor
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const isAiStudioEditorUrl =
    config.sourceType === 'iframe-url' &&
    /^https?:\/\/(aistudio\.google\.com|ai\.studio)\/apps\//i.test(config.iframeUrl.trim());

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-full min-h-[520px] flex flex-col bg-[#FAF7F2] rounded-2xl border border-[#E3D9C8] overflow-hidden">
      {/* Top Runner Utility Bar */}
      <div className="px-4 py-2.5 bg-[#F2ECE1] border-b border-[#DACBB9] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-[#3B2C1F] truncate">
            {config.sourceType === 'iframe-url' ? '외부 게임 링크 연동' : '커스텀 코드 실행기'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {config.sourceType === 'iframe-url' && config.iframeUrl && (
            <a
              href={config.iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-semibold text-[#594635] bg-white hover:bg-[#EFE6D5] rounded-md transition-colors border border-[#DACBB9] flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>새 창에서 열기</span>
            </a>
          )}
          {!isAiStudioEditorUrl && (
            <button
              onClick={handleReload}
              className="p-1.5 text-xs text-[#594635] hover:bg-[#E2D6C5] rounded-md transition-colors border border-[#DACBB9] flex items-center gap-1 cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다시 로드</span>
            </button>
          )}
          <button
            onClick={onOpenEditor}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-[#B45309] hover:bg-[#9A4204] rounded-md transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>코드/링크 변경</span>
          </button>
        </div>
      </div>

      {/* Runner Stage */}
      <div className="flex-1 relative bg-white">
        {config.sourceType === 'iframe-url' ? (
          config.iframeUrl ? (
            isAiStudioEditorUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-gradient-to-b from-[#EAF6FC] via-[#F7F3EB] to-[#EFE6D5]">
                <div className="max-w-lg w-full bg-[#FFFDF9] rounded-3xl border-3 border-[#C8B296] shadow-xl p-5 sm:p-6 space-y-4">
                  {gameId === 'escape-room' && (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#DECDB8] shadow-sm bg-[#CBE8F6]">
                      <img
                        src={publicAsset('/assets/thumbnails/escape_room_game.png')}
                        alt="고강선사유적체험관 탈출하기"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#451A03]">
                      연결된 Google AI Studio 게임 열기
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B5440] leading-relaxed">
                      AI Studio 프로젝트 링크(<code className="px-1 py-0.5 bg-[#F2ECE1] rounded text-[11px]">ai.studio/apps/...</code>)는 보안 정책상 창 내부 삽입이 차단되어 아래 버튼으로 바로 실행할 수 있습니다.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <a
                      href={config.iframeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 text-sm font-bold text-white btn-wood rounded-2xl flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>방탈출 게임 바로 실행하기</span>
                    </a>
                    <button
                      type="button"
                      onClick={onOpenEditor}
                      className="py-3 px-4 text-xs sm:text-sm font-bold text-[#5C442E] bg-[#EFE6D5] hover:bg-[#E4D7C1] rounded-2xl border border-[#D4C2AA] transition-colors cursor-pointer"
                    >
                      실행 URL / 코드 바꾸기
                    </button>
                  </div>

                  <p className="text-[11px] text-[#8B735B] bg-[#F7F1E5] p-3 rounded-xl border border-[#E5D7C3] text-left leading-relaxed">
                    <strong>이 화면 안에서 바로 실행하려면:</strong> 해당 AI Studio 앱 우측 상단 <strong>Share / Deploy</strong>로 생성된 앱 실행 URL(예: <code className="bg-white px-1 rounded">https://ais-pre-...run.app</code>)을 연결하거나, 소스 파일을 이 프로젝트에 직접 가져오면 됩니다.
                  </p>
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={config.iframeUrl}
                className="w-full h-full border-0"
                title="Custom Game Frame"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#FAF7F2]">
              <div className="w-12 h-12 rounded-full bg-[#FCE8D5] text-[#B45309] flex items-center justify-center mb-3">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#3B2C1F] mb-1">
                연결된 외부 URL이 없습니다
              </h4>
              <p className="text-xs text-[#705D4A] max-w-sm mb-4">
                상단의 [코드/링크 변경] 버튼을 눌러 연동하실 웹 게임의 URL 주소를 입력해주세요.
              </p>
              <button
                onClick={onOpenEditor}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#B45309] rounded-lg shadow-xs cursor-pointer"
              >
                URL 입력하기
              </button>
            </div>
          )
        ) : (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            srcDoc={config.htmlCode}
            className="w-full h-full border-0"
            title="Custom HTML Game Frame"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}
      </div>
    </div>
  );
};
