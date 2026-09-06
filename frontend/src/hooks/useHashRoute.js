import { useEffect, useState } from 'react'

function parseHash() {
  const hash = window.location.hash
  if (!hash.startsWith('#/')) {
    return { page: 'home', param: null }
  }
  const [page, param] = hash.slice(2).split('/')
  return { page: page || 'home', param: param || null }
}

export function useHashRoute() {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
