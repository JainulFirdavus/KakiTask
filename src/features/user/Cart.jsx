

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../../store.jsx'
import { calculateTotals, formatMoney } from '../../utils/money.js'
import { formatServiceAddress } from '../../utils/addressLookup.js'

export default function Cart() {
  const { cart, settings, removeFromCart, getNearbyWorkerCount } = useStore()
  const totals = calculateTotals(cart, settings)

  return (
    <motion.main className="page flow-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Link to="/app" className="flow-back">← My services</Link>
      <p className="flow-kicker">Your services · Step 2 of 3</p>
      <h1 className="h1">Your cart <span className="cart-heading-count">{cart.length}</span></h1>
      {cart.length === 0 ? (
        <div className="card empty-cart">
          <h2>Your cart is empty</h2>
          <p className="muted">Choose a home service and add the job details to get started.</p>
          <Link className="btn" to="/app">Browse services</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            <Link to="/app" className="btn ghost add-another-service">Add another service</Link>
            {cart.map((item) => (
              <article className="card cart-item" key={item.id}>
                <span className="emoji">{item.icon}</span>
                <div className="cart-item-main">
                  <h2>{item.serviceName}</h2>
                  <p>{item.date} · {item.time}</p>
                  <p>{item.customerName} · {formatServiceAddress(item)}</p>
                  <p>Contact: {item.customerPhone}{item.alternativePhone ? ` · Alternate: ${item.alternativePhone}` : ''}</p>
                  <p className="nearby-worker-count">{getNearbyWorkerCount(item.location, item.serviceId)} verified {getNearbyWorkerCount(item.location, item.serviceId) === 1 ? 'pro is' : 'pros are'} available near this address</p>
                  {item.notes && <p className="muted">{item.notes}</p>}
                </div>
                <strong className="cart-item-price">{formatMoney(item.price, settings.currency)}</strong>
                <button className="remove-item" type="button" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.serviceName} from cart`}>Remove</button>
              </article>
            ))}
          </div>
          <aside className="card cart-total">
            <h2>Combined order · {cart.length} {cart.length === 1 ? 'service' : 'services'}</h2>
            <div><span>Services ({cart.length})</span><span>{formatMoney(totals.subtotal, settings.currency)}</span></div>
            <div><span>Service fee</span><span>{formatMoney(totals.serviceFee, settings.currency)}</span></div>
            <div><span>Service tax ({settings.serviceTaxPercent}%)</span><span>{formatMoney(totals.serviceTax, settings.currency)}</span></div>
            <div className="total-line"><strong>Total</strong><strong>{formatMoney(totals.total, settings.currency)}</strong></div>
            {settings.bookingsEnabled === false ? <p className="err" role="status">Checkout is temporarily unavailable.</p> : <Link to="/checkout" className="btn big full">Continue to payment</Link>}
            <p className="muted">Payment is completed securely in the next step.</p>
          </aside>
        </div>
      )}
    </motion.main>
  )
}
 