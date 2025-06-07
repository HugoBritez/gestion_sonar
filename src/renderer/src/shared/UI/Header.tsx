import * as React from 'react';
import { useColorScheme } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { toggleSidebar } from './utils';

export default function Header(): React.JSX.Element {
  const { mode } = useColorScheme();

  return (
    <Sheet
      component="header"
      className="Header"
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        width: '100vw',
        height: 'var(--Header-height)',
        zIndex: 1100,
        p: 2,
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: mode === 'dark' ? 'background.surface' : 'background.body',
      }}
    >
      <IconButton
        variant="outlined"
        color="neutral"
        size="sm"
        onClick={() => toggleSidebar()}
        sx={{ display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
    </Sheet>
  );
} 