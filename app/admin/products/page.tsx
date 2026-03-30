/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import styles from "./AdminProducts.module.css";

// Interface atualizada para suportar os campos de Dropshipping
interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;    // Preço de custo no fornecedor
  supplierUrl: string;  // Link do produto na Shopee/AliExpress
  image: string;
  category: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    name: "", 
    price: "", 
    costPrice: "",      // Novo campo no form
    supplierUrl: "",    // Novo campo no form
    image: "/imagens/products/", 
    category: "biblias" 
  });

  // 1. Carregar produtos existentes (GET)
  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Falha ao buscar produtos");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      console.error("Erro ao carregar catálogo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // 2. Salvar Novo Produto (POST)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price.replace(",", ".")),
          costPrice: parseFloat(form.costPrice.replace(",", ".")),
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        alert("✅ Artigo cadastrado com sucesso!");
        setForm({ 
          name: "", price: "", costPrice: "", 
          supplierUrl: "", image: "/imagens/products/", category: "biblias" 
        });
        loadProducts();
      } else {
        throw new Error();
      }
    } catch {
      alert("Erro ao cadastrar produto. Verifique os dados.");
    }
  }

  // 3. Excluir Produto (DELETE)
  async function handleDelete(id: string) {
    if (!confirm("Remover este item do catálogo definitivamente?")) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch {
      alert("Erro ao remover produto.");
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel de Inventário FG's</h1>
      
      <div className={styles.formCard}>
        <h2 className={styles.subtitle}>Novo Cadastro</h2>
        <form onSubmit={handleSubmit} className={styles.formGroup}>
          <label className={styles.label}>Nome do Produto</label>
          <input 
            className={styles.input}
            placeholder="Ex: Bíblia de Estudo Luxo" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />

          <div className={styles.row}>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Preço de Venda (Loja)</label>
              <input 
                className={styles.input}
                placeholder="0.00"
                value={form.price} 
                onChange={e => setForm({...form, price: e.target.value})} 
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Preço de Custo (Fornecedor)</label>
              <input 
                className={styles.input}
                placeholder="0.00"
                value={form.costPrice} 
                onChange={e => setForm({...form, costPrice: e.target.value})} 
                required 
              />
            </div>
          </div>

          <label className={styles.label}>URL do Fornecedor</label>
          <input 
            className={styles.input}
            placeholder="Link da Shopee, AliExpress ou Distribuidor" 
            value={form.supplierUrl} 
            onChange={e => setForm({...form, supplierUrl: e.target.value})} 
            required 
          />

          <div className={styles.row}>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Categoria</label>
              <select 
                className={styles.select}
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option value="biblias">Bíblias</option>
                <option value="livros">Livros</option>
                <option value="devocionais">Devocionais</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Caminho da Imagem</label>
              <input 
                className={styles.input}
                value={form.image} 
                onChange={e => setForm({...form, image: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button type="submit" className={styles.saveButton}>
            Salvar no Catálogo
          </button>
        </form>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.subtitle}>Catálogo Ativo</h2>
        {loading ? <p>Carregando...</p> : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Venda</th>
                  <th>Custo</th>
                  <th>Lucro</th>
                  <th>Fornecedor</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const lucro = product.price - (product.costPrice || 0);
                  return (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>R$ {Number(product.price).toFixed(2)}</td>
                      <td>R$ {Number(product.costPrice || 0).toFixed(2)}</td>
                      <td style={{ color: lucro > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                        R$ {lucro.toFixed(2)}
                      </td>
                      <td>
                        <a href={product.supplierUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          Abrir Link
                        </a>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(product.id)} className={styles.deleteButton}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}