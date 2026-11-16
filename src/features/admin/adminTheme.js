


import { createTheme } from '@mui/material/styles'
import { getThemePreset } from '../../config/themePresets.js'

export function createAdminTheme(name = 'orange') {
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
    typography: { fontFamily: '"DM Sans", "Manrope", sans-serif', button: { fontWeight: 700, textTransform: 'none' } },
    shape: { borderRadius: 8 },
  })
}

const adminTheme = createAdminTheme()

export default adminTheme