import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Architecture 3 couches (voir .claude/rules/) : chaque couche n'importe que ce qu'elle a le droit d'utiliser.
// En config « flat », la dernière déclaration d'une règle qui s'applique à un fichier remplace les précédentes :
// chaque couche reprend donc la liste complète de ses interdits.

/** Clients de base de données : réservés à src/data. À compléter quand le pilote sera choisi. */
const DB_CLIENTS = {
  group: ["@libsql/*", "better-sqlite3", "drizzle-orm", "drizzle-orm/*"],
  message: "Seule la couche données (src/data) parle à la base.",
};

const DATA_LAYER = {
  group: ["@/data", "@/data/*", "**/data", "**/data/*"],
  message: "La présentation passe par la couche service, jamais par la couche données.",
};

const UI = {
  group: [
    "react",
    "react/*",
    "react-dom",
    "react-dom/*",
    "next",
    "next/*",
    "@/presentation",
    "@/presentation/*",
    "**/presentation",
    "**/presentation/*",
  ],
  message: "La couche service ne dépend pas de l'interface (React, Next.js, présentation).",
};

const restrict = (...patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Tout le code hors couche données : pas de client de base.
  { files: ["src/**"], ignores: ["src/data/**"], rules: restrict(DB_CLIENTS) },
  // Présentation : n'appelle que la couche service.
  { files: ["src/app/**", "src/presentation/**"], rules: restrict(DATA_LAYER, DB_CLIENTS) },
  // Service : ni interface ni base.
  { files: ["src/service/**"], rules: restrict(UI, DB_CLIENTS) },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
