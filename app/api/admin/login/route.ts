import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // A senha que você definiu no seu arquivo .env
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Verificação de segurança
    if (password === adminPassword) {
      // Se a senha estiver certa, retornamos um "OK"
      return NextResponse.json({ authenticated: true });
    }

    // Se a senha estiver errada, retornamos 401 (Não autorizado)
    return NextResponse.json(
      { authenticated: false, message: "Senha incorreta" }, 
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno no servidor de login" }, 
      { status: 500 }
    );
  }
}