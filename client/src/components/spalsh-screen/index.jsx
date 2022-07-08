import { Stack, Typography, Zoom } from '@mui/material';

const SplashScreen = ({ visible }) => {
  return (
    <Stack
      style={{
        width: '100%',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      justifyContent="center"
      alignItems="center"
    >
      <Zoom in={visible} style={{ transitionDelay: visible ? '500ms' : '0ms' }}>
        <Typography sx={{ fontSize: 36, fontWeight: 'bold', fontFamily: 'poppins' }}>Sample Game</Typography>
      </Zoom>
    </Stack>
  );
};

export default SplashScreen;
