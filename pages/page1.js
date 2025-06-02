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
const treeTrunkGeometry = new THREE.BoxGeometry(15, 15, 50);
const treeTrunkMaterial = new THREE.MeshLambertMaterial({
  color: treeTrunkColor
});
const treeCrownMaterial = new THREE.MeshLambertMaterial({
  color: treeCrownColor
});

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
const speed = 0.0007;
const wheelGeometry1 = new THREE.CylinderGeometry(7.5, 7.5, 35, 32);
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

const config = {
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
};

const playerAngleInitial = Math.PI;
let playerAngleMoved;
let playerAngleMoved1;
let lastTimestamp = null;
let isPaused = false;

//----------------------------------------------Tree----------------------------------------------

function Tree() {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
  trunk.position.z = 10;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.matrixAutoUpdate = false;
  tree.add(trunk);

  const treeHeights = 65;
  const height = treeHeights;

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(height / 2, 30, 30),
    treeCrownMaterial
  );
  crown.position.z = height / 2 + 15;
  crown.castShadow = true;
  crown.receiveShadow = false;
  tree.add(crown);

  return tree;
}





//----------------------------------------------Car----------------------------------------------
function getCarFrontTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = "#000000";
  context.fillRect(8, 8, 48, 24);

  return new THREE.CanvasTexture(canvas);
}

function getCarSideTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 32);

  context.fillStyle = "#000000";
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);

  return new THREE.CanvasTexture(canvas);
}

function Car() {
  const car = new THREE.Group();

  const color = pickRandom(vehicleColors);

  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color: color })
  );
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);
  const denL = new THREE.Mesh(
    new THREE.SphereGeometry(5, 60, 64),
    new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
  );
  denL.position.set(28, -8, 10);
  car.add(denL);


  const denR = new THREE.Mesh(
    new THREE.SphereGeometry(5, 60, 64),
    new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
  );
  denR.position.set(28, 8, 10);
  car.add(denR);

  const carFrontTexture = getCarFrontTexture();
  carFrontTexture.center = new THREE.Vector2(0.5, 0.5);
  carFrontTexture.rotation = Math.PI / 2;

  const carBackTexture = getCarFrontTexture();
  carBackTexture.center = new THREE.Vector2(0.5, 0.5);
  carBackTexture.rotation = -Math.PI / 2;

  const carLeftSideTexture = getCarSideTexture();
  carLeftSideTexture.flipY = false;

  const carRightSideTexture = getCarSideTexture();

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(33, 24, 12), [
    new THREE.MeshLambertMaterial({ map: carFrontTexture }),
    new THREE.MeshLambertMaterial({ map: carBackTexture }),
    new THREE.MeshLambertMaterial({ map: carLeftSideTexture }),
    new THREE.MeshLambertMaterial({ map: carRightSideTexture }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }), 
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  ]);
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  const backWheel = new Wheel();
  backWheel.position.x = -18;
  car.add(backWheel);

  const frontWheel = new Wheel();
  frontWheel.position.x = 18;
  car.add(frontWheel);

  return car;
}
function Wheel() {
  const wheel = new THREE.Mesh(wheelGeometry1, wheelMaterial);
  wheel.position.z = 6;
  wheel.castShadow = false;
  wheel.receiveShadow = false;
  return wheel;
}

// ---------------------------------------------Map-----------------------------------------------

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

  // Arccross
  context.setLineDash([]);
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

  islandLeft.absarc(0, 0, innerTrackRadius, 0, 2 * Math.PI,);

  islandLeft.absarc(0, 0, innerTrackRadius2, 0, Math.PI * 2, false);

  const hole = new THREE.Path();
  hole.absarc( 0, 0, outerTrackRadius,0, Math.PI * 2, true);
  islandLeft.holes.push(hole);
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
  hole.absarc(0, 0, outerTrackRadius, 0, Math.PI * 2,true);
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
    const tree1 = Tree();
    tree1.position.x = arcCenterX * 2;
    scene.add(tree1);

    const tree0 = Tree();
    tree0.position.x = -arcCenterX * 2;
    scene.add(tree0);


    const tree2 = Tree();
    tree2.position.y = arcCenterX * 1;
    tree2.position.x = arcCenterX * 1.9;
    scene.add(tree2);

    const tree3 = Tree();
    tree3.position.x = arcCenterX * 0.8;
    tree3.position.y = arcCenterX * 1.7;
    scene.add(tree3);

    const tree4 = Tree();
    tree4.position.x = arcCenterX * 1.8;
    tree4.position.y = arcCenterX * 2.5;
    scene.add(tree4);

    const tree5 = Tree();
    tree5.position.x = -arcCenterX * -0.2;
    tree5.position.y = arcCenterX * 2;
    scene.add(tree5);

    const tree6 = Tree();
    tree6.position.x = -arcCenterX * 2;
    tree6.position.y = arcCenterX * 2.3;
    scene.add(tree6);

    const tree7 = Tree();
    tree7.position.x = arcCenterX * 0.8;
    tree7.position.y = -arcCenterX * 2;
    scene.add(tree7);

    const tree8 = Tree();
    tree8.position.x = arcCenterX * 2.3;
    tree8.position.y = -arcCenterX * 2;
    scene.add(tree8);

    const tree9 = Tree();
    tree9.position.x = -arcCenterX * 1;
    tree9.position.y = -arcCenterX * 2;
    scene.add(tree9);

    const tree10 = Tree();
    tree10.position.x = -arcCenterX * 2.5;
    tree10.position.y = -arcCenterX * 1.8;
    scene.add(tree10);

    const tree11 = Tree();
    tree11.position.x = arcCenterX * 0.4;
    tree11.position.y = -arcCenterX * 2.1;
    scene.add(tree11);

    const tree12 = Tree();
    tree12.position.x = arcCenterX * 1.7;
    tree12.position.y = -arcCenterX * 2.4;
    scene.add(tree12);

    const tree13 = Tree();
    tree13.position.x = -arcCenterX * 1.7;
    tree13.position.y = -arcCenterX * 2.4;
    scene.add(tree13);
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

const playerCar = Car();
scene.add(playerCar);


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

//----------------------------------------------Animation---------------------------------------------------
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
  const playerSpeed = speed;
  playerAngleMoved -= playerSpeed * timeDelta;

  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

  const playerX = Math.cos(totalPlayerAngle) * trackRadius;
  const playerY = Math.sin(totalPlayerAngle) * trackRadius;

  playerCar.position.x = playerX;
  playerCar.position.y = playerY;
  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;


}
function reset() {
  playerAngleMoved = 0;
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
// controls.minDistance = 50;
// controls.maxDistance = 500;
// controls.maxPolarAngle = Math.PI / 2;