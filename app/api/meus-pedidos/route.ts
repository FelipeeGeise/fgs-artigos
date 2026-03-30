import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Validação de segurança básica
    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    // Busca apenas os pedidos vinculados a este e-mail no Supabase
    const orders = await prisma.order.findMany({
      where: {
        email: email,
      },
      include: {
        items: true, // Inclui os itens para o cliente saber o que comprou
      },
      orderBy: {
        createdAt: "desc", // O mais recente primeiro
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos do cliente:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}