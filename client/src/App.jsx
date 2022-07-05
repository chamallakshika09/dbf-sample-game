import Scene from 'components/scene';
import { useState } from 'react';

const App = () => {
  const [editor, setEditor] = useState(null);
  const [game, setGame] = useState(null);

  return <Scene setEditor={setEditor} setGame={setGame} />;
};

export default App;
