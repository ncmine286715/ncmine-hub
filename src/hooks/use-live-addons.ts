import { useEffect, useState } from "react";
import type { Addon } from "@/components/AddonCard";
import { fetchRemoteAddons, FALLBACK_ADDONS } from "@/lib/addons-live";

type State = { addons: Addon[]; loading: boolean; updated: boolean };

// Cache em memória do módulo: navegar entre páginas não refaz o fetch.
let memo: Addon[] | null = null;
let inflight: Promise<Addon[] | null> | null = null;

/**
 * Catálogo "ao vivo": renderiza na hora com os dados do bundle (zero espera)
 * e, logo depois do primeiro paint, revalida contra o JSON remoto. Se o JSON
 * mudou, a lista atualiza sozinha — sem redeploy.
 */
export function useLiveAddons(): State {
  const [addons, setAddons] = useState<Addon[]>(memo ?? FALLBACK_ADDONS);
  const [loading, setLoading] = useState(!memo);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (memo) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();

    const run = () => {
      inflight = inflight ?? fetchRemoteAddons(controller.signal);
      inflight.then((remote) => {
        if (cancelled) return;
        if (remote) {
          memo = remote;
          setAddons(remote);
          setUpdated(remote.length !== FALLBACK_ADDONS.length);
        }
        setLoading(false);
      });
    };

    // Espera o browser ficar ocioso: não competir com o primeiro paint no celular.
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number })
      .requestIdleCallback;
    const timer = idle ? idle(run, { timeout: 3000 }) : window.setTimeout(run, 1200);

    return () => {
      cancelled = true;
      controller.abort();
      if (!idle) window.clearTimeout(timer as number);
    };
  }, []);

  return { addons, loading, updated };
}
