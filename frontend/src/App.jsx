import Home from './pages/Home/Home.jsx'
import CatalogPage from './pages/Catalog/CatalogPage.jsx'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import AIConsultantWidget from './components/AIConsultant/AIConsultantWidget.jsx'
import CartDrawer from './components/CartDrawer/CartDrawer.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { useHashRoute } from './hooks/useHashRoute.js'
import './App.css'

function App() {
  const { page, param } = useHashRoute()

  return (
    <LanguageProvider>
      <CartProvider>
        <ChatProvider>
          <div className="app">
            <Header />
            <main>{page === 'catalog' ? <CatalogPage focusGroup={param} /> : <Home />}</main>
            <Footer />
            <AIConsultantWidget />
            <CartDrawer />
          </div>
        </ChatProvider>
      </CartProvider>
    </LanguageProvider>
  )
}

export default App
