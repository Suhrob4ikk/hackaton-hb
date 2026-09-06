import { useEffect } from 'react'
import Hero from '../../components/Hero/Hero.jsx'
import Benefits from '../../components/Benefits/Benefits.jsx'
import Categories from '../../components/Categories/Categories.jsx'

function Home() {
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      <Hero />
      <Benefits />
      <Categories />
    </>
  )
}

export default Home
