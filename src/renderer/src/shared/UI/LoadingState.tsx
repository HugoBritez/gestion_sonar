import * as React from 'react';
import { Box, CircularProgress, Typography, useColorScheme } from '@mui/joy';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Cargando...' }: LoadingStateProps): React.JSX.Element {
  const { mode } = useColorScheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: '200px',
        width: '100%',
        bgcolor: mode === 'dark' ? 'background.surface' : 'background.body',
        borderRadius: 'sm',
        p: 3,
      }}
    >
      <CircularProgress 
        size="lg" 
        sx={{
          '--CircularProgress-size': '48px',
          '--CircularProgress-trackThickness': '4px',
          '--CircularProgress-progressThickness': '4px',
        }}
      />
      <Typography 
        level="body-md" 
        sx={{ 
          color: 'text.secondary',
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
} 