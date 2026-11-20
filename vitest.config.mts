import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` lève une erreur hors contexte serveur Next : on le neutralise en test.
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // Fuseau du serveur Vercel : un calcul de jour en heure locale échoue ici, même sur un poste réglé sur Paris.
    env: { TZ: "UTC" },
  },
});
