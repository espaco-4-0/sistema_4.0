# Descrição

<!-- O que muda e por quê. Se resolve uma issue, use "Closes #123". -->

## Tipo

- [ ] feat — nova funcionalidade
- [ ] fix — correção de bug
- [ ] refactor — mudança interna sem alterar comportamento
- [ ] chore — build, CI, dependências
- [ ] docs — documentação

## Checklist

- [ ] A base deste PR é `develop` (só `release/*` e `hotfix/*` vão para `main`)
- [ ] `pnpm lint`, `pnpm typecheck` e `pnpm test:run` passam localmente
- [ ] Alterei `prisma/schema/` **e** gerei a migration correspondente em `prisma/migrations/`
- [ ] Novas variáveis de ambiente foram adicionadas ao `.env.example`
- [ ] Endpoints novos validam entrada com Zod e checam sessão/role

## Como testar

<!-- Passos para o revisor reproduzir. Inclua rotas, payloads e o resultado esperado. -->

## Impacto no banco

<!-- Migration destrutiva? Precisa de backfill? Escreva "nenhum" se não houver. -->
