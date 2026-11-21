---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/presentation/todo"]
---

# Écran TODO (route /)

Mode : Operate. L'écran réel de l'application : ajouter, parcourir, cocher, changer le jour d'un TODO. Remplace le monde Cartouche (demande de l'utilisateur : « trop carré, pas next generation » ; veut du dynamique, stylé, amical).

- Utilisateur : une seule personne, ordinateur et téléphone à parts égales, 10 à 30 TODO en cours.
- Attentes retenues : gestes au pouce, mouvement vivant, progression gratifiante.
- La maquette /maquette n'est pas refaite (demande explicite) ; elle hérite seulement des jetons.

## Direction contract

THESIS: La journée comme une affiche suisse : un chiffre géant de ce qui reste et un arc par jour qui se ferme à mesure qu'on coche. Refuse la liste grise à cases carrées du gabarit TODO et le cartouche à filets de l'ancien monde.

OWN-WORLD: Affiche. Champ vermillon (#D93A1A) en aplat, blanc papier, noir 111. Archivo (largeur variable) très grasse pour chiffres et titres de jour, Archivo 400/500 pour le texte. Formes : cercles et pilules (cases rondes, pastilles d'âge rondes, champ et boutons en pilule), filets fins entre lignes, aucun cadre de carte. Sombre : fond noir chaud, vermillon gardé pour le champ.

STORY: J'ouvre, le chiffre géant dit combien il en reste et les arcs montrent la part faite de chaque jour. J'ajoute au clavier ou au pouce. Je coche ou je glisse la ligne vers la droite : la case se remplit de vermillon, le titre est barré, la ligne se replie, le chiffre roule et l'arc du jour avance.

FIRST VIEWPORT: Large : grille deux colonnes, à gauche le champ vermillon collant pleine hauteur (≈ 40 %) avec titre, date, menu thème, chiffre « En cours » géant, terminés et plus ancien en phrase, arcs concentriques recadrés en bas à droite dans une marge du champ, avec leur légende ; à droite la saisie en pilule en tête puis les jours (titre très gras, pastille d'âge ronde, nombre). Téléphone : champ vermillon en bande haute compacte (chiffre + arcs), liste dessous, saisie fixée en bas à portée du pouce.

FORM: Affiche suisse (style typographique international), position 5 de ma liste ordonnée, seed:ea09e4c0eac227e7. Signature : les arcs du jour en concentriques à la Müller-Brockmann, un par jour, dont la longueur suit la part terminée et qui avancent quand on coche. Geste : glisser une ligne à droite la termine, à gauche ouvre son calendrier ; la ligne tenue s'arrondit et reste nette, le reste de la liste s'efface. Chiffres qui roulent sur place. Lignes qui glissent à leur nouvelle place (FLIP). Mouvements de 180 à 460 ms en sortie exponentielle ; les arcs, la signature, se dessinent en 700 ms ; léger ressort sur la case qui se coche et sur la ligne qui revient après un geste (l'utilisateur a demandé un « mouvement vivant ») ; la trace du dernier ajout reste 6 s (un état, pas un mouvement). Tout est coupé en mouvement réduit.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
