import * as THREE from 'three';
import Ammo from 'ammo.js';
import { v4 as uuidv4 } from 'uuid';

class Game {
  constructor(editor, viewport) {
    // this.test = 'test';
    this.viewport = viewport;
    this.editor = editor;
    this.margin = 0.05;
    this.rigidBodies = [];
    this.armMovement = 0;
    this.gravityConstant = -9.8;
    // elements option
    this.ballRadius = 0.6;
    this.ballMass = 0;
    this.ropeNumSegments = 10;
    this.ropeMass = 3;
    this.influence = 1;

    //scene objects
    this.ceiling = null;

    this.addLights();
    this.initScene(); //lets keep this at the end of the constructor
  }

  initScene = async () => {
    this.Ammo = await Ammo();
    this.initPhysics();

    this.createObjects();
    this.editor.loadGame();
    this.editor.updateGame();
    this.animate();
  };

  clearScene = () => {
    const { balls, ropes } = this.editor.state;

    if (balls.length > 0) {
      for (let i = 0; i < balls.length; i++) {
        const ball = this.viewport.scene.getObjectById(balls[i].id);
        if (ball) {
          this.viewport.scene.remove(ball);
          ball.geometry.dispose();
          ball.material.dispose();
        }
      }
    }

    if (ropes.length > 0) {
      for (let i = 0; i < ropes.length; i++) {
        const rope = this.viewport.scene.getObjectById(ropes[i].id);
        if (rope) {
          this.viewport.scene.remove(rope);
          rope.geometry.dispose();
          rope.material.dispose();
        }
      }
    }
  };

  createBallFromState = (ball, ballRadius, ballMass) => {
    const ballShape = new this.Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(this.margin);
    this.createRigidBody(ball, ballShape, ballMass, ball.userData.pos, ball.userData.quat);
  };

  createRopeFromState = (rope) => {
    const { balls } = this.editor.state;
    const ball1 = balls.filter((ball) => ball.userData.id === rope.userData.ball1)[0];
    const ball2 = balls.filter((ball) => ball.userData.id === rope.userData.ball2)[0];

    // Rope graphic object
    this.viewport.scene.add(rope);

    // Rope physic object
    const softBodyHelpers = new this.Ammo.btSoftBodyHelpers();
    const ropeStart = new this.Ammo.btVector3(ball1.position.x, ball1.position.y, ball1.position.z);
    const ropeEnd = new this.Ammo.btVector3(ball2.position.x, ball2.position.y, ball2.position.z);
    const ropeSoftBody = softBodyHelpers.CreateRope(
      this.physicsWorld.getWorldInfo(),
      ropeStart,
      ropeEnd,
      this.ropeNumSegments - 1,
      0
    );
    const sbConfig = ropeSoftBody.get_m_cfg();
    sbConfig.set_viterations(10);
    sbConfig.set_piterations(10);
    ropeSoftBody.setTotalMass(this.ropeMass, false);
    this.Ammo.castObject(ropeSoftBody, this.Ammo.btCollisionObject)
      .getCollisionShape()
      .setMargin(this.margin * 3);
    this.physicsWorld.addSoftBody(ropeSoftBody, 1, -1);
    rope.userData.physicsBody = ropeSoftBody;
    // Disable deactivation
    ropeSoftBody.setActivationState(4);

    ropeSoftBody.appendAnchor(0, ball1.userData.physicsBody, true, this.influence);
    ropeSoftBody.appendAnchor(this.ropeNumSegments, ball2.userData.physicsBody, true, this.influence);

    return ropeSoftBody;
  };

  loadInitialScene = () => {
    const { balls, ropes } = this.editor.state;

    if (balls.length > 0) {
      for (let i = 0; i < balls.length; i++) {
        this.createBallFromState(balls[i], this.ballRadius, this.ballMass);
      }
    }

    if (ropes.length > 0) {
      for (let i = 0; i < ropes.length; i++) {
        this.createRopeFromState(ropes[i]);
      }
    }
  };

