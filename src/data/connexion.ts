import "server-only";
import { createClient, type Client } from "@libsql/client";

/** Fichier SQLite local, à la racine du projet (ignoré par git). */
const URL_PAR_DEFAUT = "file:local.db";

let client: Client | undefined;

/** Connexion de l'application, ouverte au premier appel. `DATABASE_URL` la redirige (tests, autre fichier). */
export function clientParDefaut(): Client {
  client ??= createClient({ url: process.env.DATABASE_URL ?? URL_PAR_DEFAUT });
  return client;
}
