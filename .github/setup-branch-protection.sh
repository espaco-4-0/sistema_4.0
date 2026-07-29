#!/usr/bin/env bash
#
# Aplica as regras de branch que NÃO podem viver em arquivos versionados:
# elas são configuração do repositório no GitHub.
#
# Requisitos: gh CLI autenticado (`gh auth login`) e permissão de admin no repo.
# Uso: ./.github/setup-branch-protection.sh
#
set -euo pipefail

REPO="${REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

echo "Repositório: $REPO"
echo

# ---------------------------------------------------------------------------
# 1. develop passa a ser a branch padrão.
#    Efeito: todo PR aberto pela UI já vem com base em develop, e `git clone`
#    entrega develop. É isto que faz os PRs "apontarem automaticamente" para lá.
# ---------------------------------------------------------------------------
echo "==> Definindo 'develop' como branch padrão"
gh api -X PATCH "repos/$REPO" -f default_branch=develop >/dev/null
echo "    ok"

# ---------------------------------------------------------------------------
# 2. Proteção da main: ninguém empurra direto, merge só via PR aprovado
#    por um code owner, e nada de force-push nem deleção.
# ---------------------------------------------------------------------------
echo "==> Protegendo 'main'"
gh api -X PUT "repos/$REPO/branches/main/protection" --input - >/dev/null <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint, tipos e testes", "Build de produção"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "required_conversation_resolution": true,
  "block_creations": false,
  "lock_branch": false
}
JSON
echo "    ok"

# ---------------------------------------------------------------------------
# 3. Proteção da develop: mais leve que a main, mas ainda exige PR verde
#    e uma aprovação. Push direto continua bloqueado.
# ---------------------------------------------------------------------------
echo "==> Protegendo 'develop'"
gh api -X PUT "repos/$REPO/branches/develop/protection" --input - >/dev/null <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint, tipos e testes", "Build de produção"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
echo "    ok"

# ---------------------------------------------------------------------------
# 4. Reforço: restringe quem pode empurrar na main aos três owners, os mesmos
#    listados no .github/CODEOWNERS.
# ---------------------------------------------------------------------------
echo "==> Restringindo push na main aos owners"
gh api -X PUT "repos/$REPO/branches/main/protection/restrictions" \
  -f 'users[]=Alberth-Farias' \
  -f 'users[]=gustavo-lola' \
  -f 'users[]=JoaoGSantiago' \
  -F 'teams[]=' >/dev/null
echo "    ok"

# ---------------------------------------------------------------------------
# 5. Higiene de merge: mantém histórico linear e limpa branch mesclada.
# ---------------------------------------------------------------------------
echo "==> Ajustando políticas de merge"
gh api -X PATCH "repos/$REPO" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=true >/dev/null
echo "    ok"

echo
echo "Pronto. Confira em: https://github.com/$REPO/settings/branches"
