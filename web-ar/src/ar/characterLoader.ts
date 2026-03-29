// characterLoader.ts
// GLBモデルを読み込む。モデルがない場合は簡易フォールバックメッシュを返す。

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CONFIG } from '../config';

export interface LoadedCharacter {
  group: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  animations: THREE.AnimationClip[];
  isFallback: boolean;
}

// モデルが存在するか HEAD リクエストで確認
async function modelExists(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// フォールバック: 簡易キャラ（カプセル頭 + 胴体）
function buildFallbackCharacter(): LoadedCharacter {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.6 });

  // 胴体
  const bodyGeo = new THREE.CapsuleGeometry(0.18, 0.4, 4, 8);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 0.3;
  body.castShadow = true;

  // 頭
  const headGeo = new THREE.SphereGeometry(0.15, 12, 12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffd1aa, roughness: 0.8 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 0.72;
  head.castShadow = true;

  // 目 (左右)
  const eyeGeo = new THREE.SphereGeometry(0.03, 6, 6);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  [-0.06, 0.06].forEach((x) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(x, 0.76, 0.13);
    group.add(eye);
  });

  // 影用の円形シャドウ
  const shadowGeo = new THREE.CircleGeometry(0.2, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;

  group.add(body, head, shadow);
  return { group, mixer: null, animations: [], isFallback: true };
}

export async function loadCharacter(): Promise<LoadedCharacter> {
  const exists = await modelExists(CONFIG.modelPath);

  if (!exists) {
    console.warn('[CharacterLoader] model not found, using fallback');
    return buildFallbackCharacter();
  }

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      CONFIG.modelPath,
      (gltf) => {
        const group = new THREE.Group();
        const model = gltf.scene;

        // 影を有効化
        model.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = false;
          }
        });

        // 円形シャドウ（簡易ブロブシャドウ）
        const shadowGeo = new THREE.CircleGeometry(0.25, 16);
        const shadowMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.001;

        group.add(model, shadow);

        const mixer = new THREE.AnimationMixer(model);

        resolve({
          group,
          mixer,
          animations: gltf.animations,
          isFallback: false,
        });
      },
      undefined,
      (err) => {
        console.error('[CharacterLoader] load error, using fallback', err);
        resolve(buildFallbackCharacter());
      }
    );
  });
}

// アニメーションを名前で再生。なければ最初のクリップを使う。
export function playAnimation(
  mixer: THREE.AnimationMixer,
  clips: THREE.AnimationClip[],
  preferredNames = ['idle', 'Idle', 'walk', 'Walk', 'run']
): THREE.AnimationAction | null {
  if (clips.length === 0) return null;

  const clip =
    preferredNames.map((n) => THREE.AnimationClip.findByName(clips, n)).find(Boolean) ??
    clips[0];

  const action = mixer.clipAction(clip);
  action.play();
  return action;
}
