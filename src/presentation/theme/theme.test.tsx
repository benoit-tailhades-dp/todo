// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { MenuTheme } from "./menu-theme";
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

/** Ouverture de l'application : le script du <head>, puis l'écran et son bouton de thème. */
function ouvrirApplication({ systemeSombre, enregistre }: { systemeSombre: boolean; enregistre?: string }) {
  if (enregistre !== undefined) window.localStorage.setItem(CLE_THEME, enregistre);
  const systeme = fauxSysteme(systemeSombre);
  executerScriptDuHead();
  render(<MenuTheme />);
  return systeme;
}

function themeDeLaPage(): string | null {
  return document.documentElement.getAttribute("data-theme");
}

function bouton(): HTMLElement {
  return screen.getByRole("button", { name: /^Thème/ });
}

function ouvrirMenu(): HTMLElement {
  fireEvent.click(bouton());
  return screen.getByRole("menu");
}

function choisir(libelle: "Système" | "Clair" | "Sombre") {
  fireEvent.click(within(ouvrirMenu()).getByRole("menuitemradio", { name: libelle }));
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

describe("MenuTheme : choisir Système, Clair ou Sombre", () => {
  it("le bouton annonce le thème actif : « Thème : Système » par défaut", () => {
    ouvrirApplication({ systemeSombre: false });
    expect(bouton()).toHaveProperty("ariaLabel", "Thème : Système");
  });

  it("Sombre enregistré : le bouton annonce « Thème : Sombre »", () => {
    ouvrirApplication({ systemeSombre: false, enregistre: "sombre" });
    expect(bouton()).toHaveProperty("ariaLabel", "Thème : Sombre");
  });

  it("le menu propose Système, Clair et Sombre, le choix actif coché", () => {
    ouvrirApplication({ systemeSombre: false, enregistre: "clair" });
    const menu = ouvrirMenu();
    const choix = within(menu).getAllByRole("menuitemradio");
    expect(choix.map((c) => c.textContent)).toEqual(["Système", "Clair", "Sombre"]);
    expect(choix.map((c) => c.getAttribute("aria-checked"))).toEqual(["false", "true", "false"]);
  });

  it("en clair, choisir Sombre : toute la page passe en sombre tout de suite, et le choix est enregistré", () => {
    ouvrirApplication({ systemeSombre: false });
    expect(themeDeLaPage()).toBe("clair");

    choisir("Sombre");

    expect(themeDeLaPage()).toBe("sombre");
    expect(window.localStorage.getItem(CLE_THEME)).toBe("sombre");
    expect(bouton()).toHaveProperty("ariaLabel", "Thème : Sombre");
    expect(screen.queryByRole("menu")).toBeNull();
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
    expect(bouton()).toHaveProperty("ariaLabel", "Thème : Système");

    systeme.basculer(true);
    expect(themeDeLaPage()).toBe("sombre");
  });

  it("au clavier : Entrée ouvre le menu sur le choix actif, flèche bas puis Entrée choisit, le focus revient au bouton", async () => {
    ouvrirApplication({ systemeSombre: true });
    bouton().focus();

    fireEvent.keyDown(bouton(), { key: "Enter" });
    fireEvent.click(bouton());
    const menu = screen.getByRole("menu");
    // Le menu donne le focus au choix actif à l'image suivante.
    await waitFor(() =>
      expect(document.activeElement).toBe(within(menu).getByRole("menuitemradio", { name: "Système" })),
    );

    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowDown" });
    expect(document.activeElement).toBe(within(menu).getByRole("menuitemradio", { name: "Clair" }));

    fireEvent.keyDown(document.activeElement as Element, { key: "Enter" });

    expect(themeDeLaPage()).toBe("clair");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(document.activeElement).toBe(bouton());
    expect(bouton()).toHaveProperty("ariaLabel", "Thème : Clair");
  });

  it("l'attribut effacé par React (remontage du mode Strict en dev) : le menu le repose", () => {
    window.localStorage.setItem(CLE_THEME, "sombre");
    fauxSysteme(false);
    executerScriptDuHead();
    document.documentElement.removeAttribute("data-theme");

    render(<MenuTheme />);

    expect(themeDeLaPage()).toBe("sombre");
  });
});
