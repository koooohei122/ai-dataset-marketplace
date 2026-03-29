// OcclusionLayer.tsx
// セグメンテーション結果を前景マスクとして重ねる。
// 3D キャラの上に配置することで「人物がキャラの前に来る」効果を出す。

import React from 'react';
import { CONFIG } from '../config';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  enabled: boolean;
}

export const OcclusionLayer: React.FC<Props> = ({ canvasRef, enabled }) => {
  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      width={CONFIG.segmentation.inferenceWidth}
      height={CONFIG.segmentation.inferenceHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: CONFIG.segmentation.opacity,
        // object-fit: cover で映像と同じアスペクト比に拡縮する
        objectFit: 'cover',
        // レイヤー順: video(0) < Three.js canvas(1) < OcclusionLayer(2)
        zIndex: 2,
      }}
    />
  );
};
