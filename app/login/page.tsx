"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./login.module.css"
import { Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui entrará a lógica de autenticação no futuro
    alert("Funcionalidade de login em desenvolvimento!")
  }

  return (
    <main className={styles.main}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Bem-vindo de volta</h1>
          <p>Acesse sua conta para ver seus pedidos</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <div className={styles.inputWrapper}>
              <Mail size={20} />
              <input 
                id="email"
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <div className={styles.inputWrapper}>
              <Lock size={20} />
              <input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className={styles.loginButton}>
            Entrar <ArrowRight size={20} />
          </button>
        </form>

        <div className={styles.footer}>
          <p>Não tem uma conta? <Link href="/cadastro">Cadastre-se</Link></p>
          <Link href="/" className={styles.backHome}>Voltar para a loja</Link>
        </div>
      </div>
    </main>
  )
}