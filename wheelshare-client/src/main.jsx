import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RoleProvider } from './context/RoleContext.jsx'
import { VehicleStoreProvider } from './context/VehicleStoreContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import { AdminStoreProvider } from './admin/context/AdminStore.jsx'
import { LocationProvider } from './context/LocationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LocationProvider>
        <RoleProvider>
          <VehicleStoreProvider>
            <AdminProvider>
              <AdminStoreProvider>
                <App />
              </AdminStoreProvider>
            </AdminProvider>
          </VehicleStoreProvider>
        </RoleProvider>
      </LocationProvider>
    </AuthProvider>
  </StrictMode>,
)
