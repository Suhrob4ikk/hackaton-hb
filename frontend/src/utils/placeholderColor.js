const GRADIENTS = [
  'linear-gradient(135deg, #f0629e, #a855f7)',
  'linear-gradient(135deg, #f472b6, #818cf8)',
  'linear-gradient(135deg, #fb7185, #c084fc)',
  'linear-gradient(135deg, #e879f9, #a78bfa)',
]

export function gradientForId(id) {
  const sum = [...String(id)].reduce((total, char) => total + char.charCodeAt(0), 0)
  return GRADIENTS[sum % GRADIENTS.length]
}
