import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { composerRegistre } from "./registre";

describe("todoService (assemblé sur la vraie base)", () => {
  let dossier: string;
  let fichier: string;

  /** Un assemblage neuf, avec sa propre connexion : comme après un redémarrage de l'application. */
  async function demarrer() {
    vi.resetModules();
    const { todoService } = await import("./instances");
    return todoService();
  }

  beforeEach(() => {
    dossier = mkdtempSync(join(tmpdir(), "todo-instances-"));
    fichier = join(dossier, "todo.db");
    vi.stubEnv("DATABASE_URL", `file:${fichier}`);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(dossier, { recursive: true, force: true });
  });

  it("première ouverture : crée la base et renvoie une liste vide", async () => {
    const service = await demarrer();

    expect(await service.lister()).toEqual([]);
    expect(existsSync(fichier)).toBe(true);
  });

  it("TODO ajouté : toujours là après un redémarrage", async () => {
    const avant = await demarrer();
    await avant.ajouter("  Relancer le devis  ", Date.UTC(2026, 10, 20, 11, 0));

    const apres = await demarrer();

    expect(await apres.lister()).toEqual([
      expect.objectContaining({
        titre: "Relancer le devis",
        creeLe: Date.UTC(2026, 10, 20, 11, 0),
        termine: false,
      }),
    ]);
  });

  it("TODO terminé : toujours terminé après un redémarrage", async () => {
    const avant = await demarrer();
    const ajout = await avant.ajouter("Relancer le devis", Date.UTC(2026, 10, 20, 11, 0));
    if (!ajout.ok) throw new Error("ajout refusé");
    expect(await avant.terminer(ajout.todo.id)).toEqual({ ok: true });

    const apres = await demarrer();

    expect(await apres.lister()).toEqual([{ ...ajout.todo, termine: true }]);
  });

  it("TODO dont la date a changé : toujours sous son nouveau jour après un redémarrage", async () => {
    const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);
    const avant = await demarrer();
    const ajout = await avant.ajouter("Relancer le devis", VENDREDI_20_MIDI);
    if (!ajout.ok) throw new Error("ajout refusé");
    expect(await avant.changerDate(ajout.todo.id, "2026-11-16")).toEqual({ ok: true });

    const apres = await demarrer();

    const { jours } = composerRegistre(await apres.lister(), VENDREDI_20_MIDI);
    expect(jours.map(({ titre, todos }) => ({ titre, titres: todos.map((t) => t.titre) }))).toEqual([
      { titre: "Lundi 16 novembre", titres: ["Relancer le devis"] },
    ]);
  });
});
