import InstructionPanel from 'components/instructions-panel';
import Scene from 'components/scene';
import SplashScreen from 'components/spalsh-screen';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

const App = () => {
  const [editor, setEditor] = useState(null);
  const [game, setGame] = useState(null);
  const [splashVisible, setSplashVisible] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setSplashVisible(false);
    }, 5000);
  }, []);

  return (
    <>
      <Typography
        align="center"
        sx={{
          fontSize: '1rem',
          lineHeight: '1rem',
          fontWeight: 500,
          fontFamily: 'poppins',
          position: 'absolute',
          top: '10px',
          zIndex: 200,
          width: '100%',
        }}
      >
        {selectionMode ? 'Ball selection mode' : 'Ball placing mode'}
      </Typography>
      {splashVisible && <SplashScreen visible={splashVisible} />}
      <InstructionPanel />
      <Scene setEditor={setEditor} setGame={setGame} setSelectionMode={setSelectionMode} />
    </>
  );
};

export default App;
