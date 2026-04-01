"use server";

import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

// --- INTERFACES DE TIPAGEM ---
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

interface MercadoPagoErrorResponse {
  message?: string;
  cause?: Array<{ description: string }>;
}

/**
 * ACTION: Criar Pedido no Prisma e Gerar PIX no Mercado Pago
 */
export async function createOrderAction(
  customerData: OrderCustomerInput, 
  cartItems: OrderItemInput[], 
  total: number
) {
  // 1️⃣ CAPTURA E LIMPEZA DO NOVO TOKEN (TEST-)
  const mpToken = (process.env.MP_ACCESS_TOKEN || "").trim();

  console.log("--- INICIANDO PROCESSAMENTO DE PEDIDO (MODO TESTE) ---");
  console.log("Token lido:", mpToken.substring(0, 20) + "..."); 

  if (!mpToken || mpToken.length < 20) {
    return { 
      success: false, 
      error: "O servidor não encontrou o Token de Teste no .env.local" 
    };
  }

  try {
    // 2️⃣ INICIALIZAÇÃO DO MERCADO PAGO
    const client = new MercadoPagoConfig({ accessToken: mpToken });
    const payment = new Payment(client);
    
    // 3️⃣ TRATAMENTO DE DADOS
    const cleanCPF = customerData.cpf.replace(/\D/g, "");
    const cleanPhone = customerData.whatsapp.replace(/\D/g, "");
    const firstName = customerData.nome.split(" ")[0] || "Cliente";

    // 4️⃣ SOLICITAR PAGAMENTO (PIX)
    const paymentResponse = await payment.create({
      body: {
        transaction_amount: Number(total.toFixed(2)), 
        description: `Pedido FG'S Store - Teste PIX`,
        payment_method_id: "pix",
        installments: 1,
        payer: {
          email: customerData.email.trim(),
          first_name: firstName,
          identification: {
            type: "CPF",
            number: cleanCPF,
          },
        },
      },
    });

    const pixData = paymentResponse.point_of_interaction?.transaction_data;

    if (!pixData) {
      throw new Error("O Mercado Pago não retornou os dados do PIX.");
    }

    // 5️⃣ SALVAR NO BANCO DE DADOS (PRISMA / SUPABASE)
    const order = await prisma.order.create({
      data: {
        customerName: customerData.nome,
        cpf: cleanCPF, 
        whatsapp: cleanPhone,
        email: customerData.email,
        cep: customerData.cep,
        logradouro: customerData.logradouro,
        numero: customerData.numero,
        bairro: customerData.bairro,
        cidade: customerData.cidade,
        uf: customerData.uf,
        total: Number(total),
        status: "AGUARDANDO_PAGAMENTO",
        paymentId: String(paymentResponse.id),
        
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

    console.log(`✅ Sucesso! Pedido #${order.id} gerado em Modo Teste.`);

    return { 
      success: true, 
      orderId: order.id,
      pixCopyPaste: pixData.qr_code, 
      pixQRCodeBase64: pixData.qr_code_base64 
    };

  } catch (error: unknown) {
    const err = error as MercadoPagoErrorResponse;
    console.error("🚨 ERRO DETALHADO NO MERCADO PAGO:", err);
    
    return { 
      success: false, 
      error: err.message || "Erro ao gerar PIX em Modo Teste." 
    };
  }
}