import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { nextTier } from "./script.js";

const colors = [
  {
    hex: 0x00ff00,
    hexString: "#00ff00",
    rgb: "rgb(0, 255, 0)",
    rgba: "rgb(0, 255, 0, 0.239)",
  },
  {
    hex: 0xefbf04,
    hexString: "#efbf04",
    rgb: "rgb(239, 191, 4)",
    rgba: "rgb(239, 191, 4, 0.239)",
  },
  {
    hex: 0x1aa0ff,
    hexString: "#1aa0ff",
    rgb: "rgb(26, 260, 255)",
    rgba: "rgb(26, 160, 255, 0.239)",
  },
];

const spheresElement = document.getElementById("spheres");

let fractalDepth = 0;
let color = 0x00ff00;
let pyramidSize = 1;
let colorIdx = 1;

// Initialisation de la scene 3D
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
  100000,
);
camera.position.z = 0.3;
camera.position.y = 0.1;

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

// Mettre des sous-triangles sur les faces de la pyramide du haut quand on a terminé une pyramide pour donner l'impression qu'elle est remplie
// Cette partie là c'est pas mal de choses déjà faites trouvées sur internet
function createFakePyramidsLines(apex, baseLeft, baseRight, rows = 5) {
  const points = [];
  const grid = [];

  // Fonction pour subdiviser un triangle en traçant des lignes
  function subdivideTriangle(v1, v2, v3) {
    const mid12 = new THREE.Vector3().lerpVectors(v1, v2, 0.5);
    const mid23 = new THREE.Vector3().lerpVectors(v2, v3, 0.5);
    const mid31 = new THREE.Vector3().lerpVectors(v3, v1, 0.5);
    points.push(mid12.clone(), mid23.clone());
    points.push(mid23.clone(), mid31.clone());
    points.push(mid31.clone(), mid12.clone());
  }

  for (let row = 0; row <= rows; row++) {
    grid[row] = [];
    const numPointsInRow = row + 1;

    for (let col = 0; col < numPointsInRow; col++) {
      const t = row / rows;

      if (row === 0) {
        // Sommet
        grid[row][col] = apex.clone();
      } else {
        const rowLeftPoint = new THREE.Vector3().lerpVectors(apex, baseLeft, t);
        const rowRightPoint = new THREE.Vector3().lerpVectors(
          apex,
          baseRight,
          t,
        );
        const colT = col / row;
        grid[row][col] = new THREE.Vector3().lerpVectors(
          rowLeftPoint,
          rowRightPoint,
          colT,
        );
      }
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      const current = grid[row][col];

      if (col < row + 1) {
        const bottomLeft = grid[row + 1][col];
        if (col > 0 || row < rows - 1) {
          if (col > 0) {
            points.push(current.clone(), bottomLeft.clone());
          }
        }
      }

      if (col < row + 1) {
        const bottomRight = grid[row + 1][col + 1];
        if (col < row) {
          points.push(current.clone(), bottomRight.clone());
        }
      }

      const bottomLeft = grid[row + 1][col];
      const bottomRight = grid[row + 1][col + 1];
      subdivideTriangle(current, bottomLeft, bottomRight);

      if (col > 0) {
        const left = grid[row][col - 1];
        const bottom = grid[row + 1][col];
        subdivideTriangle(left, current, bottom);
      }
    }
  }

  for (let row = 1; row < rows; row++) {
    for (let col = 0; col < row; col++) {
      const left = grid[row][col];
      const right = grid[row][col + 1];
      points.push(left.clone(), right.clone());
    }
  }

  return points;
}

// Idem que pour les triangles sur les faces de la pyramide supérieure, on lui quadrille la base
function createBaseGrid(baseVertices, divisions) {
  const points = [];

  const corner0 = baseVertices[0];
  const corner1 = baseVertices[1];
  const corner2 = baseVertices[2];
  const corner3 = baseVertices[3];

  for (let i = 1; i < divisions; i++) {
    const t = i / divisions;
    const left = new THREE.Vector3().lerpVectors(corner0, corner3, t);
    const right = new THREE.Vector3().lerpVectors(corner1, corner2, t);
    points.push(left.clone(), right.clone());
  }

  for (let i = 1; i < divisions; i++) {
    const t = i / divisions;
    const back = new THREE.Vector3().lerpVectors(corner0, corner1, t);
    const front = new THREE.Vector3().lerpVectors(corner3, corner2, t);
    points.push(back.clone(), front.clone());
  }

  return points;
}

// On assemble les fonctions précédentes pour appliquer les traitements aux faces une par une
function createFakePyramids(size) {
  const group = new THREE.Group();
  const a = size;
  const h = a * Math.sqrt(0.5);

  const baseVertices = [
    new THREE.Vector3(-a / 2, 0, -a / 2),
    new THREE.Vector3(a / 2, 0, -a / 2),
    new THREE.Vector3(a / 2, 0, a / 2),
    new THREE.Vector3(-a / 2, 0, a / 2),
  ];
  const apex = new THREE.Vector3(0, h, 0);

  const { geometry } = createPyramidGeometry(size);
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: colors[colorIdx - 2].hex,
  });
  const pyramidOutline = new THREE.LineSegments(edges, lineMaterial);
  group.add(pyramidOutline);

  const allPoints = [];

  allPoints.push(
    ...createFakePyramidsLines(apex, baseVertices[0], baseVertices[1], 5),
  );
  allPoints.push(
    ...createFakePyramidsLines(apex, baseVertices[1], baseVertices[2], 5),
  );
  allPoints.push(
    ...createFakePyramidsLines(apex, baseVertices[2], baseVertices[3], 5),
  );
  allPoints.push(
    ...createFakePyramidsLines(apex, baseVertices[3], baseVertices[0], 5),
  );

  if (allPoints.length > 0) {
    const pascalGeometry = new THREE.BufferGeometry().setFromPoints(allPoints);
    const pascalLines = new THREE.LineSegments(pascalGeometry, lineMaterial);
    group.add(pascalLines);
  }

  const baseGridPoints = createBaseGrid(baseVertices, 15);
  if (baseGridPoints.length > 0) {
    const baseGridGeometry = new THREE.BufferGeometry().setFromPoints(
      baseGridPoints,
    );
    const baseGridLines = new THREE.LineSegments(
      baseGridGeometry,
      lineMaterial,
    );
    group.add(baseGridLines);
  }

  return group;
}

