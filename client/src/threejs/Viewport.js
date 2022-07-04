import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { Controls } from './Viewport.controls.js';

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
    this.orbit = this.getOrbit(editor);
    this.transformControl = this.getControl(editor);
    this.transformControl.space = 'local';
    this.scene.add(this.transformControl);
    this.controls = Controls(editor, this);
  }

  getCamera() {
    // move to viewport?
    let container = this.element.current;
    let width = container.offsetWidth;
    let height = window.innerHeight;

    const aspect = width / height;

    this.cameraPersp = new THREE.PerspectiveCamera(75, aspect, 1, 5000);
    this.cameraPersp.position.y = 60;
    this.cameraOrtho = new THREE.OrthographicCamera(-600 * aspect, 600 * aspect, 600, -600, 0.01, 30000);
    this.currentCamera = this.cameraPersp;
    this.currentCamera.position.set(500, 500, 500);
    this.currentCamera.lookAt(0, 60, 0);
    return this.currentCamera;
  }

  getRenderer(container) {
    let width = container.offsetWidth;
    let height = window.innerHeight;

    // let renderer = new THREE.WebGLRenderer();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    // renderer.setPixelRatio(width / height);
    renderer.setSize(width, height);
    // renderer.setSize(container.offsetWidth, container.offsetHeight)
    renderer.setClearColor(0x000000, 0); // the default
    renderer.localClippingEnabled = true;

    renderer.autoClearStencil = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    return renderer;
  }

  getOrbit(editor) {
    let orbit = new OrbitControls(this.camera, this.renderer.domElement);
    orbit.update();
    orbit.minPolarAngle = 0;
    orbit.maxPolarAngle = Math.PI;
    /*        orbit.minAzimuthAngle = 0
                    orbit.maxAzimuthAngle = Math.PI*/
    orbit.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };

    orbit.enablePan = true;
    orbit.minDistance = 10;
    orbit.maxDistance = 2000;

    return orbit;
  }

  getControl(editor) {
    let control = new TransformControls(this.camera, this.renderer.domElement);
    control.colliders = [];
    control.tags = [];
    control.rayLines = [];

    control.addEventListener('dragging-changed', (event) => {
      this.orbit.enabled = !event.value;
    });

    control.addEventListener('objectChange', function () {
      if (this.object.type === 'Group') {
        this.object.children.forEach((child) => {
          // console.log('transmit group');
          let objectData = {
            uuid: child.uuid,
            position: child.getWorldPosition(new THREE.Vector3()),
            rotation: null,
            scale: child.getWorldScale(new THREE.Vector3()),
            quaternion: child.getWorldQuaternion(new THREE.Quaternion()),
          };

          editor.signals.objectChanged.dispatch(editor, objectData);
        });

        return;
      }

      if (this.object.type === 'Mesh') {
        let objectData = {
          uuid: this.object.uuid,
          position: this.object.position,
          rotation: this.object.rotation,
          scale: this.object.scale,
        };

        editor.signals.objectChanged.dispatch(editor, objectData);
      }
    });

    control.addEventListener('mouseDown', function () {});

    return control;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export default Viewport;
