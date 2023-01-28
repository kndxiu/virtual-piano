import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

import { Power3 } from "gsap";

import Howler from "howler";

const gsaptl = gsap.timeline();

const fileLoader = document.getElementById("loader");
const loadingProgress = document.getElementById("loadingProgress");
const loaderTitle = document.getElementById("title");
const currentFile = document.getElementById("file");

// Debug
// const gui = new dat.GUI();

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 0, 3.5);

const notes = [
  "A0",
  "Bb0",
  "B0",
  "C1",
  "Db1",
  "D1",
  "Eb1",
  "E1",
  "F1",
  "Gb1",
  "G1",
  "Ab1",
  "A1",
  "Bb1",
  "B1",
  "C2",
  "Db2",
  "D2",
  "Eb2",
  "E2",
  "F2",
  "Gb2",
  "G2",
  "Ab2",
  "A2",
  "Bb2",
  "B2",
  "C3",
  "Db3",
  "D3",
  "Eb3",
  "E3",
  "F3",
  "Gb3",
  "G3",
  "Ab3",
  "A3",
  "Bb3",
  "B3",
  "C4",
  "Db4",
  "D4",
  "Eb4",
  "E4",
  "F4",
  "Gb4",
  "G4",
  "Ab4",
  "A4",
  "Bb4",
  "B4",
  "C5",
  "Db5",
  "D5",
  "Eb5",
  "E5",
  "F5",
  "Gb5",
  "G5",
  "Ab5",
  "A5",
  "Bb5",
  "B5",
  "C6",
  "Db6",
  "D6",
  "Eb6",
  "E6",
  "F6",
  "Gb6",
  "G6",
  "Ab6",
  "A6",
  "Bb6",
  "B6",
  "C7",
  "Db7",
  "D7",
  "Eb7",
  "E7",
  "F7",
  "Gb7",
  "G7",
  "Ab7",
  "A7",
  "Bb7",
  "B7",
  "C8",
];

const audioSources = {};

let piano;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1.5;
camera.position.y = 2;
camera.position.z = 1.5;
camera.rotation.set(-0.7, 0.6, 0.5);
// camera.position.x = 0;
// camera.position.y = 1.25;
// camera.position.z = 1;
// camera.rotation.x = THREE.Math.degToRad(-15);
scene.add(camera);
const listener = new THREE.AudioListener();
camera.add(listener);

// Lights

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.x = 1;
directionalLight.position.y = 1;
directionalLight.position.z = 1;
scene.add(directionalLight);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 4);
directionalLight1.position.x = -1;
directionalLight1.position.y = 1;
directionalLight1.position.z = 1;
scene.add(directionalLight1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3);
directionalLight2.position.x = 0;
directionalLight2.position.y = 2;
directionalLight2.position.z = 1;
scene.add(directionalLight2);

const ambientLight = new THREE.AmbientLight(0xffffff, -3);
scene.add(ambientLight);

const tl = new THREE.TextureLoader();

const aoMap = tl.load("textures/vbooccvew_2K_AO.jpg");
aoMap.wrapS = THREE.RepeatWrapping;
aoMap.wrapT = THREE.RepeatWrapping;
aoMap.repeat.set(10, 10);
const displacementMap = tl.load("textures/vbooccvew_2K_Displacement.jpg");
displacementMap.wrapS = THREE.RepeatWrapping;
displacementMap.wrapT = THREE.RepeatWrapping;
displacementMap.repeat.set(10, 10);
const normalMap = tl.load("textures/vbooccvew_2K_Normal.jpg");
normalMap.wrapS = THREE.RepeatWrapping;
normalMap.wrapT = THREE.RepeatWrapping;
normalMap.repeat.set(10, 10);
const roughnessMap = tl.load("textures/vbooccvew_2K_Roughness.jpg");
roughnessMap.wrapS = THREE.RepeatWrapping;
roughnessMap.wrapT = THREE.RepeatWrapping;
roughnessMap.repeat.set(10, 10);
const map = tl.load("textures/vbooccvew_2K_Albedo.jpg");
map.wrapS = THREE.RepeatWrapping;
map.wrapT = THREE.RepeatWrapping;
map.repeat.set(10, 10);

const geometry = new THREE.PlaneGeometry(10, 10);
const material = new THREE.MeshStandardMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
  aoMap: aoMap,
  displacementMap: displacementMap,
  normalMap: normalMap,
  roughnessMap: roughnessMap,
  map: map,
});
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = THREE.Math.degToRad(90);
scene.add(plane);

const loader = new GLTFLoader();

let pianoKeys = [];

loader.load(
  "models/piano/piano.gltf",
  (gltf) => {
    piano = gltf.scene;
    scene.add(piano);
    piano.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material.map) {
          child.material.map.anisotropy = 4;
        }
        if (child.material.roughness) {
          child.material.roughness = 0.2;
        }
        if (child.name.startsWith("key")) {
          child.userData = {
            position: child.position.y,
            rotation: child.rotation.x,
          };
          pianoKeys.push(child);
        }
      }
    });

    Promise.all(
      notes.map((note, index) => {
        loadingProgress.value = parseInt((index / 88) * 100);
        currentFile.innerHTML = `sounds/${note}.mp3<span>${
          index + 1
        } / 88</span>`;
        if (index + 1 == 88) {
          currentFile.innerHTML = `Finishing loading...`;
        }
        return new Promise((resolve) => {
          audioSources[note] = new Howl({
            src: [`sounds/${note}.mp3`],
            volume: 1,
            onload: resolve,
          });
        });
      })
    ).then(() => {
      filesLoaded();
    });
  },
  (xhr) => {
    const percentComplete = parseInt((xhr.loaded / xhr.total) * 100);
    currentFile.innerHTML = `models/piano/piano.gltf<span>${percentComplete}%</div>`;
    loadingProgress.value = percentComplete;
  }
);

