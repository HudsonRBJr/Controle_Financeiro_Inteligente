import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "config_session";
const COOKIE_MAX_AGE = 60 * 60; // 1 hora

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.PASSWORD_CONFIGURATION;
    if (!expectedPassword) {
      return NextResponse.json(
        { message: "Configuração de senha não definida." },
        { status: 500 }
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json(
        { message: "Senha incorreta." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Erro ao processar requisição." },
      { status: 400 }
    );
  }
}
