# Plan · Lot 7 · Choisir le thème clair ou sombre

Issue : #24 · Branche : `dev` · PR : `dev` → `main`

Dans le bandeau, un bouton me laisse choisir le thème : Système, Clair ou Sombre. Le choix s'applique tout de suite, sans recharger la page, et il est retenu sur cet appareil. Par défaut, l'application suit le réglage du système.

Deux validations ont eu lieu avant le code :
1. Le plan et les six points à trancher : « je valide ».
2. La maquette complétée, sur captures : « je valide ».

## 1. Points tranchés

1. **Stockage** : `localStorage`, clé `mes-todo:theme`, valeur `clair` ou `sombre`. Système = clé absente.
   - Un cookie lu par le serveur rendrait le layout dynamique sous `cacheComponents` (guide Next `preventing-flash-before-hydration`).
   - La clé est préfixée : en local, `localhost:3000` est partagé avec d'autres projets, et une clé `theme` = `"dark"` y existait déjà.
2. **Application** : un script inline dans le `<head>` pose `data-theme="clair|sombre"` sur `<html>` avant le premier rendu. En Système, il suit le réglage du système (`matchMedia`, événement `change`).
   - Le CSS ne dépend plus que de l'attribut. Les jetons sombres sont dans un seul bloc, `:root[data-theme="sombre"]`.
   - `color-scheme` suit le thème, et la variante `dark:` aussi.
   - Conséquence acceptée : **sans JavaScript, l'app reste claire**.
3. **Règles dans le service** : `src/service/theme.ts`, des fonctions pures.
   - `lireChoixTheme` : rien ou une valeur inconnue donne Système.
   - `themeAffiche(choix, systemeSombre)` : renvoie `clair` ou `sombre`.
   - Le script du `<head>` les recopie par `toString()`. Les règles n'existent donc qu'à un seul endroit.
4. **Données** : rien. Le choix reste dans le navigateur et `src/data` est `server-only`. Aucun test côté données.
5. **Composant** : `dropdown-menu` de shadcn (Base UI Menu), aligné sur Cartouche. Aucune nouvelle dépendance.
6. **Maquette d'abord** : complétée, capturée, validée, puis le code.

## 2. Tâches réalisées

### Service

- **`theme.ts`** :
  - `CHOIX_THEME` : Système, Clair, Sombre.
  - `lireChoixTheme`, `themeAffiche` : autonomes, pour être recopiées dans le script.

### Présentation

- **`app/globals.css`** :
  - jetons sombres sous `:root[data-theme="sombre"]`, `color-scheme` clair ou sombre ;
  - `@custom-variant dark` sur l'attribut ;
  - plus aucune règle ne dépend de `prefers-color-scheme`.
- **`app/layout.tsx`** : `<ScriptTheme />` dans le `<head>`, et `suppressHydrationWarning` sur `<html>`.
- **`theme/script-theme.tsx`** :
  - `installerTheme`, autonome : lit le choix, pose l'attribut, écoute le système ;
  - `scriptTheme()` assemble cette fonction et les règles du service ;
  - `<ScriptTheme />` les rend dans un `<script>` inline.
- **`theme/menu-theme.tsx`** :
  - bouton et menu, au balisage validé sur la maquette ;
  - le choix affiché est lu par `useSyncExternalStore`, sans erreur d'hydratation ;
  - un choix est enregistré et appliqué tout de suite ; « Système » efface la clé ;
  - `useLayoutEffect` repose l'attribut que le mode Strict efface en dev.
- **`todo/bandeau.tsx`** : grille de la maquette ; le bouton est à droite du titre sur mobile, après les cellules en large. Il apparaît aussi pendant le chargement.
- **`ui/dropdown-menu.tsx`** : ajouté par shadcn, aligné sur Cartouche.
  - Le popup est une feuille à filet, avec le rayon de carte et l'ombre de flottant.
  - Les lignes reprennent celles du `Select`, et la coche est à l'encre.
  - Le mouvement suit `ease-trait` et se coupe en mouvement réduit.

### Maquette

- Le bandeau a un emplacement `theme`, et un nouveau scénario `?etat=menu-theme` ouvre le menu.

### Docs

- `DESIGN.md`, `.impeccable/design.json` et `CLAUDE.md` décrivent maintenant le thème piloté par `data-theme` et le bouton de thème.

## 3. Critères d'acceptation et tests

