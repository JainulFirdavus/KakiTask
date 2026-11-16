

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { createAppTheme } from './theme.js'
import { useStore } from './store.jsx'
import './styles.css'
import './site-shell.css'

function ThemedApplication() {
  const { settings } = useStore()
  const userTheme = ['orange', 'ocean', 'forest'].includes(settings.userTheme) ? settings.userTheme : 'orange'
  return (
    <ThemeProvider theme={createAppTheme(userTheme)}>
      <CssBaseline />
      <div className={`site-theme site-theme-${userTheme}`}>
        <App />
      </div>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <BrowserRouter>
      <StoreProvider>
        <ThemedApplication />
      </StoreProvider>
    </BrowserRouter>
  </LocalizationProvider>
)
 