import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Avatar from '@mui/material/Avatar'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import { useStore } from '../store.jsx'

export default function Navbar() {
  const { session, logout, cart, settings } = useStore()
  const location = useLocation()
  const nav = useNavigate()
  const home = session ? (session.role === 'admin' ? '/admin' : session.role === 'worker' ? '/worker' : '/app') : '/login'
  const showCart = session?.role === 'user'
  if (location.pathname.startsWith('/admin')) return null
  const logoPosition = settings.headerLogoPosition === 'center' ? 'center' : 'left'
  return (
    <motion.header className={`nav logo-${logoPosition}`} initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
      <Link to="/" className="logo"><span className="logo-dot" /><span className="logo-name">{settings.businessName || 'Urban Company'}</span></Link>
      <nav>
        {location.pathname === '/' && <>
          <Link to="/#services" className="link nav-page-link">Services</Link>
          <Link to="/#how-it-works" className="link nav-page-link">How it works</Link>
        </>}
        {showCart && (
          <Link to="/cart" className="link cart-link" aria-label={`Cart${cart.length ? `, ${cart.length} items` : ''}`}>
            Cart{cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </Link>
        )}
        {session ? (
          <>
            <Link to={home} className="nav-profile" aria-label={`${session.name} profile and ${session.role === 'worker' ? 'worker hub' : session.role === 'admin' ? 'management' : 'bookings'}`}>
              <Avatar className="nav-avatar">{session.name?.slice(0, 1) || <AccountCircleOutlinedIcon />}</Avatar>
              <span>{session.role === 'admin' ? 'Management' : session.role === 'worker' ? 'Worker hub' : session.name}</span>
            </Link>
            <button className="btn ghost" onClick={() => { logout(); nav('/') }}>Log out</button>
          </>
        ) : (
          <>
            {settings.showHeaderLogin !== false && <Link to="/login" className="link nav-login">Log in</Link>}
            <Link to="/signup" className="btn nav-signup">Get started</Link>
          </>
        )}
      </nav>
    </motion.header>
  )
}


