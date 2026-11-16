import { createTheme } from '@mui/material/styles'
import { getThemePreset } from './config/themePresets.js'

export function createAppTheme(name = 'orange') {
  const preset = getThemePreset(name)
  return createTheme({
    palette: {
      mode: 'light',
      primary: { main: preset.primary, dark: preset.primaryDark, contrastText: '#ffffff' },
      secondary: { main: preset.secondary },
      background: { default: preset.background, paper: preset.paper },
      text: { primary: preset.text, secondary: preset.muted },
      divider: preset.border,
    },
    typography: {
      fontFamily: '"DM Sans", "Manrope", sans-serif',
      button: { fontWeight: 700, textTransform: 'none' },
      h1: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
      h2: { fontFamily: '"Manrope", sans-serif', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { minHeight: 40, borderRadius: 8, boxShadow: 'none' },
          containedPrimary: { boxShadow: `0 3px 8px ${preset.primary}33` },
        },
      },
      MuiPaper: { styleOverrides: { rounded: { border: `1px solid ${preset.border}` } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 8, backgroundColor: preset.paper },
          notchedOutline: { borderColor: preset.border },
        },
      },
      MuiPickersDay: { styleOverrides: { root: { borderRadius: 8 } } },
    },
  })
}

const theme = createAppTheme()

export default theme

