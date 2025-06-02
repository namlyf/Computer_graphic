import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


//-------------------------initial-----------------------------

const trackRadius = 200;
const trackWidth = 35;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const trackRadius2 = 340;
const trackWidth2 = 40;
const outerTrackRadius2 = trackRadius2 + trackWidth2;
const innerTrackRadius2 = trackRadius2 - trackWidth2;


const config = {
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
};



let lastTimestamp = null;
let isPaused = false;

//-------------------------------camere, light, scene,render-------------------
const scene = new THREE.Scene();
const mapWidth = 1100;
const mapHeight = 1100;

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

//ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

// Camera
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 1450;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.PerspectiveCamera(
  60,                // FOV - góc nhìn dọc (degrees)
  aspectRatio,       // tỉ lệ khung hình
  0.1,               // near clipping plane
  2000               // far clipping plane
);

camera.position.set(0, -700, 250);
camera.lookAt(0, 0, 0);
// const camera = new THREE.OrthographicCamera(
//   cameraWidth / -2,
//   cameraWidth / 2,
//   cameraHeight / 2,
//   cameraHeight / -2,
//   50,
//   700
// );
// camera.position.set(0,-150, 550);
// camera.lookAt(0, 0, 0);




//--------------------------Map------------------------
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
  hole.absarc(0, 0, outerTrackRadius2, 0, Math.PI * 2,true);
  field.holes.push(hole);
  return field;
}
function getBlueCircleLayer() {
  const shape = new THREE.Shape();

  shape.absarc(0, 0, innerTrackRadius - 10, 0, Math.PI * 2);

  const geometry = new THREE.ExtrudeGeometry([shape], {
    depth: 0.1,
    bevelEnabled: false,
    curveSegments: 128,
    transparent: true,
    roughness: 0.8,
    metalness: 0.2,
    shadow: true
  });

  const material = new THREE.MeshLambertMaterial({ color: 0x00C0FF }); // xanh biển
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0.2;
  return mesh;
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

  // Lake
  const blueLayer = getBlueCircleLayer();
  blueLayer.receiveShadow = true;
  scene.add(blueLayer);

}


//----------------------------------Cloud----------------------------------------
function createCloud() {
  const cloud = new THREE.Group();

  const geometry = new THREE.SphereGeometry(7, 16, 32);
  const material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true
  });

  const part1 = new THREE.Mesh(geometry, material);
  const part2 = new THREE.Mesh(geometry, material);
  const part3 = new THREE.Mesh(geometry, material);
  const part4 = new THREE.Mesh(geometry, material);
  part1.position.set(0, 0, 0);
  part2.position.set(5, 0, 0);
  part3.position.set(-5, 0, 0);
  part4.position.set(0, 0, 5);
  cloud.add(part1);
  cloud.add(part2);
  cloud.add(part3);
  cloud.add(part4);
  enableShadowForObject(cloud);
  cloud.scale.set(2.5, 2.5, 3);
  return cloud;
}

const clouds = [];

function spawnClouds() {
  for (let i = 0; i < 8; i++) {
    const cloud = createCloud(); 

    cloud.position.set(
      i * 100 - 320,                
      Math.random() * 150 + 100,   
      220 + Math.random() * 100    
    );

    cloud.speed = 0.2 + Math.random() * 0.2; 
    scene.add(cloud);
    clouds.push(cloud);
  }
}
spawnClouds();


//--------------------------------Sun + Light--------------------------------
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


const sunSphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffff00 }) 
);
scene.add(sunSphere);
sunSphere.position.set(100, -300, 400);

let sunAngle = 0;
const sunRadius = 650; 
const dayNightSpeed = 0.001;
scene.background = new THREE.Color(0x87ceeb);
let waveClock = new THREE.Clock();


//-----------------------------------Animation--------------------------------
function animation(timestamp) {

  if (isPaused) return;

  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    requestAnimationFrame(animation);
    return;
  }
  if (sunSphere) {
    sunAngle += dayNightSpeed;

    const sunX = 0;
    const sunY = Math.cos(sunAngle) * sunRadius;
    const sunZ = Math.sin(sunAngle) * sunRadius;

    sunLight.position.set(sunX, sunY, sunZ);
    sunLight.target.position.set(0, 0, 0);
    sunLight.target.updateMatrixWorld();

    sunSphere.position.set(sunX, sunY, sunZ);

    const brightness = Math.max(0, Math.sin(sunAngle));
    sunLight.intensity = brightness * 2;
    ambientLight.intensity = 1.0 + 0.3 * brightness;

    const skyColor = new THREE.Color().lerpColors(
      new THREE.Color(0x0d1b2a), 
      new THREE.Color(0x87ceeb), 
      brightness
    );
    scene.background = skyColor;
  }
  if (clouds) {
    clouds.forEach((cloud) => {
      cloud.position.x += cloud.speed;

      if (cloud.position.x > 450) {
        cloud.position.x = -500;
        cloud.position.y = Math.random() * 150 + 100;
        cloud.position.z = 320 + Math.random() * 100;
      }
    });
  }


  renderer.render(scene, camera);
  lastTimestamp = timestamp;
  requestAnimationFrame(animation);
}



renderer.render(scene, camera);

//----------------------------------------Functions--------------------------------

function reset() {
  lastTimestamp = undefined;
  renderer.render(scene, camera);
}
reset();

window.addEventListener('keydown', (event) => {
  if (event.key === 'p' || event.key === 'P') {
    isPaused = true;
    waveClock.stop(); 
  }
  if (event.key === 'r' || event.key === 'R') {
    isPaused = false;
    waveClock.start(); 
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


//-----------------------------controls--------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
function enableShadowForObject(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}