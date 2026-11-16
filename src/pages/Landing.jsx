

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { formatMoney } from '../utils/money.js'

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay: i * 0.08 },
})

const STEPS = [
  ['01', 'Pick a service', 'Choose from 8+ trusted home services.'],
  ['02', 'Set your slot', 'Select date, time and address in seconds.'],
  ['03', 'Pro arrives', 'A verified worker accepts and shows up.'],
]

export default function Landing() {
  const { catalog, settings } = useStore()
  const services = catalog.filter((service) => service.active !== false)
  const words = 'Home services, on demand.'.split(' ')
  return (
    <motion.main className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="hero">
        <motion.span className="pill" {...fade()}>✦ Trusted pros in your neighbourhood</motion.span>
        <h1>
          {words.map((word, i) => (
            <motion.span key={word} className="word" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}>
              {word}&nbsp;
            </motion.span>
          ))}
        </h1>
        <motion.p className="sub" {...fade(3)}>Book cleaners, plumbers, movers and more in a few taps — or earn on your own schedule as a pro.</motion.p>
        <motion.div className="cta" {...fade(4)}>
          <Link to="/signup?role=user" className="btn big">Book a service →</Link>
          <Link to="/signup?role=worker" className="btn big outline">Become a pro</Link>
        </motion.div>
        <div className="float-icons" aria-hidden="true">
          {['🧹', '🔧', '⚡', '📦', '🎨'].map((icon, i) => (
            <motion.span key={icon} className={`fi fi${i}`} animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}>{icon}</motion.span>
          ))}
        </div>
      </section>

      <div className="marquee"><div className="track">
        {[...services, ...services].map((service, i) => <span key={`${service.id}-${i}`}>{service.icon} {service.name}</span>)}
      </div></div>

      <section className="section" id="services">
        <motion.h2 {...fade()}>Everything your home needs</motion.h2>
        <div className="grid">
          {services.map((service, i) => (
            <motion.div key={service.id} {...fade(i % 4)} whileHover={{ y: -5 }}>
              <Link className="card hover tile service-tile" to={`/book/${service.id}`}>
              <div className="emoji">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.desc}</p>
              <span className="price">from {formatMoney(service.price, settings.currency)} <span aria-hidden="true">→</span></span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section" id="how-it-works">
        <motion.h2 {...fade()}>How it works</motion.h2>
        <div className="steps">
          {STEPS.map(([number, title, description], i) => (
            <motion.div key={number} className="card step" {...fade(i)}>
              <span className="num">{number}</span><h3>{title}</h3><p>{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section className="section banner" {...fade()}>
        <h2>Are you a skilled pro?</h2>
        <p>Join as a worker, pick the jobs you want, and get paid per task.</p>
        <Link to="/signup?role=worker" className="btn big">Start earning</Link>
      </motion.section>

      <motion.footer className="footer landing-footer" {...fade()}>
        <div className="landing-footer-main">
          <Link to="/" className="footer-brand"><span className="logo-dot" /><strong>{settings.businessName || 'Urban Company'}</strong></Link>
          <p>Trusted help for the work that makes a home.</p>
        </div>
        <div className="landing-footer-links"><Link to="/#services">Browse services</Link><Link to="/signup?role=worker">Become a pro</Link><Link to="/login">Log in</Link><a href="mailto:support@urbancompany.test">Contact support</a></div>
        <small>© {new Date().getFullYear()} {settings.businessName || 'Urban Company'} · Home services, handled.</small>
      </motion.footer>
    </motion.main>
  )
}
 