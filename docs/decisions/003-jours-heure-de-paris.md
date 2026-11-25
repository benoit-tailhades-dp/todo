# ADR 003 · Jours calculés à l'heure de Paris

- Statut : acceptée
- Date : 2026-11-20
- Portée : cadrage

## Contexte
Les TODO en cours sont rangés par jour d'ajout (« Aujourd'hui », « Hier », sinon la date). Le rendu se fait en partie sur le serveur (UTC sur Vercel) et en partie dans le navigateur (heure locale de l'utilisateur). Sans fuseau commun, un TODO ajouté le soir peut changer de jour entre les deux rendus.

## Décision
Les jours se calculent dans le fuseau `Europe/Paris`, sur le serveur comme dans le navigateur. La règle est portée par le service : `src/service/jours.ts` (la maquette a sa copie dans `src/presentation/maquette/dates.ts`).

## Options considérées
- Fuseau `Europe/Paris` sur le serveur comme dans le navigateur : retenue.
- Heure du serveur (UTC sur Vercel) : écartée, le serveur et le navigateur rangeraient un TODO sous des jours différents.
- Heure locale du navigateur : écartée pour la même raison, le premier rendu se fait sur le serveur.

## Conséquences
- Un TODO est rangé sous le même jour, quel que soit l'endroit du rendu.
- L'application suppose un utilisateur à l'heure de Paris : en voyage, les jours restent ceux de Paris.
