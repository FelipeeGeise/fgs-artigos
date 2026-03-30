/* eslint-disable react/no-unescaped-entities */
"use client"

import styles from "./Hero.module.css"

export default function Hero() {

  // Função para rolar suavemente até a seção de produtos
  const scrollToProducts = () => {
    const productsSection = document.getElementById("products");
    
    if (productsSection) {
      // Calculamos a posição do elemento menos a altura do header (aprox 80px)
      // para o título não ficar escondido atrás do menu fixo.
      const headerOffset = 80;
      const elementPosition = productsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>

        <h1 className={styles.title}>
          <span className={styles.highlight}>FG's</span> — Tesouros para sua jornada
        </h1>

        <p className={styles.subtitle}>
          Explore nosso catálogo de bíblias, livros e devocionais
        </p>

        {/* Botão configurado para disparar o scroll suave */}
        <button 
          type="button" 
          className={styles.button} 
          onClick={scrollToProducts}
        >
          Ver produtos
        </button>

      </div>
    </section>
  )
}