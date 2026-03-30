/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import styles from "./Footer.module.css";
import { FaInstagram, FaEnvelope, FaWhatsapp } from "react-icons/fa"; // Precisa instalar react-icons

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Coluna 1: Sobre */}
        <div className={styles.column}>
          <h3 className={styles.logo}>FG's Store</h3>
          <p className={styles.description}>
            Sua livraria cristã de confiança. Levando a palavra e o conhecimento 
            diretamente para o seu lar com excelência e carinho.
          </p>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className={styles.column}>
          <h4>Links Úteis</h4>
          <ul className={styles.links}>
            <li><Link href="/">Início</Link></li>
            <li><Link href="/politicas-de-envio">Políticas de Envio</Link></li>
            <li><Link href="/contato">Fale Conosco</Link></li>
          </ul>
        </div>

        {/* Coluna 3: Atendimento */}
        <div className={styles.column}>
          <h4>Atendimento</h4>
          <div className={styles.contactItem}>
          <FaWhatsapp className={styles.icon} />
          <span>(81) 99959-9815</span>
        </div>
          <div className={styles.contactItem}>
            <FaEnvelope className={styles.icon} />
            <span>contato@fgstore.com.br</span>
          </div>
          <div className={styles.socials}>
            <Link href="https://instagram.com/seuusuario" target="_blank">
              <FaInstagram />
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} FG's Store - Todos os direitos reservados.</p>
        <p className={styles.smallText}>
          Os produtos podem ser enviados de centros de distribuição parceiros. 
          Consulte nossas <Link href="/politicas-de-envio">políticas</Link>.
        </p>
      </div>
    </footer>
  );
}