import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O Mercado Pago envia o ID do pagamento na notificação
    // Pode vir como body.data.id ou body.id dependendo da versão da API
    const paymentId = body.data?.id || body.id;

    if (paymentId) {
      // 1. Consultar o status real no Mercado Pago (Segurança contra fakes)
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao consultar Mercado Pago");
      }

      const paymentData = await response.json();

      // 2. Se o pagamento estiver aprovado
      if (paymentData.status === "approved") {
        // ✅ SOLUÇÃO PARA O ERRO DE TYPESCRIPT:
        // Como o paymentId não é @unique no seu schema, usamos updateMany
        await prisma.order.updateMany({
          where: {
            paymentId: String(paymentId),
          },
          data: {
            status: "PAGO",
          },
        });
        
        console.log(`✅ Status do pagamento ${paymentId} atualizado para PAGO.`);
      }
    }

    // Mercado Pago precisa receber status 200 para confirmar o recebimento
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Erro no Webhook:", error);
    // Retornamos 200 mesmo no erro para evitar que o MP fique reenviando infinitamente
    return new NextResponse("Erro Processado", { status: 200 });
  }
}