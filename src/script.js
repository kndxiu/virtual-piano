import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Power3 } from "gsap";
import Howler from "howler";
import { Midi } from "@tonejs/midi";
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

let volume = 0.5;

const slider = document.getElementById("volume");
const val = document.getElementById("val");

slider.addEventListener("input", () => {
  volume = slider.value / 100;
  val.innerHTML = slider.value;
});

let camera;
let renderer;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const getNoteIndex = (name) => {
  for (let index = 0; index < notes.length; index++) {
    if (notes[index].toString() === name.toString()) {
      return index;
    }
  }
  return -1;
};

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

const keyboard = {};
const keyboardOld = {};

const keyMap = {
  "Q": "C4",
  "2": "Db4",
  "W": "D4",
  "3": "Eb4",
  "E": "E4",
  "R": "F4",
  "5": "Gb4",
  "T": "G4",
  "6": "Ab4",
  "Y": "A4",
  "7": "Bb4",
  "U": "B4",
  "I": "C5",
  "9": "Db5",
  "O": "D5",
  "0": "Eb5",
  "P": "E5",
  "Z": "F5",
  "S": "Gb5",
  "X": "G5",
  "D": "Ab5",
  "C": "A5",
  "F": "Bb5",
  "V": "B5",
  "B": "C6",
  "H": "Db6",
  "N": "D6",
  "J": "Eb6",
  "M": "E6",
};

const audioSources = {};

let piano;

const setupCamera = () => {
  camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.x = 1.5;
  camera.position.y = 2;
  camera.position.z = 1.5;
  camera.rotation.set(-0.7, 0.6, 0.5);
  scene.add(camera);
  const listener = new THREE.AudioListener();
  camera.add(listener);
};

const setupLights = () => {
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
};

const setupBasicScene = () => {
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
};

const setupRenderer = () => {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(2);
};

const setupEvents = () => {
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(2);
  });
  if (navigator.maxTouchPoints) {
    document.addEventListener("touchstart", onTouchStart, false);
    document.addEventListener("touchend", onTouchEnd, false);
    document.addEventListener("touchmove", onTouchMove, false);
  } else {
    window.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mouseup", onMouseUp, false);
    window.addEventListener("mousemove", onMouseMove, false);
  }

  document.addEventListener("keydown", onKeyPress);
  document.addEventListener("keyup", onKeyRelease);
  window.addEventListener("message", (e) => {
    if (e.data.type === "webpackOk") {
      return;
    }
    const keyboardEvent = new KeyboardEvent(e.data.type, {
      key: e.data.content,
    });

    if (e.data.type == "keydown") onKeyPress(keyboardEvent);
    else if (e.data.type == "keyup") onKeyRelease(keyboardEvent);
  });
  const inputFile = document.getElementById("midifile");
  inputFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    const bin = reader.readAsArrayBuffer(file);
    reader.onload = function (e) {
      playMIDIFile(e.target.result);
    };
  });
};

const playSound = (name, velocity = 1) => {
  const sound = audioSources[name];
  const soundId = sound.play();
  sound.fade(0, volume * velocity, 50, soundId);
  sound.fade(volume * velocity, 0, 3000);
};

setupLights();
setupBasicScene();
setupCamera();
setupRenderer();

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
        return new Promise((resolve) => {
          const sound = (audioSources[note] = new Howl({
            src: [`sounds/${note}.mp3`],
            onload: () => {
              if (sound.state() == "loaded") {
                loadingProgress.value = parseInt((index / 88) * 100);
                currentFile.innerHTML = `sounds/${note}.mp3<span>${
                  index + 1
                } / 88</span>`;
                if (index + 1 == 88) {
                  currentFile.innerHTML = `Finishing loading...`;
                }
                resolve();
              }
            },
          }));
        });
      })
    ).then(() => {
      filesLoaded();
    });
  },
  (xhr) => {
    const percentComplete = parseInt((xhr.loaded / 289907) * 100);
    currentFile.innerHTML = `models/piano/piano.gltf<span>${percentComplete}%</div>`;
    loadingProgress.value = percentComplete;
  }
);

const filesLoaded = () => {
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
};

const sharpToFlat = (noteName) => {
  const flats = {
    "A#": "Bb",
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
  };
  return flats[noteName] || noteName;
};

const playMIDIFile = (file) => {
  const notes = [];
  const velocities = [];
  const durations = [];
  const delays = [];

  const midi = new Midi(file);
  const tracks = midi.tracks;
  tracks.forEach((track) => {
    const notesTrack = track.notes;
    notesTrack.forEach((note) => {
      const pitch = sharpToFlat(note.pitch);
      const name = `${pitch + note.octave}`;
      const velocity = note.velocity;
      notes.push(name);
      velocities.push(velocity);
      durations.push(note.duration * 1000);
      delays.push(note.time * 1000);
    });
  });

  for (let i = 0; i < notes.length; i++) {
    setTimeout(() => {
      try {
        playSound(notes[i], velocities[i]);
        const id = getNoteIndex(notes[i]);
        const key = piano.children[0].getObjectByName(
          `key${id.toString().padStart(2, 0)}`
        );
        pressKey(key);
        setTimeout(() => {
          releaseKey(key);
        }, durations[i]);
      } catch (error) {}
    }, delays[i]);
  }
};

const getNote = (string) => {
  if (string[string.length - 2] === "0") {
    return string[string.length - 1];
  } else {
    return string.slice(-2);
  }
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let activeKey = null;

const pressKey = (object) => {
  const baseRotation = object.userData.rotation;
  const basePosition = object.userData.position;
  object.rotation.x = baseRotation + THREE.Math.degToRad(5);
  object.position.y = basePosition - 0.00475;
};

const releaseKey = (object) => {
  const baseRotation = object.userData.rotation;
  const basePosition = object.userData.position;
  object.rotation.x = baseRotation;
  object.position.y = basePosition;
};

const handleKeys = () => {
  for (const key in keyboard) {
    const keyNew = keyboard[key];
    const keyOld = keyboardOld[key];

    if (keyNew != keyOld) {
      const keyName = key.toUpperCase();
      const note = keyMap[keyName];
      if (keyNew) {
        try {
          playSound(note);
          const id = notes.indexOf(note);
          const key = piano.children[0].getObjectByName(
            `key${id.toString().padStart(2, 0)}`
          );
          pressKey(key);
        } catch {}
      }
      if (keyOld) {
        const id = notes.indexOf(note);
        const key = piano.children[0].getObjectByName(
          `key${id.toString().padStart(2, 0)}`
        );
        if (key) {
          releaseKey(key);
        }
      }
    }
  }
  Object.assign(keyboardOld, keyboard);
};

const onKeyPress = (event) => {
  keyboard[event.key] = true;
  handleKeys();
};

const onKeyRelease = (event) => {
  keyboard[event.key] = null;
  handleKeys();
};

const onMouseDown = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    activeKey = intersects[0].object;
    const id = getNote(activeKey.name);
    const name = notes[id];
    playSound(name);
    pressKey(activeKey);
  }
};

const onMouseUp = () => {
  if (activeKey) releaseKey(activeKey);
  activeKey = null;
};

const onMouseMove = (event) => {
  if (!activeKey) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    const key = intersects[0].object;
    if (activeKey != key) {
      releaseKey(activeKey);
      activeKey = key;
      const id = getNote(key.name);
      const name = notes[id];
      playSound(name);
      pressKey(activeKey);
    }
  }
};

const onTouchStart = (event) => {
  const touch = event.touches[0];
  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    activeKey = intersects[0].object;
    const id = getNote(activeKey.name);
    const name = notes[id];
    playSound(name);
    pressKey(activeKey);
  }
};

const onTouchEnd = () => {
  if (activeKey) releaseKey(activeKey);
  activeKey = null;
};

const onTouchMove = (event) => {
  if (!activeKey) return;
  const touch = event.touches[0];
  mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pianoKeys);
  if (intersects.length > 0) {
    const key = intersects[0].object;
    if (activeKey != key) {
      releaseKey(activeKey);
      activeKey = key;
      const id = getNote(key.name);
      const name = notes[id];
      playSound(name);
      pressKey(activeKey);
    }
  }
};

setupEvents();

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
