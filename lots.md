# Lots

Un lot = une chose que l'utilisateur fait de bout en bout, de l'écran à la base.
Les lots se traitent dans l'ordre, avec `/lot N`.

## Décisions

- Pilote de base : `@libsql/client` dès le lot 1 (fichier local `file:` en dev, Turso en ligne, même API).
- Ordre d'affichage : du plus ancien au plus récent.
- Groupement : les TODO en cours sont rangés par jour d'ajout, sous un en-tête par jour (« Aujourd'hui », « Hier », sinon la date) avec le nombre de TODO de ce jour.
- Jours calculés à l'heure de Paris (`Europe/Paris`) : le serveur (UTC sur Vercel) et le navigateur rangent un TODO sous le même jour.
- Référence visuelle : la route `/maquette` et `DESIGN.md`.
- Pas de « décocher » un TODO terminé : non demandé par INTENT.md.
- Pas d'authentification (hors périmètre) : l'URL Vercel est publique, quiconque la connaît peut lire et modifier les TODO.

## Lot 1 · Consulter ma liste de TODO

Issue : #1

J'ouvre l'application et je vois la liste de mes TODO, lue depuis la base SQLite et rangée par jour d'ajout. S'il n'y en a aucun, un message me le dit.

- [ ] Étant donné une base sans TODO, quand j'ouvre l'application, alors je vois le message « Aucun TODO pour l'instant ».
- [ ] Étant donné deux TODO ajoutés le lundi 16 novembre et un ajouté aujourd'hui, quand j'ouvre l'application, alors je les vois sous deux en-têtes, « Lundi 16 novembre » puis « Aujourd'hui », chacun avec son nombre de TODO, et dans chaque jour du plus ancien au plus récent.
- [ ] Étant donné un TODO ajouté le 19 novembre à 23 h 30, heure de Paris, quand j'ouvre l'application le 20, alors il est rangé sous « Hier », même si le serveur tourne en UTC.
- [ ] Étant donné une base qui n'existe pas encore, quand je lance l'application pour la première fois, alors la base et sa table sont créées et la liste vide s'affiche.
- [ ] Étant donné des TODO en base, quand je redémarre l'application, alors la liste affichée est la même.

## Lot 2 · Ajouter un TODO

Issue : #2

Je saisis un titre dans le champ au-dessus de la liste et je valide avec le bouton ou la touche Entrée. Le TODO est enregistré en base, il apparaît en dernier sous « Aujourd'hui » et le champ se vide.

- [ ] Étant donné la liste affichée, quand je saisis « Relancer le devis » et que je valide, alors « Relancer le devis » apparaît en dernier sous « Aujourd'hui » (en-tête créé s'il n'existait pas) et le champ se vide.
- [ ] Étant donné un champ vide ou qui ne contient que des espaces, quand je valide, alors aucun TODO n'est créé et un message me demande un titre.
- [ ] Étant donné un titre entouré d'espaces (« ␣␣Relancer le devis␣␣ »), quand je valide, alors le TODO est enregistré sous « Relancer le devis ».
- [ ] Étant donné un TODO que je viens d'ajouter, quand je redémarre l'application, alors il est toujours dans la liste.

## Lot 3 · Marquer un TODO terminé

Issue : #3

Dans la liste, je coche la case d'un TODO en cours. Il s'affiche tout de suite comme terminé et cet état est enregistré en base.

- [ ] Étant donné un TODO en cours, quand je coche sa case, alors il s'affiche comme terminé (case cochée, titre barré).
- [ ] Étant donné un TODO terminé, quand je redémarre l'application, alors il est toujours affiché comme terminé.
- [ ] Étant donné un identifiant qui ne correspond à aucun TODO, quand je demande à le marquer terminé, alors rien n'est modifié et un message dit que le TODO est introuvable.
- [ ] Étant donné un TODO déjà terminé, quand je le marque à nouveau terminé, alors il reste terminé et aucun autre TODO ne change.

## Lot 4 · Séparer mes TODO en cours de mes TODO terminés

Issue : #4

J'ouvre la liste et je vois d'abord mes TODO en cours, puis mes TODO terminés dans une section à part. Un compteur m'indique combien il m'en reste.

- [ ] Étant donné 2 TODO en cours et 1 terminé, quand j'ouvre l'application, alors les 2 en cours sont en haut, le terminé est dans la section « Terminés » et le compteur affiche « 2 en cours ».
- [ ] Étant donné un TODO en cours, quand je le coche, alors il passe dans « Terminés » et le compteur baisse de 1.
- [ ] Étant donné le seul TODO en cours d'un jour, quand je le coche, alors l'en-tête de ce jour disparaît.
- [ ] Étant donné que tous mes TODO sont terminés, quand j'ouvre l'application, alors un message dit qu'il ne reste rien à faire.
- [ ] Étant donné qu'aucun TODO n'est terminé, quand j'ouvre l'application, alors la section « Terminés » n'apparaît pas.

