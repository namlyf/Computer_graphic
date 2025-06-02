import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Map settings
const trackRadius = 200;
const trackWidth = 35;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const trackRadius2 = 340;
const trackWidth2 = 40;
const outerTrackRadius2 = trackRadius2 + trackWidth2;
const innerTrackRadius2 = trackRadius2 - trackWidth2;

// Tree location
const arcAngle1 = (1 / 3) * Math.PI;
const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX =
  (Math.cos(arcAngle1) * innerTrackRadius +
    Math.cos(arcAngle2) * outerTrackRadius) / 2;

const treeCrownColor = 0x498c2c;
const treeTrunkColor = 0x4b3f2f;

// Vehicle settings
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
const vehicleColors = [
  0xa52523,
  0xef2d56,
  0x0ad3ff,
  0xff9f1c,
  0xa52523, 0xbdb638, 0x78b14b,
];
const wheelGeometry1 = new THREE.CylinderGeometry(7.5, 7.5, 35, 32);
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

const config = {
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
};


const playerAngleInitial = Math.PI;
let playerAngleMoved1;
let lastTimestamp = null;
let isPaused = false;

function enableShadowForObject(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

//----------------------------------------------Tree----------------------------------------------

function PineTree() {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0x8B4513 }) 
  );
  trunk.position.y = 5;
  tree.add(trunk);

  const leaf1 = new THREE.Mesh(
    new THREE.ConeGeometry(8, 12, 16),
    new THREE.MeshLambertMaterial({ color: 0x0b6623 }) 
  );
  leaf1.position.y = 14;
  tree.add(leaf1);

  const leaf2 = new THREE.Mesh(
    new THREE.ConeGeometry(6, 10, 16),
    new THREE.MeshLambertMaterial({ color: 0x0b6623 })
  );
  leaf2.position.y = 20;
  tree.add(leaf2);

  const leaf3 = new THREE.Mesh(
    new THREE.ConeGeometry(4, 8, 16),
    new THREE.MeshLambertMaterial({ color: 0x0b6623 })
  );
  leaf3.position.y = 25;
  tree.add(leaf3);
  enableShadowForObject(tree);

  tree.rotation.x = Math.PI / 2;
  tree.scale.set(4, 4, 4);
  return tree;
}



// ---------------------------------------------- Truck -----------------------------------

function Wheel() {
  const wheel = new THREE.Mesh(wheelGeometry1, wheelMaterial);
  wheel.position.z = 6;
  wheel.castShadow = false;
  wheel.receiveShadow = false;
  return wheel;
}

function getCargotextrue() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = "#000000";
  context.font = "25px Arial";
  context.fillText("T", 25, 25);

  return new THREE.CanvasTexture(canvas);
}
function getCargotextrue2() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = "#000000";
  context.font = "20px Arial";
  context.fillText("H", 10, 25);

  return new THREE.CanvasTexture(canvas);
}
function getTruckFrontTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 32, 32);

  context.fillStyle = "#000000";
  context.fillRect(0, 5, 32, 10);

  return new THREE.CanvasTexture(canvas);
}

function getTruckSideTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 32, 32);

  context.fillStyle = "#000000";
  context.fillRect(17, 5, 15, 10);

  return new THREE.CanvasTexture(canvas);
}

