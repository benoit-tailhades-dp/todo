---
name: Mes TODO
description: Registre du jour dans le monde Cartouche, le cartouche d'un plan d'ingénierie appliqué à une liste de TODO.
colors:
  encre: "#1D3E8A"
  encre-foreground: "#FFFFFF"
  surligneur: "#F7D646"
  surligneur-foreground: "#1B2430"
  papier: "#F3F5F8"
  graphite: "#1B2430"
  feuille: "#FFFFFF"
  calque: "#EBEFF4"
  graphite-doux: "#536072"
  secondaire: "#E3E8EF"
  survol: "#E7ECF3"
  filet: "#CDD5DF"
  trait: "#7F8C9C"
  alerte: "#B42318"
  alerte-foreground: "#FFFFFF"
  bandeau: "#1D3E8A"
  bandeau-foreground: "#FFFFFF"
  encre-sombre: "#86A9F2"
  encre-foreground-sombre: "#0C1730"
  surligneur-sombre: "#E9C93B"
  surligneur-foreground-sombre: "#1A1708"
  papier-sombre: "#111821"
  graphite-sombre: "#E5EAF0"
  feuille-sombre: "#17202B"
  calque-sombre: "#1B2531"
  graphite-doux-sombre: "#98A6B7"
  secondaire-sombre: "#222D3B"
  survol-sombre: "#233041"
  filet-sombre: "#2B3746"
  trait-sombre: "#66778C"
  alerte-sombre: "#F2766B"
  alerte-foreground-sombre: "#2A0A07"
  bandeau-sombre: "#1A2D5A"
  bandeau-foreground-sombre: "#E5EAF0"
typography:
  display:
    fontFamily: "Barlow Semi Condensed, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.1
  headline:
    fontFamily: "Barlow Semi Condensed, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  chiffre:
    fontFamily: "Barlow Semi Condensed, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    fontFeature: "tnum"
  title:
    fontFamily: "Barlow Semi Condensed, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.25
  chiffre-cellule:
    fontFamily: "Barlow Semi Condensed, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
    fontFeature: "tnum"
  bouton:
    fontFamily: "Barlow Semi Condensed, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
  label-sm:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
  label-xs:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  base: "0.125rem"
  puce: "0.075rem"
  controle: "0.125rem"
  carte: "0.175rem"
spacing:
  conteneur: "56rem"
  goutiere-mobile: "16px"
  goutiere: "24px"
  champ-bouton: "8px"
  ligne-x: "14px"
  ligne-hauteur: "46px"
  groupes: "24px"
  cellule-x: "12px"
  cellule-x-large: "16px"
components:
  button-default:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.encre-foreground}"
    typography: "{typography.bouton}"
    rounded: "{rounded.controle}"
    padding: "0 14px"
    height: "36px"
  button-signature:
    backgroundColor: "{colors.surligneur}"
    textColor: "{colors.surligneur-foreground}"
    typography: "{typography.bouton}"
    rounded: "{rounded.controle}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.controle}"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.survol}"
  button-destructive:
    backgroundColor: "{colors.alerte}"
    textColor: "{colors.alerte-foreground}"
    rounded: "{rounded.controle}"
    height: "36px"
  input:
    backgroundColor: "{colors.feuille}"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.controle}"
    padding: "4px 12px"
    height: "36px"
  input-bandeau:
    backgroundColor: "{colors.feuille}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.controle}"
    height: "44px"
  checkbox:
    backgroundColor: "{colors.feuille}"
    rounded: "{rounded.controle}"
    size: "20px"
  checkbox-checked:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.encre-foreground}"
  bandeau:
    backgroundColor: "{colors.bandeau}"
    textColor: "{colors.bandeau-foreground}"
  cellule-cartouche:
    textColor: "{colors.bandeau-foreground}"
    typography: "{typography.chiffre}"
    padding: "8px 16px"
  cellule-cartouche-en-avant:
    textColor: "{colors.surligneur}"
  en-tete-jour:
    backgroundColor: "{colors.calque}"
    textColor: "{colors.graphite}"
    typography: "{typography.title}"
    rounded: "{rounded.carte}"
    padding: "8px 14px"
  ligne-todo:
    backgroundColor: "{colors.feuille}"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    padding: "10px 14px"
    height: "46px"
  ligne-todo-hover:
    backgroundColor: "{colors.survol}"
  alerte-saisie:
    backgroundColor: "{colors.surligneur}"
    textColor: "{colors.surligneur-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.puce}"
    padding: "4px 8px"
  alert-destructive:
    backgroundColor: "{colors.feuille}"
    textColor: "{colors.alerte}"
    rounded: "{rounded.carte}"
    padding: "12px 16px"
  encart-etat:
    backgroundColor: "{colors.feuille}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.carte}"
    padding: "40px 32px"
