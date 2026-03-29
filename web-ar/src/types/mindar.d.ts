// MindAR is loaded via CDN script tag (see index.html).
// This file provides TypeScript type declarations for the global MINDAR object.

import type { WebGLRenderer, Scene, PerspectiveCamera, Group } from 'three';

interface MindARThreeOptions {
  container: HTMLElement;
  imageTargetSrc: string;
  maxTrack?: number;
  filterMinCF?: number;
  filterBeta?: number;
  missTolerance?: number;
  warmupTolerance?: number;
  showStats?: boolean;
  uiLoading?: string;
  uiScanning?: string;
  uiError?: string;
}

interface MindARAnchor {
  group: Group;
  onTargetFound: (() => void) | null;
  onTargetLost: (() => void) | null;
}

export interface MindARThreeInstance {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  start(): Promise<void>;
  stop(): void;
  addAnchor(targetIndex: number): MindARAnchor;
}

declare global {
  const MINDAR: {
    IMAGE: {
      MindARThree: new (options: MindARThreeOptions) => MindARThreeInstance;
    };
  };
}
