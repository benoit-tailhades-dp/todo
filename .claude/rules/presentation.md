---
paths:
  - "src/app/**"
  - "src/presentation/**"
---

# Couche présentation

Périmètre : `src/app/` (routes Next.js) et `src/presentation/` (composants).

## Règles

- N'appelle que la couche service (`@/service/...`). Jamais `@/data/...`, jamais de client de base de données, jamais `process.env`.
- Aucune règle métier ici : un composant affiche et transmet, le service décide.
- N'utilise que les composants du design system Cartouche, dans `@/presentation/ui/`. S'il en manque un : `pnpm dlx shadcn@latest add <nom>`, puis l'aligner sur Cartouche (modèle : `button.tsx`).
- Aucune couleur en dur :
  - ni hex, `rgb()`, `hsl()` ou `oklch()` ;
  - ni couleur de la palette Tailwind (`zinc-500`, `bg-white`, `text-black`…) ;
  - ni valeur arbitraire (`bg-[#…]`).

  Seulement les jetons : `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-input`, `bg-signature`…
- Les couleurs sont définies à un seul endroit : `src/app/globals.css`. S'il en manque une, ajouter un jeton (clair et sombre) plutôt qu'une valeur locale.

## Comment vérifier

1. `pnpm lint` : la règle `no-restricted-imports` bloque tout import de `@/data` et de client de base depuis `src/app` et `src/presentation`.
2. Aucune couleur en dur (les deux commandes ne doivent rien renvoyer) :
   ```bash
   grep -rnE "#[0-9a-fA-F]{3,8}\b|(rgb|rgba|hsl|oklch)\(" src/app src/presentation --include='*.ts' --include='*.tsx'
   grep -rnE "\b(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|decoration|caret|accent)-(white|black|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3})\b" src/app src/presentation
   ```
3. Pas de `<button>` ni d'`<input>` stylé à la main quand le composant existe dans `@/presentation/ui`.
4. Le hook Impeccable signale les dérives visuelles à chaque modification d'un fichier d'interface.
