import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "config_session";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://31.97.168.45:3000";

async function ensureAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return !!session && session.value === "authenticated";
}

export async function GET(req: NextRequest) {
  const auth = await ensureAuthenticated();
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const days = req.nextUrl.searchParams.get("days") ?? "30";
    const res = await fetch(`${BACKEND_URL}/metrics/dashboard?days=${encodeURIComponent(days)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar dashboard de métricas." },
      { status: 500 }
    );
  }
}
