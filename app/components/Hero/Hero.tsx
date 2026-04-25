
"use client"

import styles from "./Hero.module.css"

export default function Hero() {

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
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
        
        {/* ESSA DIV ABAIXO É A CHAVE PARA FICAR UM ABAIXO DO OUTRO */}
        <div className={styles.content}>
          <p className={styles.author}>Pr. Lucas Mendes</p>
          
          <h1 className={styles.title}>
            VIVA COM <br/> PROPÓSITO
          </h1>

          <p className={styles.subtitle}>
            O Guia Essencial para uma Vida com Cristo!
          </p>

          <button 
            type="button" 
            className={styles.button} 
            onClick={scrollToProducts}
          >
            COMPRAR AGORA
          </button>
        </div>

        {/* Setas meramente visuais para bater com a imagem */}
        <span className={`${styles.arrow} ${styles.arrowLeft}`}>‹</span>
        <span className={`${styles.arrow} ${styles.arrowRight}`}>›</span>

      </div>
    </section>
  )
}