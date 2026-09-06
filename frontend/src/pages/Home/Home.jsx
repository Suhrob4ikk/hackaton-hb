import { useEffect } from 'react'
import Hero from '../../components/Hero/Hero.jsx'
import Benefits from '../../components/Benefits/Benefits.jsx'
import Categories from '../../components/Categories/Categories.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import AIConsultantWidget from '../../components/AIConsultant/AIConsultantWidget.jsx'
import CartDrawer from '../../components/CartDrawer/CartDrawer.jsx'
import AuthModal from '../../components/AuthModal/AuthModal.jsx'
import AccountPanel from '../../components/AccountPanel/AccountPanel.jsx'

function Home() {
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Categories />
      </main>
      <Footer />
      <AIConsultantWidget />
      <CartDrawer />
      <AuthModal />
      <AccountPanel />
    </div>
    <>
      <Hero />
      <Benefits />
      <Categories />
    </>
  )
}

export default Home
