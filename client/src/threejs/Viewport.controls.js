import * as THREE from 'three';

export const Controls = (editor, viewport) => {
  const onClick = (event) => {
    viewport.raycaster.setFromCamera(viewport.mouse, viewport.camera);
    const pos = viewport.raycaster.ray.intersectPlane(viewport.drawingPlane, new THREE.Vector3());
    editor.game.addBallToScene(pos);
  };
  const onMouseDown = (event) => {
    switch (event.button) {
      case 0: // left
        // console.log('left')

        if (viewport.transformControl.dragging) return;

        if (onClick(event)) return;
        break;

      case 1: // middle
        // console.log('middle')
        break;

      case 2: // right
        // console.log('right')

        break;
      default:
        break;
    }
  };
  let dom = viewport.renderer.domElement;
  dom.addEventListener('pointerdown', onMouseDown);
};
