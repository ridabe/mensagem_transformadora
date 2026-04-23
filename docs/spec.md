3.1 Visão arquitetural
Arquitetura sugerida

Arquitetura modular em camadas:

UI
Application / Use Cases
Domain
Data
Persistence local
Estrutura conceitual
src/screens/
src/components/
src/navigation/
src/database/
src/repositories/
src/services/
src/theme/
src/types/

Observações de implementação (atual):

- Stack: Expo SDK 54 + React Native + TypeScript.
- Persistência: SQLite local com `expo-sqlite` (async) e pragmas `WAL` + `foreign_keys = ON`.
- Splash Screen: `expo-splash-screen` com logo e transição automática após inicialização do app.
- Exportação PDF: `expo-print` + `expo-sharing` com HTML/CSS local e logo embutido.
3.2 Entidades principais
Entidade: SermonNote

Representa uma anotação de pregação.

Campos sugeridos
type SermonNote = {
id: string
userName: string
preacherName: string
churchName: string
sermonDate: string
sermonTime?: string
sermonTitle: string
mainVerse: string
secondaryVerses: string\[]
introduction?: string
keyPoints: SermonPoint\[]
highlightedPhrases: string\[]
personalObservations?: string
practicalApplications?: string
conclusion?: string
finalSummary?: string
createdAt: string
updatedAt: string
favorite: boolean
}
Entidade: SermonPoint
type SermonPoint = {
id: string
title: string
content: string
order: number
}
3.3 Regras funcionais
RF01

O app deve permitir criar uma nova anotação localmente.

RF02

A data da pregação deve ser preenchida automaticamente na criação.

RF03

O usuário deve poder editar todos os campos depois.

RF04

O usuário deve poder adicionar múltiplos pontos principais.

RF05

O usuário deve poder adicionar múltiplos versículos secundários.

RF06

O sistema deve listar as anotações salvas em ordem da mais recente para a mais antiga.

RF07

O sistema deve permitir pesquisa textual por:

título
pregador
igreja
versículo
RF08

O sistema deve gerar um resumo consolidado com base nas anotações.

RF09

O sistema deve exportar uma anotação em PDF.

RF10

O sistema deve funcionar sem internet.

3.4 Regras não funcionais
RNF01 — Offline first

Todas as funcionalidades principais devem funcionar sem conexão.

RNF02 — Persistência local

Os dados devem ser salvos localmente em SQLite.

RNF03 — Performance

A abertura da lista principal deve ser rápida mesmo com centenas de anotações.

RNF04 — Usabilidade

O app deve ter interface simples para uso durante culto/pregação.

RNF05 — Confiabilidade

Os dados devem permanecer após fechar e reabrir o app, compatível com persistência local.

RNF06 — Escalabilidade futura

A arquitetura deve permitir no futuro adicionar sincronização, contas e IA externa sem reescrever o núcleo.

3.5 Fluxos principais
Fluxo 1 — Criar anotação
Usuário abre o app
Clica em “Nova Mensagem”
Preenche os campos
Adiciona pontos principais
Adiciona versículos secundários
Salva
Registro é persistido localmente
Fluxo 2 — Editar anotação
Usuário abre uma mensagem existente
Ajusta os dados
Salva
Sistema atualiza o registro local
Fluxo 3 — Gerar resumo
Usuário abre uma mensagem
Clica em “Gerar Resumo”
Sistema monta o resumo com base nos campos preenchidos
Usuário revisa e salva
Fluxo 4 — Exportar PDF
Usuário abre uma mensagem
Clica em “Exportar PDF”
Sistema gera o documento localmente
Usuário compartilha ou salva

Fluxo 5 — Backup e restauração (Android)
Usuário acessa “Sobre o Aplicativo”
Clica em “Backup e Restauração”
Para exportar: escolhe uma pasta e o app salva um arquivo `.mtbackup`
Para restaurar: seleciona um arquivo de backup e confirma a substituição dos dados
Sistema reinicializa o banco local e reaplica migrations

Fluxo 6 — Solicitar avaliação (Play Store, Android)
Usuário entra na tela Início (ou conclui uma ação positiva, como exportar PDF)
Sistema verifica regra de tempo (mínimo 3 dias desde o primeiro uso e mínimo 3 dias entre tentativas)
Sistema exibe um modal próprio com “Avaliar agora”, “Lembrar depois” e “Já avaliei”
Se “Avaliar agora”: tenta abrir o review nativo; se indisponível, abre a página do app na Play Store
Como a Play Store não confirma a avaliação, o sistema marca como tentativa não confirmada e agenda nova elegibilidade para +3 dias
Se “Lembrar depois”: agenda nova elegibilidade para +3 dias
Se “Já avaliei”: marca como confirmado e nunca mais exibe

