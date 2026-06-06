# 🔥 Firebase — Configuração NCMINE HUB

Este documento descreve **exatamente** o que precisa estar configurado no Console do Firebase para o site funcionar 100% (login, XP, comentários, analytics e painel admin).

---

## 1. Authentication

No Console do Firebase → **Authentication → Sign-in method**:

1. **Google** → habilitar (Enable). Defina e-mail de suporte.
2. **Email/Password** → habilitar (opcional, mas o site oferece como fallback).
3. Em **Authentication → Settings → Authorized domains**, adicione:
   - `ncmine-hub.lovable.app`
   - `ncmine-hub.pages.dev` (se usar Cloudflare Pages)
   - Domínios customizados que você usar.

---

## 2. Firestore — Regras de Segurança

Cole o conteúdo do arquivo [`firestore.rules`](./firestore.rules) na aba **Rules** do Firestore.

As regras cobrem:
- 👤 **Usuários** — só você edita o próprio perfil; XP de terceiros pode ser incrementado por qualquer logado.
- 💬 **Comentários** — qualquer um lê; só logado cria; só dono edita/apaga; likes/replies counts atualizáveis por qualquer logado.
- ❤️ **Favoritos / ⭐ Ratings / ⬇️ Downloads** — só logado, e o ID precisa começar com `uid_…` (anti-abuso).
- 📈 **Analytics (`public_events`)** — qualquer um (mesmo deslogado) pode **criar** eventos; apenas o admin lê.
- 📊 **`daily_stats`** — contadores diários globais, leitura pública (para painel) e incremento aberto.
- 📦 **`addons`** — contadores agregados de downloads/views/etc.; leitura pública, escrita por logados.
- 🛡️ **`global_notifications`** — só o admin (`rosidomingos032@gmail.com`) cria notificações.

---

## 3. Coleções criadas pelo site (automático)

| Coleção            | Função                                                  |
|--------------------|---------------------------------------------------------|
| `users`            | Perfil, XP, rank, favoritos                              |
| `addons`           | Contadores por addon: downloads, views, clicks, shares  |
| `comments`         | Comentários com replies aninhadas                        |
| `favorites`        | Relação usuário ↔ addon favoritado                       |
| `ratings`          | Avaliações com nota e texto                              |
| `downloads`        | Registro de quem baixou o quê                            |
| `likes`            | Curtidas em comentários                                  |
| `public_events`    | Log bruto de cada evento (page view, click, share, ...) |
| `daily_stats`      | Agregado por dia (`YYYY-MM-DD`)                          |
| `global_notifications` | Notificações enviadas para todos os usuários         |

---

## 4. Painel Admin

Acesse em `/admin` logado com `rosidomingos032@gmail.com`. Mostra:

- 📊 KPIs do dia: downloads, views, clicks, sessões, CTR, profundidade de rolagem média.
- 📅 Tabela dos últimos 7 dias.
- 🏆 Top 20 addons por downloads, com Views, CTR, Rating, Favoritos.
- 👥 Novos usuários e XP.
- 💬 Comentários recentes.
- ⚡ Stream de eventos em tempo real.
- 📢 Broadcast de notificações globais.

---

## 5. Sistema de XP

| Ação               | XP   |
|--------------------|------|
| Conta criada       | 10   |
| Avaliar (5⭐ + texto) | +5  |
| Comentar           | +2   |
| Favoritar          | +1   |
| Baixar addon       | +5   |

Ranks: `Iniciante` → `Explorador` (50 XP) → `Veterano` (200 XP) → `Lenda` (500 XP).

---

## 6. Checklist final

- [ ] Provider Google ativado.
- [ ] Domínios autorizados.
- [ ] Regras do Firestore publicadas.
- [ ] Login funciona com 1 clique no Google.
- [ ] Após login, abrir `/profile` e clicar **Abrir Painel Admin** (se for o e-mail admin).
- [ ] Verificar que ações geram eventos no `public_events`.