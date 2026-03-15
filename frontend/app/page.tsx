"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function WalletIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1976D2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Erro ao fazer login.");
        return;
      }

      router.push("/dashboard-metricas");
      router.refresh();
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
      <main className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-3xl bg-[#E3F2FD]">
            <WalletIcon />
          </div>
          <h1 className="text-2xl font-bold text-[#263238]">
            Controle Financeiro
          </h1>
          <p className="mt-2 text-[15px] text-[#666]">
            Painel de Configuração — Digite a senha para acessar o painel de configuração
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#37474F]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-[#E0E0E0] bg-white px-4 py-3.5 text-base text-[#263238] placeholder-[#999] focus:border-[#1976D2] focus:outline-none focus:ring-1 focus:ring-[#1976D2]"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg bg-[#FFEBEE] p-3 text-center text-sm text-[#C62828]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-[#1976D2] px-4 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </main>
    </div>
  );
}
