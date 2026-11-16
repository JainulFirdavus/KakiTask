

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store.jsx'
import { formatMoney } from '../../utils/money.js'
import { formatServiceAddress } from '../../utils/addressLookup.js'
import Rating from '@mui/material/Rating'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

export default function UserDash() {
  const { session, bookings, catalog, settings, notifications, markNotificationsRead, complaints, addComplaint, rateBooking, cancel } = useStore()
  const [activeComplaint, setActiveComplaint] = useState('')
  const [complaintDraft, setComplaintDraft] = useState({ subject: '', message: '' })
  const [complaintNotice, setComplaintNotice] = useState('')
  const [ratingDrafts, setRatingDrafts] = useState({})
  const [ratingNotice, setRatingNotice] = useState('')
  const mine = bookings.filter((b) => b.customerId === session.id)
  const myNotifications = notifications.filter((item) => item.recipientId === session.id)
  const unreadNotifications = myNotifications.filter((item) => !item.read)

  const submitComplaint = (event, bookingId) => {
    event.preventDefault()
    const added = addComplaint({ bookingId, ...complaintDraft })
    if (!added) return setComplaintNotice('Unable to submit your message. Please try again.')
    setActiveComplaint('')
    setComplaintDraft({ subject: '', message: '' })
    setComplaintNotice('Your message has been sent to support.')
  }

  const submitRating = (event, bookingId) => {
    event.preventDefault()
    const draft = ratingDrafts[bookingId] || {}
    if (!draft.rating || !draft.satisfaction) return setRatingNotice('Select a star rating and satisfaction response first.')
    if (!rateBooking(bookingId, draft)) return setRatingNotice('This booking cannot be rated.')
    setRatingNotice('Thanks for sharing your feedback.')
  }

  return (
    <motion.main className="page dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 className="h1">Hi {session.name.split(' ')[0]} 👋</h1>
      <p className="sub left">What do you need help with today?</p>
      {myNotifications.length > 0 && <section className="card notification-panel">
        <div className="notification-panel-heading"><h2>Booking updates</h2>{unreadNotifications.length > 0 && <button className="btn ghost" onClick={markNotificationsRead}>Mark all read</button>}</div>
        <div className="notification-list">{myNotifications.slice(0, 6).map((notification) => (
          <div className={`notification-item${notification.read ? '' : ' unread'}`} key={notification.id}><span className="notification-dot" /><p>{notification.message}</p><small>{new Date(notification.createdAt).toLocaleString()}</small></div>
        ))}</div>
      </section>}
      <div className="grid">
        {catalog.filter((service) => service.active !== false).map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }}>
            <Link className="card hover tile service-tile" to={`/book/${s.id}`}>
              <div className="emoji">{s.icon}</div><h3>{s.name}</h3><p>{s.desc}</p><span className="price">{formatMoney(s.price, settings.currency)} <span aria-hidden="true">→</span></span>
            </Link>
          </motion.div>
        ))}
      </div>

      <h2 className="h2">My bookings</h2>
      {complaintNotice && <p className="complaint-notice" role="status">{complaintNotice}</p>}
      {ratingNotice && <p className="complaint-notice" role="status">{ratingNotice}</p>}
      {mine.length === 0 && <p className="muted">No bookings yet — pick a service above.</p>}
      <div className="list">
        <AnimatePresence>
          {mine.map((b) => (
            <motion.div key={b.id} layout className="card row" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="emoji sm">{b.icon}</div>
              <div className="grow">
                <h3>{b.serviceName}</h3>
                <p>{b.date} · {b.time} · {formatServiceAddress(b)}</p>
                <p className="muted">Contact: {b.customerPhone}{b.alternativePhone ? ` · Alternate: ${b.alternativePhone}` : ''} · Total {formatMoney(b.total ?? b.price, settings.currency)}</p>
                <p className="muted">{b.workerName ? `Pro: ${b.workerName}` : 'Waiting for a pro to accept'}</p>
              </div>
              <span className={`status ${b.status}`}>{b.status}</span>
              {b.status === 'pending' && <button className="btn ghost" onClick={() => cancel(b.id)}>Cancel</button>}
              {b.status === 'completed' && <section className="booking-rating">
                {b.rating ? (
                  <div className="submitted-rating">
                    <div><Rating value={b.rating} readOnly size="small" /><strong>{b.rating}/5</strong></div>
                    <p>Work satisfaction: <b>{b.satisfaction === 'satisfied' ? 'Satisfied' : 'Not satisfied'}</b></p>
                    {b.reviewComment && <p className="muted">{b.reviewComment}</p>}
                  </div>
                ) : (
                  <form className="booking-rating-form" onSubmit={(event) => submitRating(event, b.id)}>
                    <strong>How was the work?</strong>
                    <div className="rating-input-row">
                      <span>Rate your pro</span>
                      <Rating
                        value={ratingDrafts[b.id]?.rating || 0}
                        precision={1}
                        onChange={(_, value) => setRatingDrafts((drafts) => ({ ...drafts, [b.id]: { ...drafts[b.id], rating: value || 0 } }))}
                        aria-label={`Rate ${b.serviceName} from 1 to 5 stars`}
                      />
                    </div>
                    <div className="rating-input-row">
                      <span>Were you satisfied?</span>
                      <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={ratingDrafts[b.id]?.satisfaction || ''}
                        aria-label="Work satisfaction"
                        onChange={(_, value) => value && setRatingDrafts((drafts) => ({ ...drafts, [b.id]: { ...drafts[b.id], satisfaction: value } }))}
                      >
                        <ToggleButton value="satisfied">Satisfied</ToggleButton>
                        <ToggleButton value="unsatisfied">Not satisfied</ToggleButton>
                      </ToggleButtonGroup>
                    </div>
                    <textarea aria-label="Optional work review" placeholder="Add a comment (optional)" value={ratingDrafts[b.id]?.comment || ''} onChange={(event) => setRatingDrafts((drafts) => ({ ...drafts, [b.id]: { ...drafts[b.id], comment: event.target.value } }))} />
                    <button className="btn" type="submit">Submit rating</button>
                  </form>
                )}
              </section>}
              {(() => {
                const complaint = complaints.find((item) => item.bookingId === b.id && item.customerId === session.id)
                if (complaint) return (
                  <div className="complaint-thread">
                    <strong>{complaint.subject} · {complaint.status}</strong>
                    <p>{complaint.message}</p>
                    {complaint.reply && <p className="complaint-reply"><b>Support reply:</b> {complaint.reply}</p>}
                  </div>
                )
                return (
                  <div className="complaint-action">
                    {activeComplaint === b.id ? (
                      <form className="complaint-form" onSubmit={(event) => submitComplaint(event, b.id)}>
                        <input required aria-label="Complaint subject" placeholder="Subject" value={complaintDraft.subject} onChange={(event) => setComplaintDraft({ ...complaintDraft, subject: event.target.value })} />
                        <textarea required aria-label="Describe your concern" placeholder="Tell us what happened" value={complaintDraft.message} onChange={(event) => setComplaintDraft({ ...complaintDraft, message: event.target.value })} />
                        <div><button className="btn" type="submit">Send to support</button><button className="btn ghost" type="button" onClick={() => setActiveComplaint('')}>Cancel</button></div>
                      </form>
                    ) : <button className="btn ghost" onClick={() => setActiveComplaint(b.id)}>Contact support</button>}
                  </div>
                )
              })()}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.main>
  )
} 