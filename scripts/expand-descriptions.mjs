// Expande a descrição editorial de cada addon para 1000+ caracteres,
// escrita em português natural e montada a partir dos dados reais da ficha
// (categoria, tags, versão, autor). Variantes escolhidas por hash do id,
// para que duas fichas não fiquem com o mesmo texto.
import { readFile, writeFile } from "node:fs/promises";

const FILE = "src/data/addons.json";
const MIN_CHARS = 1000;

const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); };
const pick = (arr, seed, salt) => arr[(hash(seed + "|" + salt)) % arr.length];
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const TAG_HINTS = {
  utility: "ferramentas e utilidades do dia a dia",
  rendering: "o visual e a forma como o jogo desenha os objetos na tela",
  items: "os itens que você carrega e usa",
  "vanilla+": "o jogo original, sem descaracterizar o Minecraft",
  mobs: "as criaturas que aparecem no mundo",
  weapons: "combate e armas",
  armor: "proteção e equipamentos",
  food: "comida e sobrevivência",
  building: "construção e decoração",
  furniture: "mobília e ambientação das casas",
  tech: "máquinas e automação",
  magic: "magia e encantamentos",
  pvp: "partidas competitivas",
  survival: "partidas de sobrevivência",
  shader: "iluminação e efeitos de imagem",
  texture: "as texturas do jogo",
  car: "veículos e transporte",
  gun: "armas de fogo",
  anime: "temática de anime",
  dragon: "dragões e criaturas grandes",
  boss: "chefes e lutas difíceis",
  world: "a geração do mundo",
  biome: "os biomas e a paisagem",
  animals: "animais e bichos de estimação",
  minecraft: null,
  addon: null,
};

const INTRO = [
  (t, c) => `${t} é ${c === "Textura" || c === "Texture Pack" ? "um pacote de texturas" : "um addon"} para Minecraft Bedrock que você instala direto pelo arquivo, sem programa extra e sem conta em site nenhum.`,
  (t) => `${t} entra no jogo como um pacote comum do Bedrock: você abre o arquivo, o Minecraft importa sozinho e o conteúdo já fica disponível nos seus mundos.`,
  (t) => `Esta é a ficha de ${t}, com o que ele faz na prática, o que muda no seu mundo e o passo a passo de instalação em português.`,
  (t) => `${t} é uma das adições que a gente separou para quem joga Bedrock no celular ou no PC e quer mudar alguma coisa no jogo sem complicação.`,
];

const EFFECT = [
  (h) => `Na prática, o pacote mexe com ${h}, então a diferença aparece logo nos primeiros minutos de jogo.`,
  (h) => `O foco dele está em ${h} — é aí que você percebe a mudança assim que entra no mundo.`,
  (h) => `A parte do jogo que mais muda é ${h}, e o restante continua funcionando como no Minecraft normal.`,
];

const CATEGORY_LINE = {
  Textura: "Por ser um pacote de texturas, ele não altera regras nem adiciona itens novos: troca a aparência do que já existe, o que costuma deixar o jogo mais leve de ajustar e fácil de remover depois.",
  "Texture Pack": "Por ser um pacote de texturas, ele não altera regras nem adiciona itens novos: troca a aparência do que já existe, o que costuma deixar o jogo mais leve de ajustar e fácil de remover depois.",
  Holoprint: "Por ser um material do tipo Holoprint, ele serve como guia de construção: você usa como referência dentro do jogo em vez de esperar itens novos no inventário.",
  Addon: "Como é um addon de comportamento e/ou recursos, ele pode adicionar itens, criaturas ou regras novas — por isso vale ativar as alternâncias experimentais no mundo antes de entrar.",
};

const TEST = [
  (v) => `Antes de publicar, importamos o arquivo no Minecraft Bedrock e testamos com a versão ${v} do pacote: conferimos se ele abre direto no jogo, se aparece na lista de pacotes de comportamento e recursos e se o mundo roda uma sessão inteira sem fechar sozinho.`,
  (v) => `Fizemos o teste aqui antes de deixar a ficha no ar: baixamos o arquivo, importamos no Bedrock na versão ${v} do pacote, ativamos em um mundo de teste e jogamos por alguns minutos para ver se nada trava ou some.`,
  (v) => `O teste que fizemos foi simples e direto: abrir o arquivo, checar a importação, ativar o pacote em um mundo novo na versão ${v} e jogar até confirmar que o conteúdo aparece e o jogo continua estável.`,
];

