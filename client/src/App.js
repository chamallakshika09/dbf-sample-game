import Scene from 'components/scene';
import { useState } from 'react';

const App = () => {
  const [editor, setEditor] = useState(null);
  const [game, setGame] = useState(null);
  const [sceneCreated, setSceneCreated] = useState(false);
  return (
    <Scene setEditor={setEditor} setGame={setGame} setSceneCreated={setSceneCreated} sceneCreated={sceneCreated} />
  );
};

export default App;