---

# Design System: Mes TODO

## Overview

**Creative North Star: "Le Cartouche"**

Le système reprend le cartouche d'un plan d'ingénierie : un bandeau d'encre qui porte le titre, la date et des compartiments chiffrés à filets, puis des feuilles blanches tracées au filet de 1 px. L'encre bleue structure, le surligneur jaune signale. Les formes sont nettes (rayons de 1 à 3 px), la typographie est une Barlow technique avec ses titres en Semi Condensed et des chiffres tabulaires. La densité est celle d'un registre : lignes de 46 px, en-têtes en bande, pas d'air décoratif.

La profondeur ne vient pas des ombres mais des aplats : papier gris-bleu, feuille blanche, calque pour les en-têtes, encre pour le bandeau. Le mouvement est bref et dessiné à la main : un trait de surligneur balaie le dernier ajout, un trait d'encre barre ce qu'on coche, un chiffre glisse en place quand il change. Tout mouvement est coupé quand le système demande un mouvement réduit.

Les deux modes, clair et sombre, suivent le réglage du système (`prefers-color-scheme`). Le sombre garde la même grammaire : encre éclaircie, surligneur légèrement assourdi, bandeau d'encre profonde.

**Key Characteristics:**
- Bandeau d'encre pleine largeur, contenu centré à 56 rem.
- Cellules de cartouche à filets, chiffres tabulaires en Barlow Semi Condensed 600.
- Feuilles blanches à filets de 1 px, rayons de 2 px (contrôles) et environ 3 px (cartes).
- Surligneur jaune réservé au focus, à l'action principale sur le bandeau, au dernier ajout, au chiffre mis en avant et aux alertes de saisie.
- Système plat : aucune ombre sur les surfaces de contenu.
- Mouvements de 150 à 300 ms sur une sortie exponentielle, coupés en mouvement réduit.

## Colors

Une encre bleue d'ingénieur et un surligneur jaune sur un papier gris-bleu froid : deux voix, une qui structure, une qui signale.

### Primary
- **Encre** (`encre`) : bandeau de l'application, case cochée, trait qui barre un TODO terminé, cellule « Âge » d'un jour qui traîne depuis 4 jours ou plus, icônes des encarts d'état, anneau de focus. En sombre, l'encre s'éclaircit (`encre-sombre`) pour garder le contraste.

### Secondary
- **Surligneur** (`surligneur`) : halo de focus de tous les contrôles, bouton « Ajouter » sur le bandeau, balayage du TODO qui vient d'être ajouté, chiffre « En cours » du cartouche, pastille d'alerte de saisie, sélection de texte. Le texte posé dessus est toujours `surligneur-foreground` (graphite).

### Tertiary
- **Alerte** (`alerte`) : erreurs de chargement et d'enregistrement (filet et titre de l'alerte), bordure d'un champ invalide. Jamais en aplat décoratif.

### Neutral
- **Papier** (`papier`) : fond de page sous les feuilles.
- **Feuille** (`feuille`) : fond des listes, des champs, des cases, des encarts et des alertes.
- **Calque** (`calque`) : en-têtes de jour et en-tête « Terminés » ; fond des squelettes de chargement et des champs désactivés.
- **Graphite** (`graphite`) : texte courant et titres.
- **Graphite doux** (`graphite-doux`) : dates secondaires, aides, libellés, compteurs discrets, TODO terminés.
- **Survol** (`survol`) : survol des lignes et des boutons fantômes ; cellule « Âge » à 2 jours.
- **Filet** (`filet`) : séparateurs entre lignes, contour des listes et des encarts.
- **Trait** (`trait`) : contour des champs et des cases (3,4:1 sur feuille), contour des en-têtes de jour, barre de défilement.
- **Bandeau** (`bandeau`, `bandeau-foreground`) : jeton dédié au bandeau de l'application ; en clair il vaut l'encre, en sombre une encre profonde. Les filets et textes secondaires du bandeau sont `bandeau-foreground` à 35 % (filets) et 75 à 80 % (textes).

