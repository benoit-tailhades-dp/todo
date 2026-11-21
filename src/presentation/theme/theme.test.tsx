// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { SelecteurTheme } from "./selecteur-theme";
import { CLE_THEME, ScriptTheme, scriptTheme } from "./script-theme";

const SYSTEME_SOMBRE = "(prefers-color-scheme: dark)";

/**
 * Faux réglage du système, écrit ici : jsdom n'a pas de matchMedia.
 * `basculer` imite l'utilisateur qui change l'apparence de son système, page ouverte.
 */
function fauxSysteme(sombre: boolean) {
  const ecouteurs = new Set<() => void>();
  const requete = {
    media: SYSTEME_SOMBRE,
    matches: sombre,
    addEventListener: (_type: string, ecouteur: () => void) => ecouteurs.add(ecouteur),
    removeEventListener: (_type: string, ecouteur: () => void) => ecouteurs.delete(ecouteur),
  };
  const autre = { matches: false, addEventListener: () => {}, removeEventListener: () => {} };
  window.matchMedia = ((media: string) => (media === SYSTEME_SOMBRE ? requete : autre)) as unknown as typeof window.matchMedia;
  return {
    basculer(sombreMaintenant: boolean) {
      requete.matches = sombreMaintenant;
      act(() => ecouteurs.forEach((ecouteur) => ecouteur()));
    },
  };
}

/** Ce que fait le navigateur en lisant le <head> : il exécute le script tel qu'il est envoyé. */
function executerScriptDuHead() {
  new Function(scriptTheme())();
}

/** Ouverture de l'application : le script du <head>, puis l'écran et son sélecteur de thème. */
function ouvrirApplication({ systemeSombre, enregistre }: { systemeSombre: boolean; enregistre?: string }) {
  if (enregistre !== undefined) window.localStorage.setItem(CLE_THEME, enregistre);
  const systeme = fauxSysteme(systemeSombre);
  executerScriptDuHead();
  render(<SelecteurTheme />);
  return systeme;
}

function themeDeLaPage(): string | null {
  return document.documentElement.getAttribute("data-theme");
}

function selecteur(): HTMLElement {
  return screen.getByRole("radiogroup", { name: "Thème" });
}

function pastille(libelle: "Système" | "Clair" | "Sombre"): HTMLElement {
  return within(selecteur()).getByRole("radio", { name: libelle });
}

/** Le choix que le lecteur d'écran annonce comme coché. */
function choixCoche(): string | null {
  return within(selecteur())
    .getAllByRole("radio")
    .find((radio) => radio.getAttribute("aria-checked") === "true")
    ?.getAttribute("aria-label") ?? null;
}

