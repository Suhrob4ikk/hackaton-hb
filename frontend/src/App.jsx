import Home from './pages/Home/Home.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <ChatProvider>
          <Home />
        </ChatProvider>
      </CartProvider>
    </LanguageProvider>
  )
}

export default App