### Named Rules
**The Deux Voix Rule.** L'encre structure, le surligneur signale. Aucune troisième couleur d'accent ; l'alerte ne sert qu'aux erreurs.

**The Surligneur Rare Rule.** Le jaune ne s'emploie que pour le focus, l'action principale posée sur le bandeau, le dernier ajout, le chiffre lu en premier et l'alerte de saisie. S'il apparaît ailleurs, il ne signale plus rien.

**The Jeton Unique Rule.** Toute couleur vient d'un jeton de `src/app/globals.css`, défini en clair et en sombre. Ni hex, ni `rgb()`, ni palette Tailwind, ni valeur arbitraire dans les composants. Une couleur manquante devient un nouveau jeton, pas une valeur locale.

**The Encre Qui Monte Rule.** L'âge d'un jour se lit à la densité d'encre de sa cellule : rien à 0 et 1 jour, survol à 2 jours, encre à 15 % à 3 jours, encre pleine à 4 jours et plus.

## Typography

**Display Font:** Barlow Semi Condensed 600 (avec sans-serif)
**Body Font:** Barlow 400, 500 et 600 (avec sans-serif)
**Label/Mono Font:** Geist Mono est chargée mais n'apparaît dans aucun écran livré.

**Character:** Une grotesque technique de dessin industriel. La Semi Condensed, toujours en 600, porte les titres, les boutons et les chiffres ; la Barlow normale porte le texte et les libellés en 500.

