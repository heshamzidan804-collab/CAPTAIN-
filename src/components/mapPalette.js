// ألوان الخريطة: لافندر هادي متناسق مع الباليت
const C = {
  land: '#d3ccdd',
  street: '#f2eef6',
  road: '#9a8bb3',
  roadEdge: '#85749f',
  building: '#cbc3d6',
  park: '#cdd5cf',
  water: '#b9bdda',
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
