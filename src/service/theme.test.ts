import { describe, expect, it } from "vitest";
import { CHOIX_THEME, lireChoixTheme, themeAffiche } from "./theme";

describe("CHOIX_THEME", () => {
  it("propose Système, Clair puis Sombre", () => {
    expect(CHOIX_THEME).toEqual([
      { valeur: "systeme", libelle: "Système" },
      { valeur: "clair", libelle: "Clair" },
      { valeur: "sombre", libelle: "Sombre" },
    ]);
  });
});

describe("lireChoixTheme", () => {
  it("garde un choix Clair ou Sombre enregistré", () => {
    expect(lireChoixTheme("clair")).toBe("clair");
    expect(lireChoixTheme("sombre")).toBe("sombre");
  });

  it("aucun choix enregistré : Système, le réglage par défaut", () => {
    expect(lireChoixTheme(null)).toBe("systeme");
    expect(lireChoixTheme(undefined)).toBe("systeme");
    expect(lireChoixTheme("systeme")).toBe("systeme");
  });

  it("valeur inconnue ou abîmée : Système", () => {
    expect(lireChoixTheme("")).toBe("systeme");
    expect(lireChoixTheme("dark")).toBe("systeme");
    expect(lireChoixTheme("Sombre")).toBe("systeme");
    expect(lireChoixTheme(42)).toBe("systeme");
  });
});

describe("themeAffiche", () => {
  it("Système : sombre si le système est sombre, clair sinon", () => {
    expect(themeAffiche("systeme", true)).toBe("sombre");
    expect(themeAffiche("systeme", false)).toBe("clair");
  });

  it("Clair ou Sombre choisi : le réglage du système n'y change rien", () => {
    expect(themeAffiche("clair", true)).toBe("clair");
    expect(themeAffiche("clair", false)).toBe("clair");
    expect(themeAffiche("sombre", false)).toBe("sombre");
    expect(themeAffiche("sombre", true)).toBe("sombre");
  });

  it("fonctions autonomes : elles se recopient telles quelles dans le script du <head>", () => {
    const lire = new Function(`return (${lireChoixTheme.toString()})`)() as typeof lireChoixTheme;
    const afficher = new Function(`return (${themeAffiche.toString()})`)() as typeof themeAffiche;
    expect(afficher(lire("clair"), true)).toBe("clair");
    expect(afficher(lire("inconnu"), true)).toBe("sombre");
  });
});
