"use server";

import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configuração do Mercado Pago com o seu Token do .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || "" 
});

export interface OrderCustomerInput {
  nome: string;
  cpf: string;
  whatsapp: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface OrderItemInput {
  id: string | number;
  name: string;
  price: number;
  quantity?: number;
}

export async function createOrderAction(
  customerData: OrderCustomerInput, 
  cartItems: OrderItemInput[], 
  total: number
) {
  try {
    // --- PASSO 1: GERAR O PAGAMENTO NO MERCADO PAGO ---
    const payment = new Payment(client);
    
    const paymentResponse = await payment.create({
      body: {
        transaction_amount: total,
        description: `Pedido FG'S Store - ${customerData.nome}`,
        payment_method_id: "pix",
        payer: {
          email: customerData.email,
          identification: {
            type: "CPF",
            number: customerData.cpf.replace(/\D/g, ""), // Limpa pontos e traços
          },
        },
      },
    });

    const pixData = paymentResponse.point_of_interaction?.transaction_data;

    // --- PASSO 2: SALVAR NO BANCO DE DADOS (PRISMA) ---
    const order = await prisma.order.create({
      data: {
        customerName: customerData.nome,
        cpf: customerData.cpf,
        whatsapp: customerData.whatsapp,
        email: customerData.email,
        cep: customerData.cep,
        logradouro: customerData.logradouro,
        numero: customerData.numero,
        bairro: customerData.bairro,
        cidade: customerData.cidade,
        uf: customerData.uf,
        total: total,
        status: "AGUARDANDO_PAGAMENTO",
        paymentId: String(paymentResponse.id), // Salvamos o ID do MP para o Webhook
        
        items: {
          create: cartItems.map((item) => ({
            productId: String(item.id),
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity || 1),
          })),
        },
      },
    });

    // Retornamos o sucesso e os dados do PIX para o Front-end
    return { 
      success: true, 
      orderId: order.id,
      pixCopyPaste: pixData?.qr_code, // Código Copia e Cola
      pixQRCodeBase64: pixData?.qr_code_base64 // Imagem do QR Code
    };

  } catch (error) {
    console.error("Erro ao gerar pedido/pix:", error);
    return { success: false, error: "Falha ao processar pagamento via PIX." };
  }
}