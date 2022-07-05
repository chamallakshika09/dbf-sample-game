import { useEffect, useRef } from 'react';
import Editor from 'threejs/Editor';
import Game from 'threejs/Game';
import Viewport from 'threejs/Viewport';
import ToolBar from 'threejs/Editor.toolbar';
import { Keyboard } from 'threejs/Viewport.keys';

let viewport;
let requestID;

const Scene = (props) => {
  const mountRef = useRef();

  useEffect(() => {
    createScene();
    onUpdateDimensions();
    window.addEventListener('resize', onUpdateDimensions, false);
    const ref = mountRef.current;
    return () => {
      cancelAnimationFrame(requestID);
      ref.removeChild(viewport.renderer.domElement);
      window.removeEventListener('resize', onUpdateDimensions);
    };
  }, []);

  const createScene = () => {
    const { setEditor, setGame } = props;

    const editor = new Editor();

    viewport = new Viewport(editor, mountRef);

    const game = new Game(editor, viewport);

    const toolbar = new ToolBar(editor, viewport, game);
    const keyboard = Keyboard(editor, viewport, game);

    editor.viewport = viewport;
    editor.game = game;

    setEditor(editor);
    setGame(game);

    animate();
  };

  const onUpdateDimensions = () => {
    let container = mountRef.current;
    let width = container.offsetWidth;
    let height = window.innerHeight;

    const aspect = width / height;

    // resize threejs canvas
    viewport.cameraPersp.aspect = aspect;
    viewport.cameraPersp.updateProjectionMatrix();

    viewport.cameraOrtho.left = viewport.cameraOrtho.bottom * aspect;
    viewport.cameraOrtho.right = viewport.cameraOrtho.top * aspect;
    viewport.cameraOrtho.updateProjectionMatrix();

    viewport.renderer.setSize(width, height);
  };

  const animate = () => {
    if (requestID) {
      cancelAnimationFrame(requestID);
    }
    requestID = requestAnimationFrame(animate);
    viewport.render();
  };

  return <div id="mount" ref={mountRef}></div>;
};

export default Scene;
