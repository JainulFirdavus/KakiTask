import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '../../store.jsx'
import { formatMoney } from '../../utils/money.js'
import { distanceKm } from '../../utils/geo.js'
import { formatServiceAddress } from '../../utils/addressLookup.js'
import MapPicker from '../../components/MapPicker.jsx'

function Job({ b, children, currency }) {
  return (
    <motion.div layout className="card row" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
      <div className="emoji sm">{b.icon}</div>
      <div className="grow">
        <h3>{b.serviceName} · You earn {formatMoney(b.workerNet ?? b.price, currency)}</h3>
        <p>{b.customerName} · {b.date} {b.time}</p>
        <p className="muted">{formatServiceAddress(b)}{b.notes ? ` — ${b.notes}` : ''}</p>
        <p className="muted">Customer contact: {b.customerPhone || '—'}{b.alternativePhone ? ` · Alternate: ${b.alternativePhone}` : ''}</p>
      </div>
      {children}
    </motion.div>
  )
}

export default function WorkerDash() {
  const { session, bookings, catalog, settings, verifications, submitWorkerVerification, workerProfiles, updateWorkerProfile, notifications, markNotificationsRead, accept, decline, complete } = useStore()
  const [uploadError, setUploadError] = useState('')
  const [actionError, setActionError] = useState('')
  const skill = catalog.find((s) => s.id === session.skill)
  const verification = verifications[session.id]
  const profile = workerProfiles[session.id] || { location: null, radiusKm: Number(settings.defaultWorkerRadiusKm) || 15, address: '' }
  const workerNotifications = notifications.filter((item) => item.recipientId === session.id)
  const unreadNotifications = workerNotifications.filter((item) => !item.read)
  const isVerified = verification?.status === 'approved'
  const open = bookings.filter((booking) => booking.status === 'pending'
    && booking.serviceId === session.skill
    && profile.location
    && booking.location
    && distanceKm(profile.location, booking.location) <= Number(profile.radiusKm || settings.defaultWorkerRadiusKm || 15))
  const mine = bookings.filter((b) => b.workerId === session.id)
  const active = mine.filter((b) => b.status === 'accepted')
  const done = mine.filter((b) => b.status === 'completed')
  const earned = done.reduce((t, b) => t + (b.workerNet ?? b.price), 0)

  const submitDocument = async (event) => {
    event.preventDefault()
    setUploadError('')
    const file = event.currentTarget.elements.verificationFile.files[0]
    if (!file) return setUploadError('Choose an identity or trade document to continue.')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return setUploadError('Upload a PDF, JPG, or PNG document.')
    if (file.size > 1024 * 1024) return setUploadError('The document must be smaller than 1 MB.')
    const fileData = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    }).catch(() => null)
    if (!fileData) return setUploadError('This document could not be read. Please try again.')
    submitWorkerVerification({ fileName: file.name, fileType: file.type, fileData })
  }

  const acceptJob = (bookingId) => {
    setActionError(accept(bookingId) ? '' : 'This job is no longer available or is outside your saved service radius.')
  }

  if (!isVerified) {
    return (
      <motion.main className="page dash worker-verification-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h1 className="h1">Worker verification</h1>
        <p className="sub left">Submit a document so our team can verify your professional profile. Job access is enabled after approval.</p>
        <section className="card verification-card">
          <span className={`status ${verification?.status || 'pending'}`}>{verification?.status || 'Not submitted'}</span>
          <h2>{verification?.status === 'pending' ? 'Document under review' : verification?.status === 'rejected' ? 'Please submit a new document' : 'Identity or trade document required'}</h2>
          <p>Accepted formats: PDF, JPG, or PNG. Files are limited to 1 MB in this local demo.</p>
          {verification?.fileName && <a className="verification-file" href={verification.fileData} target="_blank" rel="noreferrer">Current document: {verification.fileName}</a>}
          {verification?.reviewNote && <p className="err">Review note: {verification.reviewNote}</p>}
          {verification?.status !== 'pending' && (
            <form className="verification-form" onSubmit={submitDocument}>
              <label>Verification document<input name="verificationFile" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required /></label>
              {uploadError && <p className="err">{uploadError}</p>}
              <button className="btn big" type="submit">Submit for review</button>
            </form>
          )}
        </section>
      </motion.main>
    )
  }

  return (
    <motion.main className="page dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 className="h1">Worker hub {skill?.icon}</h1>
      <p className="sub left">{skill?.name} jobs near you</p>
      <div className="stats">
        {[['Open jobs', open.length], ['In progress', active.length], ['Completed', done.length], ['Your earnings', formatMoney(earned, settings.currency)]].map(([l, v], i) => (
          <motion.div key={l} className="card stat" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
            <b>{v}</b><span>{l}</span>
          </motion.div>
        ))}
      </div>

      <section className="card worker-location-panel">
        <div><h2>Service location and radius</h2><p className="muted">Only matching verified orders inside this radius are offered to you.</p></div>
        <label>Base address<input value={profile.address || ''} onChange={(event) => updateWorkerProfile({ address: event.target.value })} placeholder="Area, city" /></label>
        <label>Accept jobs within <strong>{profile.radiusKm} km</strong><input type="range" min="1" max="100" step="1" value={profile.radiusKm || settings.defaultWorkerRadiusKm || 15} onChange={(event) => updateWorkerProfile({ radiusKm: Number(event.target.value) })} /></label>
        <MapPicker label="Set your service base" position={profile.location} onChange={(location) => updateWorkerProfile({ location })} settings={settings} />
        {!profile.location && <p className="err">Choose your service base on the map to receive nearby jobs.</p>}
      </section>

      {workerNotifications.length > 0 && <section className="card notification-panel">
        <div className="notification-panel-heading"><h2>Notifications</h2>{unreadNotifications.length > 0 && <button className="btn ghost" onClick={markNotificationsRead}>Mark all read</button>}</div>
        <div className="notification-list">{workerNotifications.slice(0, 8).map((notification) => (
          <div className={`notification-item${notification.read ? '' : ' unread'}`} key={notification.id}>
            <span className="notification-dot" /><p>{notification.message}</p><small>{new Date(notification.createdAt).toLocaleString()}</small>
          </div>
        ))}</div>
      </section>}

      <h2 className="h2">Available jobs</h2>
      {actionError && <p className="err" role="status">{actionError}</p>}
      {open.length === 0 && <p className="muted">No open jobs for your skill inside {profile.radiusKm} km. Set your map location to receive nearby requests.</p>}
      <div className="list"><AnimatePresence>
        {open.map((booking) => <Job key={booking.id} b={booking} currency={settings.currency}><span className="distance-label">{distanceKm(profile.location, booking.location).toFixed(1)} km away</span><button className="btn ghost" onClick={() => decline(booking.id)}>Decline</button><button className="btn" onClick={() => acceptJob(booking.id)}>Accept</button></Job>)}
      </AnimatePresence></div>

      <h2 className="h2">My jobs</h2>
      {mine.length === 0 && <p className="muted">Accepted jobs will show up here.</p>}
      <div className="list"><AnimatePresence>
        {mine.map((b) => (
          <Job key={b.id} b={b} currency={settings.currency}>
            <span className={`status ${b.status}`}>{b.status}</span>
            {b.status === 'accepted' && <button className="btn" onClick={() => complete(b.id)}>Mark done</button>}
          </Job>
        ))}
      </AnimatePresence></div>
    </motion.main>
  )
}
 