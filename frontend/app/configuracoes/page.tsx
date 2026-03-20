"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Configuration = {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Configuration | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("http://31.97.168.45:3001/configurations");
      if (res.status === 401) {
        router.push("/");
        router.refresh();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
        setName(data.name);
        setDescription(data.description);
        setVersion(data.version);
      } else {
        if (res.status === 404) {
          setConfig(null);
          setName("");
          setDescription("");
          setVersion("");
        } else {
          setError(data.message ?? "Erro ao carregar configuração.");
        }
      }
    } catch {
      setError("Erro ao conectar. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, version }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Erro ao criar configuração.");
        return;
      }

      setConfig(data);
      setSuccess("Configuração criada com sucesso!");
    } catch {
      setError("Erro ao conectar. Verifique se o backend está rodando.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/configurations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, version }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Erro ao atualizar configuração.");
        return;
      }

      setConfig(data);
      setSuccess("Configuração atualizada com sucesso!");
    } catch {
      setError("Erro ao conectar. Verifique se o backend está rodando.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <p className="text-[#666]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="border-b border-[#E0E0E0] bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-[#263238]">
            Configuração do App
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard-metricas")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#1976D2] hover:bg-[#E3F2FD]"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#666] hover:bg-[#F5F5F5]"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <p className="mb-6 text-sm text-[#666]">
            Estas informações aparecem no app mobile. Altere e salve para atualizar.
          </p>

          <form
            onSubmit={config ? handleUpdate : handleCreate}
            className="space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#37474F]">
                Nome do sistema
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Controle Financeiro Inteligente"
                className="mt-2 w-full rounded-xl border border-[#E0E0E0] bg-white px-4 py-3.5 text-[#263238] placeholder-[#999] focus:border-[#1976D2] focus:outline-none focus:ring-1 focus:ring-[#1976D2]"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-[#37474F]">
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Sistema de controle financeiro pessoal"
                rows={3}
                className="mt-2 w-full rounded-xl border border-[#E0E0E0] bg-white px-4 py-3.5 text-[#263238] placeholder-[#999] focus:border-[#1976D2] focus:outline-none focus:ring-1 focus:ring-[#1976D2]"
                required
              />
            </div>

            <div>
              <label htmlFor="version" className="block text-sm font-semibold text-[#37474F]">
                Versão
              </label>
              <input
                id="version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ex: 1.0.0"
                className="mt-2 w-full rounded-xl border border-[#E0E0E0] bg-white px-4 py-3.5 text-[#263238] placeholder-[#999] focus:border-[#1976D2] focus:outline-none focus:ring-1 focus:ring-[#1976D2]"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-[#FFEBEE] p-3 text-sm text-[#C62828]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-[#E8F5E9] p-3 text-sm text-[#2E7D32]">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#1976D2] px-4 py-4 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {saving
                ? "Salvando..."
                : config
                  ? "Atualizar configuração"
                  : "Criar configuração"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
