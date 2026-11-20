import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLibsqlTodoRepository, type TodoEnregistre } from "./todo-repository";

describe("TodoRepository libSQL (fichier SQLite)", () => {
  let dossier: string;
  let fichier: string;
  const clients: Client[] = [];

  /** Une connexion à la base du test : en ouvrir une nouvelle simule un redémarrage de l'application. */
  function connecter(): Client {
    const client = createClient({ url: `file:${fichier}` });
    clients.push(client);
    return client;
  }

  beforeEach(() => {
    dossier = mkdtempSync(join(tmpdir(), "todo-repository-"));
    fichier = join(dossier, "todo.db");
  });

  afterEach(() => {
    clients.splice(0).forEach((client) => {
      if (!client.closed) client.close();
    });
    rmSync(dossier, { recursive: true, force: true });
  });

  it("base qui n'existe pas encore : crée le fichier et la table, liste vide", async () => {
    expect(existsSync(fichier)).toBe(false);
    const repository = createLibsqlTodoRepository(connecter());

    expect(await repository.listerTous()).toEqual([]);

    expect(existsSync(fichier)).toBe(true);
    const tables = await connecter().execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'todos'",
    );
    expect(tables.rows).toHaveLength(1);
  });

  it("TODO en base : après fermeture et réouverture, relit les mêmes TODO", async () => {
    const premiere = connecter();
    await createLibsqlTodoRepository(premiere).listerTous();
    await premiere.batch([
      {
        sql: "INSERT INTO todos (id, titre, cree_le, termine) VALUES (?, ?, ?, ?)",
        args: ["a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0), 0],
      },
      {
        sql: "INSERT INTO todos (id, titre, cree_le, termine) VALUES (?, ?, ?, ?)",
        args: ["b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 20, 8, 0), 1],
      },
    ]);
    premiere.close();

    const relus = await createLibsqlTodoRepository(connecter()).listerTous();

    const parId = (x: TodoEnregistre, y: TodoEnregistre) => x.id.localeCompare(y.id);
    expect(relus.toSorted(parId)).toEqual([
      { id: "a", titre: "Relancer le devis", creeLe: Date.UTC(2026, 10, 16, 9, 0), termine: false },
      {
        id: "b",
        titre: "Relire le contrat de maintenance",
        creeLe: Date.UTC(2026, 10, 20, 8, 0),
        termine: true,
      },
    ]);
  });

  it("ajouter sur une base neuve : crée la table et enregistre le TODO", async () => {
    const repository = createLibsqlTodoRepository(connecter());
    const todo = { id: "a", titre: "Relancer le devis", creeLe: Date.UTC(2026, 10, 20, 11, 0), termine: false };

    await repository.ajouter(todo);

    expect(await repository.listerTous()).toEqual([todo]);
  });

  it("TODO ajouté : après fermeture et réouverture, il est toujours là", async () => {
    const premiere = connecter();
    const todo = { id: "a", titre: "Relancer le devis", creeLe: Date.UTC(2026, 10, 20, 11, 0), termine: false };
    await createLibsqlTodoRepository(premiere).ajouter(todo);
    premiere.close();

    const relus = await createLibsqlTodoRepository(connecter()).listerTous();

    expect(relus).toEqual([todo]);
  });

  it("trouver : le TODO enregistré, ou null pour un identifiant inconnu", async () => {
    const repository = createLibsqlTodoRepository(connecter());
    const todo = { id: "a", titre: "Relancer le devis", creeLe: Date.UTC(2026, 10, 20, 11, 0), termine: false };
    await repository.ajouter(todo);

    expect(await repository.trouver("a")).toEqual(todo);
    expect(await repository.trouver("inconnu")).toBeNull();
  });

  it("marquerTermine : ne change que le TODO visé, et l'état survit à la réouverture", async () => {
    const premiere = connecter();
    const repository = createLibsqlTodoRepository(premiere);
    const a = { id: "a", titre: "Relancer le devis", creeLe: Date.UTC(2026, 10, 20, 9, 0), termine: false };
    const b = { id: "b", titre: "Relire le contrat", creeLe: Date.UTC(2026, 10, 20, 10, 0), termine: false };
    await repository.ajouter(a);
    await repository.ajouter(b);

    await repository.marquerTermine("a");
    premiere.close();

    const relus = await createLibsqlTodoRepository(connecter()).listerTous();
    const parId = (x: TodoEnregistre, y: TodoEnregistre) => x.id.localeCompare(y.id);
    expect(relus.toSorted(parId)).toEqual([{ ...a, termine: true }, b]);
  });

  it("création de la table en échec (réseau coupé) : l'appel suivant réessaie", async () => {
    const vrai = connecter();
    let coupures = 1;
    // Client qui échoue une fois, comme une base distante injoignable un instant.
    const instable = {
      execute: (...args: Parameters<Client["execute"]>) => {
        if (coupures > 0) {
          coupures -= 1;
          return Promise.reject(new Error("réseau coupé"));
        }
        return vrai.execute(...args);
      },
    } as Client;
    const repository = createLibsqlTodoRepository(instable);

    await expect(repository.listerTous()).rejects.toThrow("réseau coupé");

    expect(await repository.listerTous()).toEqual([]);
  });
});
