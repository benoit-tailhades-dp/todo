import "server-only";
import type { Client, Row } from "@libsql/client";

export type TodoEnregistre = {
  id: string;
  titre: string;
  /** Instant d'ajout, en millisecondes depuis l'époque Unix (UTC). */
  creeLe: number;
  termine: boolean;
};

export interface TodoRepository {
  listerTous(): Promise<TodoEnregistre[]>;
  ajouter(todo: TodoEnregistre): Promise<void>;
  /** Le TODO de cet identifiant, ou `null`. */
  trouver(id: string): Promise<TodoEnregistre | null>;
  marquerTermine(id: string): Promise<void>;
}

const CREER_TABLE = `
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    titre TEXT NOT NULL,
    cree_le INTEGER NOT NULL,
    termine INTEGER NOT NULL DEFAULT 0
  )
`;

function versTodo(ligne: Row): TodoEnregistre {
  return {
    id: String(ligne.id),
    titre: String(ligne.titre),
    creeLe: Number(ligne.cree_le),
    termine: Number(ligne.termine) === 1,
  };
}

export function createLibsqlTodoRepository(client: Client): TodoRepository {
  // La table est créée avant la première requête, une seule fois par connexion.
  // Un échec (base distante injoignable) n'est pas gardé : l'appel suivant réessaie.
  let table: Promise<unknown> | undefined;
  function pret() {
    table ??= client.execute(CREER_TABLE).catch((erreur: unknown) => {
      table = undefined;
      throw erreur;
    });
    return table;
  }

  return {
    async listerTous() {
      await pret();
      const resultat = await client.execute("SELECT id, titre, cree_le, termine FROM todos");
      return resultat.rows.map(versTodo);
    },

    async ajouter(todo) {
      await pret();
      await client.execute({
        sql: "INSERT INTO todos (id, titre, cree_le, termine) VALUES (?, ?, ?, ?)",
        args: [todo.id, todo.titre, todo.creeLe, todo.termine ? 1 : 0],
      });
    },

    async trouver(id) {
      await pret();
      const resultat = await client.execute({
        sql: "SELECT id, titre, cree_le, termine FROM todos WHERE id = ?",
        args: [id],
      });
      const [ligne] = resultat.rows;
      return ligne ? versTodo(ligne) : null;
    },

    async marquerTermine(id) {
      await pret();
      await client.execute({ sql: "UPDATE todos SET termine = 1 WHERE id = ?", args: [id] });
    },
  };
}
