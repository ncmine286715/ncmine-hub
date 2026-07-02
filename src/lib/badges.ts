import addonsData from "@/data/addons.json";
import type { Addon } from "@/components/AddonCard";

const RAW_ADDONS = addonsData as Addon[];

// Ajuste esta data quando o site "lançar" oficialmente — Pioneiro é quem
// criou conta até 30 dias depois disso.
const LAUNCH_CUTOFF = new Date("2026-08-01T00:00:00Z");

export type Badge = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

type ProfileForBadges = {
  createdAt?: { toDate?: () => Date } | Date | null;
  downloadsCount?: number;
  favorites?: string[];
  sharesCount?: number;
  reportsCount?: number;
  downloadedAddons?: string[];
};

const ALL_BADGES: { badge: Badge; test: (p: ProfileForBadges) => boolean }[] = [
  {
    badge: { id: "pioneiro", label: "Pioneiro", emoji: "🚀", description: "Conta criada no lançamento do site" },
    test: (p) => {
      const created = (p.createdAt as any)?.toDate ? (p.createdAt as any).toDate() : p.createdAt;
      if (!(created instanceof Date) || isNaN(created.getTime())) return false;
      return created.getTime() <= LAUNCH_CUTOFF.getTime();
    },
  },
  {
    badge: { id: "mineiro", label: "Mineiro", emoji: "⛏️", description: "50 downloads realizados" },
    test: (p) => (p.downloadsCount || 0) >= 50,
  },
  {
    badge: { id: "curador", label: "Curador", emoji: "⭐", description: "10 addons favoritados" },
    test: (p) => (p.favorites?.length || 0) >= 10,
  },
  {
    badge: { id: "embaixador", label: "Embaixador", emoji: "📣", description: "5 addons compartilhados" },
    test: (p) => (p.sharesCount || 0) >= 5,
  },
  {
    badge: { id: "detetive", label: "Detetive", emoji: "🔍", description: "3 links quebrados reportados" },
    test: (p) => (p.reportsCount || 0) >= 3,
  },
  {
    badge: { id: "fa-ncmine", label: "Fã do @ncmine", emoji: "🧡", description: "Baixou 3 addons do @ncmine" },
    test: (p) => {
      const downloaded = p.downloadedAddons || [];
      const count = downloaded.filter((id) => {
        const addon = RAW_ADDONS.find((a) => a.id === id);
        const author = (addon?.author || "").toLowerCase();
        return author.includes("ncmine") || author.includes("nicolas");
      }).length;
      return count >= 3;
    },
  },
];

export function computeBadges(profile: ProfileForBadges | null | undefined): Badge[] {
  if (!profile) return [];
  return ALL_BADGES.filter(({ test }) => test(profile)).map(({ badge }) => badge);
}

export function allBadgeDefinitions(): Badge[] {
  return ALL_BADGES.map(({ badge }) => badge);
}
