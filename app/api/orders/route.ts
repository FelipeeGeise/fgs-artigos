import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from 'mercadopago';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 1. Configuração do Cliente Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

interface OrderRequestBody {
  customerName: string;
  cpf: string;
  whatsapp: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  total: number; 
  items: {
    id: string; 
    name: string;
    price: number;
    quantity: number;
  }[];
}

/**
 * [POST] - CRIAR PEDIDO E GERAR PIX
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderRequestBody;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // A. SALVAR NO BANCO DE DADOS (PRISMA/SUPABASE)
    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        cpf: body.cpf,
        whatsapp: body.whatsapp,
        email: body.email,
        cep: body.cep,
        logradouro: body.logradouro,
        numero: body.numero,
        bairro: body.bairro,
        cidade: body.cidade,
        uf: body.uf,
        total: Number(body.total),
        status: "PENDENTE",
        items: {
          create: body.items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: { items: true },
    });

    // B. GERAR O PAGAMENTO NO MERCADO PAGO
    const payment = new Payment(client);

    const paymentResponse = await payment.create({
      body: {
        transaction_amount: Number(body.total),
        description: `Pedido #${order.id} - FGS Artigos`,
        payment_method_id: 'pix',
        payer: {
          email: body.email,
          first_name: body.customerName.split(' ')[0],
          identification: {
            type: 'CPF',
            number: body.cpf.replace(/\D/g, ''), 
          },
        },
        date_of_expiration: new Date(Date.now() + 30 * 60000).toISOString(), 
      },
    });

    // C. RESPOSTA DE SUCESSO PARA O FRONT-END
    return NextResponse.json({
      orderId: order.id,
      pix: {
        copy_paste: paymentResponse.point_of_interaction?.transaction_data?.qr_code,
        qrcode_base64: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      }
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Erro no Processamento:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

/**
 * [GET] - LISTAR PEDIDOS
 */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error("❌ Erro ao buscar pedidos:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}

/**
 * [DELETE] - EXCLUIR PEDIDO
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });

    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ message: "Pedido excluído" });
  } catch (error: unknown) {
    console.error("❌ Erro ao excluir pedido:", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}