import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const elementWidth =
  window.innerWidth > 900 ? window.innerWidth / 2 : window.innerWidth; // Pour avoir un semblant de responsive

// Définition de l'animation quand la caméra est déplacée via le code
const cameraAnim = {
  active: false,
  startZ: 0,
  targetZ: 0,

  startTargetY: 0,
  targetTargetY: 0,

  progress: 0,
  duration: 60,
};

// Attributs de la caméra 3D
const camera = new THREE.PerspectiveCamera(
  30,
  elementWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(elementWidth, window.innerHeight);
document.getElementById("pyramid").appendChild(renderer.domElement);

// Configuration des contrôles à la souris pour naviguer dans la pyramide
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 3;
controls.maxDistance = 5; // On ne peut pas beaucoup dézoomer de base pour que l'agrandissement soit plus impressionnant
controls.autoRotate = true;
controls.autoRotateSpeed = -1;

let fractalDepth = 0;

// Pyramide par défaut, celle tout en haut
const fractalPyramid = createFractalPyramid(1, fractalDepth);
scene.add(fractalPyramid);

function createPyramidGeometry(size) {
  const a = size;
  const h = a * Math.sqrt(0.5);

  const geometry = new THREE.BufferGeometry();

  // Il n'y a pas d'objet pyramide de base dans ThreeJS, on la construit en précisant les coordonnées de ses sommets
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
    // Base
    0, 1, 2, 0, 2, 3,
    // Faces latérales
    0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4,
  ];

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { geometry, height: h };
}

// Fonction récursive pour faire la pyramide en fonction de la hauteur
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
      // Tous les 3 rangs, on ne met des pyramides qu'aux extrémités de la structure (c'est cela qui créé les trous dans la pyramide)
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
      // Sinon, on créé une nouvelle tour de pyramides sous chaque sommet de la base de la pyramide actuelle
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

// Aussi pour gérer les changements de position de la caméra via le code
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

// Appelé depuis le script du jeu lui-même, ajoute un étage à la pyramide
export function nextLevel(turn) {
  let camTranslation = 0;
  let camRecul = 1;

  if (turn > 0) {
    if (turn + 1 < 4) {
      // Pour les 3 premiers tours, on ajoute seulement un étage
      fractalDepth += 1;
      camTranslation = 0.3;
      camRecul = 4;
    } else {
      // Ensuite, on ajoute un étage complet de pyramides de pyramides (équivalent 3 étages classiques)
      fractalDepth += 3;
      camTranslation = 1;
      camRecul = 10;
    }
  }

  // On met à jour la pyramide affichée
  scene.remove(fractalPyramid);
  const fractalPyramid2 = createFractalPyramid(1, fractalDepth);
  scene.add(fractalPyramid2);

  // On dézoome la caméra et la descend en fonction de la taille de ce qui a été ajouté
  cameraAnim.startZ = camera.position.z;
  cameraAnim.targetZ = camera.position.z + camRecul;

  cameraAnim.startTargetY = controls.target.y;
  cameraAnim.targetTargetY = controls.target.y - camTranslation;

  cameraAnim.progress = 0;
  cameraAnim.active = true;

  controls.maxDistance = controls.maxDistance + camRecul;
}

animate();
