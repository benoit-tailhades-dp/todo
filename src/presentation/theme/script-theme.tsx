import { lireChoixTheme, themeAffiche, type ChoixTheme, type Theme } from "@/service/theme";

/**
 * Clé du choix dans le stockage du navigateur : le thème est retenu sur cet appareil.
 * Préfixée : en local, localhost:3000 est partagé avec d'autres projets, qui écrivent souvent « theme ».
 */
export const CLE_THEME = "mes-todo:theme";
/** Réglage d'apparence du système. */
export const SYSTEME_SOMBRE = "(prefers-color-scheme: dark)";

/**
 * Pose le thème sur <html> (`data-theme`) d'après le choix enregistré, puis le reprend à chaque
 * changement d'apparence du système : en « Système », la page suit ; en « Clair » ou « Sombre », rien ne bouge.
 * Autonome : recopiée par toString() dans le script du <head>, elle n'utilise que ses paramètres.
 */
export function installerTheme(
  cle: string,
  requete: string,
  lire: (valeur: unknown) => ChoixTheme,
  afficher: (choix: ChoixTheme, systemeSombre: boolean) => Theme,
): void {
  const racine = document.documentElement;
  const systeme = window.matchMedia(requete);
  function appliquer() {
    let enregistre: string | null = null;
    try {
      enregistre = window.localStorage.getItem(cle);
    } catch {
      // Stockage inaccessible (navigation privée stricte) : « Système ».
    }
    racine.setAttribute("data-theme", afficher(lire(enregistre), systeme.matches));
  }
  appliquer();
  systeme.addEventListener("change", appliquer);
}

/** Le script du <head> : installerTheme et les règles du service, recopiées telles quelles. */
export function scriptTheme(): string {
  const parametres = [
    JSON.stringify(CLE_THEME),
    JSON.stringify(SYSTEME_SOMBRE),
    lireChoixTheme.toString(),
    themeAffiche.toString(),
  ];
  return `(${installerTheme.toString()})(${parametres.join(",")})`;
}

/**
 * Script bloquant du <head> : le navigateur l'exécute en lisant la page, avant le premier rendu.
 * La page s'ouvre donc directement dans le bon thème, sans flash.
 */
export function ScriptTheme() {
  return <script dangerouslySetInnerHTML={{ __html: scriptTheme() }} />;
}
