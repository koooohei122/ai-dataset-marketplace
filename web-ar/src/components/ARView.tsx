// ARView.tsx
// AR レンダリングエリア全体を管理するコンポーネント。
// MindAR コンテナ + オクルージョンレイヤーを重ねる。

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useARScene, ARStatus } from '../hooks/useARScene';
import { useSegmentation } from '../hooks/useSegmentation';
import { OcclusionLayer } from './OcclusionLayer';
import { StatusOverlay } from './StatusOverlay';
import { ControlPanel } from './ControlPanel';
import { CONFIG } from '../config';

interface Props {
  onStop: () => void;
}

export const ARView: React.FC<Props> = ({ onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ---- AR ステート ----
  const [status, setStatus] = useState<ARStatus>('idle');
  const [fps, setFps] = useState(60);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // ---- UI トグル ----
  const [occlusionEnabled, setOcclusionEnabled] = useState<boolean>(CONFIG.segmentation.enabled);
  const [showCharacter, setShowCharacter] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(CONFIG.debug);

  // 低 FPS 時はオクルージョンを自動 OFF
  useEffect(() => {
    if (fps < CONFIG.performance.autoDisableOcclusionBelowFps && occlusionEnabled) {
      console.warn(`[ARView] FPS=${Math.round(fps)} → auto-disabling occlusion`);
      setOcclusionEnabled(false);
    }
  }, [fps, occlusionEnabled]);

  // targets.mind の有無でデバッグモード表示を切り替え
  useEffect(() => {
    setIsDebugMode(CONFIG.useFixedAnchor);
  }, []);

  const handleStatusChange = useCallback((s: ARStatus) => {
    setStatus(s);
    // targets.mind が見つからなかった場合は debug mode 表示
    if (s === 'found' && CONFIG.useFixedAnchor) setIsDebugMode(true);
  }, []);

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    setVideoEl(video);
  }, []);

  const handleFpsUpdate = useCallback((f: number) => {
    setFps(f);
  }, []);

  const { start } = useARScene({
    containerRef,
    showCharacter,
    onStatusChange: handleStatusChange,
    onVideoReady: handleVideoReady,
    onFpsUpdate: handleFpsUpdate,
  });

  // マウント時に AR を開始
  useEffect(() => {
    start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- セグメンテーション ----
  const segmentationEnabled = occlusionEnabled && videoEl !== null;
  const occlusionCanvasRef = useSegmentation({
    enabled: segmentationEnabled,
    videoEl,
    width: CONFIG.segmentation.inferenceWidth,
    height: CONFIG.segmentation.inferenceHeight,
  });

  const handleStop = useCallback(() => {
    onStop();
  }, [onStop]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* MindAR がここにカメラ映像 + Three.js canvas を注入する */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // MindAR が z-index を管理するため、ここでは指定しない
        }}
      />

      {/* 擬似オクルージョンレイヤー（最前面）*/}
      <OcclusionLayer
        canvasRef={occlusionCanvasRef}
        enabled={segmentationEnabled}
      />

      {/* ステータス表示 */}
      <StatusOverlay
        status={status}
        fps={fps}
        showDebug={showDebug}
        isDebugMode={isDebugMode}
        isOcclusionEnabled={occlusionEnabled}
      />

      {/* コントロールパネル */}
      <ControlPanel
        occlusionEnabled={occlusionEnabled}
        showCharacter={showCharacter}
        showDebug={showDebug}
        onToggleOcclusion={() => setOcclusionEnabled((v) => !v)}
        onToggleCharacter={() => setShowCharacter((v) => !v)}
        onToggleDebug={() => setShowDebug((v) => !v)}
        onStop={handleStop}
      />
    </div>
  );
};
