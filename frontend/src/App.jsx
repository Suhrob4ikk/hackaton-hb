import Home from './pages/Home/Home.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <Home />
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
