"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, ChevronRight, Clock, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import styles from "./pedidos.module.css"

// ✅ Definindo a interface baseada no seu schema.prisma
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  customerName: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  // ✅ Tipagem correta do estado: Array de Order
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const email = typeof window !== 'undefined' ? localStorage.getItem("user_email") : null
      
      if (!email) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/meus-pedidos?email=${email}`)
        if (!res.ok) throw new Error("Falha ao buscar pedidos")
        
        const data: Order[] = await res.json()
        setOrders(data)
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
    // Checa o banco a cada 10s para ver se o status mudou para PAGO
    const timer = setInterval(loadOrders, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={20} /> Voltar para a loja
        </Link>
        <h1 className={styles.title}>Meus Pedidos</h1>
      </header>

      {loading ? (
        <div className={styles.emptyState}>
          <Loader2 className={styles.spinner} size={40} />
          <p>Buscando seus pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={64} color="#ccc" />
          <p>Você ainda não realizou nenhum pedido.</p>
          <Link href="/" className={styles.button}>
            Começar a comprar
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderInfo}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>
                    Pedido #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className={styles.orderDate}>
                    <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className={styles.orderStatus}>
                  <CheckCircle 
                    size={16} 
                    color={order.status === "PAGO" ? "#27ae60" : "#f39c12"} 
                  />
                  <span className={`${styles.statusText} ${styles[order.status.toLowerCase()] || ""}`}>
                    {order.status}
                  </span>
                </div>

                <p className={styles.orderSummary}>
                  {order.items?.length || 0} {(order.items?.length === 1) ? 'item' : 'itens'} no pedido
                </p>
              </div>

              <div className={styles.orderTotal}>
                <div className={styles.priceTag}>
                   <span>Total:</span>
                   <strong>R$ {order.total.toFixed(2)}</strong>
                </div>
                <ChevronRight size={20} color="#999" />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}