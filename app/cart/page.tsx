"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CartContext } from "../context/CartContext";
import Link from "next/link";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const router = useRouter();
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error("CartContext precisa estar dentro do CartProvider");
  }

  const {
    cart,
    total,
    isLoaded, // ✅ Usamos o isLoaded que já vem do seu Contexto
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = cartContext;

  // ✅ CORREÇÃO: Se o isLoaded for false, significa que ainda estamos 
  // no processo de leitura do localStorage. Retornamos null ou loading.
  // Isso evita o erro de "setState" e o problema do F5.
  if (!isLoaded) {
    return (
      <section className={styles.section}>
        <p>Sincronizando seu carrinho...</p>
      </section>
    );
  }

  function handleCheckout() {
    if (cart.length === 0) return;
    router.push("/checkout");
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Seu Carrinho</h1>

      {cart.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Seu carrinho está vazio.</p>
          <Link href="/" className={styles.link}>
            Voltar ao catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {cart.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.productInfo}>
                  <Image
                    src={item.image || "/imagens/products/default.jpg"}
                    alt={item.name}
                    width={200}
                    height={200}
                    className={styles.image}
                    priority
                  />

                  <div>
                    <h2 className={styles.name}>{item.name}</h2>
                    <p className={styles.price}>
                      R$ {item.price.toFixed(2)}
                    </p>

                    <div className={styles.quantity}>
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className={styles.qtyButton}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className={styles.qtyButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeButton}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <h2 className={styles.total}>
              Total: R$ {total.toFixed(2)}
            </h2>

            <div className={styles.actions}>
              <button onClick={clearCart} className={styles.clearButton}>
                Limpar
              </button>
              <button
                onClick={handleCheckout}
                className={styles.checkoutButton}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}