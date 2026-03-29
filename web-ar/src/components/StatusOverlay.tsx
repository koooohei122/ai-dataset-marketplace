// StatusOverlay.tsx
// AR ステータス・ガイドテキストを画面上部に表示する。

import React from 'react';
import type { ARStatus } from '../hooks/useARScene';

interface Props {
  status: ARStatus;
  fps: number;
  showDebug: boolean;
  isDebugMode: boolean;
  isOcclusionEnabled: boolean;
}

const STATUS_MESSAGES: Record<ARStatus, string> = {
  idle: 'camera ready',
  starting: 'starting...',
  ready: 'ready',
  searching: '🔍 marker.jpg をカメラに映してください',
  found: '✅ target found',
  error: '❌ error — please reload',
};

const STATUS_COLORS: Record<ARStatus, string> = {
  idle: '#888',
  starting: '#aaa',
  ready: '#4cf',
  searching: '#fc4',
  found: '#4f4',
  error: '#f44',
};

export const StatusOverlay: React.FC<Props> = ({
  status,
  fps,
  showDebug,
  isDebugMode,
  isOcclusionEnabled,
}) => {
  return (
    <>
      {/* ステータス表示 */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.55)',
          color: STATUS_COLORS[status],
          padding: '6px 16px',
          borderRadius: 24,
          fontSize: 14,
          fontFamily: 'system-ui, sans-serif',
          whiteSpace: 'nowrap',
          zIndex: 10,
          userSelect: 'none',
        }}
      >
        {STATUS_MESSAGES[status]}
        {isDebugMode && (
          <span style={{ color: '#fa0', marginLeft: 8 }}>[DEBUG]</span>
        )}
      </div>

      {/* デバッグ情報 */}
      {showDebug && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 8,
            background: 'rgba(0,0,0,0.6)',
            color: '#0f0',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            zIndex: 10,
            lineHeight: 1.6,
          }}
        >
          <div>FPS: {Math.round(fps)}</div>
          <div>status: {status}</div>
          <div>occlusion: {isOcclusionEnabled ? 'ON' : 'OFF'}</div>
          <div>mode: {isDebugMode ? 'fixed-anchor' : 'image-track'}</div>
        </div>
      )}
    </>
  );
};
