

import { createContext, useContext } from 'react'

const AdminStoreContext = createContext(null)

export function AdminStoreProvider({ value, children }) {
  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>
}

export function useAdminStore() {
  const store = useContext(AdminStoreContext)
  if (!store) throw new Error('AdminStoreProvider is required to use the admin dashboard.')
  return store
} 
