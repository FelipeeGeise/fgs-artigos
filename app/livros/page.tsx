/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./Livros.module.css";
import { useCart, CartProvider } from "../context/CartContext";

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

function LivrosContent() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar livros:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const livros = products.filter((p) => p.category === "livros");

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const move = direction === "left" ? -clientWidth * 0.7 : clientWidth * 0.7;
      carouselRef.current.scrollTo({ left: scrollLeft + move, behavior: "smooth" });
    }
  };

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Livros Cristãos</h1>
          <p className={styles.subtitle}>Edificando sua vida através da leitura.</p>
        </div>

        {loading ? (
          <div className={styles.loader}>Buscando obras...</div>
        ) : (
          <div className={styles.carouselWrapper}>
            {/* Setas de Navegação */}
            <button className={`${styles.navButton} ${styles.prev}`} onClick={() => scroll("left")}>&#10094;</button>
            <button className={`${styles.navButton} ${styles.next}`} onClick={() => scroll("right")}>&#10095;</button>

            <div className={styles.grid} ref={carouselRef}>
              {livros.map((product) => {
                const inCart = cart.some((item) => String(item.id) === String(product.id));

                return (
                  <div key={product.id} className={styles.card}>
                    {/* ✅ Imagem Clicável */}
                    <Link href={`/product/${product.id}`} className={styles.imageLink}>
                      <img src={product.image} alt={product.name} className={styles.productImage} />
                      <div className={styles.overlay}>Ver Detalhes</div>
                    </Link>

                    <div className={styles.info}>
                      <Link href={`/product/${product.id}`}>
                        <h3 className={styles.name}>{product.name}</h3>
                      </Link>
                      <p className={styles.price}>R$ {Number(product.price).toFixed(2)}</p>

                      <button
                        className={`${styles.button} ${inCart ? styles.disabledButton : styles.activeButton}`}
                        disabled={inCart}
                        onClick={() => {
                          addToCart({ ...product, quantity: 1 });
                        }}
                      >
                        {inCart ? "No carrinho" : "Adicionar ao carrinho"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function LivrosPage() {
  return (
    <CartProvider>
      <LivrosContent />
    </CartProvider>
  );
}