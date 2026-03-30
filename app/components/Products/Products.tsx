"use client"

import { useState, useContext, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CartContext, Product as CartProduct } from "../../context/CartContext"
import styles from "./Products.module.css"

// ✅ Interface atualizada para o novo Schema (Dropshipping)
interface ProductType {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  active?: boolean; 
}

interface ProductsProps {
  excludeId?: string;
}

export default function Products({ excludeId }: ProductsProps) {
  const cartContext = useContext(CartContext)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""

  const [allProducts, setAllProducts] = useState<ProductType[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  // 1. Carregamento dos Produtos da API
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await fetch(`/api/products?t=${Date.now()}`)
        if (!response.ok) throw new Error("Erro na requisição")

        const data = await response.json()

        if (isMounted) {
          const productsArray = Array.isArray(data) ? data : []

          // ✅ FILTRA APENAS PRODUTOS ATIVOS
          const onlyActive = productsArray.filter(p => p.active !== false)

          setAllProducts(onlyActive)
          setFilteredProducts(onlyActive)
        }
      } catch {
        console.error("Falha ao carregar produtos. Verifique se a API está ativa.");
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProducts()
    return () => { isMounted = false }
  }, [])

  // 2. Lógica de Filtro e Busca (CORRIGIDA)
  useEffect(() => {
    const term = searchQuery.toLowerCase().trim()

    // 🔥 já começa filtrando ativos
    let filtered = allProducts

    if (excludeId) {
      filtered = filtered.filter(p => String(p.id) !== String(excludeId))
    }

    if (term !== "") {
      filtered = filtered.filter(product => {
        const name = product.name.toLowerCase()
        const category = product.category.toLowerCase()

        return (
          name.includes(term) ||
          category.includes(term) ||
          term.includes(category) // 🔥 resolve singular/plural
        )
      })
    }

    setFilteredProducts(filtered)
  }, [searchQuery, allProducts, excludeId])

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current

      const targetScroll =
        direction === "left"
          ? scrollLeft - clientWidth * 0.7
          : scrollLeft + clientWidth * 0.7

      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      })
    }
  }

  if (!cartContext) return null
  const { addToCart, cart } = cartContext

  if (loading) return <p className={styles.loading}>Carregando catálogo...</p>

  return (
    <section id="products" className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.title}>
          {searchQuery ? `Resultados para: "${searchQuery}"` : "Nossas Bíblias e Livros"}
        </h2>
      </header>

      <div className={styles.carouselWrapper}>
        {filteredProducts.length > 0 && (
          <>
            <button
              className={`${styles.navButton} ${styles.prev}`}
              onClick={() => scroll("left")}
            >
              &#10094;
            </button>
            <button
              className={`${styles.navButton} ${styles.next}`}
              onClick={() => scroll("right")}
            >
              &#10095;
            </button>
          </>
        )}

        <div className={styles.grid} ref={carouselRef}>
          {filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <p className={styles.empty}>Nenhum produto encontrado.</p>
              <Link href="/" className={styles.clearBtn}>
                Ver todos os produtos
              </Link>
            </div>
          ) : (
            filteredProducts.map(product => {
              const inCart = cart.some(item => String(item.id) === String(product.id))

              return (
                <div key={product.id} className={styles.card}>
                  <Link href={`/product/${product.id}`}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className={styles.image}
                      />
                    </div>
                    <h3 className={styles.name}>{product.name}</h3>
                    <p className={styles.price}>
                      R$ {Number(product.price).toFixed(2)}
                    </p>
                  </Link>

                  <button
                    onClick={() =>
                      addToCart({ ...product, quantity: 1 } as CartProduct)
                    }
                    className={`${styles.button} ${
                      inCart ? styles.disabledButton : styles.activeButton
                    }`}
                    disabled={inCart}
                  >
                    {inCart ? "No carrinho" : "Adicionar ao carrinho"}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}