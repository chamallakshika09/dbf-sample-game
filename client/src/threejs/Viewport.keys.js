import * as THREE from 'three';

export const Keyboard = (editor, viewport, game, canvas) => {
  window.addEventListener('keydown', function (event) {
    switch (event.key) {
      case ' ':
        viewport.controls.selectionMode = !viewport.controls.selectionMode;
        if (!viewport.controls.selectionMode) {
          for (let i = 0; i < editor.pickingArr.length; i++) {
            editor.pickingArr[i].material.color.setHex(editor.pickingArr[i].userData.color);
          }
          editor.pickingArr = [];
        }
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', function (event) {
    // game.armMovement = 0;
  });
};
