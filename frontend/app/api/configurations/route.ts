import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "config_session";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://31.97.168.45:3000";

async function ensureAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session || session.value !== "authenticated") {
    return false;
  }
  return true;
}

export async function GET() {
  const auth = await ensureAuthenticated();
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/configurations`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar configuração." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await ensureAuthenticated();
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/configurations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao criar configuração." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await ensureAuthenticated();
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/configurations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao atualizar configuração." },
      { status: 500 }
    );
  }
}
