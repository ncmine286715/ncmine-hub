// Copia src/data/addons.json -> public/addons.json para que o catálogo
// fique disponível como arquivo estático e possa ser atualizado/servido
// sem depender do bundle JS.
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("public", { recursive: true });
await copyFile("src/data/addons.json", "public/addons.json");
console.log("[sync-addons] public/addons.json atualizado");
