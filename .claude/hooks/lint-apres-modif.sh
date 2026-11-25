#!/bin/bash
# PostToolUse sur Edit|Write : lance ESLint sur le fichier que l'agent vient de modifier.
# ESLint fait respecter les frontières entre couches (eslint.config.mjs) : une violation
# revient à l'agent (code 2) au moment de la modification, pas au `pnpm lint` de fin de lot.
projet="${CLAUDE_PROJECT_DIR:-$PWD}"
fichier=$(jq -r '.tool_input.file_path // empty')

# Hors du projet (scratchpad, mémoire…) : rien à faire.
case "$fichier" in
  "$projet"/*) ;;
  *) exit 0 ;;
esac

case "$fichier" in
  */node_modules/*|*/.next/*) exit 0 ;;
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.mts) ;;
  *) exit 0 ;;
esac

[ -f "$fichier" ] || exit 0
cd "$projet" || exit 1

if ! sortie=$(pnpm exec eslint --no-warn-ignored "$fichier" 2>&1); then
  echo "ESLint en échec sur ${fichier#"$projet"/} :" >&2
  echo "$sortie" >&2
  exit 2
fi
exit 0
