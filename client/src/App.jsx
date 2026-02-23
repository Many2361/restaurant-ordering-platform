import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import OrderConfirmation from './pages/OrderConfirmation';

export default function App() {
  return (
    <>
      {/* Global toast notifications (e.g. "Jollof Rice added to cart") */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#2A1810',
            color: '#F5EDD8',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            borderLeft: '3px solid #C4622D',
          },
        }}
      />

      <Navbar />
      <Cart />

      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/menu"        element={<Menu />} />
        <Route path="/order/:ref"  element={<OrderConfirmation />} />
      </Routes>

      <Footer />
    </>
  );
}