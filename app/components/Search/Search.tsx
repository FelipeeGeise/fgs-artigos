"use client"

import { useState } from "react"
import { Search as SearchIcon } from "lucide-react" // ✅ Usando ícone da biblioteca para ficar profissional
import styles from "./Search.module.css"

type SearchProps = {
  onSearch: (query: string) => void
}

export default function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    onSearch(value) // Avisa o Products.tsx para filtrar na hora
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        
        {/* Ícone posicionado via CSS */}
        <SearchIcon size={20} className={styles.icon} />

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="O que você está procurando hoje?"
          className={styles.input}
        />
      </div>
    </div>
  )
}