---
name: "docs-atualizacao"
description: "Atualiza README/prd/rules/usage/spec. Invoque sempre que implementar/alterar features, fluxos, telas, backup ou modelo de dados do app."
---

# Atualização de Documentação (Sistema)

## Objetivo

Manter sincronizados os arquivos:

- `README.md`
- `docs/prd.md`
- `docs/rules.md`
- `docs/usage.md`
- `docs/spec.md`

## Quando invocar

Invoque esta skill sempre que:

- Adicionar/remover/alterar uma feature (ex.: Backup, PDF, Dashboard, CRUD)
- Alterar fluxo de tela, navegação, textos de UI ou pontos de entrada (ex.: um botão novo no About)
- Alterar schema/migrations do SQLite, entidades, índices ou campos persistidos
- Alterar regras de negócio (validações, obrigatoriedades, comportamento de import/export)

## Procedimento obrigatório (checklist)

1) Mapear mudanças reais no código

- Identificar novas telas em `src/screens/*`
- Identificar rotas/entradas em `src/navigation/*`
- Identificar mudanças de persistência em `src/database/*` (migrations, pragmas, tabelas, índices)
- Identificar serviços/funções de feature em `src/services/*` (ex.: `backup.ts`)

2) Atualizar `README.md` (visão executiva)

- Atualizar a lista de funcionalidades (bullets)
- Se a feature exigir instruções, adicionar uma seção curta (ex.: “Backup e Restauração”)
- Incluir limitações relevantes (ex.: “Disponível apenas no Android”)

3) Atualizar `docs/prd.md` (requisitos)

- Adicionar/ajustar o item de funcionalidade correspondente (Fxx)
- Refletir regras de negócio e o objetivo da feature

4) Atualizar `docs/rules.md` (regras detalhadas)

- Criar/atualizar a seção de feature (Fxx) com:
  - Objetivo
  - Acesso (onde fica na navegação/telas)
  - Regras (o que pode/não pode, confirmações, comportamento destrutivo, limitações de plataforma)
  - Resultados esperados (ex.: histórico, ordenação, mensagens)

5) Atualizar `docs/usage.md` (passo a passo por tela)

- Garantir que toda tela acessível no app tenha um item dedicado
- Descrever “Como acessar” (especialmente para telas fora das Tabs)
- Descrever passos operacionais e alertas de risco (ex.: restore substitui dados)

6) Atualizar `docs/spec.md` (especificação)

- Incluir o fluxo principal quando a feature alterar o “caminho do usuário”
- Incluir/atualizar o modelo de dados (tabelas, colunas, índices)
- Manter o texto alinhado com o que o app realmente faz (sem features futuras como se fossem atuais)

## Validações finais

- Conferir consistência de nomes:
  - Nome da feature e textos (ex.: “Backup e Restauração”, “Exportar backup”, “Importar backup”)
  - Nome de tabela/colunas (ex.: `backup_history`, `kind`, `file_name`, `file_uri`, `created_at`)
- Conferir coerência de plataforma (ex.: se há `Platform.OS !== 'android'`, documentar “Android”)
- Evitar contradições entre PRD/Rules/Usage/Spec (mesma feature com regras diferentes)
