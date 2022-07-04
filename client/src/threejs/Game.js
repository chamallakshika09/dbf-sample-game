import * as THREE from 'three';

class Game {
  constructor(editor, viewport) {
    // this.test = 'test';
    this.viewport = viewport;
    this.update();
  }

  update() {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(100, 0, 0);
    this.viewport.scene.add(cube);
  }
}
export default Game;