### Hierarchy
- **Display** (600, 1,875 rem, 1,1) : titre du bandeau, « Mes TODO ».
- **Headline** (600, 1,25 rem, 1,25) : titre des encarts d'état (vide, tout terminé).
- **Chiffre** (600, 1,5 rem, 1,25, tabulaire) : valeurs des cellules du cartouche.
- **Title** (600, 1,0625 rem, 1,25) : en-tête de jour ; « Terminés » à 1 rem.
- **Chiffre de cellule** (600, 1,125 rem, 1,25, tabulaire) : « Âge » et « TODO » dans l'en-tête de jour.
- **Bouton** (600, 0,9375 rem ; 1 rem pour l'action principale du bandeau).
- **Body** (400, 1 rem, 1,5) : titres des TODO, champ de saisie, texte des encarts (largeur `max-w-prose`).
- **Label** (500, 0,8125 rem) : date du bandeau, précision de date des en-têtes, alerte de saisie, compteur « Terminés ».
- **Label petit** (500, 0,75 rem) : libellés des cellules du cartouche, aide clavier, « à l'instant », « Enregistrement… ».
- **Label très petit** (500, 0,6875 rem, 1,25) : libellés « Âge » et « TODO » des cellules d'en-tête.

### Named Rules
**The Chiffre Tabulaire Rule.** Tout nombre qu'on compare d'une ligne à l'autre (compteurs, âges) est en Semi Condensed 600 avec `tabular-nums`.

**The Deux Poids Rule.** Le texte courant reste en 400, les libellés en 500, tout ce qui est en Semi Condensed en 600. Pas d'autres graisses.

## Layout

Une colonne centrée de 56 rem (`max-w-4xl`), avec une gouttière de 16 px sur téléphone et de 24 px à partir de 640 px. Le bandeau occupe toute la largeur et reprend la même colonne à l'intérieur : à partir de 640 px, titre et date à gauche, cellules alignées en bas à droite ; en dessous, les cellules passent sous le titre en grille de trois colonnes égales. Le champ d'ajout prend toute la largeur restante, le bouton « Ajouter » s'y accole à 8 px.

Sous le bandeau, les groupes de jour s'empilent à 24 px d'intervalle, « Terminés » ferme la liste à 24 px. Chaque ligne fait au moins 46 px de haut, 14 px de marge latérale, 14 px entre la case et le titre ; les titres longs passent à la ligne. Les espacements suivent l'échelle Tailwind de 4 px, avec des demi-pas (10 et 14 px) dans les lignes et les cellules.

## Elevation & Depth

Système plat. La profondeur vient de l'empilement des aplats (papier, feuille, calque, bandeau) et des filets de 1 px, jamais d'une ombre. La seule ombre livrée est celle du menu déroulant du sélecteur (`shadow-md` de Tailwind), qui flotte au-dessus du contenu.

### Shadow Vocabulary
- **Menu flottant** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`) : uniquement les menus déroulants (popover du `Select`).

### Named Rules
**The Plan à Plat Rule.** Une feuille posée sur le papier se distingue par son filet et son aplat, pas par une ombre. Une ombre n'apparaît que sur un élément qui flotte réellement au-dessus de la page.

## Shapes

Des angles nets de dessin technique. La base vaut 0,125 rem (2 px) : 2 px pour les contrôles (boutons, champs, cases), environ 3 px (0,175 rem) pour les cartes (listes, en-têtes de jour, encarts, alertes), environ 1 px pour les puces (alerte de saisie, squelettes). Les compartiments du cartouche n'ont aucun rayon. Un groupe de jour se lit comme une seule pièce : l'en-tête porte le rayon du haut, la liste celui du bas et perd son filet supérieur. « Terminés » fait de même quand il est ouvert.

Les filets font 1 px ; la case à cocher a un trait de 1,5 px. L'anneau de focus combine un contour d'encre de 2 px décalé de 2 px et un halo de surligneur de 6 px.

## Components

### Buttons
Nets, en Semi Condensed 600, qui s'enfoncent d'un pixel au clic.
- **Shape:** rayon de contrôle (2 px), hauteur 36 px (40 px en `lg`, 44 px pour l'action principale du bandeau).
- **Default:** encre sur texte blanc. Au survol, l'encre fonce par un mélange à 14 % de graphite.
- **Signature:** surligneur sur texte graphite. Réservé à l'action principale posée sur le bandeau d'encre, où l'encre se confondrait avec le fond.
- **Outline / Ghost / Secondary:** fond transparent (outline avec contour `trait`) ou secondaire, survol en `survol`.
- **Destructive:** aplat d'alerte. Présente dans la bibliothèque, non employée dans l'écran livré.
- **Usage livré:** « Réessayer » de l'alerte de chargement en outline ; fermeture de l'alerte « introuvable » en ghost icône de 28 px.
- **Focus:** contour d'encre de 2 px décalé de 2 px, halo de surligneur de 6 px. Sur le bandeau, le contour passe en `bandeau-foreground`.
- **Disabled:** opacité 50 % ; sur le bandeau, aplat `bandeau-foreground` à 15 %.

### Inputs / Fields
- **Style:** feuille blanche, trait de 1 px en `trait`, rayon de 2 px, 36 px de haut (44 px sur le bandeau, avec un contour `bandeau-foreground`). Curseur de saisie à l'encre.
- **Focus:** contour d'encre, halo de surligneur de 6 px.
- **Error:** contour d'alerte et halo d'alerte à 25 % ; le message s'affiche sous le champ dans une pastille de surligneur (alerte de saisie) avec une icône.
- **Disabled:** fond calque, opacité 60 % ; sur le bandeau, `bandeau-foreground` à 10 % pendant l'enregistrement.

### Case à cocher
- Carré de 20 px, trait de 1,5 px en `trait`, rayon de 2 px, zone de clic élargie. Survol : trait d'encre. Cochée : encre pleine et coche blanche d'épaisseur 3.

### Cards / Containers
- **Corner Style:** rayon de carte (environ 3 px).
- **Background:** feuille ; en-têtes en calque.
- **Shadow Strategy:** aucune (voir Elevation & Depth).
- **Border:** filet de 1 px ; contour `trait` pour l'en-tête de jour, `filet` pour la liste et les encarts.
- **Internal Padding:** 14 px latéraux dans les lignes et les en-têtes ; 32 à 40 px dans les encarts d'état.

### Bandeau et cellules de cartouche (signature)
Le bandeau d'encre porte titre, date, cellules et saisie. Les cellules sont des compartiments à filets (`bandeau-foreground` à 35 %), sans rayon, avec un libellé en label petit et une valeur en chiffre tabulaire. La valeur lue en premier (« En cours ») est en surligneur. Pendant le chargement, la valeur est remplacée par un squelette `bandeau-foreground` à 20 %.

### En-tête de jour (signature)
Une bande de cartouche en calque : date (et précision) à gauche, puis deux cellules séparées par un trait, « Âge » teintée selon la règle de l'encre qui monte, et « TODO ». La liste qui suit est une feuille à lignes séparées par un filet, survol en `survol` à 60 %.

### Terminés
Déclencheur pleine largeur de 44 px en calque, titre et compteur, chevron qui pivote en 200 ms. Les TODO terminés sont en graphite doux, barrés d'un trait d'encre de 2 px, précédés d'une case pleine à 70 %.

### Encarts d'état et alertes
- **Encart d'état** (vide, tout terminé) : feuille à filet, icône à l'encre, titre headline, texte en graphite doux.
- **Alerte destructive** : feuille à filet d'alerte, titre en alerte, description en graphite ; erreur de chargement (avec « Réessayer ») et TODO introuvable (avec fermeture).
- **Squelette** : calque qui pulse, rayon de puce, immobile en mouvement réduit.

### Mouvements
- **Surligne** : au dernier ajout, un trait de surligneur à 58 % de la hauteur de ligne balaie le titre en 360 ms, tient, puis s'efface (6 s au total). En mouvement réduit, le trait est posé sans animation.
- **Trait d'encre** : au cochage, une barre d'encre de 2 px traverse le titre ligne par ligne en 220 ms et le texte passe en graphite doux, puis la ligne se replie en 200 ms et rejoint « Terminés ».
- **Chiffre** : un compteur qui change glisse en place en 180 ms (pas au premier affichage).
- **Apparaît** : messages et encarts entrent de 4 px en 200 ms.
- Toutes les transitions utilisent la courbe `ease-trait` (`cubic-bezier(0.22, 1, 0.36, 1)`) ; survols en 150 ms.

## Do's and Don'ts

### Do:
- **Do** prendre toutes les couleurs dans les jetons de `globals.css` (`bg-primary`, `bg-signature`, `bg-shell`, `border-input`…), et ajouter un jeton clair et sombre quand il en manque un.
- **Do** composer uniquement avec les composants de `@/presentation/ui` ; un composant shadcn ajouté s'aligne sur `button.tsx` (rayon de 2 px, focus encre et surligneur, Semi Condensed 600 pour les libellés d'action).
- **Do** donner à tout contrôle focalisable le focus Cartouche : contour d'encre de 2 px décalé de 2 px et halo de surligneur de 6 px.
- **Do** écrire les nombres comparés en Semi Condensed 600 tabulaire.
- **Do** séparer les feuilles par des filets de 1 px et des aplats, avec 2 px de rayon pour les contrôles et environ 3 px pour les cartes.
- **Do** garder les mouvements entre 150 et 300 ms sur `ease-trait`, et les couper sous `prefers-reduced-motion`.

### Don't:
- **Don't** mettre une couleur en dur dans un composant : ni hex, ni `rgb()`/`hsl()`/`oklch()`, ni palette Tailwind (`bg-white`, `text-zinc-500`), ni valeur arbitraire (`bg-[#…]`).
- **Don't** styler un `<button>` ou un `<input>` à la main quand le composant existe dans `@/presentation/ui`.
- **Don't** poser une ombre sur une feuille, une liste ou un encart ; l'ombre est réservée aux menus qui flottent.
- **Don't** employer le surligneur comme décor ou comme fond de section ; il ne sert qu'au focus, à l'action principale du bandeau, au dernier ajout, au chiffre mis en avant et à l'alerte de saisie.
- **Don't** arrondir au-delà de 3 px.