function choisir(libelle: "Système" | "Clair" | "Sombre") {
  fireEvent.click(pastille(libelle));
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("script du <head> : le thème est posé avant le premier rendu", () => {
  it("rien d'enregistré (Système) : la page prend le thème du système, sombre ou clair", () => {
    fauxSysteme(true);
    executerScriptDuHead();
    expect(themeDeLaPage()).toBe("sombre");

    fauxSysteme(false);
    executerScriptDuHead();
    expect(themeDeLaPage()).toBe("clair");
  });

  it("Système : quand le système change d'apparence, la page suit", () => {
    const systeme = fauxSysteme(false);
    executerScriptDuHead();
    systeme.basculer(true);
    expect(themeDeLaPage()).toBe("sombre");
    systeme.basculer(false);
    expect(themeDeLaPage()).toBe("clair");
  });

  it("Sombre enregistré, système clair : à la réouverture, la page est sombre dès le départ", () => {
    window.localStorage.setItem(CLE_THEME, "sombre");
    fauxSysteme(false);
    executerScriptDuHead();
    expect(themeDeLaPage()).toBe("sombre");
  });

  it("Clair enregistré : le système passe en sombre, la page reste claire", () => {
    window.localStorage.setItem(CLE_THEME, "clair");
    const systeme = fauxSysteme(false);
    executerScriptDuHead();
    systeme.basculer(true);
    expect(themeDeLaPage()).toBe("clair");
  });

  it("valeur enregistrée abîmée : Système", () => {
    window.localStorage.setItem(CLE_THEME, "violet");
    fauxSysteme(true);
    executerScriptDuHead();
    expect(themeDeLaPage()).toBe("sombre");
  });

  it("stockage inaccessible (navigation privée stricte) : Système, sans erreur", () => {
    const stockage = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    try {
      fauxSysteme(true);
      expect(executerScriptDuHead).not.toThrow();
      expect(themeDeLaPage()).toBe("sombre");
    } finally {
      if (stockage) Object.defineProperty(window, "localStorage", stockage);
    }
  });

  it("rendu en <script> inline, sans src ni async ni defer : le navigateur l'exécute en lisant le <head>", () => {
    const html = renderToStaticMarkup(<ScriptTheme />);
    expect(html).toMatch(/^<script>[\s\S]+<\/script>$/);
    expect(html).not.toMatch(/\b(src|async|defer|type)=/);
    expect(html).toContain(scriptTheme());
  });
});

describe("SelecteurTheme : choisir Système, Clair ou Sombre", () => {
  it("les trois choix sont visibles d'emblée, sans menu à ouvrir, et « Système » est coché par défaut", () => {
    ouvrirApplication({ systemeSombre: false });

    expect(within(selecteur()).getAllByRole("radio").map((radio) => radio.getAttribute("aria-label"))).toEqual([
      "Système",
      "Clair",
      "Sombre",
    ]);
    expect(choixCoche()).toBe("Système");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Sombre enregistré : « Sombre » est coché", () => {
    ouvrirApplication({ systemeSombre: false, enregistre: "sombre" });
    expect(choixCoche()).toBe("Sombre");
  });

  it("en clair, choisir Sombre : toute la page passe en sombre tout de suite, et le choix est enregistré", () => {
    ouvrirApplication({ systemeSombre: false });
    expect(themeDeLaPage()).toBe("clair");

    choisir("Sombre");

    expect(themeDeLaPage()).toBe("sombre");
    expect(window.localStorage.getItem(CLE_THEME)).toBe("sombre");
    expect(choixCoche()).toBe("Sombre");
  });

  it("Sombre choisi : à la réouverture, la page est sombre avant même l'affichage de l'écran", () => {
    ouvrirApplication({ systemeSombre: false });
    choisir("Sombre");
    cleanup();
    document.documentElement.removeAttribute("data-theme");

    fauxSysteme(false);
    executerScriptDuHead();
    expect(themeDeLaPage()).toBe("sombre");
  });

  it("Clair choisi : le système passe en sombre, la page reste claire", () => {
    const systeme = ouvrirApplication({ systemeSombre: false });
    choisir("Clair");
    systeme.basculer(true);
    expect(themeDeLaPage()).toBe("clair");
  });

  it("Sombre puis Système : le choix est effacé et la page suit de nouveau le système", () => {
    const systeme = ouvrirApplication({ systemeSombre: false });
    choisir("Sombre");
    choisir("Système");

    expect(window.localStorage.getItem(CLE_THEME)).toBeNull();
    expect(themeDeLaPage()).toBe("clair");
    expect(choixCoche()).toBe("Système");

    systeme.basculer(true);
    expect(themeDeLaPage()).toBe("sombre");
  });

  it("au clavier : seul le choix actif est dans l'ordre de tabulation, la flèche passe au suivant et l'applique", async () => {
    ouvrirApplication({ systemeSombre: true });
    expect(pastille("Système").tabIndex).toBe(0);
    expect(pastille("Clair").tabIndex).toBe(-1);
    pastille("Système").focus();

    fireEvent.keyDown(pastille("Système"), { key: "ArrowRight" });
    // Base UI déplace le focus dans une micro-tâche, après sa propre gestion du focus.
    await act(async () => {});

    expect(document.activeElement).toBe(pastille("Clair"));
    expect(choixCoche()).toBe("Clair");
    expect(themeDeLaPage()).toBe("clair");
  });

  it("l'attribut effacé par React (remontage du mode Strict en dev) : le sélecteur le repose", () => {
    window.localStorage.setItem(CLE_THEME, "sombre");
    fauxSysteme(false);
    executerScriptDuHead();
    document.documentElement.removeAttribute("data-theme");

    render(<SelecteurTheme />);

    expect(themeDeLaPage()).toBe("sombre");
  });
});
