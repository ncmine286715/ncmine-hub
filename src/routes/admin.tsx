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
  Star, TrendingUp, Users, BarChart3, Activity, Trophy, Lock, RefreshCw,
  ChevronDown, ChevronUp,
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
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState<DailyStats[]>([]);
  const [addonStats, setAddonStats] = useState<AddonStat[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [showAllAddons, setShowAllAddons] = useState(false);
  const [sortBy, setSortBy] = useState<'downloads' | 'views' | 'rating' | 'favorites'>('downloads');

  const isAdmin = user?.email === ADMIN_EMAIL;

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const dayPromises = Array.from({ length: 7 }, (_, i) =>
        getDoc(doc(db, "daily_stats", todayKey(i))).then((s) => ({
          day: todayKey(i),
          counts: (s.exists() ? (s.data() as any).counts : {}) || {},
        })),
      );
      const dayResults = await Promise.all(dayPromises);
      setDays(dayResults);

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
        });
      setAddonStats(merged);

      const evSnap = await getDocs(
        query(collection(db, "public_events"), orderBy("createdAt", "desc"), limit(20)),
      );
      setRecentEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const usSnap = await getDocs(
        query(collection(db, "users"), orderBy("createdAt", "desc"), limit(10)),
      );
      setNewUsers(usSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const cmSnap = await getDocs(
        query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(10)),
      );
      setRecentComments(cmSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("[admin]", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
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
            Esta area e so para o admin do hub.
          </p>
          <Link to="/" className="btn-block bg-primary text-primary-foreground inline-flex">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const today = days[0]?.counts || {};
  const yesterday = days[1]?.counts || {};
  const week = days.reduce<Record<string, number>>((acc, d) => {
    for (const [k, v] of Object.entries(d.counts)) acc[k] = (acc[k] || 0) + (v as number);
    return acc;
  }, {});
  const totalDownloadsAll = addonStats.reduce((s, a) => s + a.downloadsCount, 0);
  const totalViewsAll = addonStats.reduce((s, a) => s + a.viewsCount, 0);
  const ctr = totalViewsAll > 0 ? ((totalDownloadsAll / totalViewsAll) * 100).toFixed(1) : "0.0";

  const sortedAddons = [...addonStats].sort((a, b) => {
    switch (sortBy) {
      case 'views': return b.viewsCount - a.viewsCount;
      case 'rating': return b.averageRating - a.averageRating;
      case 'favorites': return b.favoritesCount - a.favoritesCount;
      default: return b.downloadsCount - a.downloadsCount;
    }
  });
  const displayAddons = showAllAddons ? sortedAddons : sortedAddons.slice(0, 20);

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingBackground />

      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3">
          <button onClick={() => navigate({ to: "/profile" })} className="text-[10px] font-pixel flex items-center gap-1 text-muted-foreground min-h-[36px]">
            <ArrowLeft className="h-3 w-3" /> Voltar
          </button>
          <h1 className="font-pixel text-xs sm:text-sm uppercase">PAINEL ADMIN</h1>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="border-2 border-foreground bg-background p-1.5 hover:bg-muted min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {loading && <p className="text-center text-sm text-muted-foreground animate-pulse">Carregando estatisticas...</p>}

        <AdminBroadcastPanel />

        {/* KPIs */}
        <section>
          <h2 className="font-pixel text-[10px] sm:text-xs uppercase mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Visao Geral - Hoje</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Kpi icon={<Download className="h-4 w-4 sm:h-5 sm:w-5" />} label="Downloads" value={today.download_start || 0} prev={yesterday.download_start || 0} accent="bg-primary" />
            <Kpi icon={<Eye className="h-4 w-4 sm:h-5 sm:w-5" />} label="Views" value={today.addon_view || 0} prev={yesterday.addon_view || 0} accent="bg-blue-500" />
            <Kpi icon={<MousePointerClick className="h-4 w-4 sm:h-5 sm:w-5" />} label="Cliques" value={today.addon_click || 0} prev={yesterday.addon_click || 0} accent="bg-purple-500" />
            <Kpi icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />} label="Sessoes" value={today.session_start || 0} prev={yesterday.session_start || 0} accent="bg-green-500" />
            <Kpi icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />} label="CTR Geral" value={`${ctr}%`} accent="bg-orange-500" />
            <Kpi icon={<Share2 className="h-4 w-4 sm:h-5 sm:w-5" />} label="Shares" value={today.share || 0} prev={yesterday.share || 0} accent="bg-indigo-500" />
            <Kpi icon={<Heart className="h-4 w-4 sm:h-5 sm:w-5" />} label="Favoritos" value={today.favorite || 0} prev={yesterday.favorite || 0} accent="bg-red-500" />
            <Kpi icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />} label="Total Downloads" value={totalDownloadsAll} accent="bg-pink-500" />
          </div>
        </section>

        {/* Weekly Summary */}
        <section>
          <h2 className="font-pixel text-[10px] sm:text-xs uppercase mb-3">Ultimos 7 dias</h2>
          <div className="card-block bg-background p-3 sm:p-4 overflow-x-auto">
            <table className="w-full text-[10px] sm:text-xs">
              <thead>
                <tr className="border-b-2 border-foreground font-pixel text-[8px] sm:text-[9px] uppercase">
                  <th className="text-left py-2">Dia</th>
                  <th className="text-right">Sessoes</th>
                  <th className="text-right">Views</th>
                  <th className="text-right">Cliques</th>
                  <th className="text-right">Downloads</th>
                  <th className="text-right hidden sm:table-cell">Shares</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.day} className="border-b border-foreground/10">
                    <td className="py-1.5 sm:py-2 font-bold">{d.day.slice(5)}</td>
                    <td className="text-right">{d.counts.session_start || 0}</td>
                    <td className="text-right">{d.counts.addon_view || 0}</td>
                    <td className="text-right">{d.counts.addon_click || 0}</td>
                    <td className="text-right font-bold text-primary">{d.counts.download_start || 0}</td>
                    <td className="text-right hidden sm:table-cell">{d.counts.share || 0}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-foreground font-pixel text-[9px] sm:text-[10px]">
                  <td className="py-2">TOTAL</td>
                  <td className="text-right">{week.session_start || 0}</td>
                  <td className="text-right">{week.addon_view || 0}</td>
                  <td className="text-right">{week.addon_click || 0}</td>
                  <td className="text-right text-primary">{week.download_start || 0}</td>
                  <td className="text-right hidden sm:table-cell">{week.share || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Addons */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-pixel text-[10px] sm:text-xs uppercase flex items-center gap-2">
              <Trophy className="h-4 w-4 text-orange-500" /> Top Addons
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border-2 border-foreground bg-background px-2 py-1 text-[10px] sm:text-xs font-bold uppercase"
            >
              <option value="downloads">Downloads</option>
              <option value="views">Views</option>
              <option value="rating">Rating</option>
              <option value="favorites">Favoritos</option>
            </select>
          </div>
          <div className="card-block bg-background p-3 sm:p-4 overflow-x-auto">
            <table className="w-full text-[10px] sm:text-xs">
              <thead>
                <tr className="border-b-2 border-foreground font-pixel text-[8px] sm:text-[9px] uppercase">
                  <th className="text-left py-2">#</th>
                  <th className="text-left">Addon</th>
                  <th className="text-right">DL</th>
                  <th className="text-right hidden sm:table-cell">Views</th>
                  <th className="text-right hidden sm:table-cell">CTR</th>
                  <th className="text-right">Rating</th>
                  <th className="text-right">Favs</th>
                </tr>
              </thead>
              <tbody>
                {displayAddons.map((a, i) => {
                  const r = a.viewsCount > 0 ? ((a.downloadsCount / a.viewsCount) * 100).toFixed(1) : "-";
                  return (
                    <tr key={a.id} className="border-b border-foreground/10 hover:bg-muted/30">
                      <td className="py-1.5 sm:py-2 font-pixel text-[9px] sm:text-[10px]">{i + 1}</td>
                      <td>
                        <Link to="/addon/$id" params={{ id: a.id }} className="font-bold hover:text-primary line-clamp-1 text-[10px] sm:text-xs">{a.title}</Link>
                      </td>
                      <td className="text-right font-bold text-primary">{a.downloadsCount}</td>
                      <td className="text-right hidden sm:table-cell">{a.viewsCount}</td>
                      <td className="text-right hidden sm:table-cell">{r}{r !== "-" ? "%" : ""}</td>
                      <td className="text-right">{a.averageRating ? a.averageRating.toFixed(1) : "-"}</td>
                      <td className="text-right">{a.favoritesCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {addonStats.length > 20 && (
              <button
                onClick={() => setShowAllAddons(!showAllAddons)}
                className="mt-2 w-full text-center text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1 py-2"
              >
                {showAllAddons ? <><ChevronUp className="h-3 w-3" /> Mostrar menos</> : <><ChevronDown className="h-3 w-3" /> Ver todos ({addonStats.length})</>}
              </button>
            )}
          </div>
        </section>

        {/* Two Columns */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <section>
            <h2 className="font-pixel text-[10px] sm:text-xs uppercase mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Novos Mineradores</h2>
            <div className="card-block bg-background p-3 space-y-2">
              {newUsers.length === 0 && <p className="text-xs text-muted-foreground">Nenhum ainda.</p>}
              {newUsers.map((u) => (
                <div key={u.id} className="flex justify-between items-center text-[10px] sm:text-xs border-b border-foreground/10 pb-1.5">
                  <span className="font-bold truncate">{u.username || u.email || u.id.slice(0, 8)}</span>
                  <span className="font-pixel text-[8px] text-muted-foreground shrink-0">{u.points || 0} XP</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-pixel text-[10px] sm:text-xs uppercase mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Comentarios Recentes</h2>
            <div className="card-block bg-background p-3 space-y-2 max-h-72 overflow-auto">
              {recentComments.length === 0 && <p className="text-xs text-muted-foreground">Nenhum.</p>}
              {recentComments.map((c) => (
                <div key={c.id} className="text-[10px] sm:text-xs border-b border-foreground/10 pb-1.5">
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

        {/* Events */}
        <section>
          <h2 className="font-pixel text-[10px] sm:text-xs uppercase mb-3">Eventos Recentes (20)</h2>
          <div className="card-block bg-background p-3 max-h-80 overflow-auto space-y-1">
            {recentEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-[9px] sm:text-[10px] border-b border-foreground/10 py-1">
                <span className="font-pixel text-primary shrink-0">{e.type}</span>
                <span className="truncate text-muted-foreground mx-2 flex-1">{e.title || e.path || e.addonId || "-"}</span>
                <span className="text-muted-foreground shrink-0">{e.userId ? "user" : "anon"}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ icon, label, value, prev, accent }: { icon: React.ReactNode; label: string; value: number | string; prev?: number; accent: string }) {
  const numValue = typeof value === 'number' ? value : 0;
  const diff = prev !== undefined ? numValue - prev : undefined;

  return (
    <div className="card-block bg-background p-3">
      <div className={`inline-flex p-1 sm:p-1.5 ${accent} text-white border-2 border-foreground mb-2`}>{icon}</div>
      <div className="text-xl sm:text-2xl font-black">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] sm:text-[9px] font-pixel uppercase text-muted-foreground">{label}</span>
        {diff !== undefined && diff !== 0 && (
          <span className={`text-[8px] font-bold flex items-center gap-0.5 ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {diff > 0 ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
            {Math.abs(diff)}
          </span>
        )}
      </div>
    </div>
  );
}
