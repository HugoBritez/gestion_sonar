import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Grid from '@mui/joy/Grid';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEffect } from 'react';

import Sidebar from '../../shared/UI/Sidebar';
import Header from '../../shared/UI/Header';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, isActive, onClick }) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      cursor: isActive ? 'pointer' : 'not-allowed',
      opacity: isActive ? 1 : 0.7,
      transition: 'all 0.2s',
      '&:hover': {
        transform: isActive ? 'translateY(-4px)' : 'none',
        boxShadow: isActive ? 'md' : 'none',
      },
    }}
    onClick={isActive ? onClick : undefined}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton variant="plain" color="primary" sx={{ mr: 1 }}>
          {icon}
        </IconButton>
        <Typography level="title-lg">{title}</Typography>
      </Box>
      <Typography level="body-sm" color="neutral">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

interface HomeViewProps {
  onLogout: () => void;
}

export default function HomeView({ onLogout }: HomeViewProps): React.JSX.Element {
  console.log('HomeView iniciando renderizado')
  
  useEffect(() => {
    console.log('HomeView montado')
  }, [])

  try {
    console.log('HomeView renderizando contenido')
    const features = [
      {
        title: 'Gestión de Productos',
        description: 'Administra tu catálogo de productos y precios',
        icon: <ShoppingCartIcon />,
        isActive: true,
        path: '/productos'
      },
      {
        title: 'Gestión de Pedidos',
        description: 'Controla y gestiona los pedidos de tus clientes',
        icon: <LocalShippingIcon />,
        isActive: false,
        path: '/pedidos'
      },
      {
        title: 'Inventario',
        description: 'Mantén un control preciso de tu stock',
        icon: <InventoryIcon />,
        isActive: false,
        path: '/inventario'
      },
      {
        title: 'Analíticas',
        description: 'Visualiza métricas y estadísticas de tu negocio',
        icon: <AnalyticsIcon />,
        isActive: false,
        path: '/analiticas'
      },
      {
        title: 'Clientes',
        description: 'Gestiona la información de tus clientes',
        icon: <PeopleIcon />,
        isActive: false,
        path: '/clientes'
      },
      {
        title: 'Configuración',
        description: 'Personaliza tu experiencia en la plataforma',
        icon: <SettingsIcon />,
        isActive: false,
        path: '/configuracion'
      }
    ];

    return (
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
          <Header />
          <Sidebar onLogout={onLogout} />
          <Box
            component="main"
            className="MainContent"
            sx={{
              px: { xs: 2, md: 6 },
              pt: {
                xs: 'calc(12px + var(--Header-height))',
                sm: 'calc(12px + var(--Header-height))',
                md: 3,
              },
              pb: { xs: 2, sm: 2, md: 3 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100dvh',
              gap: 1,
            }}
          >
            <Typography level="h1" sx={{ mb: 4 }}>
              Bienvenido a Sonar
            </Typography>
            
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid xs={12} sm={6} md={4} key={index}>
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    isActive={feature.isActive}
                    onClick={() => {
                      console.log(`Navegando a ${feature.path}`)
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </CssVarsProvider>
    );
  } catch (error) {
    console.error('Error en HomeView:', error)
    throw error
  }
} 