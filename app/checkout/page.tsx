"use client";

import { useState } from "react";
import { useCart, CustomerData } from "../context/CartContext";
import { createOrderAction } from "../actions/checkout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Checkout.module.css";
import Image from "next/image";

// Interface para tipar o retorno da Server Action
interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
  pixCopyPaste?: string;
  pixQRCodeBase64?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, finalizeOrder } = useCart();
  
  // ✅ Estado de carregamento (isSubmitting agora é lido no botão)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Estados para o Modal do PIX
  const [showModal, setShowModal] = useState(false);
  const [pixData, setPixData] = useState<{ copyPaste: string; qrCode: string } | null>(null);

  // ✅ Estado do formulário (setFormData agora é lido nos inputs)
  const [formData, setFormData] = useState<CustomerData>({
    nome: "",
    cpf: "",
    whatsapp: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    email: ""
  });

  // Função para buscar endereço via CEP
  const checkCEP = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        }));
      } else {
        alert("CEP não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  // Máscara de CPF
  const handleCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setFormData({ ...formData, cpf: value.substring(0, 14) });
  };

  // Máscara de Telefone
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    setFormData({ ...formData, whatsapp: value.substring(0, 15) });
  };

  // Copiar código PIX
  const handleCopyPix = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      alert("Código PIX copiado com sucesso!");
    }
  };

  // ✅ Função principal (handleFinalizar agora é lida no onSubmit do form)
  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrderAction(formData, cart, total) as CheckoutResult;

      if (!result.success) {
        throw new Error(result.error || "Erro ao processar pedido.");
      }

      localStorage.setItem("user_email", formData.email);

      if (result.pixCopyPaste && result.pixQRCodeBase64) {
        setPixData({
          copyPaste: result.pixCopyPaste,
          qrCode: result.pixQRCodeBase64
        });
        setShowModal(true);
      } else {
        router.push("/pedidos");
      }

      finalizeOrder(formData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro inesperado.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Finalizar Pedido</h2>

      {/* ✅ onSubmit conectado corretamente */}
      <form onSubmit={handleFinalizar} className={styles.form}>
        <div className={styles.section}>
          <h3>Dados Pessoais</h3>
          <input
            placeholder="Nome Completo"
            required
            value={formData.nome}
            onChange={e => setFormData({ ...formData, nome: e.target.value })}
          />
          <input
            type="email"
            placeholder="E-mail"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <div className={styles.row}>
            <input placeholder="CPF" required value={formData.cpf} onChange={handleCPF} />
            <input placeholder="WhatsApp" required value={formData.whatsapp} onChange={handlePhone} />
          </div>
        </div>

        <div className={styles.section}>
          <h3>Endereço de Entrega</h3>
          <input
            placeholder="CEP"
            required
            maxLength={8}
            onBlur={checkCEP}
            value={formData.cep}
            onChange={e => setFormData({ ...formData, cep: e.target.value.replace(/\D/g, "") })}
          />
          <input
            placeholder="Rua / Logradouro"
            required
            value={formData.logradouro}
            onChange={e => setFormData({ ...formData, logradouro: e.target.value })}
          />
          <div className={styles.row}>
            <input
              placeholder="Número"
              required
              value={formData.numero}
              onChange={e => setFormData({ ...formData, numero: e.target.value })}
            />
            <input
              placeholder="Bairro"
              required
              value={formData.bairro}
              onChange={e => setFormData({ ...formData, bairro: e.target.value })}
            />
          </div>
          <div className={styles.row}>
            <input placeholder="Cidade" readOnly className={styles.disabledInput} value={formData.cidade} />
            <input placeholder="UF" readOnly className={styles.disabledInput} value={formData.uf} />
          </div>
        </div>

        <div className={styles.resumo}>
          <p className={styles.politicaAviso}>
            Ao finalizar, você aceita nossas{" "}
            {/* ✅ Link lido corretamente */}
            <Link href="/politicas-de-envio" target="_blank" className={styles.politicaLink}>
              Políticas de Entrega
            </Link>.
          </p>
          <p className={styles.totalText}>Total: <strong>R$ {total.toFixed(2)}</strong></p>
          
          {/* ✅ isSubmitting lido corretamente */}
          <button type="submit" className={styles.btnFinalizar} disabled={isSubmitting}>
            {isSubmitting ? "Gerando PIX..." : "Pagar via PIX"}
          </button>
        </div>
      </form>

      {/* MODAL DO PIX */}
      {showModal && pixData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Pedido Reservado! 🚀</h3>
            <p>Escaneie o QR Code abaixo:</p>

            <div className={styles.qrCodeContainer}>
              <Image
                src={`data:image/png;base64,${pixData.qrCode}`}
                alt="QR Code PIX"
                width={250}
                height={250}
                priority
              />
            </div>

            <div className={styles.copyArea}>
              <p>Ou copie o código:</p>
              <div className={styles.copyInput}>
                {pixData.copyPaste.substring(0, 30)}...
              </div>
              <button onClick={handleCopyPix} className={styles.btnCopy}>
                Copiar Código PIX
              </button>
            </div>

            <button onClick={() => router.push("/pedidos")} className={styles.btnIrPedidos}>
              Ver Meus Pedidos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}