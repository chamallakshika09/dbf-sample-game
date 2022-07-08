import { Paper, Stack, Typography } from '@mui/material';

const InstructionPanel = () => {
  return (
    <Paper
      sx={{
        position: 'absolute',
        right: '16px',
        top: '60vh',
        zIndex: 200,
        background: 'rgba(74, 101, 114, 0.75)',
        border: '2px solid #4A6572',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '400px',
      }}
    >
      <Stack spacing={3}>
        <Typography
          align="center"
          sx={{
            fontSize: '1.5rem',
            lineHeight: '1rem',
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontFamily: 'Nunito',
          }}
        >
          Instructions to play
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8rem',
            lineHeight: '1rem',
            color: '#FFFFFF',
            fontWeight: 500,
            fontFamily: 'poppins',
          }}
        >
          Click on the ceiling to add a ball.
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8rem',
            lineHeight: '1rem',
            color: '#FFFFFF',
            fontWeight: 500,
            fontFamily: 'poppins',
          }}
        >
          Press spacebar to switch between ball selection mode and ball placing mode.
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8rem',
            lineHeight: '1rem',
            color: '#FFFFFF',
            fontWeight: 500,
            fontFamily: 'poppins',
          }}
        >
          In ball selection mode you can create a rope between two balls.
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8rem',
            lineHeight: '1rem',
            color: '#FFFFFF',
            fontWeight: 500,
            fontFamily: 'poppins',
          }}
        >
          You can place a ball on a rope by clicking on a rope in ball placing mode.
        </Typography>
      </Stack>
    </Paper>
  );
};

export default InstructionPanel;
