import Scene from 'components/scene';
import SplashScreen from 'components/spalsh-screen/splash-screen';
import { useEffect, useState } from 'react';

const App = () => {
  const [editor, setEditor] = useState(null);
  const [game, setGame] = useState(null);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSplashVisible(false);
    }, 5000);
  }, []);

  return (
    <>
      {splashVisible && <SplashScreen visible={splashVisible} />}
      <Scene setEditor={setEditor} setGame={setGame} />
    </>
  );
};

export default App;
