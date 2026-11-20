import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configurationConnexion } from "./connexion";

describe("configurationConnexion", () => {
  it("aucune variable : fichier SQLite local", () => {
    expect(configurationConnexion({})).toEqual({ url: "file:local.db" });
  });

  it("DATABASE_URL : la base indiquée (tests, autre fichier)", () => {
    expect(configurationConnexion({ DATABASE_URL: "file:/tmp/autre.db" })).toEqual({ url: "file:/tmp/autre.db" });
  });

  it("variables Turso : la base Turso et son jeton, avant DATABASE_URL", () => {
    expect(
      configurationConnexion({
        TURSO_DATABASE_URL: "libsql://todo-exemple.turso.io",
        TURSO_AUTH_TOKEN: "jeton",
        DATABASE_URL: "file:/tmp/autre.db",
      }),
    ).toEqual({ url: "libsql://todo-exemple.turso.io", authToken: "jeton" });
  });

  it("Turso sans jeton : erreur explicite", () => {
    expect(() => configurationConnexion({ TURSO_DATABASE_URL: "libsql://todo-exemple.turso.io" })).toThrow(
      /TURSO_AUTH_TOKEN/,
    );
  });

  it("sur Vercel sans Turso : erreur explicite plutôt qu'un fichier effacé au déploiement suivant", () => {
    expect(() => configurationConnexion({ VERCEL: "1" })).toThrow(/TURSO_DATABASE_URL/);
  });

  it("sur Vercel avec Turso : la base Turso", () => {
    expect(
      configurationConnexion({
        VERCEL: "1",
        TURSO_DATABASE_URL: "libsql://todo-exemple.turso.io",
        TURSO_AUTH_TOKEN: "jeton",
      }),
    ).toEqual({ url: "libsql://todo-exemple.turso.io", authToken: "jeton" });
  });

  it("variables vides : ignorées", () => {
    expect(configurationConnexion({ TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", DATABASE_URL: "" })).toEqual({
      url: "file:local.db",
    });
  });
});

describe("clientParDefaut", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function clientNeuf() {
    vi.resetModules();
    const { clientParDefaut } = await import("./connexion");
    return clientParDefaut();
  }

  it("sans variable Turso : client sur fichier SQLite", async () => {
    // Un fichier temporaire plutôt que local.db : le test ne touche pas la base du poste.
    const dossier = mkdtempSync(join(tmpdir(), "todo-connexion-"));
    vi.stubEnv("TURSO_DATABASE_URL", "");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("DATABASE_URL", `file:${join(dossier, "todo.db")}`);

    const client = await clientNeuf();

    expect(client.protocol).toBe("file");
    client.close();
    rmSync(dossier, { recursive: true, force: true });
  });

  it("avec les variables Turso : client distant en HTTPS, sans fichier local", async () => {
    vi.stubEnv("TURSO_DATABASE_URL", "libsql://todo-exemple.turso.io");
    vi.stubEnv("TURSO_AUTH_TOKEN", "jeton");

    const client = await clientNeuf();

    expect(client.protocol).toBe("http");
    client.close();
  });
});