function filesLoaded() {
  document.getElementById("view").addEventListener("click", () => {
    document.getElementById("view1").classList.remove("currentView");
    document.getElementById("view").classList.add("currentView");
    gsaptl
      .add("transition")
      .to(
        camera.position,
        {
          x: 0,
          y: 1.25,
          z: 1,
          duration: 1,
          ease: Power3.in,
        },
        "transition"
      )
      .to(
        camera.rotation,
        {
          x: THREE.Math.degToRad(-15),
          y: 0,
          z: 0,
          duration: 1,
          ease: Power3.in,
        },
        "transition"
      );
  });
  document.getElementById("view1").addEventListener("click", () => {
    document.getElementById("view").classList.remove("currentView");
    document.getElementById("view1").classList.add("currentView");
    gsaptl
      .add("transition")
      .to(
        camera.position,
        {
          x: 0,
          y: 1.5,
          z: 0.35,
          duration: 2,
          ease: Power3.in,
        },
        "transition"
      )
      .to(
        camera.rotation,
        {
          x: THREE.Math.degToRad(-90),
          y: 0,
          z: 0,
          duration: 2,
          ease: Power3.in,
        },
        "transition"
      );
  });
  fileLoader.classList.add("finished");
  setTimeout(() => {
    fileLoader.remove();
    gsaptl
      .add("start")
      .to(
        camera.position,
        {
          x: 0,
          y: 1.25,
          z: 1.25,
          duration: 2,
          ease: Power3.in,
        },
        "start"
      )
      .to(
        camera.rotation,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 2,
          ease: Power3.in,
        },
        "start"
      );
  }, 400);
  setTimeout(() => {
    gsaptl
      .add("start")
      .to(
        camera.position,
        {
          x: 0,
          y: 1.25,
          z: 1,
          duration: 1,
          ease: Power3.in,
        },
        "start"
      )
      .to(
        camera.rotation,
        {
          x: THREE.Math.degToRad(-15),
          y: 0,
          z: 0,
          duration: 1,
          ease: Power3.in,
        },
        "start"
      );
  }, 500);
  setTimeout(() => {
    document.querySelector(".info").classList.add("hide");
    setTimeout(() => {
      document.querySelector(".info").remove();
    }, 400);
  }, 5000);
}

function getNote(string) {
  if (string[string.length - 2] === "0") {
    return string[string.length - 1];
  } else {
    return string.slice(-2);
  }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let activeKey = null;

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    activeKey = intersects[0].object;
    audioSources[notes[getNote(activeKey.name)]].play();
    activeKey.position.y -= 0.005;
    activeKey.rotation.x += 3 * THREE.Math.DEG2RAD;
  }
}

function onMouseUp(event) {
  if (activeKey) {
    activeKey.position.y = activeKey.userData.position;
    activeKey.rotation.x = activeKey.userData.rotation;
    activeKey = null;
  }
}

function onMouseMove(event) {
  if (!activeKey) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    const key = intersects[0].object;
    if (key !== activeKey) {
      audioSources[notes[getNote(activeKey.name)]].play();
      activeKey.position.y = activeKey.userData.position;
      activeKey.rotation.x = activeKey.userData.rotation;
      activeKey = key;
      activeKey.position.y -= 0.005;
      activeKey.rotation.x += 3 * THREE.Math.DEG2RAD;
    }
  }
}

function onTouchStart(event) {
  const touch = event.touches[0];
  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    activeKey = intersects[0].object;
    audioSources[notes[getNote(activeKey.name)]].play();
    activeKey.position.y -= 0.005;
    activeKey.rotation.x += 3 * THREE.Math.DEG2RAD;
  }
}

function onTouchEnd(event) {
  if (activeKey) {
    activeKey.position.y = activeKey.userData.position;
    activeKey.rotation.x = activeKey.userData.rotation;
    activeKey = null;
  }
}

function onTouchMove(event) {
  if (!activeKey) return;
  const touch = event.touches[0];
  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    const key = intersects[0].object;
    if (key !== activeKey) {
      audioSources[notes[getNote(activeKey.name)]].play();
      activeKey.position.y = activeKey.userData.position;
      activeKey.rotation.x = activeKey.userData.rotation;
      activeKey = key;
      activeKey.position.y -= 0.005;
      activeKey.rotation.x += 3 * THREE.Math.DEG2RAD;
    }
  }
}

if (navigator.maxTouchPoints) {
  document.addEventListener("touchstart", onTouchStart, false);
  document.addEventListener("touchend", onTouchEnd, false);
  document.addEventListener("touchmove", onTouchMove, false);
} else {
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);
  window.addEventListener("mousemove", onMouseMove, false);
}

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update Orbital Controls
  // controls.update()

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
