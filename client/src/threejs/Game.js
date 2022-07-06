import * as THREE from 'three';
import Ammo from 'ammo.js';

class Game {
  constructor(editor, viewport) {
    // this.test = 'test';
    this.viewport = viewport;
    this.editor = editor;
    this.margin = 0.05;
    this.rigidBodies = [];
    this.armMovement = 0;
    this.gravityConstant = -9.8;
    this.addLights();
    this.initScene();

    //scene objects
    this.ceiling = null;
    this.balls = [];
  }

  initScene = async () => {
    this.Ammo = await Ammo();
    this.initPhysics();

    this.createTestScene();

    // this.createObjects();
    // this.update();
    this.animate();
  };

  createTestBall = (ballMass, ballRadius, pos, quat) => {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 20, 20),
      new THREE.MeshPhongMaterial({ color: 0x202020 })
    );
    ball.castShadow = true;
    ball.receiveShadow = true;
    const ballShape = new this.Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(this.margin);
    this.createRigidBody(ball, ballShape, ballMass, pos, quat);
    ball.userData.physicsBody.setFriction(0.5);
    return ball;
  };

  createBallOnCeiling = (position) => {
    const quat = new THREE.Quaternion();
    const ballMass = 0;
    const ballRadius = 0.6;

    let ball = this.createTestBall(ballMass, ballRadius, position, quat);
    return ball;
  };

  attachBallsToRope = (ball1, ball2, ballRadius, dir) => {
    const ropeNumSegments = 10;
    const ropeMass = 3;
    const ropePos = ball1.position.clone();
    // const ropeLength = 4;
    const ropeLength = ball1.position.clone().distanceTo(ball2.position.clone());
    const segmentLength = ropeLength / ropeNumSegments;
    const { rope, ropeSoftBody } = this.createTestRope(
      ballRadius,
      ropeLength,
      ropeNumSegments,
      ropeMass,
      ropePos,
      segmentLength,
      dir
    );

    // this.rope = rope;
    this.editor.state.ropes.push(rope);

    const influence = 1;
    ropeSoftBody.appendAnchor(0, ball1.userData.physicsBody, true, influence);
    ropeSoftBody.appendAnchor(ropeNumSegments, ball2.userData.physicsBody, true, influence);
  };

  getPos = ({ x, y, z }, dir) => {
    if (dir === 'x') {
      return { x: x + 5, y, z };
    }
    if (dir === 'y') {
      return { x, y: y + 5, z };
    }
    if (dir === 'z') {
      return { x, y, z: z + 5 };
    }
  };

  createTestScene = () => {
    this.ceiling = this.createCeiling(20, 60, 60);

    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const ballMass = 0;
    const ballRadius = 0.6;
    const directions = ['x', 'y', 'z'];
    pos.set(0, 2, 0);
    quat.set(0, 0, 0, 1);
    const balls = [];
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        balls.push(this.createTestBall(ballMass, ballRadius, pos, quat));
      } else {
        const dir = directions[(i - 1) % 3];
        const { x, y, z } = this.getPos(pos, dir);
        pos.set(x, y, z);
        balls.push(this.createTestBall(ballMass, ballRadius, pos, quat));
        this.attachBallsToRope(balls[i - 1], balls[i], ballRadius, dir);
      }
    }

    //grid helper (ground)
    const size = 60;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions);
    this.viewport.scene.add(gridHelper);
  };

  getRopeEnd = (ropePos, ropeLength, dir) => {
    if (dir === 'x') {
      return new this.Ammo.btVector3(ropePos.x + ropeLength, ropePos.y, ropePos.z);
    }
    if (dir === 'y') {
      return new this.Ammo.btVector3(ropePos.x, ropePos.y + ropeLength, ropePos.z);
    }
    if (dir === 'z') {
      return new this.Ammo.btVector3(ropePos.x, ropePos.y, ropePos.z + ropeLength);
    }
  };

  createTestRope = (ballRadius, ropeLength, ropeNumSegments, ropeMass, ropePos, segmentLength, dir) => {
    // Rope graphic object
    ropePos.y += ballRadius;
    const ropeGeometry = new THREE.BufferGeometry();
    const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const ropePositions = [];
    const ropeIndices = [];

    for (let i = 0; i < ropeNumSegments + 1; i++) {
      if (dir === 'x') {
        ropePositions.push(ropePos.x + i * segmentLength, ropePos.y, ropePos.z);
      }
      if (dir === 'y') {
        ropePositions.push(ropePos.x, ropePos.y + i * segmentLength, ropePos.z);
      }
      if (dir === 'z') {
        ropePositions.push(ropePos.x, ropePos.y, ropePos.z + i * segmentLength);
      }
    }

    for (let i = 0; i < ropeNumSegments; i++) {
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
    const ropeStart = new this.Ammo.btVector3(ropePos.x, ropePos.y, ropePos.z);
    const ropeEnd = this.getRopeEnd(ropePos, ropeLength, dir);
    const ropeSoftBody = softBodyHelpers.CreateRope(
      this.physicsWorld.getWorldInfo(),
      ropeStart,
      ropeEnd,
      ropeNumSegments - 1,
      0
    );
    const sbConfig = ropeSoftBody.get_m_cfg();
    sbConfig.set_viterations(10);
    sbConfig.set_piterations(10);
    ropeSoftBody.setTotalMass(ropeMass, false);
    this.Ammo.castObject(ropeSoftBody, this.Ammo.btCollisionObject)
      .getCollisionShape()
      .setMargin(this.margin * 3);
    this.physicsWorld.addSoftBody(ropeSoftBody, 1, -1);
    rope.userData.physicsBody = ropeSoftBody;
    // Disable deactivation
    ropeSoftBody.setActivationState(4);

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
    //this.physicsWorld.setGravity(new this.Ammo.btVector3(0, 0, 0));
    this.physicsWorld.getWorldInfo().set_m_gravity(new this.Ammo.btVector3(0, this.gravityConstant, 0));
    // this.physicsWorld.getWorldInfo().set_m_gravity(new this.Ammo.btVector3(0, 0, 0));

    this.transformAux1 = new this.Ammo.btTransform();
  };

  createBall = (ballMass, ballRadius, pos, quat) => {
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 20, 20),
      new THREE.MeshPhongMaterial({ color: 0x202020 })
    );
    ball.castShadow = true;
    ball.receiveShadow = true;
    const ballShape = new this.Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(this.margin);
    pos.set(-3, 2, 0);
    quat.set(0, 0, 0, 1);
    this.createRigidBody(ball, ballShape, ballMass, pos, quat);
    ball.userData.physicsBody.setFriction(0.5);
    return ball;
  };

  createCeiling = (height, width, length) => {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    pos.set(0, height, 0);
    quat.set(0, 0, 0, 1);
    const ceiling = this.createParalellepiped(
      width,
      1,
      length,
      0,
      pos,
      quat,
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    ceiling.castShadow = false;
    ceiling.receiveShadow = false;

    return ceiling;
  };

  createWall = (pos, quat, brickMass, brickLength, brickDepth, brickHeight, numBricksLength, numBricksHeight) => {
    const z0 = -numBricksLength * brickLength * 0.5;
    pos.set(0, brickHeight * 0.5, z0);
    quat.set(0, 0, 0, 1);

    for (let j = 0; j < numBricksHeight; j++) {
      const oddRow = j % 2 === 1;

      pos.z = z0;

      if (oddRow) {
        pos.z -= 0.25 * brickLength;
      }

      const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

      for (let i = 0; i < nRow; i++) {
        let brickLengthCurrent = brickLength;
        let brickMassCurrent = brickMass;
        if (oddRow && (i === 0 || i === nRow - 1)) {
          brickLengthCurrent *= 0.5;
          brickMassCurrent *= 0.5;
        }

        const brick = this.createParalellepiped(
          brickDepth,
          brickHeight,
          brickLengthCurrent,
          brickMassCurrent,
          pos,
          quat,
          this.createMaterial()
        );
        brick.castShadow = true;
        brick.receiveShadow = true;

        if (oddRow && (i === 0 || i === nRow - 2)) {
          pos.z += 0.75 * brickLength;
        } else {
          pos.z += brickLength;
        }
      }

      pos.y += brickHeight;
    }
  };

  createRope = (ballRadius, ropeLength, ropeNumSegments, ropeMass, ropePos, segmentLength) => {
    // Rope graphic object
    ropePos.y += ballRadius;
    const ropeGeometry = new THREE.BufferGeometry();
    const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const ropePositions = [];
    const ropeIndices = [];

    for (let i = 0; i < ropeNumSegments + 1; i++) {
      ropePositions.push(ropePos.x, ropePos.y + i * segmentLength, ropePos.z);
    }

    for (let i = 0; i < ropeNumSegments; i++) {
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
    const ropeStart = new this.Ammo.btVector3(ropePos.x, ropePos.y, ropePos.z);
    const ropeEnd = new this.Ammo.btVector3(ropePos.x, ropePos.y + ropeLength, ropePos.z);
    const ropeSoftBody = softBodyHelpers.CreateRope(
      this.physicsWorld.getWorldInfo(),
      ropeStart,
      ropeEnd,
      ropeNumSegments - 1,
      0
    );
    const sbConfig = ropeSoftBody.get_m_cfg();
    sbConfig.set_viterations(10);
    sbConfig.set_piterations(10);
    ropeSoftBody.setTotalMass(ropeMass, false);
    this.Ammo.castObject(ropeSoftBody, this.Ammo.btCollisionObject)
      .getCollisionShape()
      .setMargin(this.margin * 3);
    this.physicsWorld.addSoftBody(ropeSoftBody, 1, -1);
    rope.userData.physicsBody = ropeSoftBody;
    // Disable deactivation
    ropeSoftBody.setActivationState(4);

    return { rope, ropeSoftBody };
  };

  createBase = (pos, quat, ropePos, armMass, armLength, pylonHeight) => {
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
    pos.set(ropePos.x, 0.1, ropePos.z - armLength);
    quat.set(0, 0, 0, 1);
    const base = this.createParalellepiped(1, 0.2, 1, 0, pos, quat, baseMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    pos.set(ropePos.x, 0.5 * pylonHeight, ropePos.z - armLength);
    const pylon = this.createParalellepiped(0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial);
    pylon.castShadow = true;
    pylon.receiveShadow = true;
    pos.set(ropePos.x, pylonHeight + 0.2, ropePos.z - 0.5 * armLength);
    const arm = this.createParalellepiped(0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial);
    arm.castShadow = true;
    arm.receiveShadow = true;
    return { arm, pylon };
  };

  createHinge = (pylonHeight, armLength, pylon, arm) => {
    const pivotA = new this.Ammo.btVector3(0, pylonHeight * 0.5, 0);
    const pivotB = new this.Ammo.btVector3(0, -0.2, -armLength * 0.5);
    const axis = new this.Ammo.btVector3(0, 1, 0);
    const hinge = new this.Ammo.btHingeConstraint(
      pylon.userData.physicsBody,
      arm.userData.physicsBody,
      pivotA,
      pivotB,
      axis,
      axis,
      true
    );

    return hinge;
  };

  createObjects = () => {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();

    // Ground
    //this.createGround(pos, quat);

    // Ball
    const ballMass = 1.2;
    const ballRadius = 0.6;
    const ball = this.createBall(ballMass, ballRadius, pos, quat);

    // Wall
    const brickMass = 0.5;
    const brickLength = 1.2;
    const brickDepth = 0.6;
    const brickHeight = brickLength * 0.5;
    const numBricksLength = 6;
    const numBricksHeight = 8;
    this.createWall(pos, quat, brickMass, brickLength, brickDepth, brickHeight, numBricksLength, numBricksHeight);

    // The rope
    const ropeNumSegments = 10;
    const ropeMass = 3;
    const ropePos = ball.position.clone();
    const ropeLength = 4;
    const segmentLength = ropeLength / ropeNumSegments;
    const { rope, ropeSoftBody } = this.createRope(
      ballRadius,
      ropeLength,
      ropeNumSegments,
      ropeMass,
      ropePos,
      segmentLength
    );
    this.rope = rope;

    // The base
    const armMass = 2;
    const armLength = 3;
    const pylonHeight = ropePos.y + ropeLength;
    const { arm, pylon } = this.createBase(pos, quat, ropePos, armMass, armLength, pylonHeight);

    // Glue the rope extremes to the ball and the arm
    const influence = 1;
    ropeSoftBody.appendAnchor(0, ball.userData.physicsBody, true, influence);
    ropeSoftBody.appendAnchor(ropeNumSegments, arm.userData.physicsBody, true, influence);

    // Hinge constraint to move the arm
    this.hinge = this.createHinge(pylonHeight, armLength, pylon, arm);
    this.physicsWorld.addConstraint(this.hinge, true);
  };

  createParalellepiped = (sx, sy, sz, mass, pos, quat, material) => {
    const threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    const shape = new this.Ammo.btBoxShape(new this.Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(this.margin);

    this.createRigidBody(threeObject, shape, mass, pos, quat);

    return threeObject;
  };

  createRigidBody = (threeObject, physicsShape, mass, pos, quat) => {
    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    const transform = new this.Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new this.Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
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

  createRandomColor = () => {
    return Math.floor(Math.random() * (1 << 24));
  };

  createMaterial = () => {
    return new THREE.MeshPhongMaterial({ color: this.createRandomColor() });
  };

  updatePhysics = (deltaTime) => {
    // Hinge control
    // this.hinge.enableAngularMotor(true, 1.5 * this.armMovement, 50);

    // Step world
    this.physicsWorld.stepSimulation(deltaTime, 10);

    // // Update rope
    // const softBody = this.rope.userData.physicsBody;
    // const ropePositions = this.rope.geometry.attributes.position.array;
    // const numVerts = ropePositions.length / 3;
    // const nodes = softBody.get_m_nodes();
    // let indexFloat = 0;

    // for (let i = 0; i < numVerts; i++) {
    //   const node = nodes.at(i);
    //   const nodePos = node.get_m_x();
    //   ropePositions[indexFloat++] = nodePos.x();
    //   ropePositions[indexFloat++] = nodePos.y();
    //   ropePositions[indexFloat++] = nodePos.z();
    // }

    // this.rope.geometry.attributes.position.needsUpdate = true;

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

  update = () => {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(100, 0, 0);
    this.viewport.scene.add(cube);
  };

  animate = () => {
    if (this.viewport.requestID) {
      cancelAnimationFrame(this.viewport.requestID);
    }
    this.viewport.requestID = requestAnimationFrame(this.animate);
    this.viewport.render();
  };

  onMouseDown = (event) => {
    this.viewport.updateMouse(event);
    this.viewport.raycaster.setFromCamera(this.viewport.mouse, this.viewport.camera);

    let intersects = this.viewport.raycaster.intersectObject(this.ceiling, false);
    if (intersects.length == 0) return;
    let position = new THREE.Vector3().copy(intersects[0].point);

    let ball = this.createBallOnCeiling(position);
    this.balls.push(ball);
    console.log('ball placed on ceiling');
  };
}
export default Game;