// Fonction récursive pour faire la pyramide en fonction de la hauteur
function createFractalPyramid(
  size,
  depth,
  extremity = null,
  isTopLevel = true,
) {
  const group = new THREE.Group();
  const h = size * Math.sqrt(0.5);

  // Si c'est la pyramide du sommet, on utilise la fausse (avec les triangles sur les faces et le quadrillage en dessous)
  if (isTopLevel && colorIdx > 1) {
    const fakePyramid = createFakePyramids(size);
    group.add(fakePyramid);
  } else {
    const { geometry } = createPyramidGeometry(size);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color });
    const pyramid = new THREE.LineSegments(edges, lineMaterial);
    group.add(pyramid);
  }

  let step = fractalDepth - depth + 1;

  if (depth > 0) {
    if (step % 3 === 0) {
      // Tous les 3 rangs, on ne met des pyramides qu'aux extrémités de la structure (c'est cela qui créé les trous dans la pyramide)
      if (extremity === 1) {
        const subPyramid = createFractalPyramid(size, depth - 1, null, false);
        subPyramid.position.set(-size / 2, -h, -size / 2);
        group.add(subPyramid);
      } else if (extremity === 2) {
        const subPyramid = createFractalPyramid(size, depth - 1, null, false);
        subPyramid.position.set(size / 2, -h, -size / 2);
        group.add(subPyramid);
      } else if (extremity === 3) {
        const subPyramid = createFractalPyramid(size, depth - 1, null, false);
        subPyramid.position.set(size / 2, -h, size / 2);
        group.add(subPyramid);
      } else if (extremity === 4) {
        const subPyramid = createFractalPyramid(size, depth - 1, null, false);
        subPyramid.position.set(-size / 2, -h, size / 2);
        group.add(subPyramid);
      }
    } else {
      // Sinon, on créé une nouvelle tour de pyramides sous chaque sommet de la base de la pyramide actuelle
      const subPyramid1 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 1 || step % 3 === 1 ? 1 : null,
        false,
      );
      const subPyramid2 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 2 || step % 3 === 1 ? 2 : null,
        false,
      );
      const subPyramid3 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 3 || step % 3 === 1 ? 3 : null,
        false,
      );
      const subPyramid4 = createFractalPyramid(
        size,
        depth - 1,
        extremity === 4 || step % 3 === 1 ? 4 : null,
        false,
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
      smoothT,
    );

    controls.target.y = THREE.MathUtils.lerp(
      cameraAnim.startTargetY,
      cameraAnim.targetTargetY,
      smoothT,
    );

    if (t >= 1) {
      cameraAnim.active = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

// Appelé depuis le script du jeu lui-même, ajoute un étage à la pyramide
function nextLevel(turn) {
  let camTranslation = 0;
  let camRecul = 1;

  let controlTargetY = controls.target.y;
  let cameraPositionZ = camera.position.z;

  if (turn > 0) {
    if (turn % 7 === 0) {
      // Tous les 7 tours, on agrandit les nouvelles pyramides et on change la couleur
      nextTier();
      pyramidSize = pyramidSize * 5;
      color = colors[colorIdx].hex;
      document.documentElement.style.setProperty(
        "--primary-color",
        colors[colorIdx].rgb,
      );
      document.documentElement.style.setProperty(
        "--primary-background",
        colors[colorIdx].rgba,
      );
      fractalDepth = 1;
      for (let i = 0; i < colorIdx; i++) {
        spheresElement.children[i].classList.remove("active");
      }
      const newSphereElement = document.createElement("div");
      newSphereElement.classList.add("sphere", "active");
      newSphereElement.style.backgroundColor = colors[colorIdx].hexString;
      spheresElement.appendChild(newSphereElement);
      colorIdx++;
    } else if (fractalDepth < 2) {
      // Pour les 3 premiers tours, on ajoute seulement un étage
      fractalDepth += 1;
      camTranslation = 0.3;
      camRecul = 4;
    } else {
      // Sinon, on ajoute un étage complet de pyramides de pyramides (équivalent 3 étages classiques)
      fractalDepth += 3;
      camTranslation = 1;
      camRecul = 10;
    }
  }

  // On met à jour la pyramide affichée
  scene.clear();
  const fractalPyramid2 = createFractalPyramid(pyramidSize, fractalDepth);
  scene.add(fractalPyramid2);

  // On dézoome la caméra et la descend en fonction de la taille de ce qui a été ajouté
  cameraAnim.startZ = cameraPositionZ;
  cameraAnim.targetZ = cameraPositionZ + camRecul * pyramidSize;

  cameraAnim.startTargetY = controlTargetY;
  cameraAnim.targetTargetY = controlTargetY - camTranslation * pyramidSize;

  cameraAnim.progress = 0;
  cameraAnim.active = true;

  controls.maxDistance = controls.maxDistance + camRecul * pyramidSize;
}

animate();

export { nextLevel };
