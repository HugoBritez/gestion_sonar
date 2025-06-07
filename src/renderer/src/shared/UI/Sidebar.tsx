/* eslint-disable prettier/prettier */
import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Tooltip from '@mui/joy/Tooltip';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Inventory } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoComponent from './Logo';
import ColorSchemeToggle from './ColorSchemeToggle';
import { closeSidebar } from './utils';

export interface SidebarProps
{
  onLogout: ()=> void;
}

export default function Sidebar({onLogout}: SidebarProps): React.JSX.Element {
  console.log('Sidebar iniciando renderizado')
  
  const location = useLocation();
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<{ email: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (err) {
      console.error('Error cargando usuario:', err);
      setError('Error cargando datos del usuario');
    }
  }, []);

  const menuItems = [
    { path: '/', icon: <HomeRoundedIcon />, label: 'Inicio', available: true },
    { path: '/dashboard', icon: <DashboardRoundedIcon />, label: 'Dashboard', available: false },
    { path: '/productos', icon: <Inventory />, label: 'Productos', available: true },
    { path: '/pedidos', icon: <ShoppingCartRoundedIcon />, label: 'Pedidos', available: false },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: 'error.softBg' }}>
        <Typography color="danger">{error}</Typography>
      </Box>
    );
  }

  try {
    return (
      <Sheet
        className="Sidebar"
        sx={{
          position: { xs: 'fixed', md: 'sticky' },
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
            md: 'none',
          },
          transition: 'transform 0.4s, width 0.4s',
          zIndex: 10000,
          height: '100dvh',
          width: 'var(--Sidebar-width)',
          top: 0,
          p: 2,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <GlobalStyles
          styles={(theme) => ({
            ':root': {
              '--Sidebar-width': '220px',
              [theme.breakpoints.up('lg')]: {
                '--Sidebar-width': '240px',
              },
            },
          })}
        />
        <Box
          className="Sidebar-overlay"
          sx={{
            position: 'fixed',
            zIndex: 9998,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            opacity: 'var(--SideNavigation-slideIn)',
            backgroundColor: 'var(--joy-palette-background-backdrop)',
            transition: 'opacity 0.4s',
            transform: {
              xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
              lg: 'translateX(-100%)',
            },
          }}
          onClick={() => closeSidebar()}
        />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton variant="soft" color="primary" size="sm">
            <LogoComponent />
          </IconButton>
          <Typography level="title-lg">Sonar Co.</Typography>
          <ColorSchemeToggle sx={{ ml: 'auto' }} />
        </Box>
        <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
        <Box
          sx={{
            minHeight: 0,
            overflow: 'hidden auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            [`& .${listItemButtonClasses.root}`]: {
              gap: 1.5,
            },
          }}
        >
          <List
            size="sm"
            sx={{
              gap: 1,
              '--List-nestedInsetStart': '30px',
              '--ListItem-radius': (theme) => theme.vars.radius.sm,
            }}
          >
            {menuItems.map((item) => (
              <ListItem key={item.path}>
                <Tooltip
                  title={!item.available ? "Disponible próximamente" : ""}
                  open={showTooltip === item.path}
                  onOpen={() => !item.available && setShowTooltip(item.path)}
                  onClose={() => setShowTooltip(null)}
                >
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => {
                      if (item.available) {
                        navigate(item.path);
                      } else {
                        setShowTooltip(item.path);
                      }
                    }}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: 'primary.softBg',
                        '&:hover': {
                          bgcolor: 'primary.softHover',
                        },
                      },
                    }}
                  >
                    {item.icon}
                    <ListItemContent>
                      <Typography level="title-sm">{item.label}</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
          <List
            size="sm"
            sx={{
              mt: 'auto',
              flexGrow: 0,
              '--ListItem-radius': (theme) => theme.vars.radius.sm,
              '--List-gap': '8px',
              mb: 2,
            }}
          >
            <ListItem>
              <ListItemButton>
                <SupportRoundedIcon />
                <ListItemContent>
                  <Typography level="title-sm">Soporte</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton>
                <SettingsRoundedIcon />
                <ListItemContent>
                  <Typography level="title-sm">Configuraciones</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Avatar
            variant="outlined"
            size="sm"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="body-xs">
              {user?.email && user.email.length > 22
                ? user.email.slice(0, 19) + '...'
                : user?.email}
            </Typography>
          </Box>
          <IconButton size="sm" variant="plain" color="neutral" onClick={()=>onLogout()}>
            <LogoutRoundedIcon />
          </IconButton>
        </Box>
      </Sheet>
    )
  } catch (error) {
    console.error('Error en Sidebar:', error)
    throw error
  }
}