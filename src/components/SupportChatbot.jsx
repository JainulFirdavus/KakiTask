import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ArrowOutwardOutlinedIcon from '@mui/icons-material/ArrowOutwardOutlined'
import { useStore } from '../store.jsx'

const topics = [
  { label: 'Find a home service', response: 'Browse the service list and choose a time that works for you.', to: '/#services', action: 'Browse services' },
  { label: 'Manage a booking', response: 'Your booking status, worker updates, and support requests are in your customer account.', to: '/app', signedOutTo: '/login?role=user', action: 'Open bookings' },
  { label: 'Become a pro', response: 'Create a pro account, choose your service, and complete verification to receive nearby jobs.', to: '/signup?role=worker', action: 'Join as a pro' },
]

export default function SupportChatbot() {
  const { session } = useStore()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)

  if (location.pathname.startsWith('/admin')) return null

  return (
    <div className="support-chatbot">
      <AnimatePresence>
        {open && <motion.section className="chatbot-panel" aria-label="Quick help" initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.2 }}>
          <header className="chatbot-header">
            <div className="chatbot-mark"><ChatBubbleOutlineOutlinedIcon /></div>
            <div><strong>Urban help</strong><span>Quick answers</span></div>
            <button type="button" className="chatbot-close" aria-label="Close help" onClick={() => setOpen(false)}><CloseOutlinedIcon fontSize="small" /></button>
          </header>
          <div className="chatbot-content">
            <p className="chatbot-greeting">Hi{session?.name ? `, ${session.name.split(' ')[0]}` : ''}. What can we help with?</p>
            {selectedTopic ? (
              <div className="chatbot-answer">
                <p>{selectedTopic.response}</p>
                <Link to={session ? selectedTopic.to : selectedTopic.signedOutTo || selectedTopic.to} onClick={() => setOpen(false)}>{selectedTopic.action}<ArrowOutwardOutlinedIcon fontSize="inherit" /></Link>
                <button type="button" onClick={() => setSelectedTopic(null)}>More questions</button>
              </div>
            ) : (
              <div className="chatbot-topics">{topics.map((topic) => <button type="button" key={topic.label} onClick={() => setSelectedTopic(topic)}>{topic.label}<span>›</span></button>)}</div>
            )}
          </div>
        </motion.section>}
      </AnimatePresence>
      <motion.button className="chatbot-launcher" type="button" aria-label={open ? 'Close quick help' : 'Open quick help'} aria-expanded={open} onClick={() => setOpen((value) => !value)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
        {open ? <CloseOutlinedIcon /> : <ChatBubbleOutlineOutlinedIcon />}
        <span>{open ? 'Close' : 'Help'}</span>
      </motion.button>
    </div>
  )
}