import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Tenta ler o corpo da requisição
    const body = await request.json();
    
    // O Mercado Pago envia o ID de formas diferentes conforme a versão da API
    const paymentId = body.data?.id || body.id;
    const action = body.action || body.type; 

    console.log(`--- WEBHOOK MP: Ação ${action} | ID: ${paymentId} ---`);

    // 2. Só processamos se houver um ID de pagamento
    if (paymentId && (action === "payment" || action === "payment.created" || action === "payment.updated")) {
      
      const mpToken = (process.env.MP_ACCESS_TOKEN || "").trim();
      
      // 3. Consulta o status real no Mercado Pago por segurança
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${mpToken}`,
        },
      });

      if (!response.ok) {
        console.error(`🚨 Erro na API do MP ao consultar ID: ${paymentId}`);
        return new NextResponse("Erro na consulta", { status: 200 });
      }

      const paymentData = await response.json();

      // 4. Se o pagamento estiver aprovado, atualiza o banco
      if (paymentData.status === "approved") {
        await prisma.order.updateMany({
          where: {
            paymentId: String(paymentId),
            NOT: { status: "PAGO" } // Evita processar o que já está pago
          },
          data: {
            status: "PAGO",
          },
        });
        
        console.log(`✅ Pedido ${paymentId} atualizado para PAGO no banco.`);
      }
    }

    // Retornamos 200 para o Mercado Pago parar de enviar a mesma notificação
    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Erro no processamento do Webhook:", error);
    return new NextResponse("Erro interno", { status: 200 });
  }
}