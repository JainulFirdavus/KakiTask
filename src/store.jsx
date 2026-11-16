

import { createContext, useContext, useEffect, useState } from 'react'
import defaultSiteSettings from './config/siteSettings.json'
import { isWithinRadius } from './utils/geo.js'

export const SERVICES = [
  { id: 'cleaning', name: 'Home Cleaning', icon: '🧹', price: 49, desc: 'Deep clean for every room' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', price: 59, desc: 'Leaks, taps & installs' },
  { id: 'electrical', name: 'Electrician', icon: '⚡', price: 55, desc: 'Wiring, lights & repairs' },
  { id: 'moving', name: 'Moving Help', icon: '📦', price: 79, desc: 'Lifting, loading & packing' },
  { id: 'painting', name: 'Painting', icon: '🎨', price: 89, desc: 'Fresh walls, clean finish' },
  { id: 'salon', name: 'Salon at Home', icon: '💇', price: 39, desc: 'Hair, spa & grooming' },
  { id: 'assembly', name: 'Furniture Assembly', icon: '🪑', price: 45, desc: 'IKEA & more, built fast' },
  { id: 'appliance', name: 'Appliance Repair', icon: '🧺', price: 65, desc: 'AC, washer, fridge fixes' },
]

export const DEMO_ACCOUNTS = [
  { id: 'demo-customer', name: 'Demo Customer', email: 'customer@urban.test', password: 'UrbanDemo123', role: 'user', skill: null, active: true },
  { id: 'demo-worker', name: 'Demo Pro', email: 'pro@urban.test', password: 'UrbanDemo123', role: 'worker', skill: 'cleaning', active: true },
  { id: 'demo-admin', name: 'Demo Admin', email: 'admin@urban.test', password: 'UrbanDemo123', role: 'admin', skill: null, active: true },
]

const read = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d }
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

