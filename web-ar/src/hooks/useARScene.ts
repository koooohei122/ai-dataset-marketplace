// useARScene.ts
// MindAR + Three.js シーンのライフサイクルを管理する。
// React コンポーネントからは start/stop とステータスのみを受け取る。

import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { buildLighting, setGroupOpacity } from '../ar/sceneBuilder';
import { loadCharacter, playAnimation } from '../ar/characterLoader';
import { FpsMonitor } from '../utils/fpsMonitor';
import { CONFIG } from '../config';
import type { MindARThreeInstance } from '../types/mindar';

export type ARStatus = 'idle' | 'starting' | 'ready' | 'searching' | 'found' | 'error';

interface UseARSceneOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  showCharacter: boolean;
  onStatusChange: (status: ARStatus) => void;
  onVideoReady: (video: HTMLVideoElement) => void;
  onFpsUpdate: (fps: number) => void;
}

// targets.mind ファイルが存在するか確認
async function targetExists(): Promise<boolean> {
  try {
    const res = await fetch(CONFIG.targetPath, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

export function useARScene({
  containerRef,
  showCharacter,
  onStatusChange,
  onVideoReady,
  onFpsUpdate,
}: UseARSceneOptions) {
  const mindarRef = useRef<MindARThreeInstance | null>(null);
  const charGroupRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const rafRef = useRef<number>(0);
  const fpsMonitor = useRef(new FpsMonitor(CONFIG.performance.fpsSampleWindow));
  const targetFoundRef = useRef(false);
  const fadeRef = useRef<number>(0); // 0-1 フェード値

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    mindarRef.current?.stop();
    mindarRef.current = null;
    onStatusChange('idle');
  }, [onStatusChange]);

  const start = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    onStatusChange('starting');

    // MINDAR がまだロードされていなければ待つ
    if (typeof MINDAR === 'undefined') {
      onStatusChange('error');
      console.error('[ARScene] MINDAR not loaded. Check CDN script in index.html');
      return;
    }

    const hasTarget = await targetExists();
    const isFixedMode = CONFIG.useFixedAnchor || !hasTarget;

    if (!hasTarget && !CONFIG.useFixedAnchor) {
      console.warn('[ARScene] targets.mind not found → falling back to fixed-anchor mode');
    }

    // ---- キャラクター読み込み ----
    const character = await loadCharacter();
    charGroupRef.current = character.group;
    mixerRef.current = character.mixer;

    // アニメーション再生
    if (character.mixer && character.animations.length > 0) {
      playAnimation(character.mixer, character.animations);
    }

    // キャラ初期変換
    const cfg = CONFIG.character;
    character.group.position.set(...cfg.position);
    character.group.scale.set(...cfg.scale);
    character.group.rotation.set(...cfg.rotation);
    setGroupOpacity(character.group, 0); // 非表示から開始

    if (isFixedMode) {
      // ----- デバッグ固定モード -----
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.01,
        1000
      );
      camera.position.set(0, 0.5, 1.5);
      camera.lookAt(0, 0.3, 0);

      buildLighting(scene);
      scene.add(character.group);
      targetFoundRef.current = true;

      onStatusChange('found');
      onStatusChange('ready');

      const animate = (time: number) => {
        rafRef.current = requestAnimationFrame(animate);
        const fps = fpsMonitor.current.tick();
        onFpsUpdate(fps);

        const delta = clockRef.current.getDelta();
        mixerRef.current?.update(delta);

        // フォールバック: 上下ボブ
        if (character.isFallback) {
          const t = time * 0.001 * CONFIG.idleBob.speed;
          character.group.position.y = cfg.position[1] + Math.sin(t) * CONFIG.idleBob.amplitude;
        }

        // フェードイン
        if (fadeRef.current < 1) {
          fadeRef.current = Math.min(1, fadeRef.current + delta * 2);
          setGroupOpacity(character.group, fadeRef.current);
        }

        renderer.render(scene, camera);
      };

      clockRef.current.start();
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // ----- MindAR 画像トラッキングモード -----
    const mindar = new MINDAR.IMAGE.MindARThree({
      container,
      imageTargetSrc: CONFIG.targetPath,
      maxTrack: 1,
      uiLoading: 'yes',
      uiScanning: 'yes',
      uiError: 'yes',
    });

    mindarRef.current = mindar;
    const { renderer, scene, camera } = mindar;

    buildLighting(scene);

    const anchor = mindar.addAnchor(0);
    anchor.group.add(character.group);

    anchor.onTargetFound = () => {
      targetFoundRef.current = true;
      fadeRef.current = 0;
      setGroupOpacity(character.group, 0);
      onStatusChange('found');
      console.log('[ARScene] target found');
    };

    anchor.onTargetLost = () => {
      targetFoundRef.current = false;
      onStatusChange('searching');
      console.log('[ARScene] target lost');
    };

    try {
      await mindar.start();
    } catch (err) {
      console.error('[ARScene] mindar.start() failed:', err);
      onStatusChange('error');
      return;
    }

    // video 要素を取得してセグメンテーションに渡す
    const videoEl = container.querySelector('video') as HTMLVideoElement | null;
    if (videoEl) onVideoReady(videoEl);

    onStatusChange('searching');

    renderer.setAnimationLoop((time) => {
      const fps = fpsMonitor.current.tick();
      onFpsUpdate(fps);

      const delta = clockRef.current.getDelta();
      mixerRef.current?.update(delta);

      // ターゲット検出中のみキャラを表示
      if (targetFoundRef.current && showCharacter) {
        if (character.isFallback) {
          const t = time * 0.001 * CONFIG.idleBob.speed;
          character.group.position.y = cfg.position[1] + Math.sin(t) * CONFIG.idleBob.amplitude;
        }
        if (fadeRef.current < 1) {
          fadeRef.current = Math.min(1, fadeRef.current + delta * 2);
          setGroupOpacity(character.group, fadeRef.current);
        }
      } else if (!targetFoundRef.current) {
        fadeRef.current = Math.max(0, fadeRef.current - delta * 3);
        setGroupOpacity(character.group, fadeRef.current);
      }

      renderer.render(scene, camera);
    });

    clockRef.current.start();
  }, [containerRef, showCharacter, onStatusChange, onVideoReady, onFpsUpdate]);

  // コンポーネントアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop };
}
