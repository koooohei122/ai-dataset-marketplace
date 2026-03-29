// ControlPanel.tsx
// 画面下部のトグルボタン群。モバイルでも押しやすいサイズにする。

import React from 'react';

interface Props {
  occlusionEnabled: boolean;
  showCharacter: boolean;
  showDebug: boolean;
  onToggleOcclusion: () => void;
  onToggleCharacter: () => void;
  onToggleDebug: () => void;
  onStop: () => void;
}

interface ToggleButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  active,
  onClick,
  activeColor = '#4cf',
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px',
      borderRadius: 24,
      border: `2px solid ${active ? activeColor : '#666'}`,
      background: active ? `${activeColor}22` : 'rgba(0,0,0,0.5)',
      color: active ? activeColor : '#999',
      fontSize: 13,
      fontFamily: 'system-ui, sans-serif',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      WebkitTapHighlightColor: 'transparent',
    }}
  >
    {label}
  </button>
);

export const ControlPanel: React.FC<Props> = ({
  occlusionEnabled,
  showCharacter,
  showDebug,
  onToggleOcclusion,
  onToggleCharacter,
  onToggleDebug,
  onStop,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 10,
        padding: '0 16px',
        maxWidth: '100%',
      }}
    >
      <ToggleButton
        label={`Occlusion ${occlusionEnabled ? 'ON' : 'OFF'}`}
        active={occlusionEnabled}
        onClick={onToggleOcclusion}
        activeColor="#f4c"
      />
      <ToggleButton
        label={`Char ${showCharacter ? 'ON' : 'OFF'}`}
        active={showCharacter}
        onClick={onToggleCharacter}
      />
      <ToggleButton
        label="Debug"
        active={showDebug}
        onClick={onToggleDebug}
        activeColor="#fa0"
      />
      <button
        onClick={onStop}
        style={{
          padding: '10px 16px',
          borderRadius: 24,
          border: '2px solid #f44',
          background: 'rgba(0,0,0,0.5)',
          color: '#f44',
          fontSize: 13,
          fontFamily: 'system-ui, sans-serif',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Stop
      </button>
    </div>
  );
};
