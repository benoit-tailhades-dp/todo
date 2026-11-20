import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("todoService (assemblé sur la vraie base)", () => {
  let dossier: string;

  beforeEach(() => {
    dossier = mkdtempSync(join(tmpdir(), "todo-instances-"));
    // Chaque test repart d'un assemblage neuf, qui relit DATABASE_URL.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(dossier, { recursive: true, force: true });
  });

  it("première ouverture : crée la base et renvoie une liste vide", async () => {
    const fichier = join(dossier, "todo.db");
    vi.stubEnv("DATABASE_URL", `file:${fichier}`);
    const { todoService } = await import("./instances");

    const registre = await todoService().consulter(Date.UTC(2026, 10, 20, 11, 0));

    expect(registre.jours).toEqual([]);
    expect(existsSync(fichier)).toBe(true);
  });
});
