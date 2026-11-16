import { ThemeProvider } from '@mui/material/styles'
import { useStore } from '../store.jsx'
import AdminDashboard from '../features/admin/AdminDashboard.jsx'
import { AdminStoreProvider } from '../features/admin/adminStore.jsx'
import { createAdminTheme } from '../features/admin/adminTheme.js'

export default function AdminHost() {
  const store = useStore()
  const adminTheme = ['orange', 'ocean', 'forest'].includes(store.settings.adminTheme) ? store.settings.adminTheme : 'orange'
  return (
    <ThemeProvider theme={createAdminTheme(adminTheme)}>
      <div className={`admin-theme-${adminTheme}`}>
        <AdminStoreProvider value={store}>
          <AdminDashboard />
        </AdminStoreProvider>
      </div>
    </ThemeProvider>
  )
}
