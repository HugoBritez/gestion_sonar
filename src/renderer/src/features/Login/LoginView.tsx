/* eslint-disable prettier/prettier */
import * as React from 'react'
import { CssVarsProvider, extendTheme, useColorScheme } from '@mui/joy/styles'
import GlobalStyles from '@mui/joy/GlobalStyles'
import CssBaseline from '@mui/joy/CssBaseline'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import Divider from '@mui/joy/Divider'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import IconButton, { IconButtonProps } from '@mui/joy/IconButton'
import Link from '@mui/joy/Link'
import Input from '@mui/joy/Input'
import Typography from '@mui/joy/Typography'
import Stack from '@mui/joy/Stack'
import Alert from '@mui/joy/Alert'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import  SonarLogo from '../../../../../resources/logosonnarconfondodark.png'
import LogoBg from '../../assets/login_bg.jpg'
import { signIn } from '@renderer/repos/AuthRepo'
import { AuthRequest } from '@renderer/models/Auth'

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
  persistent: HTMLInputElement
}
interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

function ColorSchemeToggle(props: IconButtonProps): React.JSX.Element {
  const { onClick, ...other } = props
  const { mode, setMode } = useColorScheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  return (
    <IconButton
      aria-label="toggle light/dark mode"
      size="sm"
      variant="outlined"
      disabled={!mounted}
      onClick={(event) => {
        setMode(mode === 'light' ? 'dark' : 'light')
        onClick?.(event)
      }}
      {...other}
    >
      {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  )
}

const customTheme = extendTheme({})

interface LoginViewProps {
  onLoginSuccess?: () => void
}

export default function LoginView({ onLoginSuccess }: LoginViewProps): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleLogin = async (authData: AuthRequest): Promise<void> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await signIn(authData.Email, authData.Password)
      // Aquí puedes redirigir al usuario o actualizar el estado de la aplicación
      console.log('Login exitoso')
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ':root': {
            '--Form-maxWidth': '800px',
            '--Transition-duration': '0.4s', // set to `none` to disable transition
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: '100%', md: '50vw' },
          transition: 'width var(--Transition-duration)',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255 255 255 / 0.2)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundColor: 'rgba(19 19 24 / 0.4)',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            width: '100%',
            px: 2,
          }}
        >
          <Box component="header" sx={{ py: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              <img src={SonarLogo} alt="Sonar Logo" width={32} height={32} style={{
                borderRadius: "5px"
              }} />
              <Typography level="title-lg">Sonar</Typography>
            </Box>
            <ColorSchemeToggle />
          </Box>
          <Box
            component="main"
            sx={{
              my: 'auto',
              py: 2,
              pb: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 400,
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: 'sm',
              '& form': {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: 'hidden',
              },
            }}
          >
            <Stack sx={{ gap: 4, mb: 2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" level="h3">
                  Inicia Sesion
                </Typography>
                <Typography level="body-sm">
                  Para llevar tu negocio al siguiente nivel!{' '}
                </Typography>
              </Stack>
            </Stack>
            <Divider
              sx={(theme) => ({
                [theme.getColorSchemeSelector('light')]: {
                  color: { xs: '#FFF', md: 'text.tertiary' },
                },
              })}
            >
            </Divider>
            <Stack sx={{ gap: 4, mt: 2 }}>
              {error && (
                <Alert color="danger" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <form
                onSubmit={async (event: React.FormEvent<SignInFormElement>) => {
                  event.preventDefault()
                  const formElements = event.currentTarget.elements
                  const authData: AuthRequest = {
                    Email: formElements.email.value,
                    Password: formElements.password.value,
                  }
                  await handleLogin(authData)
                }}
              >
                <FormControl required>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" name="email" disabled={isLoading} />
                </FormControl>
                <FormControl required>
                  <FormLabel>Contraseña</FormLabel>
                  <Input type="password" name="password" disabled={isLoading} />
                </FormControl>
                <Stack sx={{ gap: 4, mt: 2 }}>
                    <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    >
                    <Checkbox
                      size="sm"
                      label="Recuerdame"
                      name="persistent"
                      checked={!!(document?.forms[0]?.persistent?.checked)}
                      onChange={() => {}}
                    />
                    <Link level="title-sm" href="#replace-with-a-link">
                      Olvidaste tu contraseña?
                    </Link>
                    </Box>
                  <Button type="submit" fullWidth disabled={isLoading} loading={isLoading}>
                    {isLoading ? 'Iniciando sesión...' : 'Inicia Sesión'}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: 'center' }}>
              © Sonar Tech {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          height: '100%',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: '50vw' },
          transition:
            'background-image var(--Transition-duration), left var(--Transition-duration) !important',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          backgroundColor: 'background.level1',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: `url(${LogoBg})`,
          [theme.getColorSchemeSelector('dark')]: {
            backgroundImage: `url(${LogoBg})`
          },
        })}
      />
    </CssVarsProvider>
  )
}
