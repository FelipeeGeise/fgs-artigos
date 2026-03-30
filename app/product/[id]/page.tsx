"use client"

import { useParams } from "next/navigation"
import { useCart, Product } from "../../context/CartContext"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Heart, Loader2 } from "lucide-react"
import styles from "./ProductPage.module.css"
// 1. Importando o componente de carrossel
import Products from "../../components/Products/Products"

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart, toggleFavorite, isFavorite } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch("/api/products")
        const data: Product[] = await response.json()
        const found = data.find((p) => String(p.id) === String(params.id))
        setProduct(found || null)
      } catch (error) {
        console.error("Erro:", error)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchProduct()
  }, [params.id])

  // 2. Configuração do WhatsApp
  const whatsappNumber = "5581999599815"; // COLOQUE SEU NÚMERO AQUI
  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no produto: *${product?.name}*`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Carregando detalhes...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Produto não encontrado</h2>
        <Link href="/">Voltar ao início</Link>
      </div>
    )
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={20} /> Voltar para a loja
        </Link>
      </header>

      {/* A DIV QUE MANDA NO LADO A LADO */}
      <div className={styles.productWrapper}>
        
        {/* LADO ESQUERDO: IMAGEM */}
        <div className={styles.imageBox}>
          <Image 
            src={product.image || "/placeholder.png"} 
            alt={product.name} 
            width={600} 
            height={600} 
            className={styles.mainImage}
            priority
          />
        </div>

        {/* LADO DIREITO: TEXTOS E BOTÕES */}
        <div className={styles.infoCol}>
          <div className={styles.textContent}>
            <span className={styles.categoryTag}>{product.category}</span>
            <h1 className={styles.productName}>{product.name}</h1>
            <div className={styles.priceRow}>
              <span className={styles.currency}>R$</span>
              <span className={styles.priceValue}>{Number(product.price).toFixed(2)}</span>
            </div>
            
            <div className={styles.descriptionBox}>
              <h3>Sobre este item</h3>
              <p>{product.description || "Descrição detalhada disponível em breve. Para dúvidas sobre o acabamento ou conteúdo, entre em contato via WhatsApp."}</p>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button 
              onClick={() => addToCart(product)} 
              className={styles.buyButton}
            >
              <ShoppingCart size={22} /> Adicionar ao Carrinho
            </button>
            
            <button 
              onClick={() => toggleFavorite(product)} 
              className={isFavorite(product.id) ? styles.favBtnActive : styles.favBtn}
            >
              <Heart size={26} fill={isFavorite(product.id) ? "#ff4b4b" : "none"} color={isFavorite(product.id) ? "#ff4b4b" : "currentColor"} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO DE RELACIONADOS (Abaixo do produto principal) */}
      <div className={styles.relatedProductsSection}>
        <Products excludeId={String(params.id)} />
      </div>

      {/* 4. BOTÃO FLUTUANTE DO WHATSAPP */}
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappFloating}
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
          <path d="M12.031 6.172c-2.277 0-4.126 1.849-4.126 4.126 0 2.277 1.849 4.126 4.126 4.126 2.277 0 4.126-1.849 4.126-4.126 0-2.277-1.849-4.126-4.126-4.126zm0 6.914c-1.537 0-2.788-1.251-2.788-2.788 0-1.537 1.251-2.788 2.788-2.788 1.537 0 2.788 1.251 2.788 2.788 0 1.537-1.251 2.788-2.788 2.788zm5.95 2.138c-1.123 0-2.031.908-2.031 2.031s.908 2.031 2.031 2.031 2.031-.908 2.031-2.031-.908-2.031-2.031-2.031z"/>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.53 3.654 1.441 5.16L2 22l5.05-1.424A9.969 9.969 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.742 0-3.368-.54-4.717-1.458l-.339-.228-2.993.843.857-2.923-.251-.383A7.96 7.96 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>
      </a>
    </main>
  )
}