// useSegmentation.ts
// MediaPipe Selfie Segmentation を管理し、前景マスクを canvas に描画する。
// canvas はそのまま OcclusionLayer に渡す。

import { useEffect, useRef, useCallback } from 'react';
import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';
import { CONFIG } from '../config';

interface UseSegmentationOptions {
  enabled: boolean;
  videoEl: HTMLVideoElement | null;
  width: number;
  height: number;
}

export function useSegmentation({ enabled, videoEl, width, height }: UseSegmentationOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segRef = useRef<SelfieSegmentation | null>(null);
  const rafRef = useRef<number>(0);
  const lastSendTime = useRef(0);
  const isSending = useRef(false);

  const onResults = useCallback(
    (results: Results) => {
      isSending.current = false;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. クリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. カメラ映像を描画（実際の人物ピクセル）
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      // 3. セグメンテーションマスクで前景（人物）のみ残す
      //    destination-in: 既存ピクセルのアルファにマスクを掛け合わせる
      //    マスク白=人物=保持、黒=背景=透明
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

      // 4. 合成モードをリセット
      ctx.globalCompositeOperation = 'source-over';
    },
    []
  );

  useEffect(() => {
    if (!enabled || !videoEl) return;

    // MediaPipe モデルファイルは CDN から取得（バンドルサイズ削減）
    const seg = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${file}`,
    });

    seg.setOptions({
      modelSelection: CONFIG.segmentation.modelSelection,
    });

    seg.onResults(onResults);
    segRef.current = seg;

    const interval = 1000 / CONFIG.segmentation.maxFps;

    const loop = async (now: number) => {
      rafRef.current = requestAnimationFrame(loop);

      // 推論間隔の制御（targetFps 以上は送らない）
      if (now - lastSendTime.current < interval) return;
      if (isSending.current) return;
      if (!videoEl || videoEl.readyState < 2) return;

      lastSendTime.current = now;
      isSending.current = true;

      try {
        await seg.send({ image: videoEl });
      } catch (err) {
        isSending.current = false;
        console.warn('[Segmentation] send error:', err);
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      seg.close().catch(() => {});
      segRef.current = null;
    };
  }, [enabled, videoEl, onResults]);

  // canvas サイズを動的に合わせる
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CONFIG.segmentation.inferenceWidth;
    canvas.height = CONFIG.segmentation.inferenceHeight;
  }, [width, height]);

  return canvasRef;
}
