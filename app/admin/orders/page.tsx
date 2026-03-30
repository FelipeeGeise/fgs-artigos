"use client";

import { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";

// 1. Interfaces alinhadas com o novo esquema de Dropshipping do Prisma
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string; // Nome vindo do formulário
  email: string;        // E-mail para rastreio
  cpf: string;          // Necessário para fornecedor/NF
  whatsapp: string;     // Contato direto
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  total: number;
  status: string;       // Ex: "Aguardando PIX"
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // 2. Busca de pedidos na API (Optional Catch Binding para evitar erros de 'error' unused)
  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch {
      console.error("Erro na busca de pedidos do banco.");
    } finally {
      setLoading(false);
    }
  }

  // 3. Persistência da sessão administrativa
  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (isAuth === "true") {
      setAuthenticated(true);
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, []);

  // 4. Login administrativo
  async function handleLogin() {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: passwordInput }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setAuthenticated(true);
        localStorage.setItem("admin_auth", "true");
        fetchOrders();
      } else {
        alert("Senha incorreta!");
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    }
  }

  // 5. Exclusão de registro (Limpeza de banco)
  async function handleDelete(id: string) {
    if (!confirm("Deseja remover este registro permanentemente?")) return;
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter(order => order.id !== id));
      }
    } catch {
      alert("Erro ao tentar excluir o pedido.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_auth");
    window.location.reload();
  }

  if (loading) return <p className={styles.loading}>Carregando painel...</p>;

  // --- TELA DE LOGIN ---
  if (!authenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>🔒 Área do Pastor / Admin</h1>
          <p>Gerenciamento de pedidos e entregas.</p>
          <input 
            type="password" 
            placeholder="Senha Mestre"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className={styles.input}
          />
          <button onClick={handleLogin} className={styles.button}>Entrar no Painel</button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD DE PEDIDOS ---
  return (
    <div className={styles.container}>
      <header className={styles.adminHeader}>
         <h1 className={styles.title}>📦 Gestão de Pedidos</h1>
         <button onClick={handleLogout} className={styles.logoutButton}>
           Sair com Segurança
         </button>
      </header>
      
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Ainda não há pedidos registrados no banco de dados.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {orders.map((order) => (
            <div key={order.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>
                  {new Date(order.createdAt).toLocaleString('pt-BR')}
                </span>
                <span className={styles.statusBadge}>{order.status}</span>
              </div>

              <div className={styles.clientBox}>
                <h3>Dados do Cliente</h3>
                <p><strong>Nome:</strong> {order.customerName}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>CPF:</strong> {order.cpf}</p>
                <p><strong>WhatsApp:</strong> 
                  <a 
                    href={`https://wa.me/55${order.whatsapp.replace(/\D/g, "")}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.whatsappLink}
                  >
                     Chamar Cliente
                  </a>
                </p>
                
                <hr className={styles.divider} />
                
                <h3>Endereço para Fornecedor</h3>
                <p>{order.logradouro}, nº {order.numero}</p>
                <p>{order.bairro} - {order.cidade} / {order.uf}</p>
                <p className={styles.cepHighlight}>CEP: {order.cep}</p>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Artigo</th>
                    <th>Qtd</th>
                    <th>Preço Un.</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>R$ {item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.cardFooter}>
                <div className={styles.totalBox}>
                  <span>VALOR TOTAL</span>
                  <h3>R$ {order.total.toFixed(2)}</h3>
                </div>
                <button 
                  onClick={() => handleDelete(order.id)} 
                  className={styles.deleteButton}
                >
                  Excluir Registro
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}