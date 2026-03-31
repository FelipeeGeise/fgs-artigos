/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, Suspense } from "react"; // ✅ Adicionado Suspense
import Link from "next/link"; 
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./Biblias.module.css";
import { useCart, CartProvider } from "../context/CartContext"; 

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

function BibliasContent() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); 

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const biblias = products.filter(p => p.category === "biblias");

  return (
    <>
      <Header />
      <main className={styles.container}>
        <h1 className={styles.title}>Bíblias Profetizando</h1>
        <p className={styles.subtitle}>Escolha a tradução que mais toca seu coração</p>

        {loading ? (
          <div className={styles.loader}>Carregando catálogo...</div>
        ) : (
          <div className={styles.grid}>
            {biblias.map(product => (
              <div key={product.id} className={styles.card}>
                
                <Link href={`/product/${product.id}`} className={styles.imageLink}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={styles.productImage} 
                  />
                  <div className={styles.overlay}>Ver Detalhes</div>
                </Link>

                <div className={styles.productInfo}>
                  <Link href={`/product/${product.id}`}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  
                  <p className={styles.price}>R$ {Number(product.price).toFixed(2)}</p>
                  
                  <button 
                    className={styles.button}
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                        quantity: 1
                      });
                      alert("✅ Bíblia adicionada ao carrinho!");
                    }}
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

// ✅ Exportação atualizada com Suspense para evitar erro de Prerender
export default function BibliasPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Carregando Bíblias...</div>}>
      <CartProvider>
        <BibliasContent />
      </CartProvider>
    </Suspense>
  );
}