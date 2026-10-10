import { useRef } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import MapBackground from './components/MapBackground'
import SearchBar from './components/SearchBar'
import LocateButton from './components/LocateButton'
import BottomNav from './components/BottomNav'

export default function App() {
  const mapRef = useRef(null)
  return (
    <ErrorBoundary>
      <div className="stage">
        <main className="screen">
          <MapBackground mapRef={mapRef} />
          <SearchBar />
          <LocateButton mapRef={mapRef} />
          <BottomNav />
        </main>
      </div>
    </ErrorBoundary>
  )
}
