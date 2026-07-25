import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Addon } from "@/components/AddonCard";
import { useAuth } from "@/hooks/use-auth";
import { setFavoriteVersionSeen } from "@/lib/firebase-services";

/**
 * Sem FCM/Cloud Function: compara a versão atual de cada addon favoritado
 * (vinda do addons.json, carregado sob demanda) contra a última versão vista,
 * guardada no doc do usuário. Diferente -> avisa. Zero infra nova.
 */
export function FavoriteUpdatesWatcher() {
  const { user, profile } = useAuth();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!user || !profile || checkedRef.current) return;
    if (!profile.favorites?.length) return;
    checkedRef.current = true;

    import("@/data/addons.json").then(({ default: addonsData }) => {
      const rawAddons = addonsData as Addon[];
      const seen = profile.favoriteVersions ?? {};
      for (const addonId of profile.favorites!) {
        const addon = rawAddons.find((a) => a.id === addonId);
        if (!addon) continue;
        const lastSeen = seen[addonId];
        if (lastSeen === undefined) {
          setFavoriteVersionSeen(user.uid, addonId, addon.version).catch(() => {});
          continue;
        }
        if (lastSeen !== addon.version) {
          toast(`${addon.title} foi atualizado!`, {
            description: `Nova versão: v${addon.version}`,
            action: { label: "Ver addon", onClick: () => { window.location.href = `/addon/${addon.id}`; } },
            duration: 9000,
          });
          setFavoriteVersionSeen(user.uid, addonId, addon.version).catch(() => {});
        }
      }
    });
  }, [user, profile]);

  return null;
}
