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

    function onMouseDown(event) {
      switch (event.button) {
        case 0: // left
          editor.game.onMouseDown();
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
