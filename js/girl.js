import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js";
import { Sky } from "https://unpkg.com/three/examples/jsm/objects/Sky.js";
import { GUI } from "https://unpkg.com/three/examples/jsm/libs/lil-gui.module.min.js";

class Map {
  constructor() {
    //create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);

    //create renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExpose = 0.5;
    document.body.appendChild(this.renderer.domElement);

    //create sky and sun
    const sky = new Sky();
    sky.scale.setScalar(450000);
    this.scene.add(sky);

    const sun = new THREE.Vector3();

    const effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      elevation: 5,
      azimuth: 180,
      exposure: this.renderer.toneMappingExpose,
    };

    //implement gui
    function guiChanged() {
      const uniforms = sky.material.uniforms;
      uniforms["turbidity"].value = effectController.turbidity;
      uniforms["rayleigh"].value = effectController.rayleigh;
      uniforms["mieCoefficient"].value = effectController.mieCoefficient;
      uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
      const theta = THREE.MathUtils.degToRad(effectController.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      uniforms["sunPosition"].value.copy(sun);

      this.renderer.toneMappingExposure = effectController.exposure;
    }

    const gui = new GUI();

    gui
      .add(effectController, "turbidity", 0.0, 20.0, 0.1)
      .onChange(guiChanged.bind(this));
    gui
      .add(effectController, "rayleigh", 0.0, 4, 0.001)
      .onChange(guiChanged.bind(this));
    gui
      .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
      .onChange(guiChanged.bind(this));
    gui
      .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
      .onChange(guiChanged.bind(this));
    gui
      .add(effectController, "elevation", 0, 90, 0.1)
      .onChange(guiChanged.bind(this));
    gui
      .add(effectController, "azimuth", -180, 180, 0.1)
      .onChange(guiChanged.bind(this));
    gui
      .add(effectController, "exposure", 0, 1, 0.0001)
      .onChange(guiChanged.bind(this));

    guiChanged.bind(this)();

    //load model
    const loader = new GLTFLoader();
    loader.load("https://raw.githubusercontent.com/Assxios/threejs_a_girl/main/assets/just_a_girl/scene.gltf", (uwu) => {
      this.gltf = uwu.scene;
      this.gltf.position.y = -75;
      this.scene.add(uwu.scene);
    });

    //create camera
    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.set(400, 200, 0);

    //create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;

    this.controls.screenSpacePanning = true;

    this.controls.minDistance = 50;
    this.controls.maxDistance = 500;

    this.controls.maxPolarAngle = 360;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.renderer.render(this.scene, this.camera);
  }
}
new Map().animate();
