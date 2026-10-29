# Matriz de Riscos

**Aplicação:** [PlayLab — Playwright Practice Arena](https://playwrightlab.github.io/)
**Escopo da análise:** seções Data Tables (User Management), Form Elements, Dynamic Content, Accessibility e Responsive.

## Como ler esta matriz

- **Probabilidade (P):** chance de o problema ocorrer ou de o teste ficar instável. Alta, Média ou Baixa.
- **Impacto (I):** consequência para o usuário ou para a confiança na suíte. Alto, Médio ou Baixo.
- **Severidade:** combinação qualitativa de P e I, sem fórmula numérica:
  - **Crítica:** Alta + Alto
  - **Alta:** Alta + Médio, ou Média + Alto
  - **Média:** Média + Médio, ou Baixa + Alto
  - **Baixa:** demais combinações
- **Mitigação:** o que a automação (ou a decisão de não automatizar) faz a respeito.

> Premissa: a análise foi feita a partir da estrutura pública da página. Os itens marcados com ⚠️ dependem de confirmação na exploração manual (Etapa 1), pois o conteúdo é renderizado por JavaScript.

---

## 1. Riscos funcionais

| ID | Risco | P | I | Severidade | Cenários | Mitigação |
|---|---|---|---|---|---|---|
| RF-01 | Tabela de usuários não carrega ou carrega vazia ("Showing 0 entries") | Média | Alto | **Alta** | USR-01, USR-02 | Teste smoke valida linhas e contador de registros |
| RF-02 | Filtro por Role ou busca retorna registros incorretos | Média | Alto | **Alta** | USR-03 | Assertar que todas as linhas visíveis satisfazem o filtro |
| RF-03 | Busca sem resultado não mostra estado vazio (tabela quebrada ou sem feedback) | Média | Médio | **Média** | USR-04 | Cenário negativo com termo inexistente |
| RF-04 | Ordenação incorreta (colunas ID, Name, Email, Status) ou sem alternância asc/desc | Média | Alto | **Alta** | USR-05 | Comparar a ordem da coluna com a ordenação esperada, calculada no teste |
| RF-05 | Paginação inconsistente com "5/10/15/All per page" ou com o contador "Showing X entries" | Média | Alto | **Alta** | USR-06 | Assertar nº de linhas e texto do contador após mudar o tamanho da página |
| RF-06 | Combinação de filtro, ordenação e paginação perde estado | Média | Médio | **Média** | USR-03/05/06 | Cenário combinado como P1, se houver tempo |
| RF-07 | Formulário aceita dados inválidos (e-mail mal formado, campos obrigatórios vazios) | Média | Alto | **Alta** | FRM-02, FRM-03 | Teste negativo com asserção das mensagens de erro |
| RF-08 | Formulário válido não confirma o envio ("Registration successful!") | Baixa | Alto | **Média** | FRM-01 | Teste do caminho feliz |
| RF-09 | Reset não limpa todos os campos ou o contador de bio (0/200) | Média | Médio | **Média** | FRM-05 | Assertar valores vazios e contador zerado |
| RF-10 | Limite de 200 caracteres da bio não é respeitado | Média | Médio | **Média** | FRM-04 | Preencher 201 caracteres e validar truncamento ou erro ⚠️ |
| RF-11 | Ação "Add User" não adiciona o registro ou não atualiza o contador ⚠️ | Média | Alto | **Alta** | USR-08 | Avaliar na exploração; candidato a P1 |
| RF-12 | Dropdown em cascata (Continent → Country → City) mantém opções antigas | Média | Médio | **Média** | — | Fora do escopo obrigatório; backlog |

## 2. Riscos técnicos (da automação)

| ID | Risco | P | I | Severidade | Cenários | Mitigação |
|---|---|---|---|---|---|---|
| RT-01 | **Delayed Dropdown** carrega após ~2 s; clicar antes causa falha intermitente | Alta | Alto | **Crítica** | DYN-01, DYN-02 | Aguardar a condição observável (opções habilitadas/visíveis) em vez de espera fixa |
| RT-02 | **Dynamic Table** troca colunas e linhas de posição a cada reload; seletores por índice quebram | Alta | Alto | **Crítica** | DYN-03, DYN-05 | Localizar por cabeçalho (`columnheader`) e mapear o índice em tempo de execução |
| RT-03 | Seção "Flaky Elements" tem elementos que aparecem e somem a cada 2 s | Alta | Médio | **Alta** | — | Fora do escopo; se usado, `expect.poll`/auto-wait. Não entra nos testes estáveis |
| RT-04 | **Banner de cookies** (Cookie Consent) pode sobrepor elementos e interceptar cliques | Média | Alto | **Alta** | Todos | Tratar como pré-condição do teste (aceitar/rejeitar via helper ou `storageState`) ⚠️ |
| RT-05 | Página única extensa (20 seções): seletores genéricos colidem entre seções | Alta | Médio | **Alta** | Todos | Escopo por seção (ex.: `#tables`, `getByRole('region')`) e `getByRole` com nome |
| RT-06 | Ausência de `data-testid` ou testids duplicados em algumas áreas ⚠️ | Média | Médio | **Média** | Todos | Prioridade: role → label → testid. Validar na Etapa 1 |
| RT-07 | Dependências externas (imagens Unsplash, jsonplaceholder, iframe externo) lentas ou fora do ar | Média | Médio | **Média** | — | Não usar seções dependentes de rede externa; usar `route` para bloquear imagens se atrapalharem |
| RT-08 | Site hospedado em GitHub Pages: sem controle de dados, sem ambiente isolado; execução paralela excessiva é proibida pelo enunciado | Média | Médio | **Média** | Todos | `workers` limitados (2 no CI), sem loops, sem testes de carga |
| RT-09 | Contadores animados e transições (0 Sections, barras de progresso) geram leituras prematuras | Média | Baixo | **Baixa** | — | Não assertar nesses elementos |
| RT-10 | Diferenças entre navegadores em `<select>`, foco e scroll | Média | Médio | **Média** | Todos | Rodar smoke em Chromium e Firefox |
| RT-11 | Estado compartilhado: dados da tabela ou do formulário persistem entre testes | Baixa | Alto | **Média** | Todos | Cada teste abre a página limpa (contexto novo); sem dependência de ordem |
| RT-12 | Conteúdo "aleatório" da tabela dinâmica impede valores fixos | Alta | Médio | **Alta** | DYN-05 | Validar propriedades (formato, consistência), não valores literais |

## 3. Riscos de experiência do usuário

| ID | Risco | P | I | Severidade | Cenários | Mitigação |
|---|---|---|---|---|---|---|
| RU-01 | Tabela com 7 colunas transborda em telas pequenas, causando scroll horizontal indevido | Alta | Alto | **Crítica** | RSP-02, RSP-04 | Teste mobile: `scrollWidth <= clientWidth` no documento e na área da tabela |
| RU-02 | Ações (Add User, filtros, paginação) inacessíveis ou cortadas em mobile | Média | Alto | **Alta** | RSP-05 | Jornada da tabela em viewport mobile, com cliques reais |
| RU-03 | Breakpoints (≤480, 481–768, >768) mostram o elemento errado | Média | Médio | **Média** | RSP-01/02 | Validar elementos "Mobile Only"/"Desktop Only" no viewport escolhido |
| RU-04 | Sem feedback de carregamento (dropdown de 2 s) | Média | Médio | **Média** | DYN-07 | Validar o texto "Loading options..." antes de habilitar |
| RU-05 | Mensagens de erro de validação ausentes, vagas ou não visíveis | Média | Alto | **Alta** | FRM-06 | Assertar texto e visibilidade da mensagem |
| RU-06 | Múltiplos cliques em botões (Load Options, Register) duplicam ações | Baixa | Médio | **Baixa** | DYN-06 | Backlog |
| RU-07 | Status do usuário sem distinção visual clara | Baixa | Médio | **Baixa** | USR-07 | Validar o texto do status; avaliação visual fica como exploratória |

## 4. Riscos de acessibilidade

| ID | Risco | P | I | Severidade | Cenários | Mitigação |
|---|---|---|---|---|---|---|
| RA-01 | Violações detectáveis por máquina (contraste, nomes ausentes, ARIA inválido) | Alta | Alto | **Crítica** | A11Y-06 | Análise com axe-core, escopada à seção; violações conhecidas documentadas |
| RA-02 | Campos do formulário sem label associada | Média | Alto | **Alta** | A11Y-02, FRM-07 | `getByLabel` como seletor primário já valida a associação |
| RA-03 | Ordem de foco ilógica na seção de teclado (Button 1/2/3) | Baixa | Alto | **Média** | A11Y-03, A11Y-04 | Tab sequencial com asserção de foco |
| RA-04 | **Focus Trap** não prende o foco ou não libera ao fechar (armadilha de teclado) | Média | Alto | **Alta** | A11Y-07 | Tab cíclico dentro do trap; Esc/Close devolve o foco ao acionador |
| RA-05 | Botões de ordenação (ID ↕, Name ↕) sem estado `aria-sort` ou sem nome acessível | Média | Médio | **Média** | A11Y-01 | Verificar `aria-sort` e nomes; registrar como achado |
| RA-06 | Hierarquia de títulos incoerente (h1 → h2 → h3) | Média | Médio | **Média** | A11Y-05 | Validação simples de níveis; P2 |
| RA-07 | Status de usuário comunicado apenas por cor | Média | Médio | **Média** | USR-07 | Exploratório manual; axe não cobre bem |
| RA-08 | Skip link não leva ao conteúdo | Baixa | Médio | **Baixa** | — | Backlog |

## 5. Riscos identificados além do enunciado

Estes pontos não foram citados no desafio e são tratados como diferencial.

| ID | Risco | Observação |
|---|---|---|
| RX-01 | **Cookie banner** pode mascarar falhas ou causar flakiness em CI | Ver RT-04. Tratar de forma centralizada na fixture |
| RX-02 | **Página monolítica**: um erro de JS em uma seção pode afetar as demais | Capturar `pageerror` e `console.error` durante os testes e falhar se houver erro inesperado |
| RX-03 | **Dependência de terceiros** (Unsplash, jsonplaceholder) | Bloquear recursos externos não essenciais com `page.route` para reduzir ruído |
| RX-04 | **Site de terceiros pode mudar sem aviso** (é um playground mantido por outra pessoa) | Seletores baseados em role/label; documentar a data da análise; revalidar antes da entrega |
| RX-05 | **Dados da tabela provavelmente fixos e em memória** ⚠️ | Ações como "Add User" não persistem; cada reload reinicia. Favorece isolamento, mas limita testes de persistência |
| RX-06 | **Compatibilidade WebKit no Linux (CI)** costuma divergir do Safari real | Adotar Firefox como segundo navegador; WebKit fica como próximo passo |

## 6. Resumo por severidade

| Severidade | Quantidade | IDs |
|---|---:|---|
| Crítica | 4 | RT-01, RT-02, RU-01, RA-01 |
| Alta | 14 | RF-01, RF-02, RF-04, RF-05, RF-07, RF-11, RT-03, RT-04, RT-05, RT-12, RU-02, RU-05, RA-02, RA-04 |
| Média | 17 | RF-03, RF-06, RF-08, RF-09, RF-10, RF-12, RT-06, RT-07, RT-08, RT-10, RT-11, RU-03, RU-04, RA-03, RA-05, RA-06, RA-07 |
| Baixa | 4 | RT-09, RU-06, RU-07, RA-08 |
| **Total** | **39** | |

> A contagem será atualizada após a exploração manual da Etapa 1, quando os itens marcados com ⚠️ forem confirmados ou descartados.
