// App.tsx
// 全体レイアウト・AR 開始制御を担当。

import React, { useState } from 'react';
import { ARView } from './components/ARView';

type AppState = 'start' | 'ar';

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      background: '#0a0a0f',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      gap: 24,
      padding: 24,
      boxSizing: 'border-box',
    }}
  >
    <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, textAlign: 'center' }}>
      Web AR Occlusion
    </h1>
    <p
      style={{
        color: '#888',
        fontSize: 15,
        textAlign: 'center',
        maxWidth: 320,
        lineHeight: 1.6,
      }}
    >
      カメラを起動し、<strong style={{ color: '#ccc' }}>marker.jpg</strong> を映すと
      3D キャラクターが出現します。人物や手を前に出すとキャラが隠れます。
    </p>

    <button
      onClick={onStart}
      style={{
        padding: '16px 48px',
        fontSize: 18,
        fontWeight: 600,
        borderRadius: 48,
        border: 'none',
        background: 'linear-gradient(135deg, #4cf, #46f)',
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '0 4px 24px rgba(64,192,255,0.35)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      Start AR
    </button>

    <div
      style={{
        marginTop: 16,
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 1.8,
      }}
    >
      <div>📱 スマホ: HTTPS 環境が必要です</div>
      <div>🖥 PC: localhost は HTTP で動作します</div>
      <div>🎯 targets.mind がない場合はデバッグモードで起動</div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('start');

  if (state === 'ar') {
    return (
      <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
        <ARView onStop={() => setState('start')} />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <StartScreen onStart={() => setState('ar')} />
    </div>
  );
};

export default App;
