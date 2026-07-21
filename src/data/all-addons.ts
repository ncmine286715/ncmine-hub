// Catálogo de addons dividido em múltiplos arquivos JSON porque o
// addons.json original ficou grande demais pra editar direto pelo GitHub.
//
// addons.json      -> catálogo legado (não editar mais, só leitura)
// addons-2.json    -> arquivo limpo para novos addons a partir de agora
//
// Pra adicionar um novo arquivo no futuro (addons-3.json, etc.), crie o
// JSON em ./ e inclua o import na lista de shards abaixo — e replique o
// mesmo caminho em scripts/prerender.mjs (script Node puro, sem bundler).
import shard1 from "./addons.json";
import shard2 from "./addons-2.json";

const shards = [shard1, shard2];

const allAddons = shards.flat();

export default allAddons;
