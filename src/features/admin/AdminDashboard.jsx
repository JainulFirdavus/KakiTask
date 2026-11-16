



import { Children, cloneElement, isValidElement, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined'
import ViewHeadlineOutlinedIcon from '@mui/icons-material/ViewHeadlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FormatAlignLeftOutlinedIcon from '@mui/icons-material/FormatAlignLeftOutlined'
import FormatAlignCenterOutlinedIcon from '@mui/icons-material/FormatAlignCenterOutlined'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Rating,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from './adminMoney.js'
import { formatServiceAddress } from '../../utils/addressLookup.js'
import AddressAutocomplete from '../../components/AddressAutocomplete.jsx'
import MapPicker from '../../components/MapPicker.jsx'
import { useAdminStore } from './adminStore.jsx'
import './admin.css'

const sections = [
  { value: 'overview', label: 'Overview', icon: DashboardOutlinedIcon },
  { value: 'services', label: 'Home needs', icon: HomeRepairServiceOutlinedIcon },
  { value: 'users', label: 'Users', icon: PeopleAltOutlinedIcon },
  { value: 'workers', label: 'Workers', icon: EngineeringOutlinedIcon },
  { value: 'orders', label: 'Orders', icon: AssignmentOutlinedIcon },
  { value: 'complaints', label: 'Complaints', icon: ContactSupportOutlinedIcon },
  { value: 'promotions', label: 'Promotions', icon: CampaignOutlinedIcon },
  { value: 'coupons', label: 'Coupons', icon: LocalOfferOutlinedIcon },
  { value: 'payments', label: 'Payments', icon: PaymentsOutlinedIcon },
  { value: 'settings', label: 'Settings', icon: SettingsOutlinedIcon },
]
const fieldProps = { size: 'small', fullWidth: true }
const chartColors = ['#fa681c', '#66cdb4', '#f0b45c', '#8795aa', '#d98bb5', '#a8bd70']
const orderReference = (order) => String(order.orderId || order.id || '').slice(0, 8).toUpperCase()

function OverviewCharts({ bookings, currency, commissionPercent }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const orderTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const dayBookings = bookings.filter((booking) => {
      const created = new Date(booking.createdAt || 0)
      created.setHours(0, 0, 0, 0)
      return created.getTime() === date.getTime()
    })
    const earnings = dayBookings.filter((booking) => booking.paymentStatus === 'paid').reduce((total, booking) => (
      total + Number(booking.commission ?? Number(booking.price || 0) * (Number(commissionPercent) || 0) / 100)
    ), 0)
    return { day: date.toLocaleDateString(undefined, { weekday: 'short' }), orders: dayBookings.length, earnings }
  })
  const serviceCounts = bookings.reduce((counts, booking) => {
    counts.set(booking.serviceName, (counts.get(booking.serviceName) || 0) + 1)
    return counts
  }, new Map())
  const serviceMix = [...serviceCounts].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  const pieData = serviceMix.length ? serviceMix : [{ name: 'No orders', value: 1 }]
  const paidCommission = bookings.filter((booking) => booking.paymentStatus === 'paid').reduce((total, booking) => (
    total + Number(booking.commission ?? Number(booking.price || 0) * (Number(commissionPercent) || 0) / 100)
  ), 0)

  return (
    <div className="admin-chart-grid">
      <Paper className="admin-chart-card">
        <div className="admin-chart-heading"><div><Typography variant="subtitle1">Order activity</Typography><Typography variant="caption" color="text.secondary">New jobs over the past seven days</Typography></div><span className="chart-key"><i /> Orders</span></div>
        <div className="admin-chart-plot">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={orderTrend} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}>
              <defs><linearGradient id="orderFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fa681c" stopOpacity={0.24} /><stop offset="95%" stopColor="#fa681c" stopOpacity={0.015} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#eceef0" strokeDasharray="3 4" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#858994', fontSize: 11 }} dy={8} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#858994', fontSize: 10 }} />
              <Tooltip contentStyle={{ border: '1px solid #e7e8eb', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="orders" name="Orders" stroke="#fa681c" strokeWidth={2.5} fill="url(#orderFill)" activeDot={{ r: 5, fill: '#fa681c', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      <Paper className="admin-chart-card service-mix-card">
        <div className="admin-chart-heading"><div><Typography variant="subtitle1">Service mix</Typography><Typography variant="caption" color="text.secondary">Orders by home need</Typography></div><span className="chart-total">{bookings.length}<small> total</small></span></div>
        <div className="service-mix-content">
          <div className="service-mix-donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="92%" paddingAngle={serviceMix.length > 1 ? 3 : 0} stroke="none" animationDuration={650}>
                {pieData.map((item, index) => <Cell key={item.name} fill={serviceMix.length ? chartColors[index % chartColors.length] : '#e5e7eb'} />)}
              </Pie><Tooltip contentStyle={{ border: '1px solid #e7e8eb', borderRadius: 8, fontSize: 12 }} /></PieChart>
            </ResponsiveContainer>
            <div className="donut-total"><strong>{bookings.length}</strong><span>orders</span></div>
          </div>
          <div className="service-mix-legend">
            {serviceMix.length ? serviceMix.slice(0, 5).map((service, index) => <div key={service.name}><i style={{ background: chartColors[index % chartColors.length] }} /><span>{service.name}</span><strong>{service.value}</strong></div>) : <Typography variant="body2" color="text.secondary">Service demand appears after the first order.</Typography>}
          </div>
        </div>
      </Paper>

      <Paper className="admin-chart-card admin-earnings-chart">
        <div className="admin-chart-heading"><div><Typography variant="subtitle1">Platform earnings</Typography><Typography variant="caption" color="text.secondary">Paid commission · past seven days</Typography></div><span className="chart-total">{formatMoney(paidCommission, currency)}</span></div>
        <div className="admin-chart-plot">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={orderTrend} margin={{ top: 12, right: 12, bottom: 0, left: 3 }}>
              <defs><linearGradient id="earningFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#66cdb4" stopOpacity={0.28} /><stop offset="95%" stopColor="#66cdb4" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#eceef0" strokeDasharray="3 4" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#858994', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#858994', fontSize: 10 }} tickFormatter={(value) => formatMoney(value, currency)} />
              <Tooltip formatter={(value) => formatMoney(value, currency)} contentStyle={{ border: '1px solid #e7e8eb', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="earnings" name="Paid commission" stroke="#45ad94" strokeWidth={2.5} fill="url(#earningFill)" activeDot={{ r: 5, fill: '#45ad94', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Paper>
    </div>
  )
}

function Summary({ label, value, detail }) {
  return <Paper className="admin-summary"><Typography variant="overline" color="text.secondary">{label}</Typography><Typography variant="h4">{value}</Typography><Typography variant="caption" color="text.secondary">{detail}</Typography></Paper>
}

function OrderDetailsDialog({ order, workers, selectedWorker, onSelectWorker, onAssign, onUpdateOrder, onViewCustomer, onClose, currency, settings }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => order ? { ...order } : {})
  const [editError, setEditError] = useState('')
  useEffect(() => {
    if (!order) return
    setDraft({ ...order })
    setEditing(false)
    setEditError('')
  }, [order?.id])
  if (!order) return null
  const canAssign = ['pending', 'accepted'].includes(order.status)
  const mapUrl = order.location
    ? `https://www.openstreetmap.org/?mlat=${order.location.lat}&mlon=${order.location.lng}#map=16/${order.location.lat}/${order.location.lng}`
    : ''
  const editDraft = draft || order
  const setDraftField = (field, value) => setDraft((current) => ({ ...current, [field]: value }))
  const saveOrder = () => {
    if (!editDraft.address?.trim()) return setEditError('Service address is required.')
    if (editDraft.address !== order.address && !editDraft.location) return setEditError('Pin the updated address on the map before saving.')
    const saved = onUpdateOrder(order.id, {
      customerName: editDraft.customerName.trim(),
      customerEmail: editDraft.customerEmail.trim(),
      customerPhone: editDraft.customerPhone.trim(),
      alternativePhone: editDraft.alternativePhone?.trim(),
      address: editDraft.address.trim(),
      building: editDraft.building.trim(),
      floor: editDraft.floor.trim(),
      landmark: editDraft.landmark.trim(),
      location: editDraft.location || null,
      date: editDraft.date,
      time: editDraft.time,
      notes: editDraft.notes.trim(),
    })
    if (!saved) return setEditError('Order details could not be saved.')
    setEditing(false)
    setEditError('')
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" className="admin-order-dialog">
      <DialogTitle className="order-dialog-title">
        <div><span>Order details</span><strong>{order.icon} {order.serviceName}</strong></div>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={order.status} />
          {!editing && canAssign && <Button size="small" onClick={() => { setDraft({ ...order }); setEditing(true); setEditError('') }}>Edit details</Button>}
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {editing ? <div className="order-edit-form">
          <section className="order-detail-section">
            <Typography variant="subtitle1">Customer information</Typography>
            <div className="order-detail-grid">
              <TextField size="small" label="Customer name" value={editDraft.customerName || ''} onChange={(event) => setDraftField('customerName', event.target.value)} />
              <TextField size="small" label="Email" type="email" value={editDraft.customerEmail || ''} onChange={(event) => setDraftField('customerEmail', event.target.value)} />
              <TextField size="small" label="Primary phone" value={editDraft.customerPhone || ''} onChange={(event) => setDraftField('customerPhone', event.target.value)} />
              <TextField size="small" label="Alternative phone" value={editDraft.alternativePhone || ''} onChange={(event) => setDraftField('alternativePhone', event.target.value)} />
            </div>
          </section>
          <section className="order-detail-section">
            <Typography variant="subtitle1">Service address and access</Typography>
            <AddressAutocomplete
              value={editDraft.address || ''}
              onChange={(address) => setDraft((current) => ({ ...current, address, location: null }))}
              onSelect={(suggestion) => setDraft((current) => ({ ...current, address: suggestion.label, location: suggestion.location }))}
            />
            <div className="order-detail-grid">
              <TextField size="small" label="Building / unit" value={editDraft.building || ''} onChange={(event) => setDraftField('building', event.target.value)} />
              <TextField size="small" label="Floor" value={editDraft.floor || ''} onChange={(event) => setDraftField('floor', event.target.value)} />
              <TextField size="small" label="Landmark" value={editDraft.landmark || ''} onChange={(event) => setDraftField('landmark', event.target.value)} />
            </div>
            <MapPicker label="Update service pin" position={editDraft.location} settings={settings} onChange={(location) => setDraftField('location', location)} onAddressChange={(address) => setDraftField('address', address)} />
          </section>
          <div className="order-detail-grid order-edit-schedule">
            <TextField size="small" type="date" label="Service date" InputLabelProps={{ shrink: true }} value={editDraft.date || ''} onChange={(event) => setDraftField('date', event.target.value)} />
            <TextField size="small" type="time" label="Preferred time" InputLabelProps={{ shrink: true }} value={editDraft.time || ''} onChange={(event) => setDraftField('time', event.target.value)} />
          </div>
          <TextField size="small" fullWidth multiline minRows={2} label="Notes for the pro" value={editDraft.notes || ''} onChange={(event) => setDraftField('notes', event.target.value)} />
          {editError && <Alert severity="error">{editError}</Alert>}
        </div> : <>
        <section className="order-detail-section">
          <Typography variant="subtitle1">Customer information</Typography>
          <div className="order-detail-grid">
            <div><span>Customer</span><Button className="order-customer-link" onClick={() => onViewCustomer(order.customerId)}>{order.customerName || 'Name not recorded'}</Button></div>
            <div><span>Email</span><strong>{order.customerEmail || 'Not provided'}</strong></div>
            <div><span>Primary phone</span><strong>{order.customerPhone || 'Not provided'}</strong></div>
            <div><span>Alternative phone</span><strong>{order.alternativePhone || 'Not provided'}</strong></div>
          </div>
        </section>

        <section className="order-detail-section">
          <Typography variant="subtitle1">Service address and access</Typography>
          <div className="order-detail-grid">
            <div className="order-detail-wide"><span>Service address</span><strong>{formatServiceAddress(order) || 'Address not recorded for this order'}</strong></div>
            <div><span>Building / unit</span><strong>{order.building || 'Not provided'}</strong></div>
            <div><span>Floor</span><strong>{order.floor || 'Not provided'}</strong></div>
            <div><span>Landmark</span><strong>{order.landmark || 'Not provided'}</strong></div>
            <div><span>Map pin</span>{mapUrl ? <a href={mapUrl} target="_blank" rel="noreferrer">View pinned location</a> : <strong>Location not pinned</strong>}</div>
            {order.notes && <div className="order-detail-wide"><span>Notes for the pro</span><strong>{order.notes}</strong></div>}
          </div>
        </section>

        <section className="order-detail-section">
          <Typography variant="subtitle1">Order and payment</Typography>
          <div className="order-detail-grid">
            <div><span>Order ID</span><strong>{order.orderId || order.id}</strong></div>
            <div><span>Schedule</span><strong>{order.date || 'Date not set'} · {order.time || 'Time not set'}</strong></div>
            <div><span>Payment</span><strong>{order.paymentMethod || 'Not selected'} · {order.paymentStatus || 'unpaid'}</strong></div>
            <div><span>Order total</span><strong>{formatMoney(order.total ?? order.price, currency)}</strong></div>
            <div><span>Work rating</span><strong>{order.rating ? `${order.rating}/5 · ${order.satisfaction === 'satisfied' ? 'Satisfied' : 'Not satisfied'}` : 'Not rated yet'}</strong></div>
          </div>
        </section>
        </>}

        {!editing && <section className="order-assignment-panel">
          <div><Typography variant="subtitle1">Worker assignment</Typography><Typography variant="caption" color="text.secondary">Only active, verified pros with the matching service and location are available.</Typography></div>
          {canAssign ? workers.length > 0 ? (
            <Stack className="order-dialog-assign-row" direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <TextField select size="small" fullWidth label="Eligible pro" value={selectedWorker} onChange={(event) => onSelectWorker(event.target.value)}>
                <MenuItem value="">Select worker</MenuItem>
                {workers.map((worker) => <MenuItem value={worker.id} key={worker.id}>{worker.name}</MenuItem>)}
              </TextField>
              <Button variant="contained" disabled={!selectedWorker || selectedWorker === order.workerId} onClick={onAssign}>
                {order.workerName ? 'Reassign order' : 'Assign order'}
              </Button>
            </Stack>
          ) : <Typography className="assignment-hint" variant="body2" color="text.secondary">No verified active pro matches this service, location, and radius.</Typography> : (
            <Typography variant="body2" color="text.secondary">This order is {order.status} and can’t be assigned.</Typography>
          )}
          {order.workerName && <Typography variant="caption" color="text.secondary">Currently assigned to {order.workerName}.</Typography>}
        </section>}
      </DialogContent>
      <DialogActions>
        {editing ? <>
          <Button onClick={() => { setDraft({ ...order }); setEditing(false); setEditError('') }}>Cancel</Button>
          <Button variant="contained" onClick={saveOrder}>Save changes</Button>
        </> : <Button onClick={onClose}>Close</Button>}
      </DialogActions>
    </Dialog>
  )
}

function MetricGroup({ title, metrics }) {
  return (
    <Paper className="admin-metric-group">
      <Typography variant="subtitle2">{title}</Typography>
      <div className="admin-metric-grid">
        {metrics.map((metric) => <div className="admin-metric" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}
      </div>
    </Paper>
  )
}

function ProfileDialog({ selection, bookings, settings, catalog, verification, workerProfiles, onUpdateWorkerProfile, onViewOrder, onClose }) {
  if (!selection) return null
  const { profile, type } = selection
  const isWorker = type === 'worker'
  const relatedOrders = bookings.filter((order) => isWorker
    ? order.workerId === profile.id || order.declinedById === profile.id
    : order.customerId === profile.id)
  const assignedOrders = relatedOrders.filter((order) => !isWorker || order.workerId === profile.id)
  const completedOrders = assignedOrders.filter((order) => order.status === 'completed')
  const declinedCount = relatedOrders.filter((order) => order.declinedById === profile.id || (order.declinedBy === profile.name && order.status === 'declined')).length
  const ratedOrders = completedOrders.filter((order) => Number(order.rating) >= 1 && Number(order.rating) <= 5)
  const averageRating = ratedOrders.length ? ratedOrders.reduce((sum, order) => sum + Number(order.rating), 0) / ratedOrders.length : 0
  const satisfiedOrders = ratedOrders.filter((order) => order.satisfaction === 'satisfied').length
  const workerEarned = completedOrders.reduce((sum, order) => sum + Number(order.workerNet ?? order.price ?? 0), 0)
  const workerPaid = completedOrders.filter((order) => order.paymentStatus === 'paid').reduce((sum, order) => sum + Number(order.workerNet ?? order.price ?? 0), 0)
  const customerPaid = relatedOrders.filter((order) => order.paymentStatus === 'paid').reduce((sum, order) => sum + Number(order.total ?? order.price ?? 0), 0)
  const workerProfile = isWorker
    ? workerProfiles[profile.id] || { location: null, radiusKm: Number(settings.defaultWorkerRadiusKm) || 15, address: '' }
    : null

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" className="admin-profile-dialog">
      <DialogTitle className="profile-dialog-title">
        <Avatar>{profile.name?.slice(0, 1) || '?'}</Avatar>
        <div><strong>{profile.name}</strong><span>{isWorker ? 'Service professional' : 'Customer account'}</span></div>
        <Chip size="small" label={profile.active === false ? 'Inactive' : 'Active'} />
      </DialogTitle>
      <DialogContent dividers>
        <div className="profile-details-grid">
          <div><span>Email</span><strong>{profile.email || '—'}</strong></div>
          <div><span>Account created</span><strong>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Demo account'}</strong></div>
          {isWorker ? <>
            <div><span>Verification</span><strong>{verification?.status || 'Not submitted'}</strong></div>
            <div><span>Service skill</span><strong>{catalog.find((service) => service.id === profile.skill)?.name || '—'}</strong></div>
            <div><span>Service base</span><strong>{workerProfile.address || (workerProfile.location ? `${workerProfile.location.lat.toFixed(4)}, ${workerProfile.location.lng.toFixed(4)}` : 'Not set')}</strong></div>
            <div><span>Service radius</span><strong>{workerProfile.radiusKm} km</strong></div>
          </> : <>
            <div><span>Orders</span><strong>{relatedOrders.length}</strong></div>
            <div><span>Paid total</span><strong>{formatMoney(customerPaid, settings.currency)}</strong></div>
          </>}
        </div>

        {isWorker && <div className="profile-metrics">
          <div><span>Assigned tasks</span><strong>{assignedOrders.length}</strong></div>
          <div><span>Completed</span><strong>{completedOrders.length}</strong></div>
          <div><span>Declined</span><strong>{declinedCount}</strong></div>
          <div><span>Earned</span><strong>{formatMoney(workerEarned, settings.currency)}</strong></div>
          <div><span>Paid</span><strong>{formatMoney(workerPaid, settings.currency)}</strong></div>
          <div><span>Customer rating</span><strong>{ratedOrders.length ? `${averageRating.toFixed(1)} / 5` : 'No ratings'}</strong><small>{ratedOrders.length} reviews · {satisfiedOrders} satisfied</small></div>
        </div>}

        {isWorker && <section className="admin-worker-location-editor">
          <div><Typography variant="subtitle1">Service area</Typography><Typography variant="caption" color="text.secondary">Changes immediately affect nearby counts and order assignment eligibility.</Typography></div>
          <TextField size="small" fullWidth label="Base address" value={workerProfile.address || ''} onChange={(event) => onUpdateWorkerProfile(profile.id, { address: event.target.value })} />
          <TextField size="small" type="number" label="Accept jobs within (km)" slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }} value={workerProfile.radiusKm || settings.defaultWorkerRadiusKm || 15} onChange={(event) => onUpdateWorkerProfile(profile.id, { radiusKm: Number(event.target.value) })} />
          <MapPicker
            label="Set worker base location"
            position={workerProfile.location}
            settings={settings}
            onChange={(location) => onUpdateWorkerProfile(profile.id, { location })}
            onAddressChange={(address) => onUpdateWorkerProfile(profile.id, { address })}
          />
        </section>}

        <Typography className="profile-orders-title" variant="subtitle1">{isWorker ? 'Task and payment history' : 'Order and payment history'}</Typography>
        {!isWorker && <Typography className="profile-order-hint" variant="caption" color="text.secondary">Select an order row to open its full details.</Typography>}
        <TableContainer component={Paper} className="admin-table-wrap profile-orders-table">
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Order ID</TableCell><TableCell>Service</TableCell><TableCell>Schedule</TableCell><TableCell>Job status</TableCell>
              {isWorker && <TableCell align="right">Site commission</TableCell>}
              {isWorker && <TableCell align="right">Worker payout</TableCell>}
              {isWorker && <TableCell>Customer rating</TableCell>}
              <TableCell>Payment</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {relatedOrders.map((order) => <TableRow
                key={order.id}
                className="profile-order-row"
                tabIndex={0}
                aria-label={`Open order ${orderReference(order)} details`}
                onClick={() => onViewOrder(order.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onViewOrder(order.id)
                  }
                }}
              >
                <TableCell><Button size="small" title={order.orderId || order.id} onClick={() => onViewOrder(order.id)}>#{orderReference(order)}</Button></TableCell>
                <TableCell>{order.icon} {order.serviceName}</TableCell>
                <TableCell>{order.date} · {order.time}</TableCell>
                <TableCell><Chip size="small" label={order.status} /></TableCell>
                {isWorker && <TableCell align="right">{formatMoney(order.commission ?? Number(order.price || 0) * (Number(settings.commissionPercent) || 0) / 100, settings.currency)}</TableCell>}
                {isWorker && <TableCell align="right">{formatMoney(order.workerNet ?? order.price, settings.currency)}</TableCell>}
                {isWorker && <TableCell>{order.rating ? <Stack spacing={0.25}><Rating value={order.rating} readOnly size="small" /><Typography variant="caption">{order.satisfaction === 'satisfied' ? 'Satisfied' : 'Not satisfied'}</Typography>{order.reviewComment && <Typography variant="caption" color="text.secondary">{order.reviewComment}</Typography>}</Stack> : 'Not rated'}</TableCell>}
                <TableCell>{order.paymentMethod || '—'} · {order.paymentStatus || 'unpaid'}</TableCell>
              </TableRow>)}
              {!relatedOrders.length && <TableRow><TableCell colSpan={isWorker ? 8 : 5} align="center">No task or payment records yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  )
}

function EmptyRow({ columns, message = 'No records yet.' }) {
  return <TableRow><TableCell colSpan={columns} align="center" sx={{ py: 4, color: 'text.secondary' }}>{message}</TableCell></TableRow>
}

function nodeText(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join(' ')
  if (!isValidElement(node)) return ''
  const props = node.props || {}
  return [props.label, props.value, props.name, props.children].map(nodeText).join(' ')
}

export default function AdminDashboard() {
  const isCompactNav = useMediaQuery('(max-width:760px)')
  const {
    session, logout, bookings, users, catalog, promotions, coupons, settings, workerProfiles,
    updateService, addService, updateUser, addPromotion, updatePromotion, removePromotion,
    addCoupon, updateCoupon, updateSettings, updatePayment, updateOrderDetails, verifications, updateWorkerVerification,
    complaints, updateComplaint, getAssignableWorkers, assignOrder, updateManagedWorkerProfile,
  } = useAdminStore()
  const [section, setSection] = useState('overview')
  const [serviceDraft, setServiceDraft] = useState({ name: '', price: '', desc: '', icon: '' })
  const [promotionDraft, setPromotionDraft] = useState({ title: '', description: '', discount: '' })
  const [couponDraft, setCouponDraft] = useState({ code: '', discount: '', type: 'percent', expires: '' })
  const [settingsDraft, setSettingsDraft] = useState(settings)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [assignmentDrafts, setAssignmentDrafts] = useState({})
  const [tableFilter, setTableFilter] = useState('')
  const [tablePage, setTablePage] = useState(0)
  const [tableRowsPerPage, setTableRowsPerPage] = useState(10)
  const [notice, setNotice] = useState('')
  const [profileSelection, setProfileSelection] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const navigate = useNavigate()
  const workers = users.filter((user) => user.role === 'worker')
  const customers = users.filter((user) => user.role === 'user')
  const newUsers = customers.filter((user) => user.createdAt && Date.now() - user.createdAt <= 30 * 24 * 60 * 60 * 1000).length
  const activeUsers = customers.filter((user) => user.active !== false).length
  const activeWorkers = workers.filter((worker) => worker.active !== false).length
  const inactiveWorkers = workers.length - activeWorkers
  const unverifiedWorkers = workers.filter((worker) => verifications[worker.id]?.status !== 'approved').length
  const currentOrders = bookings.filter((order) => ['pending', 'accepted'].includes(order.status)).length
  const pendingOrders = bookings.filter((order) => order.status === 'pending').length
  const cancelledOrders = bookings.filter((order) => ['cancelled', 'canceled'].includes(order.status)).length
  const declinedOrders = bookings.filter((order) => ['declined', 'rejected'].includes(order.status)).length
  const activeSection = sections.find((item) => item.value === section)
  const selectedOrder = bookings.find((order) => order.id === selectedOrderId) || null
  const eligibleOrderWorkers = selectedOrder ? getAssignableWorkers(selectedOrder.location, selectedOrder.serviceId) : []
  const selectedOrderWorker = selectedOrder ? assignmentDrafts[selectedOrder.id] ?? selectedOrder.workerId ?? '' : ''
  const navPlacement = settings.adminNavPlacement === 'top' ? 'top' : 'left'
  const revenue = bookings.filter((order) => order.paymentStatus === 'paid').reduce((total, order) => total + Number(order.total ?? order.price ?? 0), 0)
  const commissionRevenue = bookings.reduce((total, order) => total + Number(order.commission ?? 0), 0)

  useEffect(() => {
    setTableFilter('')
    setTablePage(0)
  }, [section])

  const submitService = (event) => {
    event.preventDefault()
    const error = addService(serviceDraft)
    if (error) return setNotice(error)
    setServiceDraft({ name: '', price: '', desc: '', icon: '' })
    setNotice('Service added to the catalog.')
  }
  const submitPromotion = (event) => {
    event.preventDefault()
    addPromotion(promotionDraft)
    setPromotionDraft({ title: '', description: '', discount: '' })
    setNotice('Promotion created.')
  }
  const submitCoupon = (event) => {
    event.preventDefault()
    const error = addCoupon(couponDraft)
    if (error) return setNotice(error)
    setCouponDraft({ code: '', discount: '', type: 'percent', expires: '' })
    setNotice('Coupon created.')
  }
  const saveSettings = (event) => {
    event.preventDefault()
    updateSettings({ ...settingsDraft, adminNavPlacement: settingsDraft.adminNavPlacement || 'left' })
    setNotice('Settings saved.')
  }

  const submitAssignment = (orderId) => {
    const workerId = assignmentDrafts[orderId]
    if (!workerId) return setNotice('Choose an eligible worker before assigning this order.')
    const assigned = assignOrder(orderId, workerId)
    setNotice(assigned ? 'Order assigned and both parties notified.' : 'The order could not be assigned. Refresh the worker list and try again.')
    if (assigned) setAssignmentDrafts((drafts) => ({ ...drafts, [orderId]: '' }))
  }

  const table = (children) => {
    const tableParts = Children.toArray(children.props?.children ?? children)
    const body = tableParts.find((part) => part.type === TableBody)
    if (!body) return <TableContainer component={Paper} className="admin-table-wrap"><Table size="small">{children}</Table></TableContainer>
    const bodyRows = Children.toArray(body.props.children)
    const emptyRows = bodyRows.filter((row) => row.type === EmptyRow)
    const dataRows = bodyRows.filter((row) => row.type !== EmptyRow)
    const normalizedFilter = tableFilter.trim().toLocaleLowerCase()
    const filteredRows = normalizedFilter ? dataRows.filter((row) => nodeText(row).toLocaleLowerCase().includes(normalizedFilter)) : dataRows
    const pageCount = Math.max(1, Math.ceil(filteredRows.length / tableRowsPerPage))
    const safePage = Math.min(tablePage, pageCount - 1)
    const visibleRows = filteredRows.slice(safePage * tableRowsPerPage, (safePage + 1) * tableRowsPerPage)
    const header = tableParts.find((part) => part.type === TableHead)
    const headerRow = header && Children.toArray(header.props.children).find((row) => row.type === TableRow)
    const columnCount = headerRow ? Children.count(headerRow.props.children) : 1
    const rowsToRender = visibleRows.length ? visibleRows : filteredRows.length ? [
      <TableRow key="no-filter-results"><TableCell colSpan={columnCount} align="center" sx={{ py: 4, color: 'text.secondary' }}>No matching records.</TableCell></TableRow>,
    ] : emptyRows
    const paginatedParts = tableParts.map((part) => part.type === TableBody ? cloneElement(part, {}, rowsToRender) : part)

    return (
      <>
        <div className="admin-table-toolbar">
          <TextField size="small" label={`Filter ${activeSection.label}`} value={tableFilter} onChange={(event) => { setTableFilter(event.target.value); setTablePage(0) }} />
          <Typography variant="caption" color="text.secondary">{filteredRows.length} records</Typography>
        </div>
        <TableContainer component={Paper} className="admin-table-wrap"><Table size="small">{paginatedParts}</Table></TableContainer>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={safePage}
          rowsPerPage={tableRowsPerPage}
          onPageChange={(_, page) => setTablePage(page)}
          onRowsPerPageChange={(event) => { setTableRowsPerPage(Number(event.target.value)); setTablePage(0) }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Rows"
          className="admin-table-pagination"
        />
      </>
    )
  }

  return (
    <motion.main className={`admin-console nav-${navPlacement}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>{(settings.businessName || 'Urban Company').slice(0, 1)}</span><div><strong>{settings.businessName || 'Urban Company'}</strong><small>OPERATIONS</small></div></div>
        <Typography className="admin-nav-label" variant="overline">Workspace</Typography>
        <Tabs orientation={isCompactNav || navPlacement === 'top' ? 'horizontal' : 'vertical'} value={section} onChange={(_, value) => setSection(value)} variant="scrollable" scrollButtons="auto" aria-label="Management sections" className="admin-tabs">
          {sections.map(({ value, label, icon: Icon }) => <Tab key={value} value={value} icon={<Icon fontSize="small" />} iconPosition="start" label={label} />)}
        </Tabs>
        <div className="admin-sidebar-foot"><span className="admin-online-dot" /><span>Management workspace</span></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><span>Management</span><b>/</b><strong>{activeSection.label}</strong></div>
          <div className="admin-account">
            <Avatar>{session?.name?.slice(0, 1) || 'A'}</Avatar>
            <div><strong>{session?.name || 'Administrator'}</strong><small>Administrator</small></div>
            <Button size="small" onClick={() => { logout(); navigate('/') }}>Log out</Button>
          </div>
        </header>

        <div className="admin-content">
          <Box className="admin-heading">
            <Box><Typography variant="overline" color="primary.main">{(settings.businessName || 'Urban Company').toUpperCase()} · OPERATIONS</Typography><Typography variant="h1">{activeSection.label}</Typography><Typography color="text.secondary">Monitor activity and manage the service operation.</Typography></Box>
            <Chip label="Live workspace" color="primary" variant="outlined" />
          </Box>

          {notice && <Alert severity="info" onClose={() => setNotice('')} sx={{ mb: 2 }}>{notice}</Alert>}

        {section === 'overview' && <Box className="admin-panel">
          <div className="admin-metric-groups">
            <MetricGroup title="Users" metrics={[{ label: 'Registered', value: customers.length }, { label: 'Active', value: activeUsers }, { label: 'New · 30 days', value: newUsers }]} />
            <MetricGroup title="Workers" metrics={[{ label: 'Total', value: workers.length }, { label: 'Active', value: activeWorkers }, { label: 'Inactive', value: inactiveWorkers }, { label: 'Not verified', value: unverifiedWorkers }]} />
            <MetricGroup title="Orders" metrics={[{ label: 'Total', value: bookings.length }, { label: 'Current', value: currentOrders }, { label: 'Pending', value: pendingOrders }, { label: 'Cancelled', value: cancelledOrders }, { label: 'Declined', value: declinedOrders }]} />
          </div>
          <OverviewCharts bookings={bookings} currency={settings.currency} commissionPercent={settings.commissionPercent} />
          <Box className="admin-section-title"><Typography variant="h6">Recent orders</Typography><Typography variant="body2" color="text.secondary">Latest customer requests</Typography></Box>
          {table(<><TableHead><TableRow><TableCell>Order ID</TableCell><TableCell>Service</TableCell><TableCell>Customer</TableCell><TableCell>Schedule</TableCell><TableCell>Status</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead><TableBody>
            {bookings.slice(0, 6).map((order) => <TableRow key={order.id}><TableCell>#{orderReference(order)}</TableCell><TableCell>{order.icon} {order.serviceName}</TableCell><TableCell>{order.customerName}</TableCell><TableCell>{order.date} · {order.time}</TableCell><TableCell><Chip size="small" label={order.status} /></TableCell><TableCell align="right">{formatMoney(order.total ?? order.price, settings.currency)}</TableCell></TableRow>)}
            {!bookings.length && <EmptyRow columns={6} message="Orders will appear here after customers check out." />}
          </TableBody></>)}
        </Box>}

        {section === 'services' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">Home needs catalog</Typography><Typography variant="body2" color="text.secondary">Edit service names, rates, details, and availability.</Typography></Box>
          {table(<><TableHead><TableRow><TableCell>Service</TableCell><TableCell>Description</TableCell><TableCell width="130">Rate</TableCell><TableCell>Available</TableCell></TableRow></TableHead><TableBody>
            {catalog.map((service) => <TableRow key={service.id}>
              <TableCell><Stack direction="row" spacing={1} alignItems="center"><Typography>{service.icon}</Typography><TextField {...fieldProps} value={service.name} onChange={(event) => updateService(service.id, { name: event.target.value })} slotProps={{ htmlInput: { 'aria-label': `${service.name} name` } }} /></Stack></TableCell>
              <TableCell><TextField {...fieldProps} value={service.desc} onChange={(event) => updateService(service.id, { desc: event.target.value })} slotProps={{ htmlInput: { 'aria-label': `${service.name} description` } }} /></TableCell>
              <TableCell><TextField {...fieldProps} type="number" value={service.price} onChange={(event) => updateService(service.id, { price: Number(event.target.value) })} slotProps={{ htmlInput: { min: 0, 'aria-label': `${service.name} rate` } }} /></TableCell>
              <TableCell><Switch checked={service.active !== false} onChange={(event) => updateService(service.id, { active: event.target.checked })} slotProps={{ input: { 'aria-label': `${service.name} available` } }} /></TableCell>
            </TableRow>)}
          </TableBody></>)}
          <Box component="form" className="admin-create-form" onSubmit={submitService}>
            <Typography variant="subtitle1">Add a home need</Typography>
            <TextField {...fieldProps} required label="Service name" value={serviceDraft.name} onChange={(event) => setServiceDraft({ ...serviceDraft, name: event.target.value })} />
            <TextField {...fieldProps} required label="Rate" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} value={serviceDraft.price} onChange={(event) => setServiceDraft({ ...serviceDraft, price: event.target.value })} />
            <TextField {...fieldProps} required label="Description" value={serviceDraft.desc} onChange={(event) => setServiceDraft({ ...serviceDraft, desc: event.target.value })} />
            <TextField {...fieldProps} label="Icon" value={serviceDraft.icon} onChange={(event) => setServiceDraft({ ...serviceDraft, icon: event.target.value })} />
            <Button type="submit" variant="contained">Add service</Button>
          </Box>
        </Box>}

        {section === 'users' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">Customer accounts</Typography><Typography variant="body2" color="text.secondary">Contact details and profile names.</Typography></Box>
          <Grid container spacing={2}><Grid size={{ xs: 12, sm: 4 }}><Summary label="REGISTERED" value={customers.length} detail="All customer accounts" /></Grid><Grid size={{ xs: 12, sm: 4 }}><Summary label="ACTIVE" value={activeUsers} detail="Enabled accounts" /></Grid><Grid size={{ xs: 12, sm: 4 }}><Summary label="NEW · 30 DAYS" value={newUsers} detail="Recently registered" /></Grid></Grid>
          {table(<><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Active</TableCell><TableCell>Orders</TableCell></TableRow></TableHead><TableBody>
            {customers.map((user) => <TableRow key={user.id}><TableCell><Stack direction="row" spacing={0.5} alignItems="center"><TextField {...fieldProps} value={user.name} onChange={(event) => updateUser(user.id, { name: event.target.value })} slotProps={{ htmlInput: { 'aria-label': `${user.email} name` } }} /><IconButton size="small" aria-label={`View ${user.name} details`} onClick={() => setProfileSelection({ profile: user, type: 'user' })}><InfoOutlinedIcon fontSize="small" /></IconButton></Stack></TableCell><TableCell>{user.email}</TableCell><TableCell><Switch checked={user.active !== false} onChange={(event) => updateUser(user.id, { active: event.target.checked })} slotProps={{ input: { 'aria-label': `${user.email} active` } }} /></TableCell><TableCell>{bookings.filter((order) => order.customerId === user.id).length}</TableCell></TableRow>)}
            {!customers.length && <EmptyRow columns={4} message="No customer profiles yet." />}
          </TableBody></>)}
        </Box>}

        {section === 'workers' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">Worker directory</Typography><Typography variant="body2" color="text.secondary">Skills, assigned jobs, and completed work.</Typography></Box>
          <Grid container spacing={2}><Grid size={{ xs: 6, md: 3 }}><Summary label="TOTAL WORKERS" value={workers.length} detail="Registered pros" /></Grid><Grid size={{ xs: 6, md: 3 }}><Summary label="ACTIVE" value={activeWorkers} detail="Enabled accounts" /></Grid><Grid size={{ xs: 6, md: 3 }}><Summary label="INACTIVE" value={inactiveWorkers} detail="Disabled accounts" /></Grid><Grid size={{ xs: 6, md: 3 }}><Summary label="NOT VERIFIED" value={unverifiedWorkers} detail="Approval required" /></Grid></Grid>
          {table(<><TableHead><TableRow><TableCell>Worker</TableCell><TableCell>Email</TableCell><TableCell>Skill</TableCell><TableCell>Service area</TableCell><TableCell>Active jobs</TableCell><TableCell>Completed</TableCell><TableCell>Rating</TableCell><TableCell>Account</TableCell><TableCell>Verification</TableCell></TableRow></TableHead><TableBody>
            {workers.map((worker) => {
              const jobs = bookings.filter((order) => order.workerId === worker.id)
              const reviews = jobs.filter((job) => Number(job.rating) >= 1 && Number(job.rating) <= 5)
              const averageRating = reviews.length ? reviews.reduce((total, job) => total + Number(job.rating), 0) / reviews.length : 0
              const profile = workerProfiles[worker.id]
              const verification = verifications[worker.id]
              return <TableRow key={worker.id}>
                <TableCell><Button size="small" className="profile-open-button" onClick={() => setProfileSelection({ profile: worker, type: 'worker' })}>{worker.name}<InfoOutlinedIcon fontSize="small" /></Button></TableCell><TableCell>{worker.email}</TableCell><TableCell>{catalog.find((service) => service.id === worker.skill)?.name || '—'}</TableCell>
                <TableCell>{profile?.address || 'Base not set'}<br /><span className="muted">{profile?.radiusKm || settings.defaultWorkerRadiusKm || 15} km radius</span></TableCell>
                <TableCell>{jobs.filter((job) => job.status === 'accepted').length}</TableCell><TableCell>{jobs.filter((job) => job.status === 'completed').length}</TableCell>
                <TableCell>{reviews.length ? <Stack spacing={0.25}><Rating value={averageRating} readOnly precision={0.1} size="small" /><Typography variant="caption">{averageRating.toFixed(1)} · {reviews.length} reviews</Typography></Stack> : <Typography variant="caption" color="text.secondary">No ratings</Typography>}</TableCell>
                <TableCell><Switch checked={worker.active !== false} onChange={(event) => updateUser(worker.id, { active: event.target.checked })} slotProps={{ input: { 'aria-label': `${worker.email} active` } }} /></TableCell>
                <TableCell>
                  <Stack spacing={0.75} alignItems="flex-start">
                    <Chip size="small" label={verification?.status || 'Not submitted'} />
                    {verification?.fileData && <Button size="small" component="a" href={verification.fileData} target="_blank" rel="noreferrer">{verification.fileName || 'View document'}</Button>}
                    {verification?.status !== 'approved' && verification?.fileData && <Stack direction="row" spacing={0.5}>
                      <Button size="small" onClick={() => updateWorkerVerification(worker.id, { status: 'approved', reviewNote: '' })}>Approve</Button>
                      <Button size="small" color="error" onClick={() => updateWorkerVerification(worker.id, { status: 'rejected', reviewNote: 'Please upload a valid, readable document.' })}>Reject</Button>
                    </Stack>}
                  </Stack>
                </TableCell>
              </TableRow>
            })}
            {!workers.length && <EmptyRow columns={9} message="No worker profiles yet." />}
          </TableBody></>)}
        </Box>}

        {section === 'orders' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">All orders</Typography><Typography variant="body2" color="text.secondary">Customer requests, worker assignments, and job status.</Typography></Box>
          <Grid container spacing={2}><Grid size={{ xs: 6, md: 2.4 }}><Summary label="TOTAL" value={bookings.length} detail="All jobs" /></Grid><Grid size={{ xs: 6, md: 2.4 }}><Summary label="CURRENT" value={currentOrders} detail="Pending or accepted" /></Grid><Grid size={{ xs: 6, md: 2.4 }}><Summary label="PENDING" value={pendingOrders} detail="Awaiting a pro" /></Grid><Grid size={{ xs: 6, md: 2.4 }}><Summary label="CANCELLED" value={cancelledOrders} detail="Cancelled jobs" /></Grid><Grid size={{ xs: 6, md: 2.4 }}><Summary label="DECLINED" value={declinedOrders} detail="Declined jobs" /></Grid></Grid>
          {table(<><TableHead><TableRow><TableCell>Order ID</TableCell><TableCell>Service</TableCell><TableCell>Customer</TableCell><TableCell>Worker</TableCell><TableCell>Schedule</TableCell><TableCell>Status</TableCell><TableCell align="right">Rate</TableCell></TableRow></TableHead><TableBody>
            {bookings.map((order) => {
              const openOrder = () => setSelectedOrderId(order.id)
              return <TableRow key={order.id} className="admin-order-row" tabIndex={0} aria-label={`View ${order.serviceName} order for ${order.customerName}`} onClick={openOrder} onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openOrder()
                }
              }}>
                <TableCell title={order.orderId || order.id}><strong>#{orderReference(order)}</strong></TableCell>
                <TableCell>{order.icon} {order.serviceName}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.workerName || (order.declinedBy ? `${order.declinedBy} (declined)` : 'Unassigned')}</TableCell>
                <TableCell>{order.date} · {order.time}</TableCell>
                <TableCell><Chip size="small" label={order.status} /></TableCell>
                <TableCell align="right">{formatMoney(order.total ?? order.price, settings.currency)}</TableCell>
              </TableRow>
            })}
            {!bookings.length && <EmptyRow columns={7} message="No orders have been placed yet." />}
          </TableBody></>)}
        </Box>}

        {section === 'complaints' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">Customer complaints</Typography><Typography variant="body2" color="text.secondary">Reply here to update the customer account, or open an email draft to send the response.</Typography></Box>
          {table(<><TableHead><TableRow><TableCell>Customer / order</TableCell><TableCell>Issue</TableCell><TableCell>Status</TableCell><TableCell>Reply to customer</TableCell></TableRow></TableHead><TableBody>
            {complaints.map((complaint) => <TableRow key={complaint.id}>
              <TableCell><strong>{complaint.customerName}</strong><br />{complaint.customerEmail}<br /><span className="muted">{complaint.orderName}</span></TableCell>
              <TableCell><strong>{complaint.subject}</strong><br />{complaint.message}</TableCell>
              <TableCell><Chip size="small" label={complaint.status} /></TableCell>
              <TableCell>
                <Stack spacing={1} sx={{ minWidth: 220 }}>
                  <TextField {...fieldProps} multiline minRows={2} label="Reply" value={replyDrafts[complaint.id] ?? complaint.reply ?? ''} onChange={(event) => setReplyDrafts({ ...replyDrafts, [complaint.id]: event.target.value })} />
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" disabled={!(replyDrafts[complaint.id] ?? complaint.reply)?.trim()} onClick={() => {
                      const reply = (replyDrafts[complaint.id] ?? complaint.reply).trim()
                      updateComplaint(complaint.id, { reply, status: 'replied' })
                    }}>Save reply</Button>
                    {complaint.reply && <Button size="small" component="a" href={`mailto:${encodeURIComponent(complaint.customerEmail)}?subject=${encodeURIComponent(`Update about ${complaint.orderName}`)}&body=${encodeURIComponent(complaint.reply)}`}>Email</Button>}
                  </Stack>
                </Stack>
              </TableCell>
            </TableRow>)}
            {!complaints.length && <EmptyRow columns={4} message="Customer support requests will appear here." />}
          </TableBody></>)}
        </Box>}

        {section === 'promotions' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">Promotional campaigns</Typography><Typography variant="body2" color="text.secondary">Create and pause homepage offers.</Typography></Box>
          <Box component="form" className="admin-create-form" onSubmit={submitPromotion}>
            <TextField {...fieldProps} required label="Campaign title" value={promotionDraft.title} onChange={(event) => setPromotionDraft({ ...promotionDraft, title: event.target.value })} />
            <TextField {...fieldProps} required label="Description" value={promotionDraft.description} onChange={(event) => setPromotionDraft({ ...promotionDraft, description: event.target.value })} />
            <TextField {...fieldProps} required label="Discount (%)" type="number" slotProps={{ htmlInput: { min: 1, max: 100 } }} value={promotionDraft.discount} onChange={(event) => setPromotionDraft({ ...promotionDraft, discount: event.target.value })} />
            <Button type="submit" variant="contained">Create promotion</Button>
          </Box>
          {table(<><TableHead><TableRow><TableCell>Campaign</TableCell><TableCell align="right">Discount</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
            {promotions.map((promotion) => <TableRow key={promotion.id}>
              <TableCell><strong>{promotion.title}</strong><br /><span className="muted">{promotion.description}</span></TableCell>
              <TableCell align="right">{promotion.discount}%</TableCell>
              <TableCell><FormControlLabel control={<Switch checked={promotion.active} onChange={(event) => updatePromotion(promotion.id, { active: event.target.checked })} />} label={promotion.active ? 'Active' : 'Paused'} /></TableCell>
              <TableCell><Button color="error" onClick={() => removePromotion(promotion.id)}>Delete</Button></TableCell>
            </TableRow>)}
            {!promotions.length && <EmptyRow columns={4} message="No campaigns yet." />}
          </TableBody></>)}
        </Box>}

        {section === 'coupons' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">Coupons</Typography><Typography variant="body2" color="text.secondary">Manage discount codes and expiry dates.</Typography></Box>
          <Box component="form" className="admin-create-form" onSubmit={submitCoupon}>
            <TextField {...fieldProps} required label="Coupon code" value={couponDraft.code} onChange={(event) => setCouponDraft({ ...couponDraft, code: event.target.value })} />
            <TextField {...fieldProps} required label="Discount" type="number" slotProps={{ htmlInput: { min: 1 } }} value={couponDraft.discount} onChange={(event) => setCouponDraft({ ...couponDraft, discount: event.target.value })} />
            <TextField {...fieldProps} select label="Type" value={couponDraft.type} onChange={(event) => setCouponDraft({ ...couponDraft, type: event.target.value })}><MenuItem value="percent">Percent</MenuItem><MenuItem value="fixed">Fixed amount</MenuItem></TextField>
            <TextField {...fieldProps} label="Expires" type="date" InputLabelProps={{ shrink: true }} value={couponDraft.expires} onChange={(event) => setCouponDraft({ ...couponDraft, expires: event.target.value })} />
            <Button type="submit" variant="contained">Add coupon</Button>
          </Box>
          {table(<><TableHead><TableRow><TableCell>Code</TableCell><TableCell>Discount</TableCell><TableCell>Expires</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>
            {coupons.map((coupon) => <TableRow key={coupon.id}><TableCell><strong>{coupon.code}</strong></TableCell><TableCell>{coupon.type === 'percent' ? `${coupon.discount}%` : formatMoney(coupon.discount, settings.currency)}</TableCell><TableCell>{coupon.expires || 'No expiry'}</TableCell><TableCell><FormControlLabel control={<Switch checked={coupon.active} onChange={(event) => updateCoupon(coupon.id, { active: event.target.checked })} />} label={coupon.active ? 'Active' : 'Paused'} /></TableCell></TableRow>)}
            {!coupons.length && <EmptyRow columns={4} message="No coupons have been created." />}
          </TableBody></>)}
        </Box>}

        {section === 'payments' && <Box className="admin-panel">
          <Box className="admin-section-title"><Typography variant="h6">Payment records</Typography><Typography variant="body2" color="text.secondary">Demo payment statuses. No real payment processing is connected.</Typography></Box>
          {table(<><TableHead><TableRow><TableCell>Order ID</TableCell><TableCell>Service</TableCell><TableCell>Customer</TableCell><TableCell>Method</TableCell><TableCell>Status</TableCell><TableCell align="right">Total</TableCell><TableCell align="right">Site commission</TableCell><TableCell /></TableRow></TableHead><TableBody>
            {bookings.map((order) => <TableRow key={order.id}><TableCell title={order.orderId || order.id}>#{orderReference(order)}</TableCell><TableCell>{order.serviceName}</TableCell><TableCell>{order.customerName}</TableCell><TableCell>{order.paymentMethod || 'Not selected'}</TableCell><TableCell><Chip size="small" label={order.paymentStatus || 'unpaid'} /></TableCell><TableCell align="right">{formatMoney(order.total ?? order.price, settings.currency)}</TableCell><TableCell align="right">{formatMoney(order.commission, settings.currency)}</TableCell><TableCell align="right"><Button size="small" onClick={() => updatePayment(order.id, order.paymentStatus === 'paid' ? 'refunded' : 'paid')}>{order.paymentStatus === 'paid' ? 'Mark refunded' : 'Mark paid'}</Button></TableCell></TableRow>)}
            {!bookings.length && <EmptyRow columns={8} message="Payments appear here after checkout." />}
          </TableBody></>)}
        </Box>}

        {section === 'settings' && <Box component="form" className="admin-panel admin-settings" onSubmit={saveSettings}>
          <Box className="admin-section-title"><Typography variant="h6">Business settings</Typography><Typography variant="body2" color="text.secondary">Update the shared operation preferences.</Typography></Box>
          <TextField {...fieldProps} select label="User and pro app theme" value={settingsDraft.userTheme || 'orange'} onChange={(event) => setSettingsDraft({ ...settingsDraft, userTheme: event.target.value })}>
            <MenuItem value="orange">Urban Orange</MenuItem><MenuItem value="ocean">Ocean</MenuItem><MenuItem value="forest">Forest</MenuItem>
          </TextField>
          <TextField {...fieldProps} select label="Admin dashboard theme" value={settingsDraft.adminTheme || 'orange'} onChange={(event) => setSettingsDraft({ ...settingsDraft, adminTheme: event.target.value })}>
            <MenuItem value="orange">Urban Orange</MenuItem><MenuItem value="ocean">Ocean</MenuItem><MenuItem value="forest">Forest</MenuItem>
          </TextField>
          <Box className="admin-layout-setting">
            <div><Typography variant="subtitle2">Header logo position</Typography><Typography variant="caption" color="text.secondary">Choose the brand alignment in the site header.</Typography></div>
            <ToggleButtonGroup size="small" exclusive value={settingsDraft.headerLogoPosition || 'left'} aria-label="Header logo position" onChange={(_, value) => value && setSettingsDraft({ ...settingsDraft, headerLogoPosition: value })}>
              <ToggleButton value="left"><FormatAlignLeftOutlinedIcon fontSize="small" /> Left</ToggleButton>
              <ToggleButton value="center"><FormatAlignCenterOutlinedIcon fontSize="small" /> Center</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box className="admin-layout-setting">
            <div><Typography variant="subtitle2">Admin navigation</Typography><Typography variant="caption" color="text.secondary">Choose where the section menu appears.</Typography></div>
            <ToggleButtonGroup size="small" exclusive value={settingsDraft.adminNavPlacement || 'left'} aria-label="Admin navigation placement" onChange={(_, value) => value && setSettingsDraft({ ...settingsDraft, adminNavPlacement: value })}>
              <ToggleButton value="left"><ViewSidebarOutlinedIcon fontSize="small" /> Left side</ToggleButton>
              <ToggleButton value="top"><ViewHeadlineOutlinedIcon fontSize="small" /> Top</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <TextField {...fieldProps} label="Business name" value={settingsDraft.businessName} onChange={(event) => setSettingsDraft({ ...settingsDraft, businessName: event.target.value })} />
          <TextField {...fieldProps} select label="Currency" value={settingsDraft.currency} onChange={(event) => setSettingsDraft({ ...settingsDraft, currency: event.target.value })}>{[['USD', 'US Dollar'], ['EUR', 'Euro'], ['GBP', 'British Pound'], ['INR', 'Indian Rupee'], ['CAD', 'Canadian Dollar'], ['AUD', 'Australian Dollar'], ['JPY', 'Japanese Yen']].map(([code, name]) => <MenuItem key={code} value={code}>{code} · {name}</MenuItem>)}</TextField>
          <TextField {...fieldProps} select label="Map provider" value={settingsDraft.mapProvider || 'openstreetmap'} onChange={(event) => setSettingsDraft({ ...settingsDraft, mapProvider: event.target.value })}><MenuItem value="openstreetmap">OpenStreetMap · no key required</MenuItem><MenuItem value="maptiler">MapTiler · API key</MenuItem></TextField>
          {settingsDraft.mapProvider === 'maptiler' && <TextField {...fieldProps} label="MapTiler public API key" value={settingsDraft.mapApiKey || ''} onChange={(event) => setSettingsDraft({ ...settingsDraft, mapApiKey: event.target.value })} helperText="Use a browser-restricted public key. It is sent to the map tile provider." />}
          <TextField {...fieldProps} label="Default worker radius (km)" type="number" slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }} value={settingsDraft.defaultWorkerRadiusKm ?? 15} onChange={(event) => setSettingsDraft({ ...settingsDraft, defaultWorkerRadiusKm: Number(event.target.value) })} />
          <TextField {...fieldProps} label="Service fee" type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }} value={settingsDraft.serviceFee} onChange={(event) => setSettingsDraft({ ...settingsDraft, serviceFee: event.target.value })} />
          <TextField {...fieldProps} label="Site commission (%)" type="number" slotProps={{ htmlInput: { min: 0, max: 100, step: 0.1 } }} value={settingsDraft.commissionPercent} onChange={(event) => setSettingsDraft({ ...settingsDraft, commissionPercent: event.target.value })} />
          <TextField {...fieldProps} label="Service tax (%)" type="number" slotProps={{ htmlInput: { min: 0, max: 100, step: 0.1 } }} value={settingsDraft.serviceTaxPercent} onChange={(event) => setSettingsDraft({ ...settingsDraft, serviceTaxPercent: event.target.value })} />
          <Typography variant="caption" color="text.secondary">Current accrued site commission: {formatMoney(commissionRevenue, settings.currency)}. New orders use the saved commission, tax, and currency settings.</Typography>
          <FormControlLabel control={<Switch checked={settingsDraft.bookingsEnabled} onChange={(event) => setSettingsDraft({ ...settingsDraft, bookingsEnabled: event.target.checked })} />} label="Accept new bookings" />
          <FormControlLabel control={<Switch checked={settingsDraft.showHeaderLogin !== false} onChange={(event) => setSettingsDraft({ ...settingsDraft, showHeaderLogin: event.target.checked })} />} label="Show login link in site header" />
          <Button type="submit" variant="contained" sx={{ justifySelf: 'start' }}>Save settings</Button>
        </Box>}
        </div>
      </section>
      <ProfileDialog selection={profileSelection} bookings={bookings} settings={settings} catalog={catalog} verification={profileSelection?.type === 'worker' ? verifications[profileSelection.profile.id] : null} workerProfiles={workerProfiles} onUpdateWorkerProfile={updateManagedWorkerProfile} onViewOrder={(orderId) => { setProfileSelection(null); setSelectedOrderId(orderId) }} onClose={() => setProfileSelection(null)} />
      <OrderDetailsDialog
        order={selectedOrder}
        workers={eligibleOrderWorkers}
        selectedWorker={selectedOrderWorker}
        currency={settings.currency}
        settings={settings}
        onUpdateOrder={updateOrderDetails}
        onSelectWorker={(workerId) => setAssignmentDrafts((drafts) => ({ ...drafts, [selectedOrder.id]: workerId }))}
        onAssign={() => submitAssignment(selectedOrder.id)}
        onViewCustomer={(customerId) => {
          const customer = users.find((user) => user.id === customerId)
          if (!customer) return
          setSelectedOrderId(null)
          setProfileSelection({ profile: customer, type: 'user' })
        }}
        onClose={() => setSelectedOrderId(null)}
      />
    </motion.main>
  )
} 