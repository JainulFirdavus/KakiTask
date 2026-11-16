
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { useStore } from '../../store.jsx'
import { calculateTotals, formatMoney } from '../../utils/money.js'
import AddressAutocomplete from '../../components/AddressAutocomplete.jsx'
import MapPicker from '../../components/MapPicker.jsx'

const today = () => {
  const localDate = new Date()
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 10)
}

export default function BookingDetails() {
  const { serviceId } = useParams()
  const { session, catalog, settings, addToCart, getNearbyWorkerCount } = useStore()
  const service = catalog.find((item) => item.id === serviceId && item.active !== false)
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    let draft = {}
    try { draft = JSON.parse(localStorage.getItem(`uc_booking_draft_${serviceId}`)) || {} } catch {}
    return {
      customerName: draft.customerName || session?.name || '',
      customerEmail: draft.customerEmail || session?.email || '',
      customerPhone: draft.customerPhone || '',
      alternativePhone: draft.alternativePhone || '',
      date: draft.date || today(),
      time: draft.time || '10:00',
      address: draft.address || '',
      location: draft.location || null,
      building: draft.building || '',
      floor: draft.floor || '',
      landmark: draft.landmark || '',
      notes: draft.notes || '',
    }
  })

  if (!service) return <Navigate to="/" replace />

  const totals = calculateTotals([{ price: service.price }], settings)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    if (settings.bookingsEnabled === false) return
    if (!form.location) return
    if (session?.role !== 'user') {
      localStorage.setItem(`uc_booking_draft_${service.id}`, JSON.stringify(form))
      navigate('/login?role=user', { state: { from: { pathname: `/book/${service.id}` } } })
      return
    }

    const added = addToCart({
      ...form,
      serviceId: service.id,
      serviceName: service.name,
      icon: service.icon,
      price: service.price,
      location: form.location,
    })
    if (added) {
      localStorage.removeItem(`uc_booking_draft_${service.id}`)
      navigate('/cart')
    }
  }

  return (
    <motion.main className="page flow-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Link to="/" className="flow-back">← All services</Link>
      <p className="flow-kicker">Booking details · Step 1 of 3</p>
      <h1 className="h1">Tell us what you need</h1>
      <p className="sub left">Add your contact details and service information to continue.</p>

      <div className="booking-layout">
        <form className="card booking-form" onSubmit={submit}>
          <section className="form-section">
            <h2>Your details</h2>
            <div className="form-fields">
              <label>Full name<input name="customerName" autoComplete="name" required value={form.customerName} onChange={update} /></label>
              <div className="two">
                <label>Email address<input name="customerEmail" type="email" autoComplete="email" required value={form.customerEmail} onChange={update} /></label>
                <label>Phone number<input name="customerPhone" type="tel" autoComplete="tel" required value={form.customerPhone} onChange={update} /></label>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Job details</h2>
            <div className="form-fields">
              <div className="two">
                <DatePicker
                  label="Service date"
                  value={form.date ? dayjs(form.date) : null}
                  minDate={dayjs(today())}
                  onChange={(value) => setForm((current) => ({ ...current, date: value?.isValid() ? value.format('YYYY-MM-DD') : '' }))}
                  slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
                />
                <TimePicker
                  label="Preferred time"
                  value={form.time ? dayjs(`2020-01-01T${form.time}`) : null}
                  ampm={false}
                  minutesStep={30}
                  onChange={(value) => setForm((current) => ({ ...current, time: value?.isValid() ? value.format('HH:mm') : '' }))}
                  slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
                />
              </div>
              <AddressAutocomplete
                value={form.address}
                onChange={(address) => setForm((current) => ({ ...current, address, location: null }))}
                onSelect={(suggestion) => setForm((current) => ({ ...current, address: suggestion.label, location: suggestion.location }))}
              />
              <div className="two">
                <label>Building / unit <span className="field-optional">Optional</span><input name="building" autoComplete="address-line2" placeholder="Building, apartment, unit" value={form.building} onChange={update} /></label>
                <label>Floor <span className="field-optional">Optional</span><input name="floor" placeholder="Floor or level" value={form.floor} onChange={update} /></label>
              </div>
              <label>Landmark <span className="field-optional">Optional</span><input name="landmark" placeholder="Nearby landmark" value={form.landmark} onChange={update} /></label>
              <MapPicker label="Pin your service location" position={form.location} settings={settings} onChange={(location) => setForm((current) => ({ ...current, location }))} onAddressChange={(address) => setForm((current) => ({ ...current, address }))} />
              {form.location && <p className="nearby-worker-count" role="status">{getNearbyWorkerCount(form.location, service.id)} verified {getNearbyWorkerCount(form.location, service.id) === 1 ? 'pro is' : 'pros are'} available near this address.</p>}
              {!form.location && <p className="muted">Choose your location on the map to check nearby pro availability.</p>}
              <label>Alternative phone number <span className="field-optional">Optional</span><input name="alternativePhone" type="tel" autoComplete="tel-national" placeholder="Another contact number" value={form.alternativePhone} onChange={update} /></label>
              <label>Notes for your pro <span className="field-optional">Optional</span><textarea name="notes" placeholder="Share access instructions or job details" value={form.notes} onChange={update} /></label>
            </div>
          </section>

          {settings.bookingsEnabled === false && <p className="err" role="status">Bookings are temporarily unavailable. Please check back soon.</p>}
          <button className="btn big full" type="submit" disabled={settings.bookingsEnabled === false || !form.location}>
            {settings.bookingsEnabled === false ? 'Bookings unavailable' : !form.location ? 'Pin your service location' : session?.role === 'user' ? 'Add service to cart' : 'Log in to add service'} · {formatMoney(service.price, settings.currency)}
          </button>
        </form>

        <aside className="card service-summary">
          <span className="emoji">{service.icon}</span>
          <p className="summary-label">Selected service</p>
          <h2>{service.name}</h2>
          <p>{service.desc}</p>
          <div className="summary-cost-lines">
            <div><span>Service price</span><strong>{formatMoney(totals.subtotal, settings.currency)}</strong></div>
            <div><span>Service fee</span><strong>{formatMoney(totals.serviceFee, settings.currency)}</strong></div>
            <div><span>Service tax ({settings.serviceTaxPercent}%)</span><strong>{formatMoney(totals.serviceTax, settings.currency)}</strong></div>
            <div className="summary-cost-total"><span>Total</span><strong>{formatMoney(totals.total, settings.currency)}</strong></div>
          </div>
          {session?.role === 'user' && <Link to="/cart" className="summary-cart">View cart</Link>}
        </aside>
      </div>
    </motion.main>
  )
} 