1. PRD — Product Requirements Document
1.1 Nome do produto

Mensagem Transformadora

1.2 Objetivo do produto

Permitir que o usuário registre, organize, revise e exporte anotações de pregações e mensagens cristãs de forma estruturada, local e offline.

1.3 Problema que o app resolve

Hoje, muitas anotações de pregação ficam:

espalhadas em cadernos
perdidas em notas soltas do celular
sem padrão
difíceis de revisar depois
sem possibilidade simples de gerar material organizado

O app resolve isso centralizando tudo em um formato padronizado.

1.4 Público-alvo
membros de igreja
líderes de célula
obreiros
pastores
estudantes da Bíblia
pessoas que gostam de registrar aprendizados espirituais
1.5 Proposta de valor

O app permitirá:

registrar mensagens com organização
salvar tudo localmente
consultar mensagens antigas com rapidez
gerar resumos automáticos
exportar PDF de forma simples
manter um histórico devocional estruturado
1.6 Requisitos de negócio
Requisito principal

O usuário deve conseguir registrar uma pregação completa sem depender de internet.

Requisitos complementares
todos os dados devem ficar gravados localmente
a data do registro deve ser automática
o usuário deve poder editar anotações depois
o usuário deve poder pesquisar mensagens anteriores
o usuário deve poder gerar um resumo final
o usuário deve poder exportar a anotação em PDF
o usuário deve poder favoritar e duplicar anotações
o usuário deve ter métricas locais (dashboard) sem internet
o usuário deve poder iniciar uma anotação a partir de um código de pré-sermão fornecido pelo pregador, sem exigir login
1.7 Funcionalidades principais
F1. Início (porta de entrada)

- Hero com CTA claro para criar uma nova mensagem.
- Exibição das 3 últimas mensagens gravadas.
- Acesso rápido ao histórico completo e à tela “Sobre”.

F2. Criar nova anotação de pregação

- Ao tocar em “Anotar Pregação”, o usuário deve escolher entre:
  - Criar do zero
  - Carregar do código fornecido (MT-XXXXX)
- Se escolher criar do zero, o fluxo atual deve ser mantido com todos os campos em branco.
- Se escolher carregar do código, o app deve abrir uma tela para digitar o código, chamar a API pública e preencher os campos iniciais.
- O usuário deve poder editar qualquer campo antes de salvar.

Campos base:

nome do usuário
nome do pregador
igreja
data automática
título da pregação
versículo base
pontos principais
versículos secundários
observações
conclusão
resumo final
exportação PDF

F3. Listar histórico de pregações
listar todas as mensagens
ordenação por data
busca por título
busca por pregador
busca por igreja
filtro por versículo

F4. Editar anotação
alterar qualquer campo salvo
adicionar novos pontos depois
atualizar resumo

F5. Excluir anotação
remoção com confirmação

F6. Favoritar e duplicar anotação

- Favoritar/desfavoritar com indicador visual (estrela).
- Duplicar anotação para reutilizar como modelo (“(Cópia)” no título).

F7. Gerar resumo da mensagem

Com base no conteúdo anotado, o sistema deve montar um resumo estruturado.

F8. Exportar PDF

Gerar um PDF contendo os dados da pregação formatados para leitura e compartilhamento.

F9. Dashboard local

- Total de mensagens.
- Total e proporção de favoritos.
- Volume por dia (últimos 7 dias).
- Ranking de pregadores e igrejas mais frequentes.

F10. Guia de uso (Instruções)

- Instruções por tela dentro do app, com destaques de pontos importantes.

F11. Splash Screen

- Tela inicial com logo centralizado e transição suave para a tela inicial.

F12. Backup e restauração (Android)

- O usuário deve conseguir **exportar** seus dados locais para um arquivo de backup (extensão `.mtbackup`) em uma pasta escolhida.
- O usuário deve conseguir **importar/restaurar** um backup selecionando um arquivo, substituindo os dados atuais do app.
- A restauração deve exigir confirmação explícita (ação destrutiva).
- O app deve manter um **histórico local** de exportações/importações para referência do usuário.

F13. Avaliação na Play Store (Android)

- O app deve exibir um **modal próprio** perguntando se o usuário está gostando do app antes de tentar solicitar avaliação.
- A solicitação **não pode** acontecer antes de completar **3 dias** após o primeiro acesso do usuário ao app.
- Após uma tentativa (ou adiamento), o app só pode tentar novamente **após mais 3 dias**.
- Se o usuário marcar **“Já avaliei”**, o app deve considerar como confirmação rastreável e nunca mais solicitar.
