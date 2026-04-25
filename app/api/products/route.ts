import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tipagem para o corpo da requisição
interface ProductInput {
  name: string;
  category: string;
  image: string;
  price: string | number;
  costPrice?: string | number;
  supplierUrl?: string;
  sku?: string;
}

/**
 * [GET] - LISTAR PRODUTOS
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);
    return NextResponse.json({ error: "Erro ao carregar catálogo" }, { status: 500 });
  }
}

/**
 * [POST] - CADASTRAR PRODUTO
 */
export async function POST(req: Request) {
  try {
    const body: ProductInput = await req.json();

    // 1. Tratamento de Preços (converte vírgula para ponto e garante que seja número)
    const formattedPrice = typeof body.price === "string" 
      ? parseFloat(body.price.replace(",", ".")) 
      : Number(body.price);

    const formattedCostPrice = typeof body.costPrice === "string"
      ? parseFloat(body.costPrice.replace(",", "."))
      : Number(body.costPrice || 0);

    // 2. Geração de SKU (Obrigatório pelo seu Schema)
    // Se não vier no body, cria um baseado no timestamp
    const generatedSku = body.sku || `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        image: body.image,
        sku: generatedSku, // ✅ Resolve o erro de propriedade ausente
        price: formattedPrice,
        costPrice: formattedCostPrice,
        supplierUrl: body.supplierUrl || "",
        active: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return NextResponse.json(
      { error: "Erro ao salvar no banco. Verifique os campos obrigatórios." }, 
      { status: 500 }
    );
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

    return NextResponse.json({ message: "Removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}