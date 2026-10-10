// Quiet Luxury: خريطة هادية، تدرّج tonal من اللافندر
const C = {
  land: '#f4f7ff',
  landuse: '#eaeffb',
  street: '#ffffff',
  road: '#c9bfb5',
  motorway: '#b3a79c',
  motorwayEdge: '#9c8f86',
  rail: '#cdd3ea',
  park: '#e1e8f3',
  water: '#d3ddf6',
  building: '#e6e3ea',
}

const has = (id, ...words) => words.some((w) => id.includes(w))
const width = (a, b, c) => ['interpolate', ['exponential', 1.4], ['zoom'], 10, a, 15, b, 19, c]

export function applyPalette(map) {
  map.getStyle().layers.forEach((l) => {
    const id = l.id
    const set = (p, v) => {
      try { map.setPaintProperty(id, p, v) } catch { /* تجاهل */ }
    }
    const hide = () => {
      try { map.setLayoutProperty(id, 'visibility', 'none') } catch { /* تجاهل */ }
    }

    if (l.type === 'background') {
      set('background-color', C.land)
      return
    }

    if (l.type === 'fill') {
      if (has(id, 'water')) set('fill-color', C.water)
      else if (has(id, 'park', 'wood', 'forest', 'grass', 'garden', 'pitch', 'cemetery')) set('fill-color', C.park)
      else if (has(id, 'building')) {
        set('fill-color', C.building)
        set('fill-opacity', ['interpolate', ['linear'], ['zoom'], 16, 0, 17.5, 0.8])
      } else if (has(id, 'landuse', 'landcover')) set('fill-color', C.landuse)
      return
    }

    if (l.type === 'line') {
      if (has(id, 'boundary')) return hide()
      if (has(id, 'waterway')) return set('line-color', C.water)
      if (has(id, 'railway', 'rail', 'aeroway')) {
        set('line-color', C.rail)
        set('line-opacity', 0.6)
        return
      }
      if (has(id, 'path', 'pier')) {
        set('line-color', C.street)
        set('line-opacity', 0.8)
        return
      }
      if (has(id, 'casing')) {
        if (has(id, 'motorway', 'trunk')) {
          set('line-color', C.motorwayEdge)
          set('line-opacity', 0.35)
        } else {
          set('line-opacity', 0)
        }
        return
      }
      if (has(id, 'motorway', 'trunk')) {
        set('line-color', C.motorway)
        set('line-width', width(0.8, 3, 9))
      } else if (has(id, 'major', 'primary', 'secondary')) {
        set('line-color', C.road)
        set('line-width', width(0.6, 2.4, 7))
      } else if (has(id, 'minor', 'tertiary', 'service', 'street')) {
        set('line-color', C.street)
        set('line-width', width(0.4, 1.4, 5))
      }
    }
  })
}
