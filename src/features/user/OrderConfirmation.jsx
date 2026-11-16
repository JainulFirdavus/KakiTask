

import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../../store.jsx'
import { formatMoney } from '../../utils/money.js'
import { formatServiceAddress } from '../../utils/addressLookup.js'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const { bookings, session, settings } = useStore()
  const order = bookings.filter((booking) => booking.orderId === orderId)

  if (order.length === 0) {
    return (
      <main className="page flow-page">
        <div className="card empty-cart"><h1>Order not found</h1><Link className="btn" to="/">Back to services</Link></div>
      </main>
    )
  }

  const first = order[0]
  const total = order.reduce((sum, booking) => sum + Number(booking.total ?? booking.price), 0)
  const serviceFees = order.reduce((sum, booking) => sum + Number(booking.serviceFee || 0), 0)
  const serviceTax = order.reduce((sum, booking) => sum + Number(booking.serviceTax || 0), 0)

  return (
    <motion.main className="page flow-page confirmation-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="confirmation-mark" aria-hidden="true">✓</div>
      <p className="flow-kicker">Order confirmed</p>
      <h1 className="h1">Thanks, {first.customerName.split(' ')[0]}.</h1>
      <p className="sub left">Your request is in. We’ll contact you at {first.customerEmail} when a pro accepts the job.</p>

      <section className="card confirmation-card">
        <div className="confirmation-head"><div><span className="summary-label">Order reference</span><strong>{orderId.slice(0, 8).toUpperCase()}</strong></div><span className="status pending">Pending</span></div>
        {order.map((booking) => (
          <div className="confirmation-item" key={booking.id}>
            <span className="emoji">{booking.icon}</span>
            <div><strong>{booking.serviceName}</strong><p>{booking.date} · {booking.time} · {formatServiceAddress(booking)}</p><p>Contact: {booking.customerPhone}{booking.alternativePhone ? ` · Alternate: ${booking.alternativePhone}` : ''}</p></div>
            <strong>{formatMoney(booking.total ?? booking.price, settings.currency)}</strong>
          </div>
        ))}
        <div className="confirmation-fee-line"><span>Service fees</span><strong>{formatMoney(serviceFees, settings.currency)}</strong></div>
        <div className="confirmation-fee-line"><span>Service tax</span><strong>{formatMoney(serviceTax, settings.currency)}</strong></div>
        <div className="confirmation-total"><span>Total</span><strong>{formatMoney(total, settings.currency)}</strong></div>
        <p className="payment-result">{first.paymentStatus === 'paid' ? 'Demo card payment recorded. No real charge was made.' : 'Payment due after the service is complete.'}</p>
      </section>

      <div className="confirmation-actions">
        {session?.role === 'user' ? <Link className="btn" to="/app">View my bookings</Link> : <Link className="btn" to="/signup?role=user">Create an account</Link>}
        <Link className="btn ghost" to="/">Book another service</Link>
      </div>
    </motion.main>
  )
} 