import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const CSS = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

/** Contenu du premier bloc `selecteur { … }` de premier niveau, accolades imbriquées comprises. */
function bloc(selecteur: string): string {
  const debut = CSS.indexOf(`\n${selecteur} {`);
  if (debut === -1) throw new Error(`Bloc introuvable : ${selecteur}`);
  const ouverture = CSS.indexOf("{", debut);
  let profondeur = 0;
  for (let i = ouverture; i < CSS.length; i++) {
    if (CSS[i] === "{") profondeur++;
    if (CSS[i] === "}" && --profondeur === 0) return CSS.slice(ouverture + 1, i);
  }
  throw new Error(`Bloc non fermé : ${selecteur}`);
}

/** Jetons de couleur déclarés dans un bloc : `--nom: #hex`. */
function jetonsDeCouleur(contenu: string): string[] {
  return [...contenu.matchAll(/(--[\w-]+)\s*:\s*#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[1]);
}

describe("globals.css : le thème suit l'attribut data-theme de <html>", () => {
  it("chaque jeton de couleur clair a sa valeur sombre sous [data-theme=\"sombre\"]", () => {
    const clairs = jetonsDeCouleur(bloc(":root"));
    const sombres = jetonsDeCouleur(bloc(':root[data-theme="sombre"]'));
    expect(clairs.length).toBeGreaterThan(20);
    expect(sombres.sort()).toEqual(clairs.sort());
  });

  it("le sombre règle aussi les contrôles natifs (color-scheme), le clair les garde clairs", () => {
    expect(bloc(':root[data-theme="sombre"]')).toMatch(/color-scheme:\s*dark;/);
    expect(bloc(":root")).toMatch(/color-scheme:\s*light;/);
  });

  it("plus aucune règle ne dépend de prefers-color-scheme : le script du <head> a déjà résolu Système", () => {
    expect(CSS).not.toMatch(/prefers-color-scheme/);
  });

  it("la variante dark: de Tailwind suit le même attribut", () => {
    expect(CSS).toMatch(/@custom-variant dark \(&:where\(\[data-theme="sombre"\], \[data-theme="sombre"\] \*\)\);/);
  });
});
