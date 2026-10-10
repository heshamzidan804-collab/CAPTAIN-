import { useEffect, useRef, useState } from 'react'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { applyPalette } from './mapPalette'
import '../styles/map.css'

const CENTER = [31.7425, 30.2927] // [lng, lat] العاشر من رمضان
const ZOOM = 14.5
const PLUM = '#140e36'
const PLUM_SOFT = '#7d5683'
const MILK = '#f4f7ff'
const RTL_PLUGIN = 'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js'

// الاسم: عربي ← المحلي ← إنجليزي، والأسماء الرقمية بتتخفى
const NAME = [
  'case',
  ['==', ['to-number', ['get', 'name'], -1], -1],
  ['coalesce', ['get', 'name:ar'], ['get', 'name'], ['get', 'name_en']],
  '',
]

const POI_CLASSES = [
  'hospital', 'pharmacy', 'school', 'college', 'library', 'place_of_worship',
  'railway', 'police', 'fire_station', 'post', 'bank', 'stadium', 'museum', 'fuel',
]

function applyData(map) {
  applyPalette(map)
  const style = map.getStyle()
  const layers = style.layers
  const sourceId = Object.keys(style.sources).find((k) => style.sources[k].type === 'vector')
  const fontStack =
    layers.find((l) => l.layout && l.layout['text-font'])?.layout['text-font'] ?? ['Noto Sans Regular']

  layers.forEach((l) => {
    if (l.type !== 'symbol') return
    const hide = () => map.setLayoutProperty(l.id, 'visibility', 'none')
    if (l.id.startsWith('poi') || l.id.includes('shield')) return hide()
    const tf = l.layout && l.layout['text-field']
    if (!tf) return
    const s = JSON.stringify(tf)
    if (s.includes('ref') || s.includes('iata')) return hide()

    map.setLayoutProperty(l.id, 'text-field', NAME)
    const isRoad = l.id.includes('highway-name')
    map.setPaintProperty(l.id, 'text-color', isRoad ? PLUM_SOFT : PLUM)
    map.setPaintProperty(l.id, 'text-halo-color', MILK)
    map.setPaintProperty(l.id, 'text-halo-width', 1.5)
    map.setPaintProperty(l.id, 'text-halo-blur', 0.5)
    if (l.id.includes('name-minor')) map.setLayerZoomRange(l.id, 16, 24)
  })

  if (!sourceId || map.getLayer('captain-poi-dots')) return
  const filter = ['in', ['get', 'class'], ['literal', POI_CLASSES]]

  map.addLayer({
    id: 'captain-poi-dots',
    type: 'circle',
    source: sourceId,
    'source-layer': 'poi',
    minzoom: 15.5,
    filter,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 15.5, 3, 18, 5],
      'circle-color': MILK,
      'circle-stroke-color': PLUM,
      'circle-stroke-width': 1.5,
    },
  })

  map.addLayer({
    id: 'captain-poi-labels',
    type: 'symbol',
    source: sourceId,
    'source-layer': 'poi',
    minzoom: 16.5,
    filter,
    layout: {
      'text-field': NAME,
      'text-font': fontStack,
      'text-size': 11,
      'text-offset': [0, 0.9],
      'text-anchor': 'top',
      'text-optional': true,
    },
    paint: { 'text-color': PLUM, 'text-halo-color': MILK, 'text-halo-width': 1.5 },
  })
}

export default function MapBackground({ mapRef }) {
  const ref = useRef(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let map
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import('maplibre-gl')
        await import('maplibre-gl/dist/maplibre-gl.css')
        if (cancelled) return
        const maplibregl = mod.default ?? mod
        if (typeof maplibregl.setWorkerUrl === 'function') maplibregl.setWorkerUrl(workerUrl)

        try {
          const st = maplibregl.getRTLTextPluginStatus?.()
          if (st !== 'loaded' && st !== 'loading') {
            Promise.resolve(maplibregl.setRTLTextPlugin?.(RTL_PLUGIN, true)).catch(() => {})
          }
        } catch { /* ignore */ }

        map = new maplibregl.Map({
          container: ref.current,
          style: 'https://tiles.openfreemap.org/styles/positron',
          center: CENTER,
          zoom: ZOOM,
          attributionControl: false,
          dragRotate: false,
        })
        map.touchZoomRotate.disableRotation()
        if (mapRef) mapRef.current = map
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
        map.on('error', (e) => {
          const m = String(e?.error?.message || '')
          if (m.includes('could not be loaded')) return
          setErr(m || 'map error')
        })
        map.on('load', () => {
          try {
            applyData(map)
          } catch (e) {
            setErr(String(e?.stack || e))
          }
        })
      } catch (e) {
        setErr(String(e?.stack || e))
      }
    })()
    return () => {
      cancelled = true
      map?.remove()
    }
  }, [mapRef])

  return (
    <div className="map-root">
      <div ref={ref} dir="ltr" style={{ width: '100%', height: '100%' }} />
      <div className="map-fade" />
      {err && (
        <div style={{ position: 'absolute', bottom: 110, left: 12, right: 12, zIndex: 700, fontSize: 11, direction: 'ltr', background: '#fff', color: '#b00020', padding: 8, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          {err}
        </div>
      )}
    </div>
  )
}
