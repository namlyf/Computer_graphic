import * as THREE from 'three';
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



let lastTimestamp = null;

const config = {
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
};

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
camera.position.set(0,-200, 200);
camera.lookAt(0, 0, 0);




//--------------------------Map------------------------

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

  const material = new THREE.MeshLambertMaterial({ color: 0x00C0FF }); 
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0.2;
  return mesh;
}

function renderMap(mapWidth, mapHeight) {
  const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x00C0FF }); // xanh dương

  const planeGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
  const plane = new THREE.Mesh(planeGeometry, blueMaterial);
  plane.receiveShadow = true; 
  plane.matrixAutoUpdate = false;
  scene.add(plane);

  // Lake
  const blueLayer = getBlueCircleLayer();
  blueLayer.receiveShadow = true;
  scene.add(blueLayer);
}




// -----------------------------------------Ship------------------------------
function Duck() {
  const duck = new THREE.Group(); 

  const thangiua = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 20, 50, 28),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  thangiua.position.set(0, 0, 0);
  duck.add(thangiua);

  
  const thantruoc = new THREE.Mesh(
    new THREE.SphereGeometry(20, 28, 28),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  thantruoc.position.set(0, 30, 0);
  duck.add(thantruoc);


  const thansau = new THREE.Mesh(
    new THREE.SphereGeometry(20, 28, 28),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  thansau.position.set(0, -30, 0);
  duck.add(thansau);

 
  const co = new THREE.Mesh(
    new THREE.CylinderGeometry(15, 15, 40, 32),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  co.position.set(0, 30, 20);
  co.rotation.x = Math.PI / 2;
  duck.add(co);

  const dau = new THREE.Mesh(
    new THREE.SphereGeometry(15, 32, 32),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  dau.position.set(0, 35, 40);
  dau.scale.set(1.1, 1.5, 1);
  dau.rotation.x = -Math.PI / 12;
  duck.add(dau);

  const mat1 = new THREE.Mesh(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshLambertMaterial({ color: 0x000000 })
  );
  mat1.position.set(7, 38, 52);
  duck.add(mat1);


  const mat2 = new THREE.Mesh(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshLambertMaterial({ color: 0x000000 })
  );
  mat2.position.set(-7, 38, 52);
  duck.add(mat2);

  const mo = new THREE.Mesh(
    new THREE.ConeGeometry(9, 15, 32),
    new THREE.MeshLambertMaterial({ color: 0xffa500 })
  );
  mo.position.set(0, 58, 43);
  mo.rotation.x = Math.PI / 8;
  duck.add(mo);
  enableShadowForObject(duck);
  return duck;
}

function createFlagTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = "#ff0000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffff00";
  drawStar(ctx, canvas.width / 2, canvas.height / 2, 5, 40, 15);


  return new THREE.CanvasTexture(canvas);
}


function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

function ship() {
  const ship = new THREE.Group();

  const woodColor = new THREE.Color(0xDF6F06);
  const woodMaterial = new THREE.MeshLambertMaterial({
    color: woodColor,
    transparent: true,
    opacity: 0.8
  });

  const woodPositions = [0, 12, -12, 22, -22];
  woodPositions.forEach(x => {
    const wood = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 7, 120, 32),
      woodMaterial.clone()
    );
    wood.position.x = x;
    wood.castShadow = true;
    wood.receiveShadow = true;
    ship.add(wood);
  });

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 50, 32),
    new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
  );
  pole.position.z = 25;
  pole.rotation.x = Math.PI / 2;
  pole.castShadow = true;
  ship.add(pole);

  // ----- Lá cờ -----
  const flagGeometry = new THREE.PlaneGeometry(20, 10);
  const flagMaterial = new THREE.MeshStandardMaterial({
    map: createFlagTexture(),
    side: THREE.DoubleSide
  });
  const flag = new THREE.Mesh(flagGeometry, flagMaterial);
  flag.position.set(10, 0, 45);
  flag.rotation.x = Math.PI / 2;
  flag.castShadow = true;
  ship.add(flag);

  return ship;
}

// Tạo tàu
// function ship() {
//   const ship = new THREE.Group();

//   const wood1 = new THREE.Mesh(
//     new THREE.CylinderGeometry(7, 7, 120, 32),
//     new THREE.MeshLambertMaterial({ 
//       color: 0xDF6F06, 
//       roughness: 0.8,
//       opacity: 0.8 
//     })
//   );
//   wood1.castShadow = true;
//   wood1.receiveShadow = true;
//   ship.add(wood1);
//   const wood2 = new THREE.Mesh(
//     new THREE.CylinderGeometry(5, 5, 120, 32),
//     new THREE.MeshLambertMaterial({ 
//       color: new THREE.Color(0xDF6F06), 
//       transparent: true,
//       opacity: 0.8 
//     })
//   );
//   wood2.position.x = 12;
//   wood2.castShadow = true;
//   wood2.receiveShadow = true;
//   ship.add(wood2);
//   const wood3 = new THREE.Mesh(
//     new THREE.CylinderGeometry(7, 7, 120, 32),
//     new THREE.MeshLambertMaterial({ 
//       color: new THREE.Color(0xDF6F06),
//       transparent: true,
//       opacity: 0.8 
//     })
//   );
//   wood3.position.x = -12;
//   wood3.castShadow = true;
//   wood3.receiveShadow = true;
//   ship.add(wood3);

//   const wood4 = new THREE.Mesh(
//     new THREE.CylinderGeometry(7, 7, 120, 32),
//     new THREE.MeshLambertMaterial({ 
//       color: new THREE.Color(0xDF6F06),
//       transparent: true,
//       opacity: 0.8 
//     })
//   );
//   wood4.position.x = 22;
//   wood4.castShadow = true;
//   wood4.receiveShadow = true;
//   ship.add(wood4);

//   const wood5 = new THREE.Mesh(
//     new THREE.CylinderGeometry(7, 7, 120, 32),
//     new THREE.MeshLambertMaterial({ 
//       color: new THREE.Color(0xDF6F06), 
//       transparent: true,
//       opacity: 0.8 
//     })
//   );
//   wood5.position.x = -22;
//   wood5.castShadow = true;
//   wood5.receiveShadow = true;
//   ship.add(wood5);


// const flagGeometry = new THREE.PlaneGeometry(20, 10);
// const flagMaterial = new THREE.MeshStandardMaterial({ 
//     map: createFlagTexture(), 
//     side: THREE.DoubleSide 
// });
// const flag = new THREE.Mesh(flagGeometry, flagMaterial);
// flag.position.set(10,0, 45);
// flag.rotation.x = Math.PI / 2;  
// ship.add(flag);


// const pole = new THREE.Mesh(
//     new THREE.CylinderGeometry(1, 1, 50, 32),
//     new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
// );
// pole.position.z = 25;
// pole.rotation.x = Math.PI / 2;
// ship.add(pole);

//   return ship;

// }


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




let waveClock = new THREE.Clock();


//-----------------------------------Animation--------------------------------
function animation(timestamp) {

  if (isPaused) return;
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    requestAnimationFrame(animation);
    return;
  }
  const elapsed = waveClock.getElapsedTime();


  if (player2) {
    player2.position.z = Math.sin(elapsed * 1.5) * 0.5;
    player2.rotation.y = Math.sin(elapsed * 1.2) * 0.15;
    player2.rotation.x = Math.cos(elapsed * 0.8) * 0.03;
  }

  if (duck) {
    duck.position.add(duckVelocity);
    const boundary = outerTrackRadius2 - 60; 

    if (duck.position.x > boundary || duck.position.x < -boundary) {
      duckVelocity.x *= -1; 
      duck.position.x = THREE.MathUtils.clamp(duck.position.x, -boundary, boundary);
    }

    if (duck.position.y > boundary || duck.position.y < -boundary) {
      duckVelocity.y *= -1; 
      duck.position.y = THREE.MathUtils.clamp(duck.position.y, -boundary, boundary);
    }

    duck.rotation.z = Math.atan2(duckVelocity.y, duckVelocity.x);
    const distance = duck.position.distanceTo(player2.position);
    if (distance < (duckRadius + shipRadius)) {
      duckVelocity.multiplyScalar(-1); 
    }
  }
  lastTimestamp = timestamp;
  requestAnimationFrame(animation);
}

const duck = Duck();
duck.position.set(150, 150, 0);
duck.scale.set(0.5, 0.5, 0.5);
scene.add(duck);

const duckVelocity = new THREE.Vector3(
  (Math.random() - 0.5) * 2,
  (Math.random() - 0.5) * 2,
  0
);
const duckRadius = 45;
const shipRadius = 120;


const player2 = ship();
player2.position.set(0, 0, 0);
player2.scale.set(2.5, 2.5, 2.5);

scene.add(player2);


renderer.render(scene, camera);

//----------------------------------------Functions--------------------------------
function enableShadowForObject(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

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
