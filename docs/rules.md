# Regras de Negócio e Funcionalidades

Este documento consolida as regras de negócio, comportamentos esperados e o descritivo detalhado das funcionalidades do aplicativo **Mensagem Transformadora**.

---

## 1. Visão Geral e Princípios Fundamentais

- **Offline-First Absoluto**: O aplicativo não depende de conexão com a internet. Não há backend, APIs de terceiros, autenticação em nuvem ou sincronização online.
- **Armazenamento Local**: Todos os dados gerados pelo usuário são salvos localmente utilizando o banco de dados relacional (SQLite) no próprio dispositivo.
- **Privacidade**: Como não há tráfego de rede, os dados do usuário pertencem exclusivamente ao usuário e permanecem em seu aparelho.
- **Foco e Limpeza**: A interface deve ser intuitiva, direta e livre de distrações, com ações claras e contrastes padronizados.

---

## 2. Estrutura das Entidades Principais

A entidade central do sistema é a **Anotação de Pregação** (Sermon Note), composta pelas seguintes informações:

### 2.1. Metadados e Cabeçalho
- **Nome do Usuário**: Obrigatório. Identifica o autor da anotação.
- **Nome do Pregador**: Obrigatório. Quem ministrou a mensagem.
- **Nome da Igreja**: Obrigatório. Local onde a mensagem foi ministrada.
- **Data**: Obrigatória (padrão YYYY-MM-DD). Inserida automaticamente na criação, editável se necessário.
- **Horário**: Opcional (HH:MM).
- **Título da Pregação**: Obrigatório. Tema central da mensagem.
- **Versículo Base**: Obrigatório. Referência bíblica principal que fundamentou a mensagem.
- **Favorito**: Booleano. Indica se a mensagem foi destacada pelo usuário.

### 2.2. Corpo e Conteúdo
- **Versículos Secundários**: Lista dinâmica e opcional. Outras referências bíblicas citadas.
- **Introdução**: Opcional. Texto livre com as considerações iniciais.
- **Pontos Principais**: Lista dinâmica (1 ou mais pontos). Cada ponto possui título e conteúdo/explicação, e é ordenado cronologicamente.
- **Frases Marcantes**: Opcional. Lista de citações ou insights fortes (processados como texto separado por linhas).
- **Observações Pessoais**: Opcional. Pensamentos ou dúvidas do próprio usuário.
- **Aplicações Práticas**: Opcional. Como o usuário pretende aplicar a mensagem em sua vida.
- **Conclusão**: Opcional. O fechamento da mensagem.
- **Resumo Final**: Opcional. Um apanhado geral e editável gerado com base na anotação (manual ou automação textual).

---

## 3. Funcionalidades Detalhadas

### F01. Tela Inicial (Start Screen)
- **Objetivo**: Ser a porta de entrada acolhedora do aplicativo.
- **Regras**:
  - Exibir um Hero Banner com acesso rápido para "Nova Mensagem" e "Ver histórico".
  - Mostrar as 3 últimas mensagens gravadas, ordenadas por data de criação decrescente.
  - Oferecer acesso à tela "Sobre o Aplicativo".
  - Deve ter Empty State amigável quando não houver mensagens, com CTA claro para criar a primeira.

### F02. Gestão de Anotações (CRUD)
- **Criar (Nova Mensagem)**:
  - O usuário deve preencher obrigatoriamente os campos de cabeçalho.
  - Os campos dinâmicos (Pontos Principais e Versículos Secundários) devem permitir adição e remoção livre.
  - A data de criação (`createdAt`) e atualização (`updatedAt`) são geradas pelo sistema.
- **Visualizar (Detalhes)**:
  - Todos os campos preenchidos devem ser exibidos de forma estruturada.
  - Campos não preenchidos (opcionais) devem ser omitidos ou indicados como "Em branco" para não poluir a tela.
- **Editar**:
  - Deve reaproveitar o mesmo formulário de criação, pré-preenchido com os dados atuais.
  - Ao salvar, o `updatedAt` deve ser atualizado.
- **Excluir**:
  - Exige confirmação explícita do usuário (Alert de Confirmação).
  - Remoção lógica (cascade) dos dados associados (pontos e versículos) para evitar registros órfãos.

### F03. Listagem e Histórico (Home/History)
- **Objetivo**: Listar todas as anotações criadas.
- **Regras**:
  - A ordenação padrão é da mais recente para a mais antiga (`created_at DESC`).
  - O card de listagem deve exibir de forma sucinta: Título, Pregador, Igreja, Data/Hora e se é favorito.
  - Deve lidar com estado de "Lista vazia", exibindo uma mensagem amigável e um CTA para criar a primeira anotação.

### F04. Busca Inteligente Local
- **Regras**:
  - A busca é feita por texto livre e deve filtrar as anotações considerando os seguintes campos simultaneamente:
    - Título da pregação
    - Nome do pregador
    - Nome da Igreja
    - Versículo base
    - Versículos secundários associados
  - A busca deve ter *debounce* (atraso de digitação) para não sobrecarregar o banco de dados em cada caractere digitado.

### F05. Ações Rápidas de Anotação
- **Favoritar/Desfavoritar**:
  - O usuário pode marcar uma mensagem como favorita (estrela) diretamente na tela de Detalhes.
  - Isso afeta métricas e permite futuras filtragens.
- **Duplicar**:
  - Cria uma cópia exata da anotação selecionada.
  - O título da nova anotação recebe o sufixo " (Cópia)".
  - A data de criação (`createdAt`) é renovada, e os IDs internos são gerados novamente para não causar conflitos.
- **Exportar PDF**:
  - Deve gerar um PDF local com layout profissional, incluindo logo, título, metadados (pregador/igreja/data), versículos e seções principais.
  - O arquivo deve ficar pronto para compartilhamento.

### F06. Dashboard e Métricas Locais
- **Objetivo**: Prover estatísticas de uso do aplicativo baseadas nos dados inseridos.
- **Regras**:
  - Deve calcular em tempo real (consultas agregadas no SQLite):
    - Total de mensagens registradas.
    - Total de mensagens favoritadas.
    - Proporção de favoritos.
    - Gráfico/Contagem dos últimos 7 dias.
    - Ranking dos Pregadores mais frequentes.
    - Ranking das Igrejas mais frequentadas.
  - Todas as informações devem ser reprocessadas dinamicamente ao abrir a tela (Focus Effect).

### F07. Guia (Instruções)
- **Objetivo**: Ajudar o usuário a entender rapidamente como operar cada tela.
- **Regras**:
  - Deve existir como seção acessível no rodapé (Tab).
  - Deve trazer instruções por tela com destaques de pontos importantes.

### F08. Tela Sobre o Aplicativo (About)
- **Objetivo**: Fornecer créditos e informações da versão.
- **Regras**:
  - Deve exibir claramente a versão do app (ex: 1.0).
  - Desenvolvedor: Ricardo Bene.
  - Empresa: Algoritmum Desenvolvimento.
  - Licença: Software Gratuito.
  - Deve exibir o logo do aplicativo de forma proeminente e alinhada ao design visual do sistema.

### F09. Splash Screen
- **Objetivo**: Criar uma abertura premium, rápida e estável.
- **Regras**:
  - Deve usar o logo oficial do sistema centralizado.
  - Deve manter tempo de exibição entre 2 e 3 segundos, sem travar o app.
  - Deve ocultar automaticamente após a inicialização do app (incluindo inicialização do banco local).

---

## 4. Regras Técnicas e de Arquitetura

- **Transações de Banco de Dados**: Toda operação de escrita complexa (Criação, Edição, Duplicação, Exclusão) deve utilizar `withExclusiveTransactionAsync` para garantir que as tabelas relacionadas (Anotações, Pontos e Versículos) sejam salvas com integridade (se uma falhar, todas falham - *rollback*).
- **Pragmas SQLite**: O banco deve operar obrigatoriamente com `PRAGMA foreign_keys = ON;` e `PRAGMA journal_mode = WAL;` para performance e integridade referencial.
- **Gestão de Cores e UI**: O padrão é utilizar as variáveis globais do `theme.ts`. Valores em hexadecimal podem ser usados somente em efeitos visuais controlados (ex.: overlays/gradientes do hero), mantendo consistência com a paleta principal.
