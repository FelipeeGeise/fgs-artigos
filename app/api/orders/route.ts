import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Interface ajustada para bater com o seu formulário de checkout
interface OrderRequestBody {
  customerName: string;
  cpf: string;
  whatsapp: string;
  email: string;
  // Endereço detalhado conforme seu Schema
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  // Financeiro
  total: number; 
  items: {
    id: string; // productId
    name: string;
    price: number;
    quantity: number;
  }[];
}

/**
 * [POST] - CRIAR PEDIDO
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderRequestBody;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // Criando o pedido exatamente com os nomes do seu Schema.prisma
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

    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("❌ Erro Prisma:", message);
    return NextResponse.json({ error: "Erro ao salvar pedido no banco" }, { status: 500 });
  }
}

/**
 * [GET] - LISTAR PEDIDOS (ADMIN)
 */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch {
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
  } catch {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}