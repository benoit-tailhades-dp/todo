import { describe, expect, it } from "vitest";
import { validerTitre } from "./titre";

describe("validerTitre", () => {
  it("accepte un titre et le garde tel quel", () => {
    expect(validerTitre("Relancer le devis")).toEqual({ ok: true, titre: "Relancer le devis" });
  });

  it("retire les espaces autour du titre", () => {
    expect(validerTitre("  Relancer le devis  ")).toEqual({ ok: true, titre: "Relancer le devis" });
    expect(validerTitre("\tRelancer le devis\n")).toEqual({ ok: true, titre: "Relancer le devis" });
  });

  it("refuse un titre vide ou qui ne contient que des espaces", () => {
    expect(validerTitre("")).toEqual({ ok: false, erreur: "titre-vide" });
    expect(validerTitre("   ")).toEqual({ ok: false, erreur: "titre-vide" });
  });

  it("refuse ce qui n'est pas un texte (appel direct de l'action serveur)", () => {
    expect(validerTitre(undefined)).toEqual({ ok: false, erreur: "titre-vide" });
    expect(validerTitre(42)).toEqual({ ok: false, erreur: "titre-vide" });
    expect(validerTitre({ titre: "x" })).toEqual({ ok: false, erreur: "titre-vide" });
  });
});