Persistência local (AsyncStorage) — Avaliação

- `first_open_at` (ms): primeiro uso do app
- `next_review_at` (ms): próxima data/hora mínima para tentar exibir novamente
- `review_status`: `never_asked` | `eligible` | `postponed` | `requested_but_unconfirmed` | `rated_confirmed`
- `last_review_request_at` (ms | null): última tentativa de abrir avaliação
- `review_request_count` (number): contador de tentativas
- `rated_confirmed_at` (ms | null): quando o usuário confirmou “Já avaliei”






Tabela schema\_migrations

CREATE TABLE schema\_migrations (

&#x20; version INTEGER PRIMARY KEY NOT NULL

);

Tabela sermon\_notes

CREATE TABLE sermon\_notes (

&#x20; id TEXT PRIMARY KEY,

&#x20; user\_name TEXT NOT NULL,

&#x20; preacher\_name TEXT NOT NULL,

&#x20; church\_name TEXT NOT NULL,

&#x20; sermon\_date TEXT NOT NULL,

&#x20; sermon\_time TEXT,

&#x20; sermon\_title TEXT NOT NULL,

&#x20; main\_verse TEXT NOT NULL,

&#x20; introduction TEXT,

&#x20; personal\_observations TEXT,

&#x20; practical\_applications TEXT,

&#x20; conclusion TEXT,

&#x20; final\_summary TEXT,

&#x20; highlighted\_phrases TEXT NOT NULL DEFAULT '[]',

&#x20; favorite INTEGER NOT NULL DEFAULT 0,

&#x20; created\_at TEXT NOT NULL,

&#x20; updated\_at TEXT NOT NULL

);

Índices (atuais)

CREATE INDEX idx\_sermon\_notes\_created\_at ON sermon\_notes(created\_at);

CREATE INDEX idx\_sermon\_notes\_favorite ON sermon\_notes(favorite);

Tabela sermon\_points

CREATE TABLE sermon\_points (

&#x20; id TEXT PRIMARY KEY,

&#x20; sermon\_note\_id TEXT NOT NULL,

&#x20; title TEXT NOT NULL,

&#x20; content TEXT NOT NULL,

&#x20; point\_order INTEGER NOT NULL,

&#x20; FOREIGN KEY (sermon\_note\_id) REFERENCES sermon\_notes(id) ON DELETE CASCADE

);

CREATE INDEX idx\_sermon\_points\_note\_order ON sermon\_points(sermon\_note\_id, point\_order);

Tabela secondary\_verses

CREATE TABLE secondary\_verses (

&#x20; id TEXT PRIMARY KEY,

&#x20; sermon\_note\_id TEXT NOT NULL,

&#x20; verse\_text TEXT NOT NULL,

&#x20; FOREIGN KEY (sermon\_note\_id) REFERENCES sermon\_notes(id) ON DELETE CASCADE

);

CREATE INDEX idx\_secondary\_verses\_note ON secondary\_verses(sermon\_note\_id);

Tabela backup\_history

CREATE TABLE backup\_history (

&#x20; id TEXT PRIMARY KEY NOT NULL,

&#x20; kind TEXT NOT NULL,

&#x20; file\_name TEXT NOT NULL,

&#x20; file\_uri TEXT NOT NULL,

&#x20; created\_at TEXT NOT NULL

);

CREATE INDEX idx\_backup\_history\_created\_at ON backup\_history(created\_at);

6\. Módulos do sistema



Agora já ajustado ao seu novo cenário.



Módulo 1 — Estrutura base do app



Responsável por:



navegação

tema visual

layout base

componentes reutilizáveis

Splash Screen

screen inicial (Início)

Módulo 2 — Banco local



Responsável por:



criação do SQLite

migrations

repositórios

CRUD local

Módulo 3 — Nova anotação de pregação



Responsável por:



formulário de cadastro

campos principais

múltiplos pontos

múltiplos versículos

salvamento local

Módulo 4 — Histórico de mensagens



Responsável por:



listagem

ordenação

filtros

pesquisa

Módulo 5 — Detalhes e edição



Responsável por:



abrir anotação

editar

excluir

duplicar

favoritar

exportar PDF

Módulo 6 — Resumo automático



Responsável por:



ler os campos da anotação

montar resumo estruturado

salvar resumo final

Módulo 7 — Exportação PDF



Responsável por:



gerar PDF local

formatar capa e conteúdo

compartilhar arquivo

Módulo 8 — Dashboard local



Responsável por:



estatísticas simples

contagem de mensagens

pregadores e igrejas mais frequentes

Módulo Extra — Guia de uso

Responsável por:

instruções por tela dentro do app

destaques de pontos importantes

