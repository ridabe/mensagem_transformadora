# Mensagem Transformadora

O **Mensagem Transformadora** é um aplicativo móvel (Android) desenvolvido para ajudar você a registrar, organizar e revisitar anotações de pregações e sermões de forma estruturada.

Ele foi construído sob uma arquitetura 100% **offline-first**, garantindo total privacidade dos seus dados e rapidez no uso, sem necessidade de internet, login ou backend.

## 🚀 Funcionalidades

- **Registro completo de pregações**: Nome do pregador, igreja, data, título e versículo base.
- **Estruturação profunda**: Suporte a versículos secundários dinâmicos e múltiplos pontos principais da mensagem.
- **Seções reflexivas**: Espaço para frases marcantes, observações pessoais, aplicações práticas e conclusão.
- **Dashboard analítico**: Acompanhe o total de mensagens, proporção de favoritos e gráficos interativos (Top Pregadores, Igrejas e volume semanal).
- **Ações rápidas**: Favoritar, duplicar (para criar templates base) e excluir com segurança.
- **Busca eficiente**: Encontre anotações pelo título, pregador, igreja ou trechos de versículos.

## 🛠️ Tecnologias e Arquitetura

O aplicativo foi desenvolvido utilizando as melhores práticas e padrões de mercado:
- **React Native** + **Expo (SDK 54)**
- **TypeScript** para tipagem forte e segurança.
- **SQLite** (`expo-sqlite`) para persistência de dados local rápida e estruturada.
- **Arquitetura Modular**: Repositórios (CRUD isolado), UI components reutilizáveis e navegação limpa (Tabs + Stack).

## ⚙️ Como executar o projeto localmente

### Pré-requisitos
- Node.js LTS instalado (v20+ recomendado)
- App **Expo Go** instalado no seu smartphone Android.

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/ridabe/mensagem_transformadora.git
   cd mensagem_transformadora
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start --tunnel
   ```

4. Escaneie o QR Code no terminal usando o aplicativo **Expo Go** no seu celular.

## 📄 Licença

Software Gratuito
Desenvolvido por **Ricardo Bene** (Algoritmum Desenvolvimento).
