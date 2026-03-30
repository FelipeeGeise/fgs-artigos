import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * [GET] - LISTAR PRODUTOS (VITRINE & ADMIN)
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    // ✅ Retorna o array de produtos (mesmo que vazio [])
    return NextResponse.json(products);
  } catch {
    // ✅ Removido o (error) para evitar o aviso do TS
    return NextResponse.json({ error: "Erro ao carregar catálogo" }, { status: 500 });
  }
}

/**
 * [POST] - CADASTRAR PRODUTO (DROPSHIPPING)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Sincronizado com o novo Schema: Removido 'stock', adicionado 'costPrice' e 'supplierUrl'
    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        image: body.image,
        // Conversão segura de preços
        price: parseFloat(body.price.toString().replace(",", ".")),
        costPrice: parseFloat(body.costPrice?.toString().replace(",", ".") || "0"),
        supplierUrl: body.supplierUrl || "",
        active: true, // Garante que o produto nasce visível
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Erro ao salvar no banco. Verifique os campos." }, { status: 500 });
  }
}

/**
 * [DELETE] - REMOVER PRODUTO
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Removido!" });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}