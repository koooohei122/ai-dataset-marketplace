// sceneBuilder.ts
// Three.js シーンにライトなどを追加する。
// MindAR が scene/camera/renderer を提供するため、ここでは装飾のみ担当。

import * as THREE from 'three';

export function buildLighting(scene: THREE.Scene): void {
  // 環境光（全体を明るく）
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  // 指向性ライト（上から）
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(0.5, 1, 0.5);
  dirLight.castShadow = false; // 影は簡易ブロブで代替
  scene.add(dirLight);

  // フィルライト（逆側から弱く）
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-0.5, 0.5, -0.5);
  scene.add(fillLight);
}

// キャラ出現時のフェードイン用ヘルパー
export function setGroupOpacity(group: THREE.Group, opacity: number): void {
  group.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat: THREE.Material) => {
      (mat as THREE.MeshStandardMaterial).transparent = opacity < 1;
      (mat as THREE.MeshStandardMaterial).opacity = opacity;
    });
  });
}
