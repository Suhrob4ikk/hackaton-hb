import Header from '../../components/Header/Header.jsx'
import Hero from '../../components/Hero/Hero.jsx'
import Benefits from '../../components/Benefits/Benefits.jsx'
import Categories from '../../components/Categories/Categories.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import AIConsultantWidget from '../../components/AIConsultant/AIConsultantWidget.jsx'
import CartDrawer from '../../components/CartDrawer/CartDrawer.jsx'

function Home() {
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
    </div>
  )
}

export default Home
