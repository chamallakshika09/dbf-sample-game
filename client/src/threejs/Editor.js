import { ObjectLoader, Quaternion, Vector3 } from 'three';
import { SEND_INITIAL_STATE, UPDATE_STATE } from '../constants';
class Editor {
  constructor() {
    this.pickingArr = [];
    this.state = {
      balls: [],
      ropes: [],
      rigidBodies: [],
    };
  }

  updateState = () => {
    this.ws.emit(UPDATE_STATE, this.state);
  };

  loadState = (initialState) => {
    const loader = new ObjectLoader();
    const { balls, ropes } = initialState;

    this.state.balls = balls.map((ball) => {
      const parsed = loader.parse(ball);
      let { pos, quat } = parsed.userData;
      parsed.userData.pos = new Vector3(pos.x, pos.y, pos.z);
      parsed.userData.quat = new Quaternion(quat.x, quat.y, quat.z, quat.w);
      return parsed;
    });
    this.state.ropes = ropes.map((rope) => loader.parse(rope));
  };

  loadInitialState = (state) => {
    this.loadState(state);
    this.game.loadInitialScene();
  };

  loadGame = () => {
    this.ws.on(SEND_INITIAL_STATE, this.loadInitialState);
  };
}

export default Editor;
