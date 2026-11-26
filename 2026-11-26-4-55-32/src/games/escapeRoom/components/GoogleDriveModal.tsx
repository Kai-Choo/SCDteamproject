import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { sound } from '../services/soundService';
import { GameSaveData } from '../types/game';
import {
  initDriveAuth,
  signInWithGoogleDrive,
  logoutDrive,
  getDriveAccessToken,
  listDriveFiles,
  uploadSaveDataToDrive,
  uploadReportToDrive,
  downloadFileContent,
  deleteFileFromDrive,
  DriveFileItem
} from '../services/googleDriveService';
import {
  Cloud,
  FileText,
  UploadCloud,
  DownloadCloud,
  Trash2,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  HardDrive
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGameData: GameSaveData;
  onLoadGameData: (data: GameSaveData) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentGameData,
  onLoadGameData
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isFetchingFiles, setIsFetchingFiles] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Destructive delete & load confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [fileToLoad, setFileToLoad] = useState<DriveFileItem | null>(null);

  // Load auth state
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (authedUser, authedToken) => {
        setUser(authedUser);
        setToken(authedToken);
        loadFiles();
      },
      () => {
        setUser(null);
        setToken(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const loadFiles = async () => {
    if (!getDriveAccessToken()) return;
    setIsFetchingFiles(true);
    try {
      const driveFiles = await listDriveFiles();
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
      showToast(err.message || '파일 목록을 가져오지 못했습니다.', 'error');
    } finally {
      setIsFetchingFiles(false);
    }
  };

  const handleLogin = async () => {
    sound.playClick();
    setIsLoading(true);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        sound.playSuccess();
        showToast(`환영합니다, ${res.user.displayName || '탐험가'}님! Google Drive가 연결되었습니다.`);
        loadFiles();
      }
    } catch (err: any) {
      sound.playError();
      showToast(err.message || '로그인 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    await logoutDrive();
    setUser(null);
    setToken(null);
    setFiles([]);
    showToast('Google 계정에서 로그아웃했습니다.');
  };

  // 1. Save game progress to Drive
  const handleSaveProgress = async () => {
    sound.playClick();
    if (!token) return;
    setIsLoading(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '');
      const fileName = `고강동_선사유적_탐험저장_${dateStr}_${timeStr}.json`;

      await uploadSaveDataToDrive(fileName, currentGameData);
      sound.playSuccess();
      showToast(`✓ Google Drive에 [${fileName}] 저장을 완료했습니다!`);
      loadFiles();
    } catch (err: any) {
      sound.playError();
      showToast(err.message || '저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Export archaeological report to Drive
  const handleExportReport = async () => {
    sound.playClick();
    if (!token) return;
    setIsLoading(true);
    try {
      const dateStr = new Date().toLocaleDateString('ko-KR');
      const timeElapsed = `${Math.floor(currentGameData.playTimeSeconds / 60)}분 ${currentGameData.playTimeSeconds % 60}초`;
      
      const reportLines = [
        '====================================================',
        '🏛️ 부천 고강동 선사유적 학술 탐사 발굴 보고서',
        '====================================================',
        `발굴 일자: ${dateStr}`,
        `탐사 소요 시간: ${timeElapsed}`,
        `조사원 성명: ${user?.displayName || currentGameData.playerName}`,
        `조사원 이메일: ${user?.email || 'N/A'}`,
        `현재 도달 단계: ${currentGameData.currentStage}`,
        '----------------------------------------------------',
        '🏺 수집된 선사 유물 목록 (Inventory):',
        currentGameData.inventory.length === 0
          ? '  - (현재 인벤토리가 비어 있습니다)'
          : currentGameData.inventory.map((item, idx) => `  ${idx + 1}. [${item.name}] (${item.category}): ${item.description}`).join('\n'),
        '----------------------------------------------------',
        '📜 확인된 고고학 단서 (Archaeological Clues):',
        currentGameData.clues.length === 0
          ? '  - (단서 없음)'
          : currentGameData.clues.map((clue, idx) => `  ${idx + 1}. [${clue.title}] (${clue.timestamp || '선사시대'}): ${clue.content}`).join('\n'),
        '----------------------------------------------------',
        '부천 고강동 선사유적(기원전 1000년) 대탈출 탐사 완료 인증문',
        '===================================================='
      ].join('\n');

      const fileName = `부천_고강동_선사유적_발굴보고서_${new Date().toISOString().slice(0, 10)}.txt`;
      await uploadReportToDrive(fileName, reportLines);
      sound.playSuccess();
      showToast(`✓ 학술 발굴 보고서가 Google Drive에 생성되었습니다!`);
      loadFiles();
    } catch (err: any) {
      sound.playError();
      showToast(err.message || '보고서 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Load Save from Drive
  const handleLoadFile = (file: DriveFileItem) => {
    sound.playClick();
    if (!file.name.endsWith('.json')) {
      showToast('세이브 파일(.json)만 게임 진행 상태로 복원할 수 있습니다.', 'error');
      return;
    }
    setFileToLoad(file);
  };

  const confirmLoadFile = async () => {
    if (!fileToLoad) return;
    const targetFile = fileToLoad;
    setFileToLoad(null);
    setIsLoading(true);
    try {
      const content = await downloadFileContent(targetFile.id);
      const parsedData: GameSaveData = JSON.parse(content);

      if (!parsedData.currentStage || !Array.isArray(parsedData.inventory)) {
        throw new Error('유효한 고강동 선사유적 세이브 파일 형식이 아닙니다.');
      }

      onLoadGameData(parsedData);
      sound.playSuccess();
      showToast(`✓ [${targetFile.name}] 데이터를 성공적으로 복원했습니다!`);
      onClose();
    } catch (err: any) {
      sound.playError();
      showToast(err.message || '파일 불러오기에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Delete File (Confirmed via dialog per MANDATORY guidelines)
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    sound.playClick();
    setIsLoading(true);
    try {
      await deleteFileFromDrive(fileToDelete.id);
      sound.playSuccess();
      showToast(`✓ [${fileToDelete.name}] 파일을 Google Drive에서 삭제했습니다.`);
      setFileToDelete(null);
      loadFiles();
    } catch (err: any) {
      sound.playError();
      showToast(err.message || '파일 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#fbf9f4] border-2 border-[#b58343] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-serif text-[#3f3026]">
        {/* ================= HEADER ================= */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#efe7d8] via-[#f7f2e8] to-[#efe7d8] border-b border-[#ded5c5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#45694f] text-white flex items-center justify-center shadow-sm">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#3f3026] leading-none">
                Google Drive 클라우드 연동
              </h3>
              <p className="text-[11px] text-[#807260] mt-1 font-sans">
                부천 고강동 선사유적 탐험 진행상황 저장 및 발굴 보고서 보관
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#ded5c5] text-[#807260] hover:text-[#3f3026] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Toast feedback */}
          {feedbackMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-sans font-bold flex items-center gap-2 shadow-xs animate-in fade-in ${
                feedbackMessage.type === 'success'
                  ? 'bg-[#e9efdf] border border-[#45694f] text-[#45694f]'
                  : 'bg-[#fdf2f2] border border-[#e05252] text-[#c53030]'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#45694f]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#c53030]" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* User Sign-In Box */}
          {!user ? (
            <div className="bg-[#fffdf7] border border-[#ded5c5] rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#eee8dc] flex items-center justify-center text-[#45694f]">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#3f3026]">
                  Google Drive에 연결하세요
                </h4>
                <p className="text-xs text-[#807260] mt-1 max-w-sm font-sans leading-relaxed">
                  Google 계정으로 로그인하면 언제 어디서든 게임 진행 상황을 클라우드에 백업하고, 선사유적 발굴 보고서를 저장할 수 있습니다.
                </p>
              </div>

              {/* Official Google Sign In Button (Required format) */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-full shadow-sm text-sm font-sans font-bold text-stone-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Google 계정으로 로그인</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Connected User Profile */}
              <div className="bg-[#fffdf7] border border-[#ded5c5] rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User Avatar" className="w-10 h-10 rounded-full border border-amber-400" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#45694f] text-white flex items-center justify-center font-bold">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#3f3026] flex items-center gap-1.5">
                      <span>{user.displayName || '탐험가'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e9efdf] text-[#45694f] font-sans">
                        연결됨
                      </span>
                    </div>
                    <div className="text-[11px] text-[#807260] font-sans">{user.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-xl border border-[#ded5c5] hover:bg-[#eee8dc] text-[#807260] hover:text-[#3f3026] text-xs font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>

              {/* Action Buttons: Save & Export */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSaveProgress}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-[#45694f] to-[#34523c] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4 shrink-0" />
                  <span>진행 상황 Drive에 백업</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleExportReport}
                  className="p-3.5 rounded-2xl bg-[#fffdf7] border-2 border-[#b58343] text-[#8e6b38] font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-[#f7f2e8] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>발굴 보고서 문서 내보내기</span>
                </button>
              </div>

              {/* Google Drive Saved Files List */}
              <div className="bg-[#fffdf7] border border-[#ded5c5] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#ded5c5] mb-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-[#45694f]" />
                    <h4 className="text-xs sm:text-sm font-black text-[#3f3026]">
                      Google Drive 보관 파일 ({files.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={loadFiles}
                    disabled={isFetchingFiles}
                    className="p-1 rounded-lg hover:bg-[#eee8dc] text-[#807260] hover:text-[#3f3026] text-xs font-sans flex items-center gap-1 cursor-pointer"
                    title="새로고침"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFiles ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                </div>

                {isFetchingFiles ? (
                  <div className="py-8 text-center text-xs text-[#807260] font-sans">
                    Google Drive 파일 목록을 불러오는 중...
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#807260] font-sans">
                    저장된 고강동 선사유적 백업 파일이 없습니다. 상단의 '진행 상황 Drive에 백업' 버튼을 눌러보세요!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {files.map(file => {
                      const isJson = file.name.endsWith('.json') || file.mimeType === 'application/json';
                      return (
                        <div
                          key={file.id}
                          className="p-2.5 rounded-xl border border-[#ded5c5] bg-[#fbf9f4] hover:bg-[#f7f2e8] flex items-center justify-between gap-2 transition-colors font-sans text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isJson ? (
                              <FileCode className="w-5 h-5 text-amber-700 shrink-0" />
                            ) : (
                              <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-[#3f3026] truncate">{file.name}</p>
                              <p className="text-[10px] text-[#807260]">
                                {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('ko-KR') : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isJson && (
                              <button
                                type="button"
                                onClick={() => handleLoadFile(file)}
                                className="px-2.5 py-1 rounded-lg bg-[#45694f] hover:bg-[#34523c] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                                title="이 세이브 데이터 불러오기"
                              >
                                <DownloadCloud className="w-3 h-3" />
                                <span>불러오기</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setFileToDelete(file)}
                              className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ================= MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS ================= */}
        {fileToDelete && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#fffdf7] border-2 border-red-500 rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl font-sans">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-stone-900 mb-1">
                파일을 삭제하시겠습니까?
              </h4>
              <p className="text-xs text-stone-600 mb-2 leading-relaxed">
                Google Drive에서 <strong>[{fileToDelete.name}]</strong> 파일을 영구 삭제합니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFile}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  삭제 확인
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================= CONFIRMATION DIALOG FOR LOADING SAVE DATA ================= */}
        {fileToLoad && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#fffdf7] border-2 border-[#45694f] rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl font-sans">
              <div className="w-12 h-12 rounded-full bg-[#e9efdf] text-[#45694f] mx-auto flex items-center justify-center mb-3">
                <DownloadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-stone-900 mb-1">
                세이브 데이터를 불러올까요?
              </h4>
              <p className="text-xs text-stone-600 mb-2 leading-relaxed">
                Google Drive의 <strong>[{fileToLoad.name}]</strong> 기록을 불러오면 현재 진행 중인 탐험 상태가 교체됩니다.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setFileToLoad(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={confirmLoadFile}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#45694f] hover:bg-[#34523c] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  불러오기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
