/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef, Suspense } from "react"; // ✅ Adicionado Suspense
import Link from "next/link";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "../livros/Livros.module.css"; 
import { useCart, CartProvider } from "../context/CartContext";

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

function DevocionaisContent() {
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
        console.error("Erro ao carregar devocionais:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const devocionais = products.filter((p) => p.category === "devocionais");

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
          <h1 className={styles.title}>Devocionais Diários</h1>
          <p className={styles.subtitle}>Momentos de reflexão e intimidade com Deus.</p>
        </div>

        {loading ? (
          <div className={styles.loader}>Preparando suas leituras...</div>
        ) : devocionais.length === 0 ? (
          <p className={styles.empty}>Nenhum devocional cadastrado no momento.</p>
        ) : (
          <div className={styles.carouselWrapper}>
            <button className={`${styles.navButton} ${styles.prev}`} onClick={() => scroll("left")}>
              &#10094;
            </button>
            <button className={`${styles.navButton} ${styles.next}`} onClick={() => scroll("right")}>
              &#10095;
            </button>

            <div className={styles.grid} ref={carouselRef}>
              {devocionais.map((product) => {
                const inCart = cart.some((item) => String(item.id) === String(product.id));

                return (
                  <div key={product.id} className={styles.card}>
                    <Link href={`/product/${product.id}`} className={styles.imageLink}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className={styles.productImage} 
                      />
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

// ✅ Exportação atualizada com Suspense para resolver o erro de Build
export default function DevocionaisPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Carregando devocionais...</div>}>
      <CartProvider>
        <DevocionaisContent />
      </CartProvider>
    </Suspense>
  );
}