// Demo-only auth: credentials live in localStorage. Replace with a real backend before production.
export function StoreProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const savedUsers = read('uc_users', [])
    return [...DEMO_ACCOUNTS, ...savedUsers.filter((saved) => !DEMO_ACCOUNTS.some((demo) => demo.email === saved.email && demo.role === saved.role))]
  })
  const [session, setSession] = useState(() => read('uc_session', null))
  const [bookings, setBookings] = useState(() => read('uc_bookings', []))
  const [cart, setCart] = useState(() => read('uc_cart', []))
  const [verifications, setVerifications] = useState(() => read('uc_worker_verifications', {}))
  const [workerProfiles, setWorkerProfiles] = useState(() => read('uc_worker_profiles', {}))
  const [notifications, setNotifications] = useState(() => read('uc_notifications', []))
  const [complaints, setComplaints] = useState(() => read('uc_complaints', []))
  const [catalog, setCatalog] = useState(() => {
    const saved = read('uc_services', SERVICES)
    return SERVICES.map((service) => saved.find((item) => item.id === service.id) || { ...service, active: true })
      .concat(saved.filter((item) => !SERVICES.some((service) => service.id === item.id)))
  })
  const [promotions, setPromotions] = useState(() => read('uc_promotions', []))
  const [coupons, setCoupons] = useState(() => read('uc_coupons', []))
  const [settings, setSettings] = useState(() => ({ ...defaultSiteSettings, ...read('uc_settings', {}) }))

  useEffect(() => localStorage.setItem('uc_users', JSON.stringify(users)), [users])
  useEffect(() => localStorage.setItem('uc_session', JSON.stringify(session)), [session])
  useEffect(() => localStorage.setItem('uc_bookings', JSON.stringify(bookings)), [bookings])
  useEffect(() => localStorage.setItem('uc_cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('uc_worker_verifications', JSON.stringify(verifications)), [verifications])
  useEffect(() => localStorage.setItem('uc_worker_profiles', JSON.stringify(workerProfiles)), [workerProfiles])
  useEffect(() => localStorage.setItem('uc_notifications', JSON.stringify(notifications)), [notifications])
  useEffect(() => localStorage.setItem('uc_complaints', JSON.stringify(complaints)), [complaints])
  useEffect(() => localStorage.setItem('uc_services', JSON.stringify(catalog)), [catalog])
  useEffect(() => localStorage.setItem('uc_promotions', JSON.stringify(promotions)), [promotions])
  useEffect(() => localStorage.setItem('uc_coupons', JSON.stringify(coupons)), [coupons])
  useEffect(() => localStorage.setItem('uc_settings', JSON.stringify(settings)), [settings])

  const signup = ({ name, email, password, role, skill }) => {
    email = email.trim().toLowerCase()
    if (users.some((u) => u.email === email && u.role === role)) return 'An account with this email already exists.'
    const u = { id: crypto.randomUUID(), name: name.trim(), email, password, role, skill: skill || null, active: true, createdAt: Date.now() }
    setUsers([...users, u])
    if (role === 'worker') setWorkerProfiles((profiles) => ({
      ...profiles,
      [u.id]: { location: null, radiusKm: Number(settings.defaultWorkerRadiusKm) || 15, address: '' },
    }))
    setSession({ id: u.id, name: u.name, email, role, skill: u.skill })
    return null
  }

  const login = ({ email, password, role }) => {
    const u = users.find((x) => x.email === email.trim().toLowerCase() && x.role === role)
    if (!u || u.password !== password) return 'Invalid email or password.'
    setSession({ id: u.id, name: u.name, email: u.email, role, skill: u.skill })
    return null
  }

  const logout = () => setSession(null)

  const userCart = session?.role === 'user' ? cart.filter((item) => item.customerId === session.id) : []
  const managedUsers = users.map(({ id, name, email, role, skill, active, createdAt }) => ({ id, name, email, role, skill, active: active !== false, createdAt }))

  const updateService = (id, patch) => setCatalog((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item))
  const addService = ({ name, price, desc, icon }) => {
    const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || crypto.randomUUID()
    if (catalog.some((item) => item.id === id)) return 'A service with that name already exists.'
    setCatalog((items) => [...items, { id, name: name.trim(), price: Number(price), desc: desc.trim(), icon: icon.trim() || '🏠', active: true }])
    return null
  }
  const updateUser = (id, patch) => setUsers((items) => items.map((user) => user.id === id ? { ...user, ...patch } : user))
  const addPromotion = ({ title, description, discount }) => setPromotions((items) => [...items, { id: crypto.randomUUID(), title: title.trim(), description: description.trim(), discount: Number(discount), active: true }])
  const updatePromotion = (id, patch) => setPromotions((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item))
  const removePromotion = (id) => setPromotions((items) => items.filter((item) => item.id !== id))
  const addCoupon = ({ code, discount, type, expires }) => {
    const normalizedCode = code.trim().toUpperCase()
    if (coupons.some((coupon) => coupon.code === normalizedCode)) return 'That coupon code already exists.'
    setCoupons((items) => [...items, { id: crypto.randomUUID(), code: normalizedCode, discount: Number(discount), type, expires, active: true }])
    return null
  }
  const updateCoupon = (id, patch) => setCoupons((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item))
  const updateSettings = (patch) => setSettings((current) => ({ ...current, ...patch }))
  const updateWorkerProfile = (patch) => {
    if (session?.role !== 'worker') return false
    setWorkerProfiles((profiles) => ({
      ...profiles,
      [session.id]: {
        location: null,
        radiusKm: Number(settings.defaultWorkerRadiusKm) || 15,
        address: '',
        ...profiles[session.id],
        ...patch,
      },
    }))
    return true
  }
  const updateManagedWorkerProfile = (workerId, patch) => {
    if (session?.role !== 'admin' || !users.some((user) => user.id === workerId && user.role === 'worker')) return false
    setWorkerProfiles((profiles) => {
      const current = profiles[workerId] || { location: null, radiusKm: Number(settings.defaultWorkerRadiusKm) || 15, address: '' }
      const radiusKm = patch.radiusKm === undefined
        ? current.radiusKm
        : Math.min(100, Math.max(1, Number(patch.radiusKm) || 1))
      return { ...profiles, [workerId]: { ...current, ...patch, radiusKm } }
    })
    return true
  }
  const nearbyWorkers = (location, serviceId) => users.filter((worker) => {
    if (worker.role !== 'worker' || worker.active === false || worker.skill !== serviceId) return false
    if (verifications[worker.id]?.status !== 'approved') return false
    const profile = workerProfiles[worker.id]
    return Boolean(profile?.location && location && isWithinRadius(location, profile.location, profile.radiusKm))
  })
  const getAssignableWorkers = (location, serviceId) => users.filter((worker) => {
    if (worker.role !== 'worker' || worker.active === false || worker.skill !== serviceId) return false
    if (verifications[worker.id]?.status !== 'approved') return false
    const profile = workerProfiles[worker.id]
    if (!profile?.location) return false
    return !location || isWithinRadius(location, profile.location, profile.radiusKm)
  }).map(({ id, name, email, skill }) => ({ id, name, email, skill }))
  const getNearbyWorkerCount = (location, serviceId) => nearbyWorkers(location, serviceId).length
  const markNotificationsRead = () => {
    if (!session) return
    setNotifications((items) => items.map((item) => item.recipientId === session.id && !item.read ? { ...item, read: true } : item))
  }
  const submitWorkerVerification = (document) => {
    if (session?.role !== 'worker') return false
    setVerifications((items) => ({
      ...items,
      [session.id]: { ...document, status: 'pending', submittedAt: Date.now(), reviewedAt: null, reviewNote: '' },
    }))
    return true
  }
  const updateWorkerVerification = (workerId, patch) => setVerifications((items) => ({
    ...items,
    [workerId]: { ...items[workerId], ...patch, reviewedAt: Date.now() },
  }))
  const addComplaint = ({ bookingId, subject, message }) => {
    if (session?.role !== 'user') return false
    const booking = bookings.find((item) => item.id === bookingId && item.customerId === session.id)
    if (!booking) return false
    setComplaints((items) => [{
      id: crypto.randomUUID(), bookingId, orderName: booking.serviceName,
      customerId: session.id, customerName: session.name, customerEmail: session.email,
      subject: subject.trim(), message: message.trim(), status: 'open', reply: '', createdAt: Date.now(),
    }, ...items])
    return true
  }
  const updateComplaint = (complaintId, patch) => setComplaints((items) => items.map((item) => (
    item.id === complaintId ? { ...item, ...patch, repliedAt: Date.now() } : item
  )))

  const book = ({ serviceId, date, time, address, notes }) => {
    const s = catalog.find((x) => x.id === serviceId)
    setBookings((b) => [
      { id: crypto.randomUUID(), serviceId, serviceName: s.name, icon: s.icon, price: s.price, date, time, address, notes,
        customerId: session.id, customerName: session.name, workerId: null, workerName: null, status: 'pending', createdAt: Date.now() },
      ...b,
    ])
  }

  const addToCart = (item) => {
    if (session?.role !== 'user' || settings.bookingsEnabled === false) return false
    setCart((items) => [...items, { ...item, customerId: session.id, id: crypto.randomUUID() }])
    return true
  }
  const removeFromCart = (id) => setCart((items) => items.filter((item) => item.id !== id))
  const clearCart = () => setCart((items) => items.filter((item) => item.customerId !== session?.id))

  const placeOrder = ({ paymentMethod }) => {
    if (session?.role !== 'user' || settings.bookingsEnabled === false || userCart.length === 0) return null
    const orderId = crypto.randomUUID()
    const taxRate = Math.min(100, Math.max(0, Number(settings.serviceTaxPercent) || 0)) / 100
    const commissionRate = Math.min(100, Math.max(0, Number(settings.commissionPercent) || 0)) / 100
    const newBookings = userCart.map((item) => ({
      id: crypto.randomUUID(),
      orderId,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      icon: item.icon,
      price: item.price,
      serviceFee: Math.max(0, Number(settings.serviceFee) || 0),
      serviceTax: Number((item.price * taxRate).toFixed(2)),
      commission: Number((item.price * commissionRate).toFixed(2)),
      workerNet: Number((item.price * (1 - commissionRate)).toFixed(2)),
      total: Number((item.price + Math.max(0, Number(settings.serviceFee) || 0) + Number((item.price * taxRate).toFixed(2))).toFixed(2)),
      date: item.date,
      time: item.time,
      address: item.address,
      building: item.building || '',
      floor: item.floor || '',
      landmark: item.landmark || '',
      location: item.location || null,
      notes: item.notes,
      customerId: session?.id ?? null,
      customerName: item.customerName || session.name,
      customerEmail: item.customerEmail || session.email,
      customerPhone: item.customerPhone,
      alternativePhone: item.alternativePhone || '',
      workerId: null,
      workerName: null,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'card' ? 'paid' : 'pay-on-service',
      createdAt: Date.now(),
    }))

    const orderNotifications = newBookings.flatMap((booking) => nearbyWorkers(booking.location, booking.serviceId).map((worker) => ({
      id: crypto.randomUUID(),
      recipientId: worker.id,
      role: 'worker',
      type: 'nearby-order',
      bookingId: booking.id,
      message: `New ${booking.serviceName} request is available in your service area.`,
      createdAt: Date.now(),
      read: false,
    })))

    setBookings((items) => [...newBookings, ...items])
    setNotifications((items) => [...orderNotifications, ...items])
    clearCart()
    return orderId
  }

  const update = (id, patch) => setBookings((b) => b.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const updatePayment = (id, paymentStatus) => update(id, { paymentStatus })
  const updateOrderDetails = (orderId, patch) => {
    if (session?.role !== 'admin') return false
    const order = bookings.find((item) => item.id === orderId)
    if (!order || !['pending', 'accepted'].includes(order.status)) return false
    const editableFields = ['customerName', 'customerEmail', 'customerPhone', 'alternativePhone', 'address', 'building', 'floor', 'landmark', 'date', 'time', 'location', 'notes']
    const changes = Object.fromEntries(editableFields.filter((field) => patch[field] !== undefined).map((field) => [field, patch[field]]))
    const nextOrder = { ...order, ...changes }
    const nextPatch = { ...changes, updatedAt: Date.now() }
    let removedWorker = null

    if (order.workerId && Object.hasOwn(changes, 'location')) {
      const currentWorker = users.find((worker) => worker.id === order.workerId)
      const profile = workerProfiles[order.workerId]
      if (!currentWorker || !profile?.location || !nextOrder.location || !isWithinRadius(nextOrder.location, profile.location, profile.radiusKm)) {
        removedWorker = currentWorker
        Object.assign(nextPatch, { status: 'pending', workerId: null, workerName: null, assignedByAdmin: false })
      }
    }

    update(orderId, nextPatch)
    const orderNotifications = [{
      id: crypto.randomUUID(), recipientId: order.customerId, role: 'user', type: 'order-updated', bookingId: order.id,
      message: `Your ${order.serviceName} booking details were updated by support.`, createdAt: Date.now(), read: false,
    }]
    if (removedWorker) orderNotifications.push({
      id: crypto.randomUUID(), recipientId: removedWorker.id, role: 'worker', type: 'order-updated', bookingId: order.id,
      message: `The ${order.serviceName} job details changed and it is no longer assigned to you.`, createdAt: Date.now(), read: false,
    })
    else if (order.workerId) orderNotifications.push({
      id: crypto.randomUUID(), recipientId: order.workerId, role: 'worker', type: 'order-updated', bookingId: order.id,
      message: `The ${order.serviceName} booking details were updated by support.`, createdAt: Date.now(), read: false,
    })
    setNotifications((items) => [...orderNotifications, ...items])
    return true
  }
  const accept = (id) => {
    const booking = bookings.find((item) => item.id === id)
    const profile = workerProfiles[session?.id]
    const worker = users.find((item) => item.id === session?.id)
    if (session?.role !== 'worker' || !booking || booking.status !== 'pending') return false
    if (!worker || worker.active === false || verifications[session.id]?.status !== 'approved' || booking.serviceId !== worker.skill) return false
    if (!profile?.location || !booking.location || !isWithinRadius(profile.location, booking.location, profile.radiusKm)) return false
    update(id, { status: 'accepted', workerId: session.id, workerName: session.name, acceptedAt: Date.now() })
    setNotifications((items) => [{
      id: crypto.randomUUID(), recipientId: booking.customerId, role: 'user', type: 'order-accepted', bookingId: booking.id,
      message: `${session.name} accepted your ${booking.serviceName} request.`, createdAt: Date.now(), read: false,
    }, ...items])
    return true
  }
  const decline = (id) => {
    if (session?.role !== 'worker') return
    const booking = bookings.find((item) => item.id === id)
    const profile = workerProfiles[session.id]
    if (!booking || booking.status !== 'pending' || booking.serviceId !== session.skill || !profile?.location || !booking.location || !isWithinRadius(profile.location, booking.location, profile.radiusKm)) return
    update(id, { status: 'declined', declinedBy: session.name, declinedById: session.id })
  }
  const assignOrder = (orderId, workerId) => {
    if (session?.role !== 'admin') return false
    const order = bookings.find((item) => item.id === orderId)
    if (!order || !['pending', 'accepted'].includes(order.status)) return false
    const worker = getAssignableWorkers(order.location, order.serviceId).find((item) => item.id === workerId)
    if (!worker) return false
    const previousWorkerId = order.workerId
    update(orderId, { status: 'accepted', workerId: worker.id, workerName: worker.name, acceptedAt: Date.now(), assignedByAdmin: true })
    const assignmentNotifications = [
      {
        id: crypto.randomUUID(), recipientId: worker.id, role: 'worker', type: 'order-assigned', bookingId: order.id,
        message: `An administrator assigned a ${order.serviceName} job to you.`, createdAt: Date.now(), read: false,
      },
      {
        id: crypto.randomUUID(), recipientId: order.customerId, role: 'user', type: 'order-assigned', bookingId: order.id,
        message: `${worker.name} was assigned to your ${order.serviceName} booking.`, createdAt: Date.now(), read: false,
      },
    ]
    if (previousWorkerId && previousWorkerId !== worker.id) assignmentNotifications.unshift({
      id: crypto.randomUUID(), recipientId: previousWorkerId, role: 'worker', type: 'order-reassigned', bookingId: order.id,
      message: `The ${order.serviceName} job was reassigned to another pro.`, createdAt: Date.now(), read: false,
    })
    setNotifications((items) => [...assignmentNotifications, ...items])
    return true
  }
  const complete = (id) => update(id, { status: 'completed' })
  const cancel = (id) => update(id, { status: 'cancelled' })
  const rateBooking = (bookingId, { rating, satisfaction, comment = '' }) => {
    if (session?.role !== 'user') return false
    const booking = bookings.find((item) => item.id === bookingId && item.customerId === session.id)
    const numericRating = Number(rating)
    if (!booking || booking.status !== 'completed' || booking.rating) return false
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return false
    if (!['satisfied', 'unsatisfied'].includes(satisfaction)) return false
    update(bookingId, { rating: numericRating, satisfaction, reviewComment: comment.trim(), ratedAt: Date.now() })
    return true
  }

  return (
    <Ctx.Provider value={{ session, signup, login, logout, bookings, users: managedUsers, catalog, promotions, coupons, settings, updateService, addService, updateUser, addPromotion, updatePromotion, removePromotion, addCoupon, updateCoupon, updateSettings, updatePayment, updateOrderDetails, verifications, submitWorkerVerification, updateWorkerVerification, workerProfiles, updateWorkerProfile, updateManagedWorkerProfile, getNearbyWorkerCount, getAssignableWorkers, assignOrder, notifications, markNotificationsRead, complaints, addComplaint, updateComplaint, book, cart: userCart, addToCart, removeFromCart, clearCart, placeOrder, accept, decline, complete, cancel, rateBooking }}>
      {children}
    </Ctx.Provider>
  )
}
