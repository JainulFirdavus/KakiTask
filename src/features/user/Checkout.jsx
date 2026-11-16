
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../../store.jsx'
import { calculateTotals, formatMoney } from '../../utils/money.js'

export default function Checkout() {
  const { cart, settings, placeOrder } = useStore()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [orderError, setOrderError] = useState('')
  const totals = calculateTotals(cart, settings)

  if (cart.length === 0) return <Navigate to="/cart" replace />

  const submit = (event) => {
    event.preventDefault()
    const orderId = placeOrder({ paymentMethod })
    if (!orderId) {
      setOrderError('Bookings are temporarily unavailable. Your cart has been kept.')
      return
    }
    navigate(`/confirmation/${orderId}`)
  }

  return (
    <motion.main className="page flow-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Link to="/cart" className="flow-back">← Back to cart</Link>
      <p className="flow-kicker">Payment · Step 3 of 3</p>
      <h1 className="h1">Review and confirm</h1>
      <p className="sub left">One payment for {cart.length} {cart.length === 1 ? 'service' : 'services'}.</p>
      {orderError && <p className="err" role="alert">{orderError}</p>}
      {settings.bookingsEnabled === false && <p className="err" role="status">Bookings are temporarily unavailable.</p>}

      <form className="checkout-layout" onSubmit={submit}>
        <section className="card payment-panel">
          <h2>Payment method</h2>
          <label className={`payment-option${paymentMethod === 'card' ? ' selected' : ''}`}>
            <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
            <span><strong>Card payment</strong><small>Demo checkout · no real charge or card details required</small></span>
            <b aria-hidden="true">CARD</b>
          </label>
          <label className={`payment-option${paymentMethod === 'service' ? ' selected' : ''}`}>
            <input type="radio" name="payment" value="service" checked={paymentMethod === 'service'} onChange={() => setPaymentMethod('service')} />
            <span><strong>Pay after the service</strong><small>Pay your pro when the job is complete</small></span>
            <b aria-hidden="true">LATER</b>
          </label>
          <p className="payment-disclaimer">This is a demo app. Selecting card payment records a simulated payment only.</p>
        </section>

        <aside className="card cart-total checkout-total">
          <h2>Combined order · {cart.length} {cart.length === 1 ? 'service' : 'services'}</h2>
          {cart.map((item) => <div className="checkout-line" key={item.id}><span>{item.icon} {item.serviceName}</span><span>{formatMoney(item.price, settings.currency)}</span></div>)}
          <div className="checkout-line"><span>Booking fees</span><span>{formatMoney(totals.serviceFee, settings.currency)}</span></div>
          <div className="checkout-line"><span>Service tax ({settings.serviceTaxPercent}%)</span><span>{formatMoney(totals.serviceTax, settings.currency)}</span></div>
          <div className="total-line"><strong>Total</strong><strong>{formatMoney(totals.total, settings.currency)}</strong></div>
          <button className="btn big full" type="submit" disabled={settings.bookingsEnabled === false}>Confirm order · {formatMoney(totals.total, settings.currency)}</button>
          <p className="muted">Your service bookings will be sent to available pros.</p>
        </aside>
      </form>
    </motion.main>
  )
} 