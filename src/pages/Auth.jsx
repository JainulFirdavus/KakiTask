
import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DEMO_ACCOUNTS, useStore } from '../store.jsx'

export default function Auth({ mode }) {
  const [params] = useSearchParams()
  const location = useLocation()
  const { login, signup, catalog } = useStore()
  const roles = mode === 'login' ? ['user', 'worker', 'admin'] : ['user', 'worker']
  const initialRole = roles.includes(params.get('role')) ? params.get('role') : 'user'
  const [role, setRole] = useState(initialRole)
  const [f, setF] = useState({ name: '', email: '', password: '', skill: catalog[0]?.id || '' })
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (mode === 'signup' && f.password.length < 6) return setErr('Password must be at least 6 characters.')
    const error = mode === 'login' ? login({ ...f, role }) : signup({ ...f, role })
    if (error) return setErr(error)
    const from = location.state?.from
    const returnTo = from ? `${from.pathname || ''}${from.search || ''}${from.hash || ''}` : null
    nav(returnTo || (role === 'admin' ? '/admin' : role === 'worker' ? '/worker' : '/app'), { replace: true })
  }

  return (
    <motion.main className="page auth-wrap" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
      <form className="card auth" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <div className="tabs">
          {roles.map((r) => (
            <button type="button" key={r} className={role === r ? 'on' : ''} onClick={() => { setRole(r); setErr('') }}>
              {role === r && <motion.span layoutId="tab" className="tab-bg" />}
              <span>{r === 'user' ? 'I need a service' : r === 'worker' ? "I'm a pro" : 'Admin'}</span>
            </button>
          ))}
        </div>
        {mode === 'signup' && <input required placeholder="Full name" value={f.name} onChange={set('name')} />}
        <input required type="email" placeholder="Email" value={f.email} onChange={set('email')} />
        <input required type="password" placeholder="Password" value={f.password} onChange={set('password')} />
        {mode === 'login' && (
          <section className="demo-accounts" aria-label="Demo login accounts">
            <p>Demo accounts</p>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                type="button"
                key={account.id}
                onClick={() => {
                  setRole(account.role)
                  setF((current) => ({ ...current, email: account.email, password: account.password }))
                  setErr('')
                }}
              >
                <strong>{account.role === 'worker' ? 'Demo pro' : account.role === 'admin' ? 'Demo admin' : 'Demo customer'}</strong>
                <span>{account.email} · {account.password}</span>
              </button>
            ))}
          </section>
        )}
        {mode === 'signup' && role === 'worker' && (
          <select value={f.skill} onChange={set('skill')}>
            {catalog.filter((service) => service.active !== false).map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        )}
        {err && <p className="err">{err}</p>}
        <button className="btn big full">{mode === 'login' ? 'Log in' : 'Sign up'} as {role === 'worker' ? 'worker' : role === 'admin' ? 'admin' : 'customer'}</button>
        {role === 'admin' ? <p className="muted">Admin access is available through the demo account.</p> : <p className="muted">
          {mode === 'login' ? <>New here? <Link to={`/signup?role=${role}`} state={location.state}>Create an account</Link></> : <>Have an account? <Link to={`/login?role=${role}`} state={location.state}>Log in</Link></>}
        </p>}
      </form>
    </motion.main>
  )
}
 