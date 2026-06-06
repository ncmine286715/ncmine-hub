import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import addonsData from "@/data/addons.json";
import { FloatingBackground } from "@/components/FloatingBackground";
import { AdminBroadcastPanel } from "@/components/AdminBroadcastPanel";
import {
  ArrowLeft, Download, Eye, MousePointerClick, Share2, Heart, MessageSquare,
  Star, TrendingUp, Users, BarChart3, Activity, Trophy, Lock,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_EMAIL = "rosidomingos032@gmail.com";

type DailyStats = { day: string; counts: Record<string, number> };
type AddonStat = {
  id: string;
  title: string;
  downloadsCount: number;
  viewsCount: number;
  opensCount: number;
  clicksCount: number;
  sharesCount: number;
  favoritesCount: number;
  averageRating: number;
  ratingsCount: number;
};

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DailyStats[]>([]);
  const [addonStats, setAddonStats] = useState<AddonStat[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        // 1. Stats por dia (últimos 7)
        const dayPromises = Array.from({ length: 7 }, (_, i) =>
          getDoc(doc(db, "daily_stats", todayKey(i))).then((s) => ({
            day: todayKey(i),
            counts: (s.exists() ? (s.data() as any).counts : {}) || {},
          })),
        );
        const dayResults = await Promise.all(dayPromises);
        setDays(dayResults);

        // 2. Top addons por downloads
        const addonsCol = await getDocs(collection(db, "addons"));
        const statsMap = new Map<string, any>();
        addonsCol.forEach((d) => statsMap.set(d.id, d.data()));
        const merged: AddonStat[] = (addonsData as any[])
          .map((a) => {
            const s = statsMap.get(a.id) || {};
            return {
              id: a.id,
              title: a.title,
              downloadsCount: s.downloadsCount || 0,
              viewsCount: s.viewsCount || 0,
              opensCount: s.opensCount || 0,
              clicksCount: s.clicksCount || 0,
              sharesCount: s.sharesCount || 0,
              favoritesCount: s.favoritesCount || 0,
              averageRating: s.averageRating || 0,
              ratingsCount: s.ratingsCount || 0,
            };
          })
          .sort((a, b) => b.downloadsCount - a.downloadsCount);
        setAddonStats(merged);

        // 3. Eventos recentes
        const evSnap = await getDocs(
          query(collection(db, "public_events"), orderBy("createdAt", "desc"), limit(20)),
        );
        setRecentEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 4. Novos usuários
        const usSnap = await getDocs(
          query(collection(db, "users"), orderBy("createdAt", "desc"), limit(10)),
        );
        setNewUsers(usSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 5. Comentários recentes
        const cmSnap = await getDocs(
          query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(10)),
        );
        setRecentComments(cmSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("[admin]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  if (authLoading) return <div className="p-8 text-center font-pixel">Carregando...</div>;

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <FloatingBackground />
        <div className="relative max-w-md text-center card-block p-8 bg-background">
          <Lock className="mx-auto h-12 w-12 mb-3 text-primary" />
          <h1 className="font-pixel text-lg uppercase mb-2">Acesso Restrito</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Esta área é só para o admin do hub.
          </p>
          <Link to="/" className="btn-block bg-primary text-primary-foreground inline-flex">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const today = days[0]?.counts || {};
  const week = days.reduce<Record<string, number>>((acc, d) => {
    for (const [k, v] of Object.entries(d.counts)) acc[k] = (acc[k] || 0) + (v as number);
    return acc;
  }, {});
  const totalDownloadsAll = addonStats.reduce((s, a) => s + a.downloadsCount, 0);
  const totalViewsAll = addonStats.reduce((s, a) => s + a.viewsCount, 0);
  const ctr = totalViewsAll > 0 ? ((totalDownloadsAll / totalViewsAll) * 100).toFixed(1) : "0.0";
  const scrollAvg = (() => {
    const all = recentEvents.filter((e) => e.type === "scroll_depth");
    if (!all.length) return 0;
    return Math.round(all.reduce((s, e) => s + (e.depth || 0), 0) / all.length);
  })();

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingBackground />

      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate({ to: "/profile" })} className="text-[10px] font-pixel flex items-center gap-1 text-muted-foreground">
            <ArrowLeft className="h-3 w-3" /> Voltar
          </button>
          <h1 className="font-pixel text-sm uppercase">📊 PAINEL ADMIN</h1>
          <span className="bg-red-600 text-white text-[8px] font-pixel px-1.5 py-0.5 shadow-[2px_2px_0_0_#000]">ADMIN</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-6 space-y-6">
        {loading && <p className="text-center text-sm text-muted-foreground animate-pulse">Carregando estatísticas...</p>}

        <AdminBroadcastPanel />

        {/* KPIs */}
        <section>
          <h2 className="font-pixel text-xs uppercase mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Visão Geral</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Kpi icon={<Download className="h-5 w-5" />} label="Downloads (hoje)" value={today.download_start || 0} accent="bg-primary" />
            <Kpi icon={<Eye className="h-5 w-5" />} label="Visualizações (hoje)" value={today.addon_view || 0} accent="bg-blue-500" />
            <Kpi icon={<MousePointerClick className="h-5 w-5" />} label="Cliques (hoje)" value={today.addon_click || 0} accent="bg-purple-500" />
            <Kpi icon={<Users className="h-5 w-5" />} label="Sessões (hoje)" value={today.session_start || 0} accent="bg-green-500" />
            <Kpi icon={<TrendingUp className="h-5 w-5" />} label="CTR Geral" value={`${ctr}%`} accent="bg-orange-500" />
            <Kpi icon={<BarChart3 className="h-5 w-5" />} label="Rolagem Média" value={`${scrollAvg}%`} accent="bg-pink-500" />
            <Kpi icon={<Share2 className="h-5 w-5" />} label="Shares (hoje)" value={today.share || 0} accent="bg-indigo-500" />
            <Kpi icon={<Heart className="h-5 w-5" />} label="Favoritos (hoje)" value={today.favorite || 0} accent="bg-red-500" />
          </div>
        </section>

        {/* Semana */}
        <section>
          <h2 className="font-pixel text-xs uppercase mb-3">📅 Últimos 7 dias</h2>
          <div className="card-block bg-background p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-foreground font-pixel text-[9px] uppercase">
                  <th className="text-left py-2">Dia</th>
                  <th className="text-right">Sessões</th>
                  <th className="text-right">Views</th>
                  <th className="text-right">Cliques</th>
                  <th className="text-right">Downloads</th>
                  <th className="text-right">Shares</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.day} className="border-b border-foreground/10">
                    <td className="py-2 font-bold">{d.day}</td>
                    <td className="text-right">{d.counts.session_start || 0}</td>
                    <td className="text-right">{d.counts.addon_view || 0}</td>
                    <td className="text-right">{d.counts.addon_click || 0}</td>
                    <td className="text-right font-bold text-primary">{d.counts.download_start || 0}</td>
                    <td className="text-right">{d.counts.share || 0}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-foreground font-pixel text-[10px]">
                  <td className="py-2">TOTAL</td>
                  <td className="text-right">{week.session_start || 0}</td>
                  <td className="text-right">{week.addon_view || 0}</td>
                  <td className="text-right">{week.addon_click || 0}</td>
                  <td className="text-right text-primary">{week.download_start || 0}</td>
                  <td className="text-right">{week.share || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Addons */}
        <section>
          <h2 className="font-pixel text-xs uppercase mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-orange-500" /> Top Addons (por downloads)</h2>
          <div className="card-block bg-background p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-foreground font-pixel text-[9px] uppercase">
                  <th className="text-left py-2">#</th>
                  <th className="text-left">Addon</th>
                  <th className="text-right">Downloads</th>
                  <th className="text-right">Views</th>
                  <th className="text-right">CTR</th>
                  <th className="text-right">★ Rating</th>
                  <th className="text-right">Favs</th>
                </tr>
              </thead>
              <tbody>
                {addonStats.slice(0, 20).map((a, i) => {
                  const r = a.viewsCount > 0 ? ((a.downloadsCount / a.viewsCount) * 100).toFixed(1) : "—";
                  return (
                    <tr key={a.id} className="border-b border-foreground/10 hover:bg-muted/30">
                      <td className="py-2 font-pixel text-[10px]">{i + 1}</td>
                      <td>
                        <Link to="/addon/$id" params={{ id: a.id }} className="font-bold hover:text-primary line-clamp-1">{a.title}</Link>
                      </td>
                      <td className="text-right font-bold text-primary">{a.downloadsCount}</td>
                      <td className="text-right">{a.viewsCount}</td>
                      <td className="text-right">{r}{r !== "—" ? "%" : ""}</td>
                      <td className="text-right">{a.averageRating ? a.averageRating.toFixed(1) : "—"}</td>
                      <td className="text-right">{a.favoritesCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Duas colunas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <section>
            <h2 className="font-pixel text-xs uppercase mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Novos Mineradores</h2>
            <div className="card-block bg-background p-3 space-y-2">
              {newUsers.length === 0 && <p className="text-xs text-muted-foreground">Nenhum ainda.</p>}
              {newUsers.map((u) => (
                <div key={u.id} className="flex justify-between items-center text-xs border-b border-foreground/10 pb-1">
                  <span className="font-bold truncate">{u.username || u.email || u.id.slice(0, 8)}</span>
                  <span className="font-pixel text-[8px] text-muted-foreground">{u.points || 0} XP</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-pixel text-xs uppercase mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Comentários Recentes</h2>
            <div className="card-block bg-background p-3 space-y-2 max-h-72 overflow-auto">
              {recentComments.length === 0 && <p className="text-xs text-muted-foreground">Nenhum.</p>}
              {recentComments.map((c) => (
                <div key={c.id} className="text-xs border-b border-foreground/10 pb-1">
                  <div className="flex justify-between">
                    <span className="font-bold">{c.username}</span>
                    {c.rating && <span className="text-orange-500"><Star className="inline h-3 w-3 fill-current" /> {c.rating}</span>}
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Eventos brutos */}
        <section>
          <h2 className="font-pixel text-xs uppercase mb-3">⚡ Eventos em tempo real (últimos 20)</h2>
          <div className="card-block bg-background p-3 max-h-80 overflow-auto space-y-1">
            {recentEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-[10px] border-b border-foreground/10 py-0.5">
                <span className="font-pixel text-primary">{e.type}</span>
                <span className="truncate text-muted-foreground mx-2">{e.title || e.path || e.addonId || "—"}</span>
                <span className="text-muted-foreground">{e.userId ? "👤" : "🕶️"}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: string }) {
  return (
    <div className="card-block bg-background p-3">
      <div className={`inline-flex p-1.5 ${accent} text-white border-2 border-foreground mb-2`}>{icon}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[9px] font-pixel uppercase text-muted-foreground">{label}</div>
    </div>
  );
}