function Truck() {
  const truck = new THREE.Group();
  const color = pickRandom(vehicleColors);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(100, 25, 5),
    new THREE.MeshLambertMaterial({ color: 0xb4c6fc })
  );
  base.position.z = 10;
  truck.add(base);
  const cargotexture = getCargotextrue();
  cargotexture.center = new THREE.Vector2(0.5, 0.5);
  const cargotexture2 = getCargotextrue2();
  cargotexture2.center = new THREE.Vector2(0.5, 0.5);
  cargotexture2.rotation = -Math.PI / 2;


  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(75, 35, 40),
    [new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0xffffff, map: cargotexture2 }),
    new THREE.MeshLambertMaterial({ color: 0xffffff, map: cargotexture }),
    new THREE.MeshLambertMaterial({ color: 0xffffff, map: cargotexture }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0xffffff })

    ]);
  cargo.position.x = -15;
  cargo.position.z = 30;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const truckFrontTexture = getTruckFrontTexture();
  truckFrontTexture.center = new THREE.Vector2(0.5, 0.5);
  truckFrontTexture.rotation = Math.PI / 2;

  const truckLeftTexture = getTruckSideTexture();
  truckLeftTexture.flipY = false;

  const truckRightTexture = getTruckSideTexture();

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(25, 30, 30), [
    new THREE.MeshLambertMaterial({ color, map: truckFrontTexture }),
    new THREE.MeshLambertMaterial({ color }), // back
    new THREE.MeshLambertMaterial({ color, map: truckLeftTexture }),
    new THREE.MeshLambertMaterial({ color, map: truckRightTexture }),
    new THREE.MeshLambertMaterial({ color }), // top
    new THREE.MeshLambertMaterial({ color }) // bottom
  ]);
  cabin.position.x = 40;
  cabin.position.z = 20;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  const backWheel = Wheel();
  backWheel.position.x = -30;
  truck.add(backWheel);

  const middleWheel = Wheel();
  middleWheel.position.x = 10;
  truck.add(middleWheel);

  const frontWheel = Wheel();
  frontWheel.position.x = 38;
  truck.add(frontWheel);
  const denL = new THREE.Mesh(
    new THREE.SphereGeometry(6, 60, 64),
    new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
  );
  denL.position.set(50, -8, 12);
  truck.add(denL);


  const denR = new THREE.Mesh(
    new THREE.SphereGeometry(6, 60, 64),
    new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
  );
  denR.position.set(50, 8, 12);
  truck.add(denR);

  return truck;
}

function getLineMarkings(mapWidth, mapHeight) {
  const scale = 2; // Tăng độ phân giải gấp 2 lần
  const canvas = document.createElement('canvas');
  canvas.width = mapWidth * scale;
  canvas.height = mapHeight * scale;
  const context = canvas.getContext('2d');

  context.scale(scale, scale);

  context.fillStyle = '#546E90';
  context.fillRect(0, 0, mapWidth, mapHeight);

  context.lineWidth = 2;
  context.setLineDash([10, 14]);

  // Arc1
  context.strokeStyle = '#E0FFFF';
  context.beginPath();
  context.arc(mapWidth / 2, mapHeight / 2, trackRadius, 0, Math.PI * 2);
  context.stroke();

  // Arc2
  context.strokeStyle = '#E0FFFF';
  context.beginPath();
  context.arc(mapWidth / 2, mapHeight / 2, trackRadius2, 0, Math.PI * 2);
  context.stroke();

  // Arccross
  context.setLineDash([]);
  context.strokeStyle = '#E0FFFF';
  context.beginPath();
  context.arc(mapWidth / 2, mapHeight / 2, innerTrackRadius2, 0, Math.PI * 2);
  context.stroke();

  // Arc3
  context.beginPath();
  context.arc(mapWidth / 2, mapHeight / 2, outerTrackRadius2, 0, Math.PI * 2);
  context.stroke();

  //arcinner
  context.lineWidth = 3;
  context.strokeStyle = '#E0FFFF';

  context.beginPath();
  context.arc(mapWidth / 2, mapHeight / 2, outerTrackRadius, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.arc(mapWidth / 2, mapHeight / 2, innerTrackRadius, 0, Math.PI * 2);
  context.stroke();

  return new THREE.CanvasTexture(canvas);
}
function getLeftIsland() {
  const islandLeft = new THREE.Shape();

//   islandLeft.absarc(0, 0, innerTrackRadius, 0, 2 * Math.PI,);

  islandLeft.absarc(0, 0, innerTrackRadius2, 0, Math.PI * 2, false);

//   const hole = new THREE.Path();
//   hole.absarc( 0, 0, outerTrackRadius,0, Math.PI * 2, true);
//   islandLeft.holes.push(hole);
  return islandLeft;
}
function getOuterField(mapWidth, mapHeight) {
  const field = new THREE.Shape();
  field.moveTo(-mapWidth / 2, -mapHeight / 2);
  field.lineTo(mapWidth / 2, -mapHeight / 2);
  field.lineTo(mapWidth / 2, mapHeight / 2);
  field.lineTo(-mapWidth / 2, mapHeight / 2);
  field.lineTo(-mapWidth / 2, -mapHeight / 2);

  const hole = new THREE.Path();
  hole.absarc(0, 0, outerTrackRadius2, 0, Math.PI * 2,true);
  field.holes.push(hole);
  return field;
}

function renderMap(mapWidth, mapHeight) {
  const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);

  const planeGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
  const planeMaterial = new THREE.MeshLambertMaterial({ map: lineMarkingsTexture });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true; 
  plane.matrixAutoUpdate = false;
  scene.add(plane);

  // === VÙNG TRÒN BÊN TRONG - islandLeft ===
  const islandLeftShape = getLeftIsland();
  const islandLeftGeometry = new THREE.ExtrudeGeometry([islandLeftShape], {
    depth: 0.1,
    bevelEnabled: false,
    curveSegments: 128
  });
  const islandLeftMesh = new THREE.Mesh(
    islandLeftGeometry,
    new THREE.MeshLambertMaterial({ color: 0x67c240 })
  );
  islandLeftMesh.receiveShadow = true; 

  scene.add(islandLeftMesh);

  // === VÙNG NGOÀI - outerField ===
  const outerFieldShape = getOuterField(mapWidth, mapHeight);
  const outerFieldGeometry = new THREE.ExtrudeGeometry([outerFieldShape], {
    depth: 0.1,
    bevelEnabled: false,
    curveSegments: 128
  });
  const outerFieldMesh = new THREE.Mesh(
    outerFieldGeometry,
    new THREE.MeshLambertMaterial({ color: 0x67c240 })
  );
  outerFieldMesh.receiveShadow = true; 
  scene.add(outerFieldMesh);
  if (config.trees) {
    
    const tree14 = PineTree();
    tree14.position.x = -arcCenterX * 1.5;
    tree14.position.y = -arcCenterX * 1.4;
    scene.add(tree14);

    const tree15 = PineTree();
    tree15.position.set(-30, -275, 0)
    scene.add(tree15);

    const tree16 = PineTree();
    tree16.position.set(-150, 210, 0)
    scene.add(tree16);

    const tree17 = PineTree();
    tree17.position.set(-415, 115, 0)
    scene.add(tree17);

    const tree18 = PineTree();
    tree18.position.set(225, -135, 0)
    scene.add(tree18);
    const tree19 = PineTree();
    tree19.position.set(280, -280, 0)
    scene.add(tree19);

    const tree20 = PineTree();
    tree20.position.set(-285, -345, 0)
    scene.add(tree20);

    const tree21 = PineTree();
    tree21.position.set(50, -405, 0)
    scene.add(tree21);
  }
  
}


