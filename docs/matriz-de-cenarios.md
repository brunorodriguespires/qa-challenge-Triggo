# Matriz de Cenários

**Aplicação:** [PlayLab — Playwright Practice Arena](https://playwrightlab.github.io/)

## Legenda

- **Prioridade:** P0 = protege a jornada principal e bloqueia a entrega; P1 = relevante, automatizar se houver capacidade; P2 = baixo valor ou alto custo de manutenção.
- **Tipo:** Funcional, Negativo, Dinâmico/Assíncrono, Acessibilidade, Responsivo, Exploratório.
- **Status:** `Planejado` (será automatizado), `Backlog` (candidato futuro), `Manual` (cobertura exploratória), `Descartado` (não compensa).
- **Teste:** identificador do teste automatizado que cobre o cenário (ver seção 1).
- **Riscos:** IDs da [matriz de riscos](./matriz-de-riscos.md).

---

## 1. Testes automatizados selecionados (8)

Cada teste agrupa cenários de referência afins, para manter a suíte enxuta e com baixo custo de manutenção.

| Teste | Título | Cenários cobertos | Tags | Navegadores |
|---|---|---|---|---|
| T01 | Tabela de usuários carrega com estrutura, dados e status válidos | USR-01, USR-02, USR-07 | `@smoke` `@users` | Chromium, Firefox |
| T02 | Busca/filtro localiza usuário existente e trata usuário inexistente | USR-03, USR-04 | `@users` `@negative` | Chromium, Firefox |
| T03 | Ordenação e paginação mantêm consistência dos registros | USR-05, USR-06 | `@users` | Chromium |
| T04 | Registro com dados válidos exibe confirmação e o reset limpa o formulário | FRM-01, FRM-05 | `@smoke` `@forms` | Chromium, Firefox |
| T05 | Formulário rejeita campos obrigatórios vazios, e-mail inválido e excesso de caracteres | FRM-02, FRM-03, FRM-04, FRM-06 | `@forms` `@negative` | Chromium, Firefox |
| T06 | Dropdown assíncrono carrega opções e permite seleção | DYN-01, DYN-02, DYN-07 | `@dynamic` | Chromium, Firefox |
| T07 | Acessibilidade: análise automatizada (axe), labels e armadilha de foco | A11Y-06, A11Y-02, A11Y-07 | `@a11y` | Chromium |
| T08 | Adicionar usuário pelo modal e localizá-lo na tabela, sem overflow horizontal | USR-08, RSP-01, RSP-02, RSP-04, RSP-05 | `@users` `@mobile` | Chromium e Mobile (Pixel 7) |

**Cobertura dos requisitos obrigatórios do desafio**

| Requisito | Teste |
|---|---|
| Jornada principal (tabela de usuários) | T01, T02, T03 |
| Cenários de formulário | T04, T05 |
| Componente dinâmico ou assíncrono | T06 |
| Cenário negativo | T02, T05 |
| Validação de acessibilidade | T07 |
| Execução em resolução mobile | T08 |
| Pipeline e relatório | Workflow do GitHub Actions |

---

## 2. Jornada de gerenciamento de usuários (USR)

| ID | Jornada | Descrição | Tipo | Risco protegido | Prioridade | Automatizar? | Justificativa | Status | Teste |
|---|---|---|---|---|---|---|---|---|---|
| USR-01 | Usuários | Validar o carregamento da tabela de usuários | Funcional | RF-01 | P0 | Sim | Porta de entrada da jornada; se falhar, os demais cenários perdem sentido. Barato e estável | Planejado | T01 |
| USR-02 | Usuários | Validar a estrutura e os cabeçalhos (ID, Name, Email, Role, Status, Actions) | Funcional | RF-01, RT-05 | P0 | Sim | Detecta regressão de contrato da tabela. Combinado com USR-01 no mesmo teste | Planejado | T01 |
| USR-03 | Usuários | Localizar um usuário existente (busca por texto, confirmada; filtro por Role como complemento) | Funcional | RF-02 | P0 | Sim | Principal operação de consulta. Assertar que todas as linhas visíveis atendem ao critério | Planejado | T02 |
| USR-04 | Usuários | Comportamento para usuário inexistente | Negativo | RF-03 | P0 | Sim | Cenário negativo obrigatório; valida o estado vazio e o contador "0 entries" | Planejado | T02 |
| USR-05 | Usuários | Ordenar por uma coluna (asc/desc) | Funcional | RF-04 | P1 | Sim | Lógica de ordenação costuma regredir. Ordem esperada calculada no teste, sem valores fixos | Planejado | T03 |
| USR-06 | Usuários | Navegar entre páginas e alterar o tamanho da página (5/10/15/All) | Funcional | RF-05 | P1 | Sim | Valida o nº de linhas e o texto "Showing X entries" | Planejado | T03 |
| USR-07 | Usuários | Validar o status apresentado (Status) | Funcional | RF-01, RA-07 | P1 | Sim | Garante que a coluna contém apenas valores do domínio esperado. Embutido em T01 | Planejado | T01 |
| USR-08 | Usuários | Add User: abrir o modal "Add New User" (Name, Email, Role), confirmar e validar o novo registro na tabela | Funcional | RF-11, RF-13 | P1 | Sim | Ação confirmada na exploração; fecha a jornada. O mesmo teste roda em desktop e mobile, sem ultrapassar 8 testes | Planejado | T08 |

## 3. Formulário (FRM)

| ID | Jornada | Descrição | Tipo | Risco protegido | Prioridade | Automatizar? | Justificativa | Status | Teste |
|---|---|---|---|---|---|---|---|---|---|
| FRM-01 | Registro | Submeter com dados válidos | Funcional | RF-08 | P0 | Sim | Caminho feliz do formulário. Dados fictícios gerados em `src/data` | Planejado | T04 |
| FRM-02 | Registro | Submeter sem campos obrigatórios. Mensagens confirmadas: "Name is required", "Valid email is required", "Password must be at least 8 characters", "You must accept the terms" | Negativo | RF-07, RU-05 | P0 | Sim | Impede envio inválido; valida mensagens | Planejado | T05 |
| FRM-03 | Registro | E-mail inválido | Negativo | RF-07 | P0 | Sim | Regra de negócio clássica de validação | Planejado | T05 |
| FRM-04 | Registro | Limite de caracteres (Bio 0/200) | Negativo | RF-10 | P1 | Sim | Fronteira de 200 caracteres e contador. Confirmar comportamento (truncar vs. erro) | Planejado | T05 |
| FRM-05 | Registro | Reset do formulário | Funcional | RF-09 | P1 | Sim | Valida que campos e contador voltam ao estado inicial. Combinado com T04 | Planejado | T04 |
| FRM-06 | Registro | Mensagens de erro e validação | Negativo | RU-05 | P0 | Sim | Asserção do texto e visibilidade das mensagens em T05 | Planejado | T05 |
| FRM-07 | Registro | Associação campo ↔ label | Acessibilidade | RA-02 | P1 | Sim (implícito) | Uso de `getByLabel` nos testes já falha se a associação quebrar; verificação explícita em T07 | Planejado | T04, T07 |
| FRM-08 | Registro | Operação do formulário por teclado | Acessibilidade | RA-03 | P2 | Não | Cobertura parcial em T07 (foco). Fluxo completo fica para exploratório manual | Manual | — |

## 4. Componentes dinâmicos e assíncronos (DYN)

| ID | Jornada | Descrição | Tipo | Risco protegido | Prioridade | Automatizar? | Justificativa | Status | Teste |
|---|---|---|---|---|---|---|---|---|---|
| DYN-01 | Delayed Dropdown | Aguardar o carregamento do dropdown assíncrono (~2 s) | Dinâmico | RT-01 | P0 | Sim | Principal risco de flakiness da suíte. Espera por condição, nunca `waitForTimeout` | Planejado | T06 |
| DYN-02 | Delayed Dropdown | Selecionar opção carregada dinamicamente | Dinâmico | RT-01 | P0 | Sim | Comprova o estado final (valor selecionado) | Planejado | T06 |
| DYN-03 | Dynamic Table | Tabela com colunas que mudam de posição | Dinâmico | RT-02 | P1 | Não (por ora) | Alto valor didático, mas fora dos 8 testes. Primeiro candidato a T09 por demonstrar seletores robustos | Backlog | — |
| DYN-04 | Dynamic Table | Comportamento após recarregar a página | Dinâmico | RT-02 | P2 | Não | Faz parte de DYN-03 | Backlog | — |
| DYN-05 | Dynamic Table | Validar dados dinâmicos sem valores fixos | Dinâmico | RT-12 | P1 | Não (por ora) | Idem DYN-03 | Backlog | — |
| DYN-06 | Delayed Dropdown | Múltiplos cliques em "Load Options" | Dinâmico | RU-06 | P2 | Não | Baixo risco; pode ser uma variação rápida de T06 | Backlog | — |
| DYN-07 | Delayed Dropdown | Estado de carregamento ("Loading options...") | Dinâmico | RU-04 | P1 | Sim | Verificado dentro de T06, antes de a lista habilitar | Planejado | T06 |
| DYN-08 | Delayed Dropdown | Opção indisponível (itens desabilitados em "Disabled Options") | Negativo | RF-12 | P2 | Não | Seção diferente, baixo risco | Backlog | — |

## 5. Upload de arquivo (UPL) — opcional

| ID | Jornada | Descrição | Tipo | Risco protegido | Prioridade | Automatizar? | Justificativa | Status | Teste |
|---|---|---|---|---|---|---|---|---|---|
| UPL-01 | Upload | Upload de arquivo permitido | Funcional | — | P2 | Não | Opcional no desafio. Fora do foco da jornada principal | Backlog | — |
| UPL-02 | Upload | Extensão não permitida | Negativo | — | P2 | Não | Depende de a aplicação validar no cliente ⚠️ | Backlog | — |
| UPL-03 | Upload | Nome do arquivo selecionado | Funcional | — | P2 | Não | Baixo risco | Backlog | — |
| UPL-04 | Upload | Arquivo acima de 5 MB | Negativo | — | P2 | Não | Exigiria arquivo grande no repositório; contraria a orientação de arquivos pequenos. Poderia ser gerado em runtime | Descartado | — |
| UPL-05 | Upload | Remoção ou substituição do arquivo | Funcional | — | P2 | Não | Baixo risco | Backlog | — |

## 6. Acessibilidade (A11Y)

| ID | Jornada | Descrição | Tipo | Risco protegido | Prioridade | Automatizar? | Justificativa | Status | Teste |
|---|---|---|---|---|---|---|---|---|---|
| A11Y-01 | Tabela / controles | Nomes acessíveis dos principais controles (ordenação, paginação, Add User) | Acessibilidade | RA-05 | P1 | Parcial | axe cobre nome ausente; qualidade do nome é manual | Planejado | T07 |
| A11Y-02 | Formulário | Labels dos campos | Acessibilidade | RA-02 | P0 | Sim | Verificado por `getByLabel` + axe (`label`) | Planejado | T07 |
| A11Y-03 | Seção Accessibility | Navegação por teclado (Button 1/2/3) | Acessibilidade | RA-03 | P2 | Não | Backlog; baixo custo, mas redundante com A11Y-07 | Backlog | — |
| A11Y-04 | Seção Accessibility | Ordem de foco | Acessibilidade | RA-03 | P2 | Não | Idem | Backlog | — |
| A11Y-05 | Página | Hierarquia de títulos | Acessibilidade | RA-06 | P2 | Não | Regra `heading-order` do axe já sinaliza | Manual | — |
| A11Y-06 | Seções-alvo | Análise automatizada com axe-core | Acessibilidade | RA-01 | P0 | Sim | Cobre grande superfície a baixo custo. Escopo por seção (Form, Tables) para reduzir ruído | Planejado | T07 |
| A11Y-07 | Focus Trap | Modal/trap sem armadilha de teclado: Tab cíclico e foco devolvido ao fechar | Acessibilidade | RA-04 | P1 | Sim | Comportamento que ferramentas automáticas não detectam | Planejado | T07 |

## 7. Responsividade (RSP)

| ID | Jornada | Descrição | Tipo | Risco protegido | Prioridade | Automatizar? | Justificativa | Status | Teste |
|---|---|---|---|---|---|---|---|---|---|
| RSP-01 | Usuários | Jornada crítica em desktop | Responsivo | RU-03 | P0 | Sim | Coberta por T01–T03 e T08 em Desktop Chrome (1280×720) | Planejado | T01–T03, T08 |
| RSP-02 | Usuários | Jornada crítica em mobile | Responsivo | RU-01, RU-02 | P0 | Sim | Requisito obrigatório. Projeto `mobile` com Pixel 7 (412×915, abaixo do breakpoint de 480 px) | Planejado | T08 |
| RSP-03 | Usuários | Ausência de sobreposição relevante | Responsivo | RU-02 | P2 | Não | Verificação de sobreposição é frágil por DOM; prefere-se teste visual seletivo (backlog) | Backlog | — |
| RSP-04 | Usuários | Ausência de scroll horizontal indevido | Responsivo | RU-01 | P0 | Sim | Medição objetiva: `documentElement.scrollWidth <= clientWidth` | Planejado | T08 |
| RSP-05 | Usuários | Acesso às principais ações em tela reduzida | Responsivo | RU-02 | P1 | Sim | Filtro, paginação e Add User visíveis e acionáveis | Planejado | T08 |

---

## 8. Cenários que não serão automatizados pela interface

| Cenário | Motivo | Alternativa |
|---|---|---|
| Aparência visual do status (cor, ícones) | Subjetivo e propenso a falso positivo | Teste visual seletivo no futuro; validação exploratória |
| Qualidade de leitura por leitor de tela | Ferramentas automáticas cobrem apenas parte dos critérios WCAG | Validação manual com NVDA/VoiceOver |
| Seção **Flaky Elements** | Instável por desenho; automatizá-la comprometeria a confiabilidade da suíte | Usar só como material de estudo |
| Seções com dependência externa (Network/jsonplaceholder, iframe externo, imagens Unsplash) | Fora do controle; gera falhas não relacionadas ao produto | Mock com `page.route` se vierem a ser necessárias |
| Carga, stress e segurança | Proibido pelo enunciado (item 15) | — |
| Login e área protegida | Fora do escopo do desafio; credencial pública de demonstração | Backlog |

## 9. Resumo

| Métrica | Valor |
|---|---:|
| Cenários de referência analisados | 41 |
| Cobertos por testes automatizados | 26 |
| Backlog | 12 |
| Manual / descartado | 3 |
| Testes automatizados implementados | 8 |
