---
version: 1
slug: "src-app-maquette-page-tsx"
primary_target: "src/app/maquette/page.tsx"
related_targets: ["src/presentation/maquette"]
---

# Maquette de l'écran TODO (route /maquette)

Mode : Operate. Maquette dynamique, données fictives et état local, sans base ; référence visuelle des lots 1 à 4.

- Utilisateur : une seule personne, ordinateur et téléphone à parts égales, 10 à 30 TODO en cours.
- Tâches à poids égal : ajouter vite, passer la liste en revue, cocher.
- À éviter (réponse de l'utilisateur) : look gabarit générique, animations qui ralentissent, interface trop austère.
- États montrés par une barre de démo séparée : liste, vide, tout terminé, chargement, erreur de chargement, titre vide refusé, TODO introuvable, enregistrement en cours.
- Décisions ouvertes : le groupement par jour et la cellule « Le plus ancien » ne sont pas dans lots.md (à reporter dans les lots 1 et 4 si validés) ; nom de l'application non décidé (« Mes TODO » provisoire).

## Direction contract

THESIS: Un registre du jour : les TODO en cours rangés par jour d'ajout, du plus ancien au plus récent, pour voir ce qui traîne. Refuse la liste plate de cases sur fond gris du gabarit TODO.

OWN-WORLD: Cartouche. Bandeau encre portant titre, date et cellules de cartouche à filets (En cours chiffré en surligneur, Terminés, Le plus ancien). Feuilles blanches à filets de 1 px, rayons de 2 à 3 px, Barlow et Barlow Semi Condensed, chiffres tabulaires. Le jaune surligneur est réservé au focus, au dernier ajout et aux alertes de saisie.

STORY: J'ouvre, je vois combien il m'en reste et depuis quand le plus ancien attend. J'ajoute au clavier ou au pouce. Je coche : le TODO est barré à l'encre puis rejoint « Terminés ».

FIRST VIEWPORT: Bandeau encre pleine largeur, contenu centré d'environ 56 rem. Titre de 30 px et date à gauche, trois cellules à droite. Dessous, champ d'ajout pleine largeur et bouton Ajouter surligneur (action principale). Puis les groupes de jour (en-tête sur filet, âge, nombre), lignes de 46 px, « Terminés » repliable en bas.

FORM: Registre du jour, position 7 de ma liste ordonnée, seed:e29b76cda58b13b5. Interaction signature : un trait de surligneur balaie le TODO ajouté ; un trait d'encre barre le TODO coché avant qu'il ne glisse vers « Terminés ». Mouvements de 150 à 300 ms, coupés en mouvement réduit.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
