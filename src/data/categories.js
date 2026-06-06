export const CATEGORIES = {
  needs: [
    { id: 'alquiler', label: 'Alquiler', icon: '🏠' },
    { id: 'servicios', label: 'Servicios', icon: '⚡' },
    { id: 'supermercado', label: 'Supermercado', icon: '🛒' },
    { id: 'transporte', label: 'Transporte', icon: '🚌' },
    { id: 'salud', label: 'Salud', icon: '🏥' },
  ],
  wants: [
    { id: 'restaurantes', label: 'Restaurantes', icon: '🍽️' },
    { id: 'entretenimiento', label: 'Entretenimiento', icon: '🎬' },
    { id: 'ropa', label: 'Ropa', icon: '👕' },
    { id: 'electronica', label: 'Electrónica', icon: '📱' },
    { id: 'otros_deseos', label: 'Otros deseos', icon: '✨' },
  ],
}

export const ALL_CATEGORIES = [...CATEGORIES.needs, ...CATEGORIES.wants]

export const CATEGORY_BLOCK_MAP = {}
CATEGORIES.needs.forEach(c => { CATEGORY_BLOCK_MAP[c.id] = 'needs' })
CATEGORIES.wants.forEach(c => { CATEGORY_BLOCK_MAP[c.id] = 'wants' })

export function getCategoryInfo(id) {
  return ALL_CATEGORIES.find(c => c.id === id) || { id, label: id, icon: '📌' }
}
