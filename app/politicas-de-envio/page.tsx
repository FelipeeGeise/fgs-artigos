/* eslint-disable react/no-unescaped-entities */
// app/politicas-de-envio/page.tsx
import styles from "./Politicas.module.css";

export default function PoliticasEnvio() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Políticas de Envio e Entrega</h1>
      
      <section className={styles.section}>
        <h2>1. Origem dos Produtos</h2>
        <p>
          Para oferecer uma curadoria exclusiva de Bíblias e artigos cristãos com o melhor custo-benefício, 
          a <strong>FG's Store</strong> utiliza um modelo de logística descentralizada. Seus pedidos são 
          enviados diretamente de nossos centros de distribuição e parceiros logísticos nacionais.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Sobre a Documentação Fiscal (NF)</h2>
        <p>
          Conforme as normas de intermediação de negócios, o documento que acompanha o transporte físico 
          do seu pedido pode ser uma <strong>Declaração de Conteúdo</strong> ou nota simplificada de origem. 
        </p>
        <p className={styles.alert}>
          <strong>Nota importante:</strong> A Nota Fiscal de Venda referente ao valor pago em nosso site 
          é emitida pela nossa administradora e enviada para o seu e-mail de cadastro. O documento fixado 
          à caixa serve apenas para fins de fiscalização de transporte entre o centro de distribuição e sua residência.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Prazo de Processamento</h2>
        <p>
          Após a confirmação do pagamento (PIX), levamos de 1 a 3 dias úteis para processar, embalar e 
          despachar seu pedido. O código de rastreio será enviado via WhatsApp assim que disponível.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Compromisso com o Cliente</h2>
        <p>
          Garantimos a entrega de todos os pedidos. Caso haja qualquer divergência ou dúvida sobre o 
          documento recebido com seu pacote, entre em contato conosco imediatamente pelo WhatsApp. 
          Estamos aqui para servir você com transparência e verdade.
        </p>
      </section>
      
      <p className={styles.verse}>
        <em>"Onde não há conselhos os projetos saem vãos, mas com a multidão de conselheiros se confirmam." - Provérbios 15:22</em>
      </p>
    </main>
  );
}