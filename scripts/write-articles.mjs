#!/usr/bin/env node
// Pesquisa cada addon na web e escreve um artigo editorial de 1.000+ palavras
// (com FAQ e bloco de autor/E-E-A-T) em src/data/articles/<id>.json.
//
// A pesquisa usa o HTML do DuckDuckGo (títulos + trechos dos resultados) só
// como contexto factual; o texto final é escrito pelo modelo em português
// conversacional. Já existindo o arquivo do addon, ele é pulado — dá para
// rodar em lotes e retomar de onde parou.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "src/data/articles";
const MODEL = "google/gemini-3.6-flash";
const API = "https://ai.gateway.lovable.dev/v1/chat/completions";
const KEY = process.env.LOVABLE_API_KEY;
const MIN_WORDS = 1000;

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const LIMIT = Number(arg("limit", "0")) || Infinity;
const CONCURRENCY = Number(arg("concurrency", "6"));

if (!KEY) { console.error("LOVABLE_API_KEY ausente"); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripTags = (s) => s.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

async function research(addon) {
  const q = `${addon.title} minecraft bedrock ${addon.category === "Textura" ? "texture pack" : "addon"}`;
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const out = [];
    const re = /<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = re.exec(html)) && out.length < 6) {
      const title = stripTags(m[1]);
      const snippet = stripTags(m[2]);
      if (title && snippet) out.push(`- ${title}: ${snippet}`);
    }
    return out;
  } catch {
    return [];
  }
}

const SYSTEM = `Você é redator brasileiro especialista em Minecraft Bedrock e escreve para o site MineAddonsNews, do criador @ncmine.
Escreva em português do Brasil, tom conversacional e direto, sem enrolação, sem frases filosóficas, sem clichê de IA ("no mundo de hoje", "mergulhe", "desbloqueie").
Nunca invente números de download, notas, prêmios ou fatos que não estejam nos dados. Se não souber algo, fale de forma honesta e genérica.
Você responde SOMENTE com JSON válido, sem markdown.`;

function userPrompt(addon, refs) {
  return `Escreva um artigo COMPLETO de 1000 a 1200 palavras sobre este conteúdo de Minecraft Bedrock.

DADOS DA FICHA:
titulo: ${addon.title}
categoria: ${addon.category}
versao: ${addon.version || "não informada"}
autor original: ${addon.author || "não identificado"}
tags: ${(addon.tags || []).join(", ")}
resumo: ${addon.short || ""}

PESQUISA NA WEB (use só o que for coerente com o título; ignore o que for de outro conteúdo):
${refs.length ? refs.join("\n") : "(nenhum resultado encontrado — escreva apenas com base nos dados da ficha, sem inventar fatos específicos)"}

Responda com JSON neste formato exato:
{
  "intro": "2 parágrafos de abertura (separados por \\n\\n) explicando o que é e para quem serve",
  "sections": [
    {"h2": "título curto da seção", "body": "2 a 4 parágrafos separados por \\n\\n"}
  ],
  "faq": [{"q": "pergunta real que um jogador faria", "a": "resposta objetiva de 2 a 4 frases"}],
  "verdict": "1 parágrafo final honesto dizendo para quem vale a pena e para quem não vale"
}

Regras:
- 5 a 6 seções cobrindo: o que muda no jogo na prática, conteúdo/recursos principais, como instalar passo a passo no Bedrock (Android, iOS e Windows), desempenho e compatibilidade, problemas comuns e como resolver, e dicas de uso.
- 6 a 8 perguntas no FAQ (compatibilidade, conquistas, multiplayer, celular, mundo antigo, erro na importação, se é grátis).
- Some tudo: intro + sections + faq + verdict devem passar de 1000 palavras.
- Nada de listar links externos nem citar sites concorrentes.`;
}

async function callModel(messages) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": KEY },
      body: JSON.stringify({ model: MODEL, messages, response_format: { type: "json_object" } }),
      signal: AbortSignal.timeout(180000),
    });
    if (res.status === 429 || res.status >= 500) { await sleep(3000 * (attempt + 1)); continue; }
    if (res.status === 402) throw new Error("PAYMENT_REQUIRED: créditos de IA esgotados");
    if (!res.ok) throw new Error(`gateway ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }
  throw new Error("gateway indisponível após retries");
}

function parseJson(raw) {
  const t = raw.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "");
  return JSON.parse(t);
}

function countArticle(a) {
  return words(a.intro) + (a.sections || []).reduce((n, s) => n + words(s.h2) + words(s.body), 0)
    + (a.faq || []).reduce((n, f) => n + words(f.q) + words(f.a), 0) + words(a.verdict);
}

async function buildOne(addon) {
  const refs = await research(addon);
  const messages = [
    { role: "system", content: SYSTEM },
    { role: "user", content: userPrompt(addon, refs) },
  ];
  let article = parseJson(await callModel(messages));
  let total = countArticle(article);
  if (total < MIN_WORDS) {
    messages.push({ role: "assistant", content: JSON.stringify(article) });
    messages.push({ role: "user", content: `O texto ficou com ${total} palavras. Reescreva no MESMO formato JSON, mantendo o conteúdo e aprofundando as seções até passar de ${MIN_WORDS + 80} palavras. Sem repetir frases.` });
    const retry = parseJson(await callModel(messages));
    if (countArticle(retry) > total) { article = retry; total = countArticle(retry); }
  }
  return {
    id: addon.id,
    title: addon.title,
    researched: refs.length > 0,
    updatedAt: new Date().toISOString().slice(0, 10),
    wordCount: total,
    intro: article.intro || "",
    sections: (article.sections || []).filter((s) => s?.h2 && s?.body),
    faq: (article.faq || []).filter((f) => f?.q && f?.a),
    verdict: article.verdict || "",
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const addons = JSON.parse(await readFile("src/data/addons.json", "utf8"));
  const seen = new Set();
  const pending = addons.filter((a) => {
    if (!a?.id || seen.has(a.id)) return false;
    seen.add(a.id);
    return !existsSync(join(OUT_DIR, `${a.id}.json`));
  }).slice(0, LIMIT);

  const done = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".json")).length;
  console.log(`[articles] ${done} prontos | ${pending.length} nesta rodada | concorrência ${CONCURRENCY}`);

  let ok = 0, fail = 0, cursor = 0, stop = false;
  async function worker() {
    while (cursor < pending.length && !stop) {
      const addon = pending[cursor++];
      try {
        const article = await buildOne(addon);
        await writeFile(join(OUT_DIR, `${addon.id}.json`), JSON.stringify(article, null, 1) + "\n");
        ok++;
        if (ok % 25 === 0) console.log(`[articles] ${ok} escritos (${fail} falhas) — último: ${addon.id} (${article.wordCount}p)`);
      } catch (err) {
        fail++;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.startsWith("PAYMENT_REQUIRED")) { stop = true; console.error(`[articles] ${msg}`); }
        else console.warn(`[articles] falhou ${addon.id}: ${msg.slice(0, 160)}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker));
  console.log(`[articles] rodada concluída: ${ok} novos, ${fail} falhas.`);
}

main().catch((e) => { console.error("[articles]", e); process.exit(1); });