/* eslint-disable react/no-unescaped-entities */
"use client"; 

import { Suspense } from "react"; // ✅ Adicionado Suspense
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Products from "./components/Products/Products";
import Footer from "./components/Footer/Footer";
import { CartProvider } from "./context/CartContext"; 

export default function Home() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Carregando FG's Store...</div>}>
      <CartProvider>
        <div>
          <Header />
          
          <main>
            <Hero />
            <Products />
          </main>

          <Footer />
        </div>
      </CartProvider>
    </Suspense>
  );
}