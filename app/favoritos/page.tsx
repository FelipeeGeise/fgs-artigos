"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "../context/CartContext" // ✅ Puxando seu hook real
import styles from "./favoritos.module.css"

export default function FavoritesPage() {
  // Pegamos os dados e funções reais do seu Contexto
  const { favorites, toggleFavorite, addToCart, cart } = useCart()

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={20} /> Voltar para a loja
        </Link>
        <h1 className={styles.pageTitle}>
          Meus Favoritos <Heart size={28} className={styles.iconFilled} />
        </h1>
      </header>

      {/* Se a lista real de favoritos estiver vazia, mostra o aviso */}
      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <Heart size={64} className={styles.emptyIcon} />
          <p>Sua lista de favoritos está vazia.</p>
          <p style={{ color: '#888', fontSize: '14px' }}>Favorite produtos na loja para vê-los aqui!</p>
          <Link href="/" className={styles.button}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((product) => {
            // Verifica se este produto já está no carrinho para mudar o botão
            const inCart = cart.some(item => String(item.id) === String(product.id))

            return (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={90} 
                    height={90} 
                    className={styles.productImg} 
                  />
                </div>
                
                <div className={styles.info}>
                  <h3>{product.name}</h3>
                  <p className={styles.price}>R$ {product.price.toFixed(2)}</p>
                  
                  <div className={styles.actions}>
                    <button 
                      className={styles.addToCartBtn}
                      onClick={() => !inCart && addToCart(product)}
                      disabled={inCart}
                    >
                      <ShoppingCart size={18} /> 
                      {inCart ? "No Carrinho" : "Adicionar"}
                    </button>
                    
                    {/* Aqui a função toggleFavorite remove o item da lista real */}
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => toggleFavorite(product)}
                      title="Remover dos favoritos"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}