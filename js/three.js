import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const cameraAnim = {
  active: false,
  startZ: 0,
  targetZ: 0,

  startTargetY: 0,
  targetTargetY: 0,

  progress: 0,
  duration: 60,
};

const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / 2 / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth / 2, window.innerHeight);
document.getElementById("pyramid").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 3;
controls.maxDistance = 5;
controls.autoRotate = true;
controls.autoRotateSpeed = -1;

let fractalDepth = 0;

const fractalPyramid = createFractalPyramid(1, fractalDepth);
scene.add(fractalPyramid);

function createPyramidGeometry(size) {
  const a = size;
  const h = a * Math.sqrt(0.5);

  const geometry = new THREE.BufferGeometry();

  const vertices = new Float32Array([
    -a / 2,
    0,
    -a / 2,
    a / 2,
    0,
    -a / 2,
    a / 2,
    0,
    a / 2,
    -a / 2,
    0,
    a / 2,
    0,
    h,
    0,
  ]);

  const indices = [
    // base
    0, 1, 2, 0, 2, 3,
    // faces latérales
    0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4,
  ];

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { geometry, height: h };
}

function createFractalPyramid(size, depth, extremity = null) {
  const group = new THREE.Group();
  const h = size * Math.sqrt(0.5);

  const { geometry } = createPyramidGeometry(size);
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const pyramid = new THREE.LineSegments(edges, lineMaterial);

  group.add(pyramid);

  const step = fractalDepth - depth + 1;

  if (depth > 0) {
    if (step % 3 === 0) {
      if (extremity === 1) {
        const subPyramid = createFractalPyramid(size, depth - 1);
        subPyramid.position.set(-size / 2, -h, -size / 2);
        group.add(subPyramid);
      } else if (extremity === 2) {
        const subPyramid = createFractalPyramid(size, depth - 1);
        subPyramid.position.set(size / 2, -h, -size / 2);
        group.add(subPyramid);
      } else if (extremity === 3) {
        const subPyramid = createFractalPyramid(size, depth - 1);
        subPyramid.position.set(size / 2, -h, size / 2);
        group.add(subPyramid);
      } else if (extremity === 4) {
        const subPyramid = createFractalPyramid(size, depth - 1);
        subPyramid.position.set(-size / 2, -h, size / 2);
        group.add(subPyramid);
      }
    } else {
      const subPyramid1 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 1 || step % 3 === 1 ? 1 : null
      );
      const subPyramid2 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 2 || step % 3 === 1 ? 2 : null
      );
      const subPyramid3 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 3 || step % 3 === 1 ? 3 : null
      );
      const subPyramid4 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 4 || step % 3 === 1 ? 4 : null
      );

      subPyramid1.position.set(-size / 2, -h, -size / 2);
      subPyramid2.position.set(size / 2, -h, -size / 2);
      subPyramid3.position.set(size / 2, -h, size / 2);
      subPyramid4.position.set(-size / 2, -h, size / 2);

      group.add(subPyramid1, subPyramid2, subPyramid3, subPyramid4);
    }
  }

  return group;
}

function animate() {
  requestAnimationFrame(animate);

  if (cameraAnim.active) {
    cameraAnim.progress++;

    const t = cameraAnim.progress / cameraAnim.duration;
    const smoothT = t * t * (3 - 2 * t); // smoothstep

    camera.position.z = THREE.MathUtils.lerp(
      cameraAnim.startZ,
      cameraAnim.targetZ,
      smoothT
    );

    controls.target.y = THREE.MathUtils.lerp(
      cameraAnim.startTargetY,
      cameraAnim.targetTargetY,
      smoothT
    );

    if (t >= 1) {
      cameraAnim.active = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

export function nextLevel(turn) {
  let camTranslation = 0;
  let camRecul = 1;

  if (turn > 0) {
    if (turn + 1 < 4) {
      fractalDepth += 1;
      camTranslation = 0.3;
      camRecul = 4;
    } else {
      fractalDepth += 3;
      camTranslation = 1;
      camRecul = 10;
    }
  }

  scene.remove(fractalPyramid);
  const fractalPyramid2 = createFractalPyramid(1, fractalDepth);
  scene.add(fractalPyramid2);

  cameraAnim.startZ = camera.position.z;
  cameraAnim.targetZ = camera.position.z + camRecul;

  cameraAnim.startTargetY = controls.target.y;
  cameraAnim.targetTargetY = controls.target.y - camTranslation;

  cameraAnim.progress = 0;
  cameraAnim.active = true;

  controls.maxDistance = controls.maxDistance + camRecul;
}

animate();
