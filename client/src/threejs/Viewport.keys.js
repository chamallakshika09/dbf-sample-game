import * as THREE from 'three';

export const Keyboard = (editor, viewport, game, canvas) => {
  window.addEventListener('keydown', function (event) {
    switch (event.key) {
      case 'q':
        game.armMovement = 1;
        break;
      case 'a':
        game.armMovement = -1;
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', function (event) {
    game.armMovement = 0;
  });
};
