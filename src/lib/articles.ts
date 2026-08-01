// Artigos editoriais (1.000+ palavras) gerados por ficha em src/data/articles.
// Carregados por chunk individual: o bundle não carrega 2.400 artigos de uma vez,
// e no SSR/prerender o conteúdo entra direto no HTML da página.
export type ArticleSection = { h2: string; body: string };
export type ArticleFaq = { q: string; a: string };
export type AddonArticle = {
  id: string;
  title: string;
  researched?: boolean;
  updatedAt?: string;
  wordCount?: number;
  intro: string;
  sections: ArticleSection[];
  faq: ArticleFaq[];
  verdict: string;
};

const modules = import.meta.glob("../data/articles/*.json") as Record<
  string,
  () => Promise<{ default: AddonArticle }>
>;

const byId = new Map<string, () => Promise<{ default: AddonArticle }>>();
for (const [path, loader] of Object.entries(modules)) {
  const id = path.split("/").pop()!.replace(/\.json$/, "");
  byId.set(id, loader);
}

export const hasArticle = (id: string) => byId.has(id);

export async function loadArticle(id: string): Promise<AddonArticle | null> {
  const loader = byId.get(id);
  if (!loader) return null;
  try {
    return (await loader()).default;
  } catch {
    return null;
  }
}