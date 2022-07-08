import { useEffect, useRef } from 'react';
import Editor from 'threejs/Editor';
import Game from 'threejs/Game';
import Viewport from 'threejs/Viewport';
import { io } from 'socket.io-client';
import config from '../../config';
import ToolBar from 'threejs/Editor.toolbar';
import { Keyboard } from 'threejs/Viewport.keys';

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
      editor.ws?.off();
      editor.ws?.disconnect();
    };
  }, []);

  const createScene = () => {
    const { setSelectionMode } = props;

    editor = new Editor();
    editor.setSelectionMode = setSelectionMode;
    if (process.env.NODE_ENV === 'development') {
      editor.ws = io(config.BASE_URL);
    } else {
      editor.ws = io();
    }

    viewport = new Viewport(editor, mountRef);
    game = new Game(editor, viewport);

    new ToolBar(editor, viewport, game);
    Keyboard(editor, viewport, game);

    editor.viewport = viewport;
    editor.game = game;
  };

  const onUpdateDimensions = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const aspect = width / height;

    // resize threejs canvas
    viewport.camera.aspect = aspect;
    viewport.camera.updateProjectionMatrix();

    viewport.renderer.setSize(width, height);
  };

  return <div id="mount" ref={mountRef}></div>;
};

export default Scene;
