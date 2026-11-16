
import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import SupportChatbot from './components/SupportChatbot.jsx'
import HomeServicesLoader from './components/HomeServicesLoader.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import UserDash from './features/user/UserDash.jsx'
import WorkerDash from './features/pro/WorkerDash.jsx'
import BookingDetails from './features/user/BookingDetails.jsx'
import Cart from './features/user/Cart.jsx'
import Checkout from './features/user/Checkout.jsx'
import OrderConfirmation from './features/user/OrderConfirmation.jsx'
import { useStore } from './store.jsx'

const AdminHost = lazy(() => import('./adapters/AdminHost.jsx'))

function Protected({ role, children }) {
  const { session } = useStore()
  const location = useLocation()
  if (!session || session.role !== role) {
    return <Navigate to={`/login?role=${role}`} state={{ from: location }} replace />
  }
  return children
}

export default function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = window.setTimeout(() => setIsLoading(false), 1150)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      <AnimatePresence>{isLoading && <HomeServicesLoader key="home-loader" />}</AnimatePresence>
      <div className={`app-shell${isLoading ? ' app-shell-loading' : ''}`} aria-hidden={isLoading}>
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/book/:serviceId" element={<BookingDetails />} />
            <Route path="/cart" element={<Protected role="user"><Cart /></Protected>} />
            <Route path="/checkout" element={<Protected role="user"><Checkout /></Protected>} />
            <Route path="/confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/app" element={<Protected role="user"><UserDash /></Protected>} />
            <Route path="/worker" element={<Protected role="worker"><WorkerDash /></Protected>} />
            <Route path="/admin" element={<Protected role="admin"><Suspense fallback={<HomeServicesLoader />}><AdminHost /></Suspense></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <SupportChatbot />
      </div>
    </>
  )
}
