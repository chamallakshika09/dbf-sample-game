import { useEffect, useRef } from 'react';
import Editor from 'threejs/Editor';
import Game from 'threejs/Game';
import Viewport from 'threejs/Viewport';
import ToolBar from 'threejs/Editor.toolbar';
import { Keyboard } from 'threejs/Viewport.keys';
import { SEND_INITIAL_STATE } from '../../constants';
import { io } from 'socket.io-client';
import config from '../../config';

let viewport;
let editor;
let game;

const Scene = (props) => {
  const mountRef = useRef();

  useEffect(() => {
    createScene();
    onUpdateDimensions();
    window.addEventListener('resize', onUpdateDimensions, false);
    const ref = mountRef.current;
    return () => {
      cancelAnimationFrame(viewport.requestID);
      ref.removeChild(viewport.renderer.domElement);
      window.removeEventListener('resize', onUpdateDimensions);
      editor.ws?.off(SEND_INITIAL_STATE, editor.loadInitialState);
    };
  }, []);

  const createScene = () => {
    const { setEditor, setGame } = props;

    editor = new Editor();
    editor.ws = io(config.BASE_URL);

    viewport = new Viewport(editor, mountRef);
    game = new Game(editor, viewport);

    const toolbar = new ToolBar(editor, viewport, game);
    const keyboard = Keyboard(editor, viewport, game);

    editor.viewport = viewport;
    editor.game = game;

    setEditor(editor);
    setGame(game);
  };

  const onUpdateDimensions = () => {
    let container = mountRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const aspect = width / height;

    // resize threejs canvas
    viewport.camera.aspect = aspect;
    viewport.camera.updateProjectionMatrix();

    // viewport.cameraOrtho.left = viewport.cameraOrtho.bottom * aspect;
    // viewport.cameraOrtho.right = viewport.cameraOrtho.top * aspect;
    // viewport.cameraOrtho.updateProjectionMatrix();

    viewport.renderer.setSize(width, height);
  };

  return <div id="mount" ref={mountRef}></div>;
};

export default Scene;
