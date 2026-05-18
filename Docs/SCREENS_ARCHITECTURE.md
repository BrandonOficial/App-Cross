# Arquitetura de Telas e Integrações - Workout Tracker

## Tela 1: Dashboard (Centro de Comando)
**Objetivo:** Ponto de entrada do usuário, focado em iniciar o treino rapidamente e mostrar o resumo do progresso recente.

- **Componentes Necessários:**
  - **Métricas de Resumo:** Exibição de dados numéricos (ex: Ofensiva/Streak de dias treinados, Volume total da semana).
  - **Botão Principal (Call to Action):** Botão grande de "Iniciar Treino".
  - **Card de Último Treino:** Resumo rápido do último treino realizado (data e músculo alvo).
- **Integrações (API):**
  - `POST /api/workouts/sessions` -> Disparado ao clicar em "Iniciar Treino" (Cria o `sessionId`).
  - `GET /api/workouts/summary` -> Para preencher as métricas de resumo da semana.

---

## Tela 2: Sessão Ativa (O Campo de Batalha)
**Objetivo:** Interface principal de uso contínuo durante o treino. Focada em entrada rápida de dados.

- **Componentes Necessários:**
  - **Cabeçalho:** Tempo de treino rolando (cronômetro) e botão para "Finalizar Treino".
  - **Lista de Exercícios:** Blocos para cada exercício que está sendo executado.
  - **Controles de Entrada (Inputs):** Campos numéricos para `Carga` (peso) e `Repetições`.
  - **Seletor de Tipo de Série:** Escolha rápida entre `WARMUP`, `FEEDER`, `TOP_SET`, `BACK_OFF` e `STANDARD`.
  - **Ação de Registro:** Botão "Salvar Série" para cada linha preenchida.
- **Integrações (API):**
  - `POST /api/workouts/sessions/:sessionId/sets` -> Disparado a cada vez que o usuário salva uma série.
  - `PUT /api/workouts/sessions/:sessionId` -> Disparado ao clicar em "Finalizar Treino" (registra a hora de fim).
- **Estado Local (Zustand):**
  - Armazenar o `sessionId` atual, os exercícios selecionados e as séries digitadas temporariamente (para evitar perda de dados caso a internet oscile).

---

## Tela 3: Histórico (Diário de Evolução)
**Objetivo:** Consulta de treinos passados e análise de métricas de progressão.

- **Componentes Necessários:**
  - **Lista de Histórico:** Feed cronológico dos treinos anteriores.
  - **Card de Treino (Item da Lista):** Deve conter Data, Nome da Rotina (ex: Push Day), Duração e Tonelagem Total.
  - **Gráfico de Progressão:** Visualização em linha mostrando a evolução de carga ou volume ao longo das semanas.
- **Integrações (API):**
  - `GET /api/workouts/sessions` -> Traz a lista paginada dos treinos para preencher o feed.
  - `GET /api/workouts/sessions/:sessionId` -> Traz os detalhes (todas as séries e exercícios) ao clicar em um treino específico.

---

## Tela 4: Biblioteca de Exercícios (O Arsenal)
**Objetivo:** Catálogo de exercícios para adicionar ao treino atual ou consultar instruções.

- **Componentes Necessários:**
  - **Barra de Busca:** Input de texto para filtrar exercícios pelo nome.
  - **Filtros/Abas:** Seletores para filtrar por grupo muscular (Peito, Costas, Pernas) ou tipo (Máquina, Peso Livre).
  - **Lista de Resultados:** Nomes dos exercícios organizados alfabeticamente.
  - **Botão de Adição:** Opção para criar um exercício customizado que não existe na base padrão.
- **Integrações (API):**
  - `GET /api/exercises` -> Busca a lista completa de exercícios (suporta query params para busca e filtros).
  - `POST /api/exercises` -> Envia os dados de um novo exercício criado pelo usuário.

---

## Tela 5: Perfil & Configurações
**Objetivo:** Gerenciamento da conta do usuário e parâmetros do sistema.

- **Componentes Necessários:**
  - **Dados do Usuário:** Exibição de Nome, Email e Foto de Perfil.
  - **Métricas Biométricas:** Campos editáveis para Peso Corporal atual e Altura.
  - **Preferências:** Opções do sistema (ex: unidade de medida kg/lbs).
  - **Ações de Conta:** Botões de "Sair" (Logout) e "Salvar Alterações".
- **Integrações (API):**
  - `GET /api/users/me` -> Carrega as informações atuais do usuário.
  - `PUT /api/users/me` -> Atualiza dados como peso corporal.
  - `POST /api/auth/logout` -> Invalida o token JWT (Refresh Token) no banco de dados.