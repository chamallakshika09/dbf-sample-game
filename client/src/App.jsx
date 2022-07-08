import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Scene from 'components/scene';
import SplashScreen from 'components/spalsh-screen';

const App = () => {
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
      <Scene setSelectionMode={setSelectionMode} />
    </>
  );
};

export default App;
