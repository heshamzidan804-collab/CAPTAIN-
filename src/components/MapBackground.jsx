import { useEffect, useRef, useState } from 'react'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { applyPalette } from './mapPalette'
import '../styles/map.css'

const CENTER = [31.7425, 30.2927] // [lng, lat] العاشر من رمضان
const ZOOM = 14.5
const NAVY = '#3b5068'
const CREAM = '#f4f0e1'
const RTL_PLUGIN = 'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js'

// الاسم: عربي ← الاسم المحلي ← إنجليزي
const NAME = ['coalesce', ['get', 'name:ar'], ['get', 'name'], ['get', 'name_en']]

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
    if (l.id.startsWith('poi')) {
      map.setLayoutProperty(l.id, 'visibility', 'none')
      return
    }
    const tf = l.layout && l.layout['text-field']
    if (!tf) return
    const s = JSON.stringify(tf)
    if (s.includes('ref') || s.includes('iata')) return
    map.setLayoutProperty(l.id, 'text-field', NAME)
    map.setPaintProperty(l.id, 'text-color', NAVY)
    map.setPaintProperty(l.id, 'text-halo-color', CREAM)
    map.setPaintProperty(l.id, 'text-halo-width', 1.2)
  })

  if (!sourceId || map.getLayer('captain-poi-dots')) return
  const filter = ['in', ['get', 'class'], ['literal', POI_CLASSES]]

  map.addLayer({
    id: 'captain-poi-dots',
    type: 'circle',
    source: sourceId,
    'source-layer': 'poi',
    minzoom: 14,
    filter,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 2.5, 18, 6],
      'circle-color': NAVY,
      'circle-stroke-color': CREAM,
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.9,
    },
  })

  map.addLayer({
    id: 'captain-poi-labels',
    type: 'symbol',
    source: sourceId,
    'source-layer': 'poi',
    minzoom: 15.5,
    filter,
    layout: {
      'text-field': NAME,
      'text-font': fontStack,
      'text-size': 12,
      'text-offset': [0, 0.9],
      'text-anchor': 'top',
      'text-optional': true,
    },
    paint: {
      'text-color': NAVY,
      'text-halo-color': CREAM,
      'text-halo-width': 1.4,
    },
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

        // تشكيل الحروف العربية على الخريطة
        try {
          const st = maplibregl.getRTLTextPluginStatus?.()
          if (st !== 'loaded' && st !== 'loading') {
            Promise.resolve(maplibregl.setRTLTextPlugin?.(RTL_PLUGIN, true)).catch(() => {})
          }
        } catch (_) { /* ignore */ }

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
  }, [])

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