//----------------------------------------------Scence & Lights & Camera setting---------------------------------------------------
const scene = new THREE.Scene();
const mapWidth = 1100;
const mapHeight = 1100;

//ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(100, -300, 400);
scene.add(sunLight);

sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 100;
sunLight.shadow.camera.far = 2000;
sunLight.shadow.camera.left = -500;
sunLight.shadow.camera.right = 500;
sunLight.shadow.camera.top = 500;
sunLight.shadow.camera.bottom = -500;
// Camera
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 1000;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
  cameraWidth / -2,
  cameraWidth / 2,
  cameraHeight / 2,
  cameraHeight / -2,
  50,
  700
);
camera.position.set(0,-300, 350);
camera.lookAt(0, 0, 0);


//----------------------------------Main ---------------------------------------------------------------------------------------

renderMap(mapWidth, mapHeight);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
if (config.shadows) renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.render(scene, camera);


function animation(timestamp) {

  if (isPaused) return;

  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    requestAnimationFrame(animation);
    return;
  }
 
  const timeDelta = timestamp - lastTimestamp;
  movePlayerCar(timeDelta);
  renderer.render(scene, camera);
  lastTimestamp = timestamp;
  requestAnimationFrame(animation);
}

function movePlayerCar(timeDelta) {
  const playerSpeed1 = 0.001;
  playerAngleMoved1 -= playerSpeed1 * timeDelta;
  const totalPlayerAngle1 = playerAngleInitial + playerAngleMoved1;
  const playerX1 = Math.cos(totalPlayerAngle1) * trackRadius2;
  const playerY1 = Math.sin(totalPlayerAngle1) * trackRadius2;

  player1.position.x = playerX1;
  player1.position.y = playerY1;
  player1.rotation.z = totalPlayerAngle1 - Math.PI / 2;


}
const player1 = Truck();
scene.add(player1);


function reset() {
  playerAngleMoved1 = 0;
  lastTimestamp = undefined;
  movePlayerCar(0);
  renderer.render(scene, camera);
}
reset();

// -------------------------------------------------------Fuctionality Controls---------------------------------------------------
window.addEventListener('keydown', (event) => {
  if (event.key === 'p' || event.key === 'P') {
    isPaused = true;
  }
  if (event.key === 'r' || event.key === 'R') {
    isPaused = false;
    lastTimestamp = null; 
    requestAnimationFrame(animation); 
  }
});

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});



const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;