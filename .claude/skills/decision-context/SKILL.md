---
name: decision-context
description: Lit et écrit les décisions d'architecture du projet (ADR) dans docs/decisions/. À utiliser avant de proposer un choix d'architecture, de librairie ou de structure, et dès qu'une décision est prise avec des options écartées.
---

# decision-context · les décisions du projet

Les décisions d'architecture vivent dans `docs/decisions/`, un fichier par décision, commité avec le code. Format inspiré de MADR.

Les décisions produit (ordre d'affichage, groupement, pas de « décocher »…) restent dans `lots.md`, section « Décisions ». Un ADR porte un choix technique ou de structure : pilote, couches, design system, calcul des dates, process.

## Avant d'agir

1. Liste `docs/decisions/` et lis les ADR qui touchent ta tâche.
2. Ne propose pas une option qu'un ADR « acceptée » a écartée. Si elle te semble meilleure, dis-le et demande d'abord.
3. Deux ADR « acceptée » se contredisent : signale-le, ne tranche pas seul.

## Écrire un ADR

Quand un choix structurant est pris (architecture, librairie, structure, process) et que des options ont été écartées.

Fichier : `docs/decisions/NNN-<slug>.md`, numéro suivant le dernier, sur trois chiffres :

```markdown
# ADR <numéro> · <titre>

- Statut : acceptée | remplacée par l'ADR <numéro>
- Date : <AAAA-MM-JJ>
- Portée : cadrage | lot <N>

## Contexte
Le problème et les contraintes du moment.

## Décision
Ce qui est retenu.

## Options considérées
- <option retenue> : retenue.
- <option> : écartée parce que <raison>.

## Conséquences
Ce que ça change, en bien et en mal.
```

## Les règles

- Tu rédiges l'ADR et tu le montres au développeur. Tu ne l'écris qu'avec son accord.
- Un ADR est immuable. La décision change : nouvel ADR, et l'ancien passe à « remplacée par l'ADR <numéro> ».
- « Options considérées » est toujours rempli, avec l'option retenue et chaque option écartée : c'est la section qui t'évite de reproposer un choix rejeté. Une raison inconnue s'écrit « raison non documentée », jamais inventée.
- Pas de secret dans un ADR : il est commité.
