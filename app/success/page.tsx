"use client"

import { useRouter } from "next/navigation"

export default function SuccessPage() {
  const router = useRouter()

  return (
    <div style={{
      padding: "60px",
      textAlign: "center"
    }}>
      <h1>✅ Pedido realizado com sucesso!</h1>

      <p style={{ marginTop: "10px" }}>
        Em breve você receberá as instruções no seu email.
      </p>

      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer"
        }}
        onClick={() => router.push("/")}
      >
        Voltar para a loja
      </button>
    </div>
  )
}