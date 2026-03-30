"use client"; // Necessário porque o Provider e os componentes usam estados

import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Products from "./components/Products/Products";
import Footer from "./components/Footer/Footer";
// ✅ Importe o seu Contexto (ajuste o caminho se a pasta 'context' estiver em outro lugar)
import { CartProvider } from "./context/CartContext"; 

export default function Home() {
  return (
    <CartProvider>
      <div>
        {/* Agora o Header consegue ler o cart.length sem dar erro 500 */}
        <Header />
        
        <main>
          <Hero />
          
          {/* O Products vai carregar os itens do seu Admin/API */}
          <Products />
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}