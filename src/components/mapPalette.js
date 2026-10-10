// ألوان الخريطة مأخوذة من التصميم
const C = {
  land: '#c9ced6',
  street: '#efeadb',
  road: '#a3acb8',
  roadEdge: '#8e97a5',
  building: '#c1c7d0',
  park: '#c9d6c3',
  water: '#b7c4d3',
}

const has = (id, ...words) => words.some((w) => id.includes(w))

export function applyPalette(map) {
  map.getStyle().layers.forEach((l) => {
    const id = l.id
    const set = (prop, val) => {
      try { map.setPaintProperty(id, prop, val) } catch (_) { /* تجاهل */ }
    }

    if (l.type === 'background') {
      set('background-color', C.land)
    } else if (l.type === 'fill') {
      if (has(id, 'park', 'wood', 'forest', 'grass', 'garden', 'pitch')) set('fill-color', C.park)
      else if (has(id, 'water')) set('fill-color', C.water)
      else if (has(id, 'building')) { set('fill-color', C.building); set('fill-opacity', 1) }
    } else if (l.type === 'line') {
      if (has(id, 'waterway')) set('line-color', C.water)
      else if (has(id, 'railway', 'path', 'boundary', 'aeroway')) return
      else if (has(id, 'casing') && has(id, 'major', 'motorway', 'trunk', 'primary')) set('line-color', C.roadEdge)
      else if (has(id, 'major', 'motorway', 'trunk', 'primary', 'secondary')) set('line-color', C.road)
      else if (has(id, 'minor', 'tertiary', 'service', 'street')) set('line-color', C.street)
    }
  })
}
