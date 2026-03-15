"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Overview = {
  totalEvents: number;
  activeUsers: number;
  screenViews: number;
  clicks: number;
  sessionsStarted: number;
  sessionsEnded: number;
  avgSessionSeconds: number;
};

type TimelineItem = {
  date: string;
  total: number;
  screenViews: number;
  clicks: number;
  sessionsStarted: number;
  sessionsEnded: number;
};

type TopScreen = {
  screen: string;
  views: number;
  sessions: number;
  avgSessionSeconds: number;
};

type TopClick = {
  target: string;
  count: number;
};

type RecentEvent = {
  id: string;
  createdAt: string;
  eventType: string;
  target: string | null;
  userId: string;
  metadata: unknown;
};

type DashboardResponse = {
  rangeDays: number;
  since: string;
  overview: Overview;
  eventsTimeline: TimelineItem[];
  topScreens: TopScreen[];
  topClicks: TopClick[];
  recentEvents: RecentEvent[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}m ${rest}s`;
}

export default function DashboardMetricasPage() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardResponse | null>(null);

  const timeline = useMemo(() => {
    if (!data) return [];
    return data.eventsTimeline.filter((item) => item.total > 0);
  }, [data]);

  const maxTimeline = useMemo(() => {
    if (timeline.length === 0) return 1;
    return Math.max(...timeline.map((item) => item.total), 1);
  }, [timeline]);

  const maxScreenViews = useMemo(() => {
    if (!data || data.topScreens.length === 0) return 1;
    return Math.max(...data.topScreens.map((item) => item.views), 1);
  }, [data]);

  const maxSessionsPerDay = useMemo(() => {
    if (timeline.length === 0) return 1;
    return Math.max(...timeline.map((item) => item.sessionsEnded), 1);
  }, [timeline]);

  const pieData = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Screen View", value: data.overview.screenViews, color: "#2563EB" },
      { label: "Click", value: data.overview.clicks, color: "#16A34A" },
      { label: "Session Start", value: data.overview.sessionsStarted, color: "#F59E0B" },
      { label: "Session End", value: data.overview.sessionsEnded, color: "#EF4444" },
    ];
  }, [data]);

  const pieTotal = useMemo(
    () => pieData.reduce((acc, item) => acc + item.value, 0),
    [pieData]
  );

  const pieGradient = useMemo(() => {
    if (pieTotal <= 0) return "conic-gradient(#E2E8F0 0deg 360deg)";
    let currentDeg = 0;
    const stops = pieData.map((item) => {
      const nextDeg = currentDeg + (item.value / pieTotal) * 360;
      const stop = `${item.color} ${currentDeg}deg ${nextDeg}deg`;
      currentDeg = nextDeg;
      return stop;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [pieData, pieTotal]);

  const fetchDashboard = async (rangeDays: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://31.97.168.45:3000/metrics/dashboard?days=${rangeDays}`);
      if (res.status === 401) {
        router.push("/");
        router.refresh();
        return;
      }

      const payload = (await res.json()) as DashboardResponse | { message?: string };
      if (!res.ok) {
        setError((payload as { message?: string }).message ?? "Erro ao carregar métricas.");
        return;
      }
      setData(payload as DashboardResponse);
    } catch {
      setError("Erro ao conectar com a API de métricas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(days);
  }, [days]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1E293B]">
      <header className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Painel
            </p>
            <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard de Métricas</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={15}>Últimos 15 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={60}>Últimos 60 dias</option>
            </select>
            <button
              onClick={() => router.push("/configuracoes")}
              className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
            >
              Configurações
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {error ? (
          <div className="mb-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
            {error}
          </div>
        ) : null}

        {loading || !data ? (
          <div className="rounded-2xl bg-white p-10 text-center text-[#64748B] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            Carregando métricas...
          </div>
        ) : (
          <>
            <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase text-[#64748B]">Eventos totais</p>
                <p className="mt-2 text-3xl font-bold text-[#0F172A]">{data.overview.totalEvents}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase text-[#64748B]">Usuários ativos</p>
                <p className="mt-2 text-3xl font-bold text-[#0F172A]">{data.overview.activeUsers}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase text-[#64748B]">Screen views</p>
                <p className="mt-2 text-3xl font-bold text-[#0F172A]">{data.overview.screenViews}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase text-[#64748B]">Cliques</p>
                <p className="mt-2 text-3xl font-bold text-[#0F172A]">{data.overview.clicks}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase text-[#64748B]">Sessões iniciadas</p>
                <p className="mt-2 text-2xl font-bold text-[#0F172A]">{data.overview.sessionsStarted}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <p className="text-xs font-semibold uppercase text-[#64748B]">Sessões encerradas</p>
                <p className="mt-2 text-2xl font-bold text-[#0F172A]">{data.overview.sessionsEnded}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] md:col-span-2">
                <p className="text-xs font-semibold uppercase text-[#64748B]">Tempo médio de sessão</p>
                <p className="mt-2 text-2xl font-bold text-[#0F172A]">
                  {formatDuration(data.overview.avgSessionSeconds)}
                </p>
                <p className="mt-2 text-xs text-[#64748B]">
                  Encerramento inferido quando existe novo `SESSION_START` de outra tela para o mesmo usuário.
                </p>
              </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] xl:col-span-2">
                <h2 className="text-lg font-bold text-[#0F172A]">Evolução diária de eventos</h2>
                <p className="mb-4 text-sm text-[#64748B]">
                  Desde {formatDate(data.since)} ({data.rangeDays} dias)
                </p>
                <div className="flex h-72 items-end gap-3 overflow-x-auto rounded-xl bg-[#F8FAFC] p-4">
                  {timeline.length === 0 ? (
                    <p className="m-auto text-sm text-[#94A3B8]">Sem dados no período.</p>
                  ) : (
                    timeline.map((item) => {
                      const height = Math.max((item.total / maxTimeline) * 100, 10);
                      return (
                        <div key={item.date} className="group flex min-w-[42px] flex-col items-center">
                          <div className="flex h-56 w-8 items-end">
                            <div
                              className="w-full rounded-t-md bg-gradient-to-t from-[#2563EB] to-[#60A5FA] transition-opacity group-hover:opacity-80"
                              style={{ height: `${height}%` }}
                              title={`${item.total} eventos | views: ${item.screenViews} | cliques: ${item.clicks}`}
                            />
                          </div>
                          <span className="mt-2 text-[10px] text-[#64748B]">{formatDate(item.date)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Top ações (CLICK)</h2>
                <div className="space-y-3">
                  {data.topClicks.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">Sem cliques no período.</p>
                  ) : (
                    data.topClicks.slice(0, 8).map((item) => (
                      <div key={item.target} className="rounded-lg border border-[#E2E8F0] p-3">
                        <p className="truncate text-sm font-semibold text-[#0F172A]">{item.target}</p>
                        <p className="text-xs text-[#64748B]">{item.count} cliques</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Telas mais vistas</h2>
                <div className="space-y-4">
                  {data.topScreens.length === 0 ? (
                    <p className="text-sm text-[#94A3B8]">Sem visualizações de tela.</p>
                  ) : (
                    data.topScreens.map((item) => (
                      <div key={item.screen}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-semibold text-[#334155]">{item.screen}</span>
                          <span className="text-[#64748B]">{item.views} views</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div
                            className="h-full rounded-full bg-[#22C55E]"
                            style={{ width: `${Math.max((item.views / maxScreenViews) * 100, 4)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-[#64748B]">
                          Sessões: {item.sessions} • Tempo médio: {formatDuration(item.avgSessionSeconds)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Distribuição por tipo</h2>
                <div className="space-y-3">
                  {[
                    { label: "Screen View", value: data.overview.screenViews, color: "bg-[#2563EB]" },
                    { label: "Click", value: data.overview.clicks, color: "bg-[#16A34A]" },
                    { label: "Session Start", value: data.overview.sessionsStarted, color: "bg-[#F59E0B]" },
                    { label: "Session End", value: data.overview.sessionsEnded, color: "bg-[#EF4444]" },
                  ].map((item) => {
                    const width =
                      data.overview.totalEvents > 0
                        ? Math.max((item.value / data.overview.totalEvents) * 100, item.value ? 4 : 0)
                        : 0;
                    return (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-[#334155]">{item.label}</span>
                          <span className="font-semibold text-[#0F172A]">{item.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Funil de Engajamento</h2>
                <div className="space-y-3">
                  {[
                    { label: "Screen Views", value: data.overview.screenViews, color: "bg-[#2563EB]" },
                    { label: "Cliques", value: data.overview.clicks, color: "bg-[#16A34A]" },
                    { label: "Sessões Iniciadas", value: data.overview.sessionsStarted, color: "bg-[#F59E0B]" },
                    { label: "Sessões Encerradas", value: data.overview.sessionsEnded, color: "bg-[#EF4444]" },
                  ].map((step) => {
                    const width =
                      data.overview.totalEvents > 0
                        ? Math.max((step.value / data.overview.totalEvents) * 100, step.value ? 6 : 0)
                        : 0;
                    return (
                      <div key={step.label}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-[#334155]">{step.label}</span>
                          <span className="font-semibold text-[#0F172A]">{step.value}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div className={`h-full rounded-full ${step.color}`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] xl:col-span-2">
                <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Distribuição de tipos (Pizza)</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
                  <div className="flex items-center justify-center">
                    <div
                      className="h-44 w-44 rounded-full border border-[#E2E8F0] shadow-inner"
                      style={{ background: pieGradient }}
                      title={`Total: ${pieTotal}`}
                    />
                  </div>
                  <div className="space-y-3">
                    {pieData.map((item) => {
                      const pct = pieTotal > 0 ? (item.value / pieTotal) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-[#334155]">
                              <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.label}
                            </span>
                            <span className="font-semibold text-[#0F172A]">
                              {item.value} ({pct.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max(pct, item.value ? 4 : 0)}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] xl:col-span-2">
                <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Sessões encerradas por dia</h2>
                <div className="flex h-48 items-end gap-2 overflow-x-auto rounded-xl bg-[#F8FAFC] p-4">
                  {timeline.length === 0 ? (
                    <p className="m-auto text-sm text-[#94A3B8]">Sem dados no período.</p>
                  ) : (
                    timeline.map((item) => {
                      const height = Math.max((item.sessionsEnded / maxSessionsPerDay) * 100, item.sessionsEnded ? 5 : 0);
                      return (
                        <div key={item.date} className="group flex h-full min-w-[32px] flex-col items-center justify-end">
                          <div
                            className="w-4 rounded-t bg-[#F59E0B] transition-opacity group-hover:opacity-80"
                            style={{ height: `${height}%` }}
                            title={`${formatDate(item.date)}: ${item.sessionsEnded} sessões`}
                          />
                          <span className="mt-1 text-[10px] text-[#64748B]">
                            {formatDate(item.date)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#F59E0B]" />
                  Sessões encerradas por dia (data no eixo X)
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Qualidade de sessão</h2>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-[#E2E8F0] p-3">
                    <p className="text-[#64748B]">Taxa de encerramento</p>
                    <p className="text-xl font-bold text-[#0F172A]">
                      {data.overview.sessionsStarted > 0
                        ? `${((data.overview.sessionsEnded / data.overview.sessionsStarted) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E2E8F0] p-3">
                    <p className="text-[#64748B]">Cliques por screen view</p>
                    <p className="text-xl font-bold text-[#0F172A]">
                      {data.overview.screenViews > 0
                        ? (data.overview.clicks / data.overview.screenViews).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E2E8F0] p-3">
                    <p className="text-[#64748B]">Tempo médio</p>
                    <p className="text-xl font-bold text-[#0F172A]">
                      {formatDuration(data.overview.avgSessionSeconds)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <h2 className="mb-4 text-lg font-bold text-[#0F172A]">Eventos recentes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="border-b border-[#E2E8F0] px-3 py-2 text-left text-xs font-semibold uppercase text-[#64748B]">Data/Hora</th>
                      <th className="border-b border-[#E2E8F0] px-3 py-2 text-left text-xs font-semibold uppercase text-[#64748B]">Tipo</th>
                      <th className="border-b border-[#E2E8F0] px-3 py-2 text-left text-xs font-semibold uppercase text-[#64748B]">Target</th>
                      <th className="border-b border-[#E2E8F0] px-3 py-2 text-left text-xs font-semibold uppercase text-[#64748B]">Usuário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.length === 0 ? (
                      <tr>
                        <td className="px-3 py-6 text-center text-sm text-[#94A3B8]" colSpan={4}>
                          Sem eventos recentes.
                        </td>
                      </tr>
                    ) : (
                      data.recentEvents.slice(0, 30).map((event) => (
                        <tr key={event.id} className="hover:bg-[#F8FAFC]">
                          <td className="border-b border-[#F1F5F9] px-3 py-2 text-xs text-[#334155]">
                            {formatDateTime(event.createdAt)}
                          </td>
                          <td className="border-b border-[#F1F5F9] px-3 py-2">
                            <span className="rounded-md bg-[#E2E8F0] px-2 py-1 text-[11px] font-semibold text-[#334155]">
                              {event.eventType}
                            </span>
                          </td>
                          <td className="max-w-[280px] truncate border-b border-[#F1F5F9] px-3 py-2 text-xs text-[#334155]">
                            {event.target ?? "-"}
                          </td>
                          <td className="max-w-[220px] truncate border-b border-[#F1F5F9] px-3 py-2 text-xs text-[#64748B]">
                            {event.userId}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
