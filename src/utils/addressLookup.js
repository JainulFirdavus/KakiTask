
function featureToAddress(feature) {
  const properties = feature?.properties || {}
  const street = properties.street || properties.name || ''
  const streetLine = [properties.housenumber, street].filter(Boolean).join(' ')
  const locality = properties.city || properties.locality || properties.district || ''
  return [...new Set([streetLine, locality, properties.state, properties.postcode, properties.country].filter(Boolean))].join(', ')
}

export async function searchAddresses(query, signal) {
  const params = new URLSearchParams({ q: query, limit: '6', lang: 'en' })
  const response = await fetch(`https://photon.komoot.io/api/?${params}`, { signal })
  if (!response.ok) throw new Error('Address search is temporarily unavailable.')
  const data = await response.json()
  const results = (data.features || []).map((feature, index) => {
    const [lng, lat] = feature.geometry.coordinates
    return {
      id: feature.properties.osm_id || `${feature.properties.name}-${index}`,
      label: featureToAddress(feature),
      location: { lat, lng },
    }
  }).filter((result) => result.label && Number.isFinite(result.location.lat) && Number.isFinite(result.location.lng))
  return [...new Map(results.map((result) => [result.label.toLocaleLowerCase(), result])).values()]
}

export async function reverseLookupAddress(location) {
  const params = new URLSearchParams({ lon: String(location.lng), lat: String(location.lat), lang: 'en', limit: '1' })
  const response = await fetch(`https://photon.komoot.io/reverse?${params}`)
  if (!response.ok) return ''
  const data = await response.json()
  return featureToAddress(data.features?.[0])
}

export function formatServiceAddress(item) {
  const extras = [
    item.building,
    item.floor ? `Floor ${item.floor}` : '',
    item.landmark ? `Near ${item.landmark}` : '',
  ].filter(Boolean)
  return [item.address, ...extras].filter(Boolean).join(', ')
}
 