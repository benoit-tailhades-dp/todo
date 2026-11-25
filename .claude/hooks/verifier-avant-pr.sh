#!/bin/bash
# PreToolUse sur Bash : avant `gh pr create`, lance lint, types et tests.
# Un échec bloque la création de la PR (code 2) et renvoie la fin de la sortie à l'agent.
commande=$(jq -r '.tool_input.command // empty')
case "$commande" in
  *"gh pr create"*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-$PWD}" || exit 1

verifier() {
  local nom="$1"
  shift
  local sortie
  if ! sortie=$("$@" 2>&1); then
    {
      echo "PR bloquée : « $nom » est en échec. Corrige la cause, commite, puis relance gh pr create."
      echo "$sortie" | tail -n 40
    } >&2
    exit 2
  fi
}

verifier "pnpm lint" pnpm lint
verifier "pnpm exec tsc --noEmit" pnpm exec tsc --noEmit
verifier "pnpm test" pnpm test
exit 0
