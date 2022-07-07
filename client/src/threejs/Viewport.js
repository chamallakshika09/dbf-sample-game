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
    this.raycaster.params.Line.threshold = 0.1;

    this.mouse = new THREE.Vector2(1, 1);
    this.INTERSECTED = null;

    //  this all needs to be moved to viewport.control
    this.orbit = this.getOrbitControls(this.camera, this.renderer.domElement);
    this.transformControl = this.getTransformControl(this.camera, this.renderer.domElement, this.orbit);
    this.transformControl.space = 'local';
    this.scene.add(this.transformControl);
    this.controls = new Controls(editor, this);
    this.clock = new THREE.Clock();

    this.renderer.domElement.addEventListener('mousemove', this.mouseHover.bind(this));
  }

  getCamera = () => {
    let container = this.element.current;
    let width = container.offsetWidth;
    let height = window.innerHeight;

    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(60, aspect, 0.2, 2000);
    camera.position.set(70, 70, 70);
    return camera;
  };

  getRenderer = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;

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

  updateMouse(event) {
    const posX = event.clientX;
    const posY = event.clientY;

    if (!posX || !posY) {
      return;
    }

    this.mouse.x = ((posX - this.renderer.domElement.offsetLeft) / window.innerWidth) * 2 - 1;
    this.mouse.y = -((posY - this.renderer.domElement.offsetTop) / window.innerHeight) * 2 + 1;
  }

  mouseHover(event) {
    const { selectionMode } = this.controls;
    let mouse = this.mouse;
    let camera = this.camera;
    let raycaster = this.raycaster;
    let objects = selectionMode ? [...this.editor.state.balls] : this.getRaycastableObjects();
    // if (!objects) return;

    this.updateMouse(event);

    let { intersects, INTERSECTED } = Select({ raycaster, mouse, camera, objects });

    if (INTERSECTED) {
      ToggleHighlight(this.editor, intersects, INTERSECTED);
      return;
    }

    if (!this.INTERSECTED) return;
    if (!selectionMode) {
      let hex = this.INTERSECTED.userData.color;
      this.INTERSECTED.material.color.setHex(hex);
      this.INTERSECTED = null;
      return;
    }
    if (this.INTERSECTED.material.color.getHex() === 0xfa9c3f) {
      let hex = this.INTERSECTED.userData.color;
      this.INTERSECTED.material.color.setHex(hex);
      this.INTERSECTED = null;
    }
  }

  getRaycastableObjects() {
    let objects = [...this.editor.state.balls, ...this.editor.state.ropes];
    return objects;
  }
}

function ToggleHighlight(editor, intersects, INTERSECTED) {
  const { viewport } = editor;
  const { selectionMode } = viewport.controls;

  if (intersects.length === 0) return;
  if (INTERSECTED !== viewport.INTERSECTED) {
    if (viewport.INTERSECTED && !selectionMode) {
      let hex = INTERSECTED.userData.color;
      viewport.INTERSECTED.material.color.setHex(hex);
    }
    viewport.INTERSECTED = INTERSECTED;
    viewport.intersects = intersects;
    if (!selectionMode) {
      viewport.INTERSECTED.currentHex = viewport.INTERSECTED.material.color.getHex();
    }
    const hex = selectionMode ? 0xfa9c3f : 0xff0000;
    viewport.INTERSECTED.material.color.setHex(hex);
  }
}

function Select(params) {
  let { raycaster, mouse, camera, objects } = params;

  raycaster.setFromCamera(mouse, camera);

  let intersections = raycaster.intersectObjects(objects, false);

  if (intersections.length) {
    const intersects = intersections.map((i) => i.object);
    let INTERSECTED = intersects[0];
    return { intersects, INTERSECTED, intersections };
  }

  return { intersects: null, INTERSECTED: null };
}

export default Viewport;
