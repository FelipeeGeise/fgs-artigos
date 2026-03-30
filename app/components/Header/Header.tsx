/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Search, User, Menu, X, LogIn, Package, Heart } from "lucide-react"
import { CartContext } from "../../context/CartContext"
import styles from "./Header.module.css"

export default function Header() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cartContext = useContext(CartContext)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null) // ✅ Ref para focar no input ao abrir

  const queryFromUrl = searchParams.get("q") || ""

  const [searchValue, setSearchValue] = useState(queryFromUrl)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    setSearchValue(queryFromUrl)
  }, [queryFromUrl])

  // Lógica para focar o input automaticamente quando abrir a barra de busca
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!cartContext) return null
  const { cart } = cartContext

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const term = searchValue.trim()
    
    // ✅ Se o input estiver fechado, apenas abre
    if (!isSearchOpen) {
      setIsSearchOpen(true)
      return
    }

    // ✅ Se estiver aberto mas vazio, apenas fecha
    if (term === "") {
      setIsSearchOpen(false)
      router.push("/")
      return
    }

    // ✅ Se houver termo, pesquisa
    router.push(`/?q=${encodeURIComponent(term)}#products`)
    setIsSearchOpen(false)
  }

  const closeAll = () => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
    setIsSearchOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <button className={styles.menuButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <Link href="/" className={styles.logo} onClick={() => { setSearchValue(""); closeAll(); }}>
          <Image src="/imagens/logo.png" alt="Logo" width={42} height={42} priority />
          <span>FG's Livraria</span>
        </Link>

        {isMenuOpen && <div className={styles.overlay} onClick={closeAll} />}

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <Link href="/" onClick={closeAll}>Home</Link>
          <Link href="/?q=biblia#products" onClick={closeAll}>Bíblias</Link>
          <Link href="/?q=livro#products" onClick={closeAll}>Livros</Link>
        </nav>

        <div className={styles.actions}>
          {/* ✅ Formulário de Busca Corrigido */}
          <form 
            className={`${styles.searchForm} ${isSearchOpen ? styles.searchOpen : ""}`} 
            onSubmit={handleSearch}
          >
            <input 
              ref={inputRef} // ✅ Adicionado ref para foco
              type="text" 
              className={styles.searchInput}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar..."
            />
            <button 
              type="button" // ✅ Mudado para "button" para evitar submit acidental ao abrir
              className={styles.iconButton} 
              onClick={handleSearch} // ✅ Usa a mesma função tratada
            >
              <Search size={22} className={styles.icon} />
            </button>
          </form>

          <div className={styles.userContainer} ref={userMenuRef}>
            <button className={styles.iconButton} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} type="button">
              <User size={22} className={styles.icon} />
            </button>
            {isUserMenuOpen && (
              <div className={styles.userDropdown}>
                <p className={styles.userGreeting}>Bem-vindo! 👋</p>
                <hr className={styles.divider} />
                <Link href="/login" className={styles.userLink} onClick={closeAll}><LogIn size={18}/> Entrar</Link>
                <Link href="/pedidos" className={styles.userLink} onClick={closeAll}><Package size={18}/> Pedidos</Link>
                <Link href="/favoritos" className={styles.userLink} onClick={closeAll}><Heart size={18}/> Favoritos</Link>
              </div>
            )}
          </div>

          <Link href="/cart" className={styles.cart} onClick={closeAll}>
            <ShoppingCart size={22} className={styles.icon} />
            {cart.length > 0 && <span className={styles.badge}>{cart.length}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}