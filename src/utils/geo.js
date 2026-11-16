

export const DEFAULT_MAP_CENTER = { lat: 39.5, lng: -98.35 }
const EARTH_RADIUS_KM = 6371

export function distanceKm(from, to) {
  if (!from || !to || !Number.isFinite(Number(from.lat)) || !Number.isFinite(Number(from.lng)) || !Number.isFinite(Number(to.lat)) || !Number.isFinite(Number(to.lng))) return Infinity
  const radians = (degrees) => degrees * Math.PI / 180
  const latitudeDelta = radians(Number(to.lat) - Number(from.lat))
  const longitudeDelta = radians(Number(to.lng) - Number(from.lng))
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(Number(from.lat))) * Math.cos(radians(Number(to.lat))) * Math.sin(longitudeDelta / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isWithinRadius(from, to, radiusKm) {
  return distanceKm(from, to) <= Math.max(0, Number(radiusKm) || 0)
}
 