| # | Critère | Test(s) | Couche |
|---|---------|---------|--------|
| 1 | Système : sombre si le système est sombre, clair sinon | `theme.test.ts` « Système : sombre si le système est sombre, clair sinon », « aucun choix enregistré : Système, le réglage par défaut », « valeur inconnue ou abîmée : Système » | Service |
| | | `theme.test.tsx` « rien d'enregistré (Système) : la page prend le thème du système, sombre ou clair », « Système : quand le système change d'apparence, la page suit » | Présentation |
| | | Vérifié dans Chrome : macOS en sombre, Système → page sombre | Manuel |
| 2 | En clair, choisir Sombre : toute la page passe en sombre, sans rechargement | `theme.test.tsx` « en clair, choisir Sombre : toute la page passe en sombre tout de suite, et le choix est enregistré » | Présentation |
| | | `globals.test.ts` « chaque jeton de couleur clair a sa valeur sombre sous [data-theme="sombre"] », « le sombre règle aussi les contrôles natifs », « plus aucune règle ne dépend de prefers-color-scheme », « la variante dark: suit le même attribut » | Présentation |
| 3 | Sombre choisi : réouverture directement en sombre, sans flash | `theme.test.tsx` « Sombre enregistré, système clair : à la réouverture, la page est sombre dès le départ », « Sombre choisi : à la réouverture, la page est sombre avant même l'affichage de l'écran », « rendu en <script> inline, sans src ni async ni defer » | Présentation |
| | | `theme.test.ts` « fonctions autonomes : elles se recopient telles quelles dans le script du <head> » | Service |
| | | Vérifié en build de production : le script minifié est dans le `<head>`, avant le `<body>`. Sombre choisi, la page rechargée s'ouvre en sombre | Manuel |
| 4 | Clair choisi : le système passe en sombre, la page reste claire | `theme.test.ts` « Clair ou Sombre choisi : le réglage du système n'y change rien » | Service |
| | | `theme.test.tsx` « Clair enregistré : le système passe en sombre, la page reste claire », « Clair choisi : le système passe en sombre, la page reste claire » | Présentation |
| | | Vérifié dans Chrome : macOS en sombre, Clair choisi, la page rechargée reste claire | Manuel |
| 5 | Système rechoisi : la page suit de nouveau le système | `theme.test.tsx` « Sombre puis Système : le choix est effacé et la page suit de nouveau le système » | Présentation |
| 6 | Au clavier, sans souris ; le lecteur d'écran annonce le thème actif | `theme.test.tsx` « au clavier : Entrée ouvre le menu sur le choix actif, flèche bas puis Entrée choisit, le focus revient au bouton », « le bouton annonce le thème actif », « Sombre enregistré : le bouton annonce « Thème : Sombre » », « le menu propose Système, Clair et Sombre, le choix actif coché » | Présentation |
| | | `ecran-todo.test.tsx` « le bandeau porte le bouton de thème, qui annonce le thème actif », « le thème se choisit déjà pendant le chargement » | Présentation |
| | | Vérifié dans Chrome : arbre d'accessibilité avec le bouton « Thème : Clair » (`aria-haspopup="menu"`), le groupe « Thème », et `aria-checked="true"` sur le choix actif. Parcours Entrée, flèche, Entrée, focus rendu au bouton | Manuel |

Tests de robustesse en plus :
- « stockage inaccessible (navigation privée stricte) : Système, sans erreur » ;
- « valeur enregistrée abîmée : Système » ;
- « l'attribut effacé par React (remontage du mode Strict en dev) : le menu le repose ».

**Sortie rouge** :
- `globals.test.ts` : 4 tests en échec avant le passage du CSS sur `data-theme`. Bloc `:root[data-theme="sombre"]` introuvable, `prefers-color-scheme` encore présent.
- Puis toute la suite, avec des squelettes qui lèvent « à écrire » : 25 tests en échec sur 142.

**Sortie verte** : 142 tests sur 142.

## 4. Maquette : ce que le lot reprend

Référence : `/maquette?etat=menu-theme`.

| Élément | Lot 7 |
|---------|-------|
| Bouton de thème dans le bandeau : compartiment à filet en large, 36 px à droite du titre sur mobile | Repris |
| Icône du choix (écran, soleil, lune), nom « Thème : … » | Repris |
| Menu : libellé « Thème », trois choix radio, coche à l'encre | Repris |
| Bandeau en clair et en sombre | Repris |

### Écarts

1. **La maquette utilise le vrai menu.** Le thème est un état global : l'attribut est posé sur `<html>`. Deux composants qui le poseraient chacun se contrediraient. La copie de la maquette a donc été retirée après validation, et la maquette garde seulement l'ouverture du menu pour son scénario.
2. **Clé de stockage** : le plan disait `theme`, la clé livrée est `mes-todo:theme` (voir § 1).

## 5. Captures (`docs/plan/captures/lot-7/`)

L'écran réel tourne en build de production, sur la base locale. Le Mac est réglé en sombre.

| État | Maquette | Réel |
|------|----------|------|
| Bandeau clair | `maquette-bandeau-clair.jpg` | `reel-bandeau-clair.jpg` |
| Menu ouvert, clair | `maquette-menu-clair.jpg` | `reel-menu-clair.jpg` |
| Bandeau sombre | `maquette-bandeau-sombre.jpg` | `reel-bandeau-sombre.jpg` |
| Menu ouvert, sombre | `maquette-menu-sombre.jpg` | `reel-menu-sombre.jpg` |
| Menu ouvert, Système (sombre) | `maquette-menu-systeme.jpg` | `reel-menu-systeme.jpg` |
| Mobile, bandeau sombre | `maquette-bandeau-mobile-sombre.jpg` | `reel-bandeau-mobile-sombre.jpg` |
| Mobile, menu ouvert sombre | `maquette-menu-mobile-sombre.jpg` (Sombre coché) | `reel-menu-mobile-systeme.jpg` (Système coché) |
| Mobile, menu ouvert clair | `maquette-menu-mobile-clair.jpg` | `reel-menu-mobile-clair.jpg` |
| Focus clavier sur le bouton | `maquette-focus-sombre.jpg` | — |

Les captures mobiles de la maquette font 500 px de large, la largeur minimale de la fenêtre Chrome. Celles de l'écran réel font 390 px, dans une iframe, parce que la fenêtre ne se redimensionnait plus.

## 6. À savoir

- **Système qui change, page ouverte** : c'est testé avec un faux `matchMedia`. Dans Chrome, seul le cas « macOS en sombre » a été vu. Basculer l'apparence de macOS est un réglage système, que je n'ai pas modifié.
- **Icône à l'hydratation** : le serveur ne connaît pas le choix et rend l'icône « Système ». L'icône du bouton est corrigée dès l'hydratation, ce qui peut se voir un instant sur une connexion lente. La page, elle, est dans le bon thème dès le départ.
- **Hors lot, non codé** : synchroniser les autres onglets ouverts (événement `storage`). Aujourd'hui, ils suivent au rechargement.