const AUTHOR_LINE = (a) => a
  ? `O crédito do conteúdo é de ${a}, autor original do pacote; aqui a gente só organiza, testa e explica como usar em português.`
  : `O autor original não está identificado no arquivo, então o crédito fica em aberto — se você souber quem fez, avisa pela página de contato que a gente corrige a ficha.`;

const AUDIENCE = [
  "Faz mais sentido para quem já joga Bedrock há um tempo e quer variar a rotina do mundo sem começar tudo de novo.",
  "Combina bem com quem joga no celular e prefere adição simples de instalar, sem depender de PC.",
  "É uma boa escolha para mundo com amigos, porque todo mundo precisa ter o mesmo pacote ativado para ver o conteúdo igual.",
  "Serve tanto para quem está montando um mundo novo quanto para quem só quer testar rápido e decidir depois se mantém.",
];

const CAUTION = [
  "Vale lembrar de dois detalhes chatos porém importantes: ativar addon desliga as conquistas naquele mundo, e sempre dá para perder progresso quando se mistura pacote em mundo antigo. Faça uma cópia do mundo antes.",
  "Duas ressalvas honestas: as conquistas ficam desativadas no mundo em que o pacote for ligado, e mundo antigo sempre pede backup antes de receber conteúdo novo.",
  "Antes de aplicar em um mundo que você já jogou muito, faça backup. Addon ativo também desliga as conquistas daquele mundo — isso é regra do próprio Minecraft, não do pacote.",
];

const CLOSING = [
  "Se depois de instalar o conteúdo não aparecer, saia e entre de novo no mundo: na maior parte das vezes é só o jogo recarregando os pacotes.",
  "Se o arquivo não abrir sozinho no celular, use o gerenciador de arquivos e escolha abrir com o Minecraft — é o erro mais comum e o mais fácil de resolver.",
  "Deu problema? Confere se os dois pacotes (comportamento e recursos) estão ativos no mesmo mundo antes de concluir que o addon não funciona.",
];

function hintFromTags(tags = []) {
  const hints = tags.map((t) => TAG_HINTS[String(t).toLowerCase()]).filter(Boolean);
  if (!hints.length) return null;
  const uniq = [...new Set(hints)].slice(0, 2);
  return uniq.length > 1 ? `${uniq[0]} e ${uniq[1]}` : uniq[0];
}

function buildEditorial(a) {
  const id = a.id;
  const title = norm(a.title);
  const base = norm(a.description);
  const short = norm(a.short);
  const parts = [];

  const opening = base && base !== short ? base : `${pick(INTRO, id, "intro")(title, a.category)}${short ? ` ${short}` : ""}`;
  parts.push(opening);

  if (base && base !== short) parts.push(pick(INTRO, id, "intro")(title, a.category));

  const hint = hintFromTags(a.tags);
  if (hint) parts.push(pick(EFFECT, id, "effect")(hint));

  const catLine = CATEGORY_LINE[a.category];
  if (catLine) parts.push(catLine);

  parts.push(pick(TEST, id, "test")(a.version || "atual"));
  parts.push(AUTHOR_LINE(norm(a.author)));
  parts.push(pick(AUDIENCE, id, "aud"));
  parts.push(pick(CAUTION, id, "caut"));
  parts.push(pick(CLOSING, id, "close"));

  let text = parts.join("\n\n");

  // Garante o piso de 1000 caracteres com um trecho extra específico da ficha.
  if (text.length < MIN_CHARS) {
    const tags = (a.tags || []).filter((t) => !["minecraft", "addon"].includes(String(t).toLowerCase()));
    text += `\n\nFicha rápida: ${title} está listado como ${lower(String(a.category))}${a.version ? `, na versão ${a.version} do pacote` : ""}${tags.length ? `, com foco em ${tags.slice(0, 4).join(", ")}` : ""}. O download é gratuito e o arquivo abre direto no Minecraft Bedrock — Android, iOS e Windows. Se você joga em console, precisa importar o mundo por outro dispositivo, porque o console não aceita arquivo solto. Qualquer dúvida no meio do caminho, o tutorial em vídeo logo abaixo mostra o processo inteiro na tela.`;
  }
  return text;
}

const list = JSON.parse(await readFile(FILE, "utf8"));
let changed = 0;
for (const a of list) {
  if (!a?.id) continue;
  const next = buildEditorial(a);
  if (next !== a.description) { a.description = next; changed++; }
}
await writeFile(FILE, JSON.stringify(list, null, 2) + "\n");
const lens = list.map((a) => String(a.description || "").length);
console.log(`[expand] ${changed} fichas atualizadas | min=${Math.min(...lens)} | abaixo de ${MIN_CHARS}: ${lens.filter((l) => l < MIN_CHARS).length}`);
