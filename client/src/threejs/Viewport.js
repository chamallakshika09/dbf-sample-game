import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Controls from './Viewport.controls.js';

class Viewport {
  constructor(editor, element) {
    this.editor = editor;
    this.element = element;
    let container = element.current;

    this.scene = new THREE.Scene();
    this.scene.name = 'Scene';
    this.camera = this.getCamera();
    this.renderer = this.getRenderer(container);

    container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();

    this.mouse = new THREE.Vector2(1, 1);
    this.INTERSECTED = null;

    //  this all needs to be moved to viewport.control
    this.orbit = this.getOrbitControls(this.camera, this.renderer.domElement);
    this.transformControl = this.getTransformControl(this.camera, this.renderer.domElement, this.orbit);
    this.transformControl.space = 'local';
    this.scene.add(this.transformControl);
    this.controls = new Controls(editor, this);
    this.clock = new THREE.Clock();
  }

  getCamera = () => {
    // move to viewport?
    let container = this.element.current;
    let width = container.offsetWidth;
    let height = window.innerHeight;

    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(60, aspect, 0.2, 2000);
    camera.position.y = 60;
    camera.position.set(-7, 5, 8);
    return camera;
  };

  getRenderer = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    // let renderer = new THREE.WebGLRenderer();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // renderer.setClearColor(0x000000, 0); // the default
    // renderer.localClippingEnabled = true;

    // renderer.autoClearStencil = true;

    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    return renderer;
  };

  getOrbitControls = (camera, domElement) => {
    let orbit = new OrbitControls(camera, domElement);
    orbit.target.set(0, 2, 0);
    orbit.update();
    // orbit.minPolarAngle = 0;
    // orbit.maxPolarAngle = Math.PI;
    // /*        orbit.minAzimuthAngle = 0
    //                 orbit.maxAzimuthAngle = Math.PI*/
    // orbit.mouseButtons = {
    //   LEFT: null,
    //   MIDDLE: THREE.MOUSE.PAN,
    //   RIGHT: THREE.MOUSE.ROTATE,
    // };

    // orbit.enablePan = true;
    // orbit.minDistance = 10;
    // orbit.maxDistance = 2000;

    return orbit;
  };

  getTransformControl = (camera, domElement, orbit) => {
    let control = new TransformControls(camera, domElement);
    control.colliders = [];
    control.tags = [];
    control.rayLines = [];

    control.addEventListener('dragging-changed', (event) => {
      orbit.enabled = !event.value;
    });

    return control;
  };

  render = () => {
    const deltaTime = this.clock.getDelta();

    this.editor.game.updatePhysics(deltaTime);
    this.renderer.render(this.scene, this.camera);
  };
}

export default Viewport;
