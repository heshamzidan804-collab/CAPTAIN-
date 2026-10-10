import { useEffect, useRef, useState } from 'react'
import { LocateFixed } from 'lucide-react'
import '../styles/locate.css'

// idle: متوقف | locating: بيحدد | following: بيتابعني | free: بيتتبع بدون متابعة الكاميرا
export default function LocateButton({ mapRef }) {
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')
  const [ping, setPing] = useState(0)
  const watchId = useRef(null)
  const markerRef = useRef(null)
  const lastRef = useRef(null)
  const followRef = useRef(false)
  const dragRef = useRef(null)
  const mlRef = useRef(null)
  const toastTimer = useRef(null)

  const stop = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = null
    markerRef.current?.remove()
    markerRef.current = null
    if (dragRef.current && mapRef.current) mapRef.current.off('dragstart', dragRef.current)
    dragRef.current = null
    followRef.current = false
    lastRef.current = null
    setStatus('idle')
  }

  useEffect(() => {
    import('maplibre-gl').then((m) => {
      mlRef.current = m.default ?? m
    })
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showMsg = (text) => {
    setMsg(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setMsg(''), 4500)
  }

  const onPosition = (pos) => {
    const lngLat = [pos.coords.longitude, pos.coords.latitude]
    lastRef.current = lngLat
    const map = mapRef.current
    const ml = mlRef.current
    if (!map || !ml) return
    if (!markerRef.current) {
      const el = document.createElement('div')
      el.className = 'user-dot'
      markerRef.current = new ml.Marker({ element: el }).setLngLat(lngLat).addTo(map)
      followRef.current = true
      setStatus('following')
      map.flyTo({ center: lngLat, zoom: 16, duration: 1000 })
    } else {
      markerRef.current.setLngLat(lngLat)
      if (followRef.current) map.easeTo({ center: lngLat, duration: 600 })
    }
  }

  const onError = (err) => {
    if (err.code === 1) {
      showMsg('اسمح بالوصول للموقع من إعدادات المتصفح')
      stop()
    } else if (err.code === 2) {
      showMsg('تعذّر تحديد موقعك الآن')
    } else {
      showMsg('تحديد الموقع بياخد وقت، جرّب في مكان مفتوح')
    }
  }

  const start = () => {
    if (!('geolocation' in navigator)) {
      showMsg('المتصفح لا يدعم تحديد الموقع')
      return
    }
    setStatus('locating')
    watchId.current = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 20000,
    })
    const map = mapRef.current
    if (map) {
      dragRef.current = () => {
        followRef.current = false
        setStatus((s) => (s === 'following' ? 'free' : s))
      }
      map.on('dragstart', dragRef.current)
    }
  }

  const handleClick = () => {
    setPing((n) => n + 1)
    if (watchId.current === null) {
      start()
      return
    }
    if (status === 'following') {
      stop()
      return
    }
    if (status === 'free' && lastRef.current && mapRef.current) {
      followRef.current = true
      setStatus('following')
      mapRef.current.flyTo({
        center: lastRef.current,
        zoom: Math.max(mapRef.current.getZoom(), 16),
        duration: 800,
      })
    }
  }

  const label =
    status === 'idle' ? 'تحديد موقعي' : status === 'following' ? 'إيقاف التتبّع' : 'العودة لموقعي'

  return (
    <>
      <button
        type="button"
        className={`locate locate--${status}`}
        aria-label={label}
        onClick={handleClick}
      >
        <span className="locate__halo" />
        <span className="locate__ring" />
        <span className="locate__ring" />
        {ping > 0 && <span key={ping} className="locate__ping" />}
        <span className="locate__puck" />
        <span className="locate__icon">
          <LocateFixed size={22} strokeWidth={2.4} />
        </span>
      </button>
      {msg && (
        <div className="locate-toast" role="status">
          {msg}
        </div>
      )}
    </>
  )
}
