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
});
