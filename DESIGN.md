---
name: Mes TODO
description: La journée comme une affiche suisse, avec un champ vermillon, un chiffre géant et un arc par jour qui se ferme à mesure qu'on coche.
colors:
  vermillon: "#D93A1A"
  vermillon-foreground: "#FFFFFF"
  vermillon-pale: "#FBE0D7"
  noir: "#111111"
  papier: "#FFFFFF"
  lin: "#F1EFEA"
  lin-clair: "#F4F2EE"
  gris-pierre: "#6B6862"
  filet: "#E6E3DD"
  trait: "#8C8880"
  erreur: "#A1190C"
  erreur-foreground: "#FFFFFF"
  champ-sombre: "#C7361A"
  vermillon-sombre: "#FF5A36"
  vermillon-foreground-sombre: "#131211"
  vermillon-pale-sombre: "#4A1E12"
  craie-sombre: "#F3F1EC"
  papier-sombre: "#131211"
  carte-sombre: "#1A1917"
  popover-sombre: "#1F1E1B"
  lin-sombre: "#24221F"
  survol-sombre: "#262420"
  lin-clair-sombre: "#1E1D1A"
  gris-pierre-sombre: "#A39F97"
  filet-sombre: "#2E2C28"
  trait-sombre: "#6E6A63"
  erreur-sombre: "#FF8A70"
  erreur-foreground-sombre: "#2A0A05"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(8rem, min(15vw, 30dvh), 15rem)"
    fontWeight: 900
    lineHeight: 0.8
    letterSpacing: "-0.04em"
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 115"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 105"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  chiffre-secondaire:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "'tnum' 1"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.375
  bouton:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.25
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.375
rounded:
  sm: "7.2px"
  lg: "12px"
  xl: "16.8px"
  2xl: "21.6px"
  3xl: "26.4px"
  full: "9999px"
spacing:
  gouttiere-telephone: "16px"
  gouttiere-tablette: "32px"
  gouttiere-large: "56px"
  gouttiere-champ: "48px"
  entre-jours: "40px"
  entre-jours-large: "48px"
  ligne: "60px"
  saisie: "52px"
  saisie-large: "64px"
components:
  champ-affiche:
    backgroundColor: "{colors.vermillon}"
    textColor: "{colors.vermillon-foreground}"
    padding: "40px 48px 0"
  champ-affiche-sombre:
    backgroundColor: "{colors.champ-sombre}"
    textColor: "{colors.vermillon-foreground}"
  button-primary:
    backgroundColor: "{colors.noir}"
    textColor: "{colors.papier}"
    typography: "{typography.bouton}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 14px"
  button-ajouter:
    backgroundColor: "{colors.noir}"
    textColor: "{colors.papier}"
    rounded: "{rounded.full}"
    height: "{spacing.saisie-large}"
    padding: "0 32px"
  button-signature:
    backgroundColor: "{colors.vermillon}"
    textColor: "{colors.vermillon-foreground}"
    typography: "{typography.bouton}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 14px"
  button-ghost-hover:
    backgroundColor: "{colors.lin}"
    textColor: "{colors.noir}"
  button-icone-ligne:
    textColor: "{colors.gris-pierre}"
    rounded: "{rounded.full}"
    size: "36px"
  button-icone-ligne-ouvert:
    backgroundColor: "{colors.noir}"
    textColor: "{colors.papier}"
  saisie-pilule:
    backgroundColor: "{colors.papier}"
    textColor: "{colors.noir}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    height: "{spacing.saisie-large}"
    padding: "0 28px"
  case-ronde:
    backgroundColor: "{colors.papier}"
    rounded: "{rounded.full}"
    size: "24px"
  case-ronde-cochee:
    backgroundColor: "{colors.vermillon}"
    textColor: "{colors.vermillon-foreground}"
  pastille-age:
    textColor: "{colors.gris-pierre}"
    rounded: "{rounded.full}"
    height: "40px"
    width: "40px"
  pastille-age-deux-jours:
    textColor: "{colors.noir}"
  pastille-age-traine:
    backgroundColor: "{colors.vermillon}"
    textColor: "{colors.vermillon-foreground}"
  ligne-todo:
    backgroundColor: "{colors.papier}"
    typography: "{typography.body}"
    height: "{spacing.ligne}"
  ligne-todo-hover:
    backgroundColor: "{colors.lin}"
  menu-flottant:
    backgroundColor: "{colors.papier}"
    textColor: "{colors.noir}"
    rounded: "{rounded.2xl}"
    padding: "12px"
  alerte-erreur:
    backgroundColor: "{colors.papier}"
    textColor: "{colors.erreur}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
