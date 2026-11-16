import { useEffect, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { DEFAULT_MAP_CENTER } from '../utils/geo.js'
import { reverseLookupAddress } from '../utils/addressLookup.js'
import 'leaflet/dist/leaflet.css'

const selectionIcon = L.divIcon({
  className: 'map-selection-marker',
  html: '<span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function MapClick({ onChange, onAddressChange }) {
  const lookupVersion = useRef(0)
  useMapEvents({
    click(event) {
      const location = { lat: event.latlng.lat, lng: event.latlng.lng }
      const currentLookup = ++lookupVersion.current
      onChange(location)
      reverseLookupAddress(location).then((address) => {
        if (address && currentLookup === lookupVersion.current) onAddressChange?.(address)
      }).catch(() => {})
    },
  })
  return null
}

function Recenter({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], Math.max(map.getZoom(), 12))
  }, [map, position?.lat, position?.lng])
  return null
}

export default function MapPicker({ position, onChange, onAddressChange, settings, label = 'Choose a location' }) {
  const center = position || DEFAULT_MAP_CENTER
  const useMapTiler = settings.mapProvider === 'maptiler' && settings.mapApiKey?.trim()
  const tileUrl = useMapTiler
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(settings.mapApiKey.trim())}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const attribution = useMapTiler
    ? '&copy; MapTiler &copy; OpenStreetMap contributors'
    : '&copy; OpenStreetMap contributors'

  return (
    <section className="map-picker" aria-label={label}>
      <div className="map-picker-heading"><strong>{label}</strong><span>Click the map to pin the exact location.</span></div>
      <MapContainer center={[center.lat, center.lng]} zoom={position ? 12 : 4} scrollWheelZoom={false} className="location-map">
        <TileLayer url={tileUrl} attribution={attribution} />
        <MapClick onChange={onChange} onAddressChange={onAddressChange} />
        <Recenter position={position} />
        {position && <Marker position={[position.lat, position.lng]} icon={selectionIcon} />}
      </MapContainer>
      {position && <p className="map-coordinates">Pinned: {Number(position.lat).toFixed(4)}, {Number(position.lng).toFixed(4)}</p>}
    </section>
  )
}