  createBall = (ballMass, ballRadius, position) => {
    const quaternion = new THREE.Quaternion();

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 20, 20),
      new THREE.MeshPhongMaterial({ color: 0x202020 })
    );
    ball.castShadow = true;
    ball.receiveShadow = true;
    const ballShape = new this.Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(this.margin);
    this.createRigidBody(ball, ballShape, ballMass, position, quaternion);
    ball.userData.physicsBody.setFriction(0.5);
    ball.userData.id = uuidv4();
    ball.userData.pos = position;
    ball.userData.quat = quaternion;
    return ball;
  };

  createObjects = () => {
    this.floor = this.createFloor(0, 60, 60, 1);
    this.ceiling = this.createCeiling(40, 60, 10);
  };

  createRope = (ball1, ball2) => {
    // Rope graphic object
    const ropeGeometry = new THREE.BufferGeometry();
    const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const ropePositions = [];
    const ropeIndices = [];

    const ropePoints = divideSegment3D(ball1.position, ball2.position, this.ropeNumSegments);

    for (let i = 0; i < this.ropeNumSegments + 1; i++) {
      let point = ropePoints[i];
      ropePositions.push(point.x, point.y, point.z);
    }

    for (let i = 0; i < this.ropeNumSegments; i++) {
      ropeIndices.push(i, i + 1);
    }

    ropeGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(ropeIndices), 1));
    ropeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ropePositions), 3));
    ropeGeometry.computeBoundingSphere();
    const rope = new THREE.LineSegments(ropeGeometry, ropeMaterial);
    rope.castShadow = true;
    rope.receiveShadow = true;
    this.viewport.scene.add(rope);

    // Rope physic object
    const softBodyHelpers = new this.Ammo.btSoftBodyHelpers();
    const ropeStart = new this.Ammo.btVector3(ball1.position.x, ball1.position.y, ball1.position.z);
    const ropeEnd = new this.Ammo.btVector3(ball2.position.x, ball2.position.y, ball2.position.z);
    const ropeSoftBody = softBodyHelpers.CreateRope(
      this.physicsWorld.getWorldInfo(),
      ropeStart,
      ropeEnd,
      this.ropeNumSegments - 1,
      0
    );
    const sbConfig = ropeSoftBody.get_m_cfg();
    sbConfig.set_viterations(10);
    sbConfig.set_piterations(10);
    ropeSoftBody.setTotalMass(this.ropeMass, false);
    this.Ammo.castObject(ropeSoftBody, this.Ammo.btCollisionObject)
      .getCollisionShape()
      .setMargin(this.margin * 3);
    this.physicsWorld.addSoftBody(ropeSoftBody, 1, -1);
    rope.userData.physicsBody = ropeSoftBody;
    // Disable deactivation
    ropeSoftBody.setActivationState(4);

    rope.userData.id = uuidv4();
    rope.userData.ball1 = ball1.userData.id;
    rope.userData.ball2 = ball2.userData.id;

    this.editor.state.ropes.push(rope);

    ropeSoftBody.appendAnchor(0, ball1.userData.physicsBody, true, this.influence);
    ropeSoftBody.appendAnchor(this.ropeNumSegments, ball2.userData.physicsBody, true, this.influence);

    return { rope, ropeSoftBody };
  };

  addLights = () => {
    const { scene } = this.viewport;
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 10, 5);
    light.castShadow = true;
    const d = 10;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;

    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;

    scene.add(light);
  };

  initPhysics = () => {
    // Physics configuration

    this.collisionConfiguration = new this.Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    this.dispatcher = new this.Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new this.Ammo.btDbvtBroadphase();
    this.solver = new this.Ammo.btSequentialImpulseConstraintSolver();
    this.softBodySolver = new this.Ammo.btDefaultSoftBodySolver();
    this.physicsWorld = new this.Ammo.btSoftRigidDynamicsWorld(
      this.dispatcher,
      this.broadphase,
      this.solver,
      this.collisionConfiguration,
      this.softBodySolver
    );
    this.physicsWorld.setGravity(new this.Ammo.btVector3(0, this.gravityConstant, 0));
    this.physicsWorld.getWorldInfo().set_m_gravity(new this.Ammo.btVector3(0, this.gravityConstant, 0));

    this.transformAux1 = new this.Ammo.btTransform();
  };

  createCeiling = (translationY, size, divisions) => {
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.position.set(0, translationY, 0);
    this.viewport.scene.add(gridHelper);

    let geometry = new THREE.PlaneBufferGeometry(size, size, 1, 1);
    geometry.rotateX(-Math.PI / 2);
    let material = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    let floor = new THREE.Mesh(geometry, material);
    floor.position.set(0, translationY, 0);
    floor.visible = false;
    this.viewport.scene.add(floor);

    return floor;
  };

  createFloor = (translationY, width, length, height) => {
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    position.set(0, translationY - height / 2, 0);
    quaternion.set(0, 0, 0, 1);
    const floor = this.createParalellepiped(
      width,
      height,
      length,
      0,
      position,
      quaternion,
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    floor.castShadow = false;
    floor.receiveShadow = false;

    return floor;
  };

  createParalellepiped = (sx, sy, sz, mass, position, quaternion, material) => {
    const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    const shape = new this.Ammo.btBoxShape(new this.Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(this.margin);

    this.createRigidBody(threeObject, shape, mass, position, quaternion);

    return threeObject;
  };

  createRigidBody = (threeObject, physicsShape, mass, position, quaternion) => {
    threeObject.position.copy(position);
    threeObject.quaternion.copy(quaternion);

    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new this.Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
    const motionState = new this.Ammo.btDefaultMotionState(transform);

    const localInertia = new this.Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    const body = new this.Ammo.btRigidBody(rbInfo);

    threeObject.userData.physicsBody = body;

    this.viewport.scene.add(threeObject);

    if (mass > 0) {
      this.rigidBodies.push(threeObject);

      // Disable deactivation
      body.setActivationState(4);
    }

    this.physicsWorld.addRigidBody(body);
  };

  updatePhysics = (deltaTime) => {
    // Step world
    this.physicsWorld.stepSimulation(deltaTime, 10);

    //update Ropes
    for (let i = 0; i < this.editor.state.ropes.length; i++) {
      const rope = this.editor.state.ropes[i];
      const softBody = rope.userData.physicsBody;
      const ropePositions = rope.geometry.attributes.position.array;
      const numVerts = ropePositions.length / 3;
      const nodes = softBody.get_m_nodes();
      let indexFloat = 0;

      for (let i = 0; i < numVerts; i++) {
        const node = nodes.at(i);
        const nodePos = node.get_m_x();
        ropePositions[indexFloat++] = nodePos.x();
        ropePositions[indexFloat++] = nodePos.y();
        ropePositions[indexFloat++] = nodePos.z();
      }

      rope.geometry.attributes.position.needsUpdate = true;
    }

    // Update rigid bodies
    for (let i = 0, il = this.rigidBodies.length; i < il; i++) {
      const objThree = this.rigidBodies[i];
      const objPhys = objThree.userData.physicsBody;
      const ms = objPhys.getMotionState();
      if (ms) {
        ms.getWorldTransform(this.transformAux1);
        const p = this.transformAux1.getOrigin();
        const q = this.transformAux1.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }
  };

  animate = () => {
    if (this.viewport.requestID) {
      cancelAnimationFrame(this.viewport.requestID);
    }
    this.viewport.requestID = requestAnimationFrame(this.animate);
    this.viewport.render();
  };
}

export default Game;

function divideSegment3D(p1, p2, divNum) {
  let lineVec = lineVector(p1, p2);
  let divPts = [];

  let x1 = p1.x;
  let x2 = lineVec.x;
  let y1 = p1.y;
  let y2 = lineVec.y;
  let z1 = p1.z;
  let z2 = lineVec.z;

  for (let i = 0; i < divNum; i++) {
    let tempVec = new THREE.Vector3(x1 + (x2 * i) / divNum, y1 + (y2 * i) / divNum, z1 + (z2 * i) / divNum);
    divPts.push(tempVec);
  }
  //let's also add last point p2
  divPts.push(p2);
  return divPts;
}

// vector between 2 lines, not normalized
function lineVector(p1, p2) {
  let nx = p2.x - p1.x;
  let ny = p2.y - p1.y;
  let nz = p2.z - p1.z;
  return new THREE.Vector3(nx, ny, nz);
}
