import "server-only";
import { createClient, type Client, type Config } from "@libsql/client";

/** Fichier SQLite local, à la racine du projet (ignoré par git). */
const URL_PAR_DEFAUT = "file:local.db";

type Variables = Partial<Record<string, string>>;

/**
 * La base de l'application, d'après les variables d'environnement :
 * - `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` : Turso (en ligne) ;
 * - sinon `DATABASE_URL` : la base indiquée (tests, autre fichier) ;
 * - sinon le fichier SQLite local.
 */
export function configurationConnexion(env: Variables): Config {
  const turso = env.TURSO_DATABASE_URL || undefined;
  if (turso) {
    const authToken = env.TURSO_AUTH_TOKEN || undefined;
    if (!authToken) {
      throw new Error("TURSO_DATABASE_URL est définie sans TURSO_AUTH_TOKEN : ajoute le jeton de la base Turso.");
    }
    return { url: turso, authToken };
  }
  // Sur Vercel, le disque d'une fonction est en lecture seule et repart de zéro à chaque déploiement.
  if (env.VERCEL) {
    throw new Error(
      "TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sont requises sur Vercel : un fichier SQLite y serait perdu.",
    );
  }
  return { url: env.DATABASE_URL || URL_PAR_DEFAUT };
}

let client: Client | undefined;

/** Connexion de l'application, ouverte au premier appel. */
export function clientParDefaut(): Client {
  client ??= createClient(configurationConnexion(process.env));
  return client;
}
