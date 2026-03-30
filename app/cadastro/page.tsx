"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "../login/login.module.css" 
import { Mail, Lock, User, ArrowRight } from "lucide-react" // ✅ ArrowLeft removido daqui

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Funcionalidade de cadastro em desenvolvimento!")
  }

  return (
    <main className={styles.main}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Crie sua conta</h1>
          <p>Faça seu cadastro para gerenciar seus pedidos</p>
        </div>

        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nome Completo</label>
            <div className={styles.inputWrapper}>
              <User size={20} />
              <input 
                id="name"
                type="text" 
                placeholder="Seu nome" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

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
                placeholder="Crie uma senha forte" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className={styles.loginButton}>
            Cadastrar <ArrowRight size={20} />
          </button>
        </form>

        <div className={styles.footer}>
          <p>Já tem uma conta? <Link href="/login">Faça login</Link></p>
          <Link href="/" className={styles.backHome}>Voltar para a loja</Link>
        </div>
      </div>
    </main>
  )
}