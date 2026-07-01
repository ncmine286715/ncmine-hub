# Redesign mineaddonsnews — foco em download

Vou implementar as prioridades 🔴 e 🟡 agora, e as 🟢 essenciais (página individual já existe em `addon.$id.tsx`, só ajustar).

## 1. Hero enxuto (`Hero.tsx`)
- Remover marquee de tags e bloco social duplicado
- Título: "117 Addons Grátis para Minecraft Bedrock" (dinâmico com `addonsCount`)
- Subtítulo: "Sem cadastro. Sem anúncio de instalação. Clique e baixe."
- CTA único "VER ADDONS ↓" com scroll suave para `#addons`
- Manter "X pessoas baixando agora" só se real; trocar por contador agregado real de downloads (soma dos `addon.downloads`) como prova social honesta
- Remover badge "168 baixando" (fake) — substituir por "X.XXX downloads pela comunidade"

## 2. Mascote Null fixo (`NullMascot.tsx` novo)
- `position: fixed` bottom-right (bottom-4 right-4), z-40
- SVG pixel art: silhueta preta 8x8, olhos brancos vazios
- Idle: `animate-bounce` suave (bob 2s)
- On mount: entra deslizando da direita + speech bubble "Clica aí pra baixar, é de graça mesmo." que some após 4s (uma vez por sessão via sessionStorage)
- Mobile: 48x48; desktop: 72x72
- Não bloqueia sticky mobile CTA — ajustar posição se necessário

## 3. Nudge popup (`DownloadNudge.tsx` novo)
- Trigger: 8s sem interação
- Mostra addon mais baixado (sort por `downloads` desc → pega [0])
- Canto inferior esquerdo desktop; bottom center mobile
- Botão "⬇ BAIXAR GRÁTIS" abre `DownloadModal` do addon
- Fechar → `sessionStorage.setItem('nudge_dismissed', '1')`
- Some após clicar em qualquer coisa da página

## 4. Card de addon (`AddonCard.tsx`)
- Já mostra downloads e badges VIRAL/HOT — manter
- Adicionar badge laranja "@ncmine" quando `addon.author` contém "ncmine" ou é criação própria
- Botão "BAIXAR" já é laranja sólido ✓

## 5. Sticky header (`Hero.tsx` topbar)
- Simplificar: [Logo Null + mineaddonsnews] [🔍 (link #addons)] [⬇ BAIXAR AGORA (scroll #addons)]
- Remover links Discord/YouTube do header (ficam no footer)

## 6. Sitemap + robots
- Criar `src/routes/sitemap[.]xml.ts` como server route dinâmico:
  - `/` (priority 1.0)
  - `/legal` (0.3)
  - `/addon/{id}` para cada addon do JSON (0.8)
- Criar `public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://ncmine-hub.lovable.app/sitemap.xml
  ```

## 7. Página `/legal`
- Reescrever com 4 seções: Privacidade, Termos, DMCA, Sobre
- Adicionar link no footer (verificar se já existe)

## 8. Ajustes extras baratos
- Filtrar addons "Desconhecido" com 0 downloads do grid padrão (mover para categoria "Arquivo")
- Card de destaque: remover "Saber mais" se existir, deixar só "BAIXAR AGORA"

## Arquivos a criar
- `src/components/NullMascot.tsx`
- `src/components/DownloadNudge.tsx`
- `src/routes/sitemap[.]xml.ts`
- `public/robots.txt`

## Arquivos a editar
- `src/components/Hero.tsx` (limpeza + header)
- `src/components/AddonCard.tsx` (badge @ncmine)
- `src/components/AddonsGrid.tsx` (filtro desconhecido/0dl opcional)
- `src/routes/index.tsx` (mount NullMascot + DownloadNudge)
- `src/routes/legal.tsx` (conteúdo completo)

## Fora do escopo desta rodada
- Ticker "baixado há pouco" em tempo real (requer Firestore listener novo)
- Modo "Surpreenda-me" (fácil de adicionar depois como botão no hero)
- GIF animado no destaque (requer assets do usuário)

Confirma para eu executar?