## Lot 5 · Retrouver mes TODO sur l'application en ligne

Issue : #5

J'ouvre l'application déployée sur Vercel, et j'y ajoute et coche mes TODO comme en local. En ligne, les données sont dans Turso ; en local, l'application garde le fichier SQLite.

- [ ] Étant donné l'application déployée sur Vercel, quand j'ajoute un TODO, alors il apparaît dans la liste.
- [ ] Étant donné des TODO créés en ligne, quand un nouveau déploiement a lieu, alors ils sont toujours là.
- [ ] Étant donné le passage de SQLite à Turso, quand je regarde le diff du lot, alors seuls `src/data/` et `package.json` sont modifiés.
- [ ] Étant donné qu'aucune variable Turso n'est définie, quand je lance `pnpm dev`, alors l'application utilise le fichier SQLite local.

## Lot 6 · Changer la date d'un TODO

Issue : #18

Sur un TODO en cours, j'ouvre son sélecteur de date et je choisis un autre jour, passé ou futur. Ou bien je le glisse et le dépose sur un autre jour de la liste. Le TODO passe sous ce jour et sa nouvelle date est enregistrée en base. Un jour futur s'affiche après « Aujourd'hui », sous « Demain » ou sous sa date. Dans un jour, l'ordre reste celui de l'ajout. Au clavier, le sélecteur de date fait le même travail que le glisser-déposer.

- [ ] Étant donné un TODO en cours sous « Aujourd'hui » (vendredi 20 novembre), quand je choisis le lundi 16 novembre dans son sélecteur de date, alors il passe sous « Lundi 16 novembre » et les compteurs des deux jours changent.
- [ ] Étant donné deux TODO en cours, quand je choisis le samedi 21 novembre pour l'un et le mardi 24 novembre pour l'autre, alors ils sont rangés après « Aujourd'hui », sous « Demain » puis sous « Mardi 24 novembre ».
- [ ] Étant donné les jours « Hier » et « Aujourd'hui » affichés, quand je glisse un TODO de « Hier » et le dépose sur « Aujourd'hui », alors il passe sous « Aujourd'hui » avec la date du jour.
- [ ] Étant donné le seul TODO en cours d'un jour, quand je le déplace vers un autre jour, alors l'en-tête du jour qu'il quitte disparaît.
- [ ] Étant donné un TODO que je relâche sur son propre jour ou hors de la liste, alors il reste à sa place et rien n'est enregistré.
- [ ] Étant donné un TODO dont j'ai changé la date, quand je redémarre l'application, alors il est toujours sous son nouveau jour.
- [ ] Étant donné le serveur en UTC, quand je choisis le mardi 24 novembre à 23 h 30, heure de Paris, alors le TODO est rangé sous « Mardi 24 novembre », ni la veille ni le lendemain.
- [ ] Étant donné une date vide ou invalide, ou un identifiant qui ne correspond à aucun TODO, quand je demande le changement, alors rien n'est modifié et un message dit pourquoi.

Maquette : à compléter avant le code (sélecteur de date sur un TODO en cours, TODO en train d'être glissé, jour survolé prêt à le recevoir, en-tête « Demain »).

Hors lot :
- Réordonner les TODO à la main dans un jour : non demandé.
- Changer la date d'un TODO terminé.
- Glisser vers un jour qui n'est pas affiché : on passe par le sélecteur.

## Lot 7 · Choisir le thème clair ou sombre

Issue : #24

Dans le bandeau, un bouton me laisse choisir le thème : Système, Clair ou Sombre. Le choix s'applique tout de suite, sans recharger la page, et il est retenu sur cet appareil. Par défaut, l'application suit le réglage du système, comme aujourd'hui.

- [ ] Étant donné le thème « Système », quand mon système est réglé en sombre, alors l'application s'affiche en sombre, et en clair s'il est réglé en clair.
- [ ] Étant donné l'application en clair, quand je choisis « Sombre », alors toute la page passe en sombre tout de suite, sans rechargement.
- [ ] Étant donné « Sombre » choisi, quand je rouvre l'application, alors elle s'ouvre directement en sombre, sans flash blanc pendant le chargement.
- [ ] Étant donné « Clair » choisi, quand le système passe en sombre, alors l'application reste en clair.
- [ ] Étant donné « Système » choisi de nouveau, alors l'application suit à nouveau le réglage du système.
- [ ] Au clavier, je choisis le thème sans souris, et le lecteur d'écran annonce le thème actif.

Maquette : à compléter avant le code (bouton de thème dans le bandeau, menu ouvert avec les trois choix, bandeau en clair et en sombre).

Hors lot :
- Retrouver le même thème sur un autre appareil : pas de compte, le choix reste dans le navigateur.