---

# Design System: Mes TODO

## Overview

**Creative North Star: "L'affiche de la journée"**

L'écran se lit comme une affiche du style typographique international : un grand aplat vermillon, du noir et du blanc, une seule famille de caractères poussée jusqu'au 900 étendu, et une géométrie de cercles. Le champ vermillon porte ce qui compte d'un coup d'œil, le nombre de TODO en cours en chiffre géant et les arcs concentriques du jour ; la page blanche à côté porte la saisie et les jours, séparés par des filets et jamais par des cadres.

Le système est vivant sans être bavard. Les chiffres roulent sur place, la case se remplit de vermillon avec un léger ressort, le titre coché se barre d'un trait vermillon, la ligne se replie et les autres glissent à leur place. Au doigt, on glisse une ligne à droite pour la terminer, à gauche pour changer son jour. Tous les mouvements tiennent entre 180 et 460 ms en sortie exponentielle, les arcs se dessinent en 700 ms, et tout est coupé en mouvement réduit.

Le monde refuse la liste grise à cases carrées du gabarit TODO et le cartouche à filets de l'ancien monde : pas de carte, pas de case carrée, pas de bandeau bleu.

**Key Characteristics:**
- Un aplat vermillon (#D93A1A) en champ, du noir 111 et du blanc papier ailleurs.
- Archivo seule, de 400 pour le texte à 900 étendue (wdth 115) pour le chiffre géant.
- Cercles et pilules : cases rondes, pastilles d'âge rondes, saisie et bouton d'ajout en pilule.
- Filets entre les lignes, trait noir de 2 px sous chaque titre de jour, aucune carte.
- Mouvement continu et court ; la signature, ce sont les arcs du jour.

## Colors

Une palette d'affiche : un rouge-orangé saturé en aplat, un noir presque pur, un blanc papier, et des gris chauds tirés vers le lin pour le reste.

### Primary
- **Vermillon d'affiche** (`vermillon`) : le champ de l'affiche (jeton `--shell`), la case cochée, la pastille d'un jour qui traîne (3 jours et plus), le trait qui barre un titre coché, le fond du geste « Terminé », le compteur de la section Terminés, la sélection de texte et le curseur de la saisie. Texte blanc dessus (4,6:1).
- **Vermillon pâle** (`vermillon-pale`) : la trace du dernier ajout, qui balaie le titre pendant 6 s puis s'efface, et le halo du jour survolé pendant un glisser-déposer.

### Neutral
- **Noir d'imprimerie** (`noir`) : le texte, l'action principale (bouton « Ajouter »), le bord de la saisie et des cases, le trait sous chaque titre de jour, le focus, l'arc d'un jour qui traîne sur le champ (jeton `--shell-accent`), le fond du geste « Changer le jour ».
- **Papier** (`papier`) : fond de page, des menus et des cartes techniques.
- **Lin** (`lin`) et **Lin clair** (`lin-clair`) : survol des lignes et des boutons fantômes, fonds discrets, squelettes de chargement.
- **Gris pierre** (`gris-pierre`) : texte secondaire, date en clair d'un jour, aide sous la saisie, TODO terminés (5,6:1 sur papier).
- **Filet** (`filet`) : les filets fins entre les lignes et le bord des menus.
- **Trait** (`trait`) : bord des contrôles au repos et barre de défilement (3,5:1 sur papier).
- **Rouge d'erreur** (`erreur`) : erreurs seulement, plus sombre que le vermillon pour ne jamais s'y confondre.

### Thème sombre
Posé par `data-theme="sombre"` sur `<html>` (choix Système, Clair ou Sombre du sélecteur de thème). Fond noir chaud (`papier-sombre`), texte craie (`craie-sombre`), vermillon éclairci pour les signaux sur fond sombre (`vermillon-sombre`, texte noir dessus) et champ plus profond (`champ-sombre`, 5,3:1 avec le blanc). Chaque jeton clair a son pendant sombre dans `src/app/globals.css`.

### Named Rules
**The Un Seul Rouge Rule.** Le vermillon est la seule couleur. Il marque le champ et ce qui est fait ou ce qui traîne ; aucune autre teinte n'entre dans l'écran, sauf le rouge d'erreur.

**The Jetons Seulement Rule.** Aucune couleur en dur dans les composants : uniquement les jetons de `globals.css`, chacun défini en clair et en sombre. Les survols se dérivent d'un jeton par `color-mix`, jamais d'une valeur littérale.

## Typography

**Display Font:** Archivo variable, axe de largeur (avec ui-sans-serif, system-ui)
**Body Font:** Archivo (même famille)
**Label/Mono Font:** Archivo ; Geist Mono est chargée mais n'apparaît pas sur l'écran.

**Character:** Une grotesque unique, sobre au corps de lecture et monumentale en 900 étendue. L'affiche tient par le contraste de graisse et de taille, pas par un second caractère.

### Hierarchy
- **Display** (900, wdth 115, 6,5rem au téléphone, 8rem en tablette, `clamp(8rem, min(15vw, 30dvh), 15rem)` en large, interligne 0,8, approche -0,04em, chiffres tabulaires) : le nombre de TODO en cours, seul, sur le champ.
- **Title** (800, 1,5 / 2 / 2,75rem, interligne 1, en minuscules) : le libellé « en cours » posé sous le chiffre.
- **Headline** (800, wdth 105, 1,625rem au téléphone, 2rem au-delà, interligne 1) : les titres de jour (« Mardi » en noir, la date en clair en gris pierre) et la section Terminés ; 2 à 2,75rem pour les titres des états vides.
- **Chiffre secondaire** (800, 1,375rem puis 1,75rem en large, tabulaires) : terminés, le plus ancien, le nombre par jour.
- **Body** (400, 1,0625rem, interligne 1,375) : titres des TODO et texte courant ; 1,1875rem dans la saisie en large.
- **Bouton** (600, 0,9375rem) : boutons ; le bouton « Ajouter » passe en 700.
- **Label** (600, 0,8125rem) : aide, légende des arcs, « à l'instant », « Enregistrement… ».

### Named Rules
**The Chiffre Géant Rule.** Un seul chiffre en Display par écran : celui des TODO en cours. Les autres nombres restent en chiffre secondaire.

**The Minuscules Rule.** Les libellés de compteurs s'écrivent en minuscules, en phrase, à côté de leur valeur ; jamais de petites capitales espacées au-dessus d'un titre.

## Layout

Deux colonnes en large (à partir de 1024 px) : le champ vermillon à gauche (`minmax(22rem, 5fr)`, environ 40 %), collé sur toute la hauteur, et la page à droite (`7fr`), dont le contenu est limité à 48rem. Au téléphone, le champ devient une bande haute compacte (chiffre à gauche, arcs recadrés à droite, légende sous les compteurs), la liste suit, et la saisie est fixée en bas de l'écran à portée du pouce, au-dessus de la marge de sécurité ; en large, elle remonte en tête de la page, collée en haut.

Gouttières : 16 px au téléphone, 32 px dès 640 px, 56 px en large sur la page et 48 px dans le champ. Les jours sont espacés de 40 px (48 px en large) ; une ligne de TODO fait au moins 60 px de haut. Les arcs occupent la place qui reste sous les compteurs et la légende, ancrés en bas à droite : ils débordent par le bas du champ (le bas de l'écran, le champ étant collé sur toute la hauteur) et s'arrêtent à droite sur une marge vermillon de 24 px, pour que l'arc noir ne touche jamais la page en sombre. Au téléphone, une fenêtre les recadre à droite (bord de l'écran) et en bas, au-dessus de la légende.

## Elevation & Depth

Plat. La profondeur vient de l'aplat vermillon contre le papier, du trait noir sous les titres de jour et des filets, pas d'ombres. Seul le calque flottant (le calendrier d'un TODO) porte une ombre douce, car ils passent au-dessus de la page. Pendant un geste au doigt, la ligne tenue reste nette et le reste de la liste tombe à 35 % d'opacité ; c'est l'effacement qui la détache, pas une ombre.

### Shadow Vocabulary
- **Calque flottant** (ombre `lg` de Tailwind pour le calendrier, `md` pour le menu) : popovers et menus seulement.
- **Halo de dépôt** (`box-shadow: 0 0 0 12px var(--signature-doux)`) : un anneau plein, sans flou, qui étend le fond vermillon pâle du jour survolé pendant un glisser-déposer.

### Named Rules
**The Plat Par Défaut Rule.** Rien ne porte d'ombre au repos dans la page. Une ombre signale un calque qui flotte, rien d'autre.

## Shapes

Cercles et pilules. Les contrôles ont un rayon de base de 12 px ; tout ce qui se touche dans la liste et la saisie va jusqu'à la pilule ou au cercle : saisie et bouton « Ajouter » en pilule, case ronde, pastille d'âge ronde, boutons d'icône ronds dans les lignes et sur le champ. Les menus flottants prennent 17 à 22 px, le jour survolé 26 px. Les arcs du jour sont des cercles concentriques à trait épais, au plus 30 unités d'épaisseur pour 10 d'espace dans un repère de 400.

Les traits : 2 px pour ce qui structure (dessous des titres de jour, bord de la saisie, des cases et des pastilles), 1 px pour les filets entre lignes. Aucun cadre de carte autour d'un jour ou d'une ligne.

## Components

### Champ de l'affiche (signature)
Aplat vermillon, texte blanc. En tête, « Mes TODO » (800, 1,25rem), la date du jour en headline (800, wdth 105, 1,375rem au téléphone, 1,625rem dès 640 px, 2rem en large) et, à droite de « Mes TODO », le **sélecteur de thème** : trois pastilles rondes (Système, Clair, Sombre) dans une pilule cerclée de blanc à 45 %, toujours visibles, la pastille active pleine de blanc avec son icône en vermillon. Pas de menu : un toucher suffit, et au clavier c'est un groupe de boutons radio (les flèches changent de choix). Puis le chiffre géant et la ligne « 9 terminés · le plus ancien 4 j ». En bas à droite, les **arcs du jour** : un cercle par jour en cours, du plus ancien (dehors) au plus récent (dedans), neuf au plus. La piste est blanche à 25 %, l'arc plein blanc ; sa longueur suit la part terminée du jour, il démarre à gauche, tourne dans le sens horaire et se dessine en 700 ms à l'arrivée, puis avance quand on coche. Un jour qui traîne (3 jours et plus) passe au noir. Tout terminé : un seul cercle fermé, blanc plein. Une légende en label, sous les compteurs, dit ce que montrent les arcs : « Un arc par jour, le plus ancien dehors · 10 sur 23 faits ».

### Buttons
- **Shape:** rayon de base 12 px ; en pilule ou en cercle dès qu'il vit dans la saisie, une ligne ou le champ.
- **Primary:** fond noir, texte papier, Archivo 600 à 0,9375rem, 36 px de haut. Le bouton « Ajouter » : pilule de 52 px (64 px en large), 700, icône plus en tête.
- **Hover / Focus:** survol par le jeton du fond mêlé à 14 % de la couleur du texte (`color-mix`) ; focus par un contour plein de 2 px décalé de 2 px, à la couleur du focus (blanc sur le champ). Enfoncé : descend de 1 px.
- **Signature:** fond vermillon, texte blanc, pour une action posée sur fond clair qu'on veut signaler.
- **Ghost:** transparent, fond lin au survol. Le bouton de date d'une ligne est un cercle fantôme gris pierre qui passe en noir plein quand son calendrier est ouvert.

### Inputs / Fields
- **Style:** la saisie d'un TODO est une pilule de 52 px (64 px en large), bord noir de 2 px, fond papier, Archivo 1,0625rem, curseur vermillon. Les champs génériques gardent un bord trait de 1 px et 12 px de rayon.
- **Focus:** contour noir de 2 px décalé de 2 px.
- **Error:** bord et contour rouge d'erreur, message en 600 avec une icône, au-dessus du champ au téléphone, dessous en large.

### Cases et pastilles
- **Case ronde:** cercle de 24 px dans la liste, bord noir de 2 px, zone de toucher étendue. Cochée : pleine de vermillon, coche blanche qui se pose avec un ressort (320 ms). Elle ne se décoche pas. Dans les terminés, elle passe au gris pierre.
- **Pastille d'âge:** cercle de 40 px à bord de 2 px, « 2 j » en 800 tabulaires. Filet et gris pierre les premiers jours, noir à 2 jours, pleine de vermillon à 3 jours et plus, bord pointillé pour un jour à venir.

### Lignes de TODO
Titre en body sur papier, filet de 1 px dessous, 60 px de haut au moins, survol lin à la souris. Cocher : un trait vermillon de 2 px barre le titre de gauche à droite (220 ms) et le titre passe au gris, la ligne s'efface, puis rejoint Terminés. Au doigt : glisser à droite découvre un fond vermillon « Terminé », à gauche un fond noir « Changer le jour » ; au-delà de 96 px le libellé grossit légèrement et relâcher déclenche l'action ; la ligne revient avec un ressort (420 ms). À la souris, une poignée apparaît au survol pour le glisser-déposer entre jours. Les lignes qui changent de place glissent (460 ms), celles qui arrivent descendent en fondu (260 ms). Le dernier ajout porte « à l'instant » en vermillon et une trace vermillon pâle pendant 6 s.

### En-tête de jour
Titre du jour en headline, date en gris pierre (sur sa propre ligne au téléphone), pastille d'âge et nombre de TODO à droite, trait noir de 2 px dessous. Survolé pendant un dépôt : fond et halo vermillon pâle, trait vermillon, « Déposer ici ».

### Menus flottants
Calendrier : fond papier, filet, rayon 22 px, ombre douce, entrée en fondu et léger zoom (150 ms).

### États
Un disque de 80 px (96 px en large), un grand titre, une phrase. Vide : disque cerclé de noir (3 px) avec un plus. Tout terminé : disque vermillon plein avec une coche, posé avec un ressort (600 ms).

## Do's and Don'ts

### Do:
- **Do** garder le vermillon (#D93A1A) en aplat pour le champ et le réserver, dans la page, à ce qui est fait ou ce qui traîne.
- **Do** donner à tout ce qui se touche dans la liste une forme ronde ou en pilule : cases, pastilles, saisie, boutons d'icône.
- **Do** séparer les lignes par des filets de 1 px et les jours par un trait noir de 2 px.
- **Do** composer les chiffres en Archivo 800 ou 900 tabulaires, le chiffre en cours en 900 étendue (wdth 115).
- **Do** tenir les mouvements entre 180 et 460 ms sur `ease-trait`, réserver `ease-ressort` à ce qui revient au repos (case cochée, ligne relâchée), et tout couper en mouvement réduit.
- **Do** ajouter un jeton clair et sombre dans `globals.css` quand une couleur manque.

### Don't:
- **Don't** utiliser de case carrée ni de pastille carrée.
- **Don't** enfermer un jour ou une ligne dans une carte à bord ou à ombre.
- **Don't** ajouter une seconde teinte d'accent, ni utiliser le vermillon pour une erreur.
- **Don't** mettre une ombre sur un élément de la page au repos.
- **Don't** écrire une couleur en dur, une couleur de la palette Tailwind ou une valeur `[#…]` dans un composant.
- **Don't** reprendre l'encre bleue, le surligneur jaune ou les angles de 2 px de l'ancien monde Cartouche.
