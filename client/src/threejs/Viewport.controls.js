import * as THREE from 'three';

class Controls {
  constructor(editor, viewport) {
    this.viewport = viewport;
    this.editor = editor;

    this.initialize(editor, viewport);
  }

  initialize = (editor, viewport) => {
    let dom = viewport.renderer.domElement;

    dom.addEventListener('pointerdown', onMouseDown);

    const handleMouseDown = (event) => {
      const { game } = editor;
      let object = viewport.INTERSECTED;
      if (object) {
        const index = editor.pickingArr.findIndex((item) => item.uuid === object.uuid);
        if (index !== -1) {
          editor.pickingArr.splice(index, 1);
          console.log('ball removed from selection');
        } else {
          editor.pickingArr.push(object);
          if (editor.pickingArr.length > 2) editor.pickingArr.shift();
          console.log('ball added to selection');
        }
        console.log(editor.pickingArr.length);

        if (editor.pickingArr.length === 2) {
          let ball1 = editor.pickingArr[0];
          let ball2 = editor.pickingArr[1];
          game.createRope(ball1, ball2);
          editor.updateState();
        }

        return;
      }
      viewport.updateMouse(event);
      viewport.raycaster.setFromCamera(viewport.mouse, viewport.camera);

      let intersects = viewport.raycaster.intersectObject(game.ceiling, false);
      if (intersects.length === 0) return;
      let position = new THREE.Vector3().copy(intersects[0].point);

      let ball = game.createBall(game.ballMass, game.ballRadius, position);
      editor.state.balls.push(ball);
      editor.updateState();

      console.log('ball placed on ceiling');
    };

    function onMouseDown(event) {
      switch (event.button) {
        case 0: // left
          handleMouseDown(event);
          break;
        case 1: // middle
          break;
        case 2: // right
          break;
        default:
          break;
      }
    }
  };
}

export default Controls;
