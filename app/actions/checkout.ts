"use server";

import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

// --- INTERFACES ---
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

export async function createOrderAction(
  customerData: OrderCustomerInput,
  cartItems: OrderItemInput[],
  total: number
) {
  const mpToken = (process.env.MP_ACCESS_TOKEN || "").trim();

  if (!mpToken) {
    return {
      success: false,
      error: "Token do Mercado Pago não configurado.",
    };
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: mpToken });
    const payment = new Payment(client);

    const cleanCPF = customerData.cpf.replace(/\D/g, "");
    const cleanPhone = customerData.whatsapp.replace(/\D/g, "");
    const firstName = customerData.nome.split(" ")[0] || "Cliente";

    // 🔥 BUSCA PRODUTOS NO BANCO PARA PEGAR SKU REAL
    const itemsWithSku = await Promise.all(
      cartItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: String(item.id) },
        });

        return {
          productId: String(item.id),
          sku: product?.sku || "SEM-SKU",
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity || 1),
        };
      })
    );

    // 💳 CRIAR PIX NO MERCADO PAGO
    const paymentResponse = await payment.create({
      body: {
        transaction_amount: Number(total.toFixed(2)),
        description: `Pedido FG'S Store - PIX`,
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

    const pixData =
      paymentResponse.point_of_interaction?.transaction_data;

    if (!pixData) {
      throw new Error("PIX não retornado pelo Mercado Pago.");
    }

    // 💾 SALVAR PEDIDO NO BANCO
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
        status: "PENDENTE",
        paymentId: String(paymentResponse.id),

        items: {
          create: itemsWithSku,
        },
      },
    });

    return {
      success: true,
      orderId: order.id,
      pixCopyPaste: pixData.qr_code,
      pixQRCodeBase64: pixData.qr_code_base64,
    };
  } catch (error: unknown) {
    const err = error as MercadoPagoErrorResponse;

    console.error("ERRO PIX:", err);

    return {
      success: false,
      error: err.message || "Erro ao gerar PIX.",
    };
  }
}