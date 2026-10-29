# Estratégia de Testes — Front

**Aplicação-alvo:** [PlayLab — Playwright Practice Arena](https://playwrightlab.github.io/)
**Stack:** Playwright + TypeScript + Node.js
**Documentos relacionados:** [Matriz de riscos](./matriz-de-riscos.md) · [Matriz de cenários](./matriz-de-cenarios.md)

---

## 1. Objetivo

Iniciar a automação Front de uma plataforma administrativa com formulários, tabelas e componentes dinâmicos, de forma que a suíte seja:

- **confiável:** poucos testes, estáveis e com asserções que comprovam comportamento;
- **orientada a risco:** cada teste existe porque protege um risco identificado;
- **sustentável:** seletores resilientes, baixo acoplamento e dados controlados;
- **diagnosticável:** falhas acompanhadas de relatório, trace e screenshot;
- **executável em pipeline** (GitHub Actions) e localmente.

## 2. Entendimento da aplicação

O PlayLab é uma **página única com várias ações e funções** hospedada no GitHub Pages. Não há backend próprio; os dados vêm de JavaScript no cliente.

| Seção | O que contém | Relevância para o desafio |
|---|---|---|
| Forms | Formulário de registro (nome, e-mail, senha, telefone, data, país, gênero, skills, bio max. 200 caracteres, termos, Register/Reset), sliders, upload, auto-suggest, vários tipos de dropdown | **Alta** |
| Tables | *User Management* (colunas ID, Name, Email, Role, Status, Actions; ordenação, filtro por Role, 5/10/15/All por página, Add User), tabela editável, tabela dinâmica | **Alta** |
| Dynamic Content | Carregamento com atraso, visibilidade, contador, timer, progresso | Média |
| Accessibility | Navegação por teclado, skip link, ARIA, focus trap | **Alta** |
| Responsive | Elementos por breakpoint (>768, 481–768, ≤480) | **Alta** (mobile) |


### Jornadas identificadas

1. **Gerenciamento de usuários** (principal): carregar → validar → buscar/filtrar → ordenar → paginar → agir.
2. **Registro de usuário** (formulário): preencher → validar → enviar → confirmar ou corrigir → resetar.
3. **Carregamento assíncrono**: acionar → aguardar → selecionar.
4. **Uso em dispositivo móvel** da jornada 1 Gerenciamento de usuários.
5. **Navegação assistiva** (teclado e leitor de tela) em formulário e foco.

## 3. Escopo

### Dentro do escopo

- Tabela *User Management*: estrutura, dados, filtro/busca, ordenação, paginação.
- Formulário *Registration*: caminho feliz, validações, reset.
- *Delayed Dropdown*: carregamento assíncrono e seleção.
- Acessibilidade: axe-core, labels, armadilha de foco.
- Responsividade: jornada da tabela em viewport mobile.
- Execução em Chromium e Firefox; pipeline com relatório e evidências.

### Fora do escopo

- Carga, stress, negação de serviço e varredura de segurança (proibidos pelo documento do desafio).
- Autenticação (`login.html`) e conteúdo protegido.
- Upload/download (opcional no desafio).
- WebKit/Safari real e dispositivos físicos.


## 4. Riscos identificados

| Categoria | Risco-chave | Severidade |
|---|---|---|
| Técnico | Dropdown assíncrono (~2 s) causa falha intermitente | Crítica |
| Técnico | Tabela dinâmica troca colunas de posição; seletores por índice quebram | Crítica |
| Técnico | Banner de cookies pode interceptar cliques; página monolítica com colisão de seletores | Alta |
| UX | Tabela de 7 colunas gera scroll horizontal em mobile | Crítica |
| Acessibilidade | Violações detectáveis por máquina; armadilha de teclado | Crítica / Alta |
| Funcional | Ordenação, paginação e filtro incorretos | Alta |
| Funcional | Validação de formulário permissiva | Alta |


## 5. Critérios de priorização

1. **Impacto:** se quebrar, a jornada principal para ou o usuário é induzido a erro?
2. **Probabilidade:** a funcionalidade tem lógica própria (ordenação, validação, async) ou é só renderização?
3. **Valor da automação:** o teste é repetível, determinístico e rápido?
4. **Custo de manutenção:** depende de conteúdo aleatório, rede externa ou estrutura de DOM instável?

| Prioridade | Definição | Ação |
|---|---|---|
| **P0** | Protege a jornada principal ou risco crítico | Automatizar sempre |
| **P1** | Risco relevante e boa relação custo/benefício | Automatizar se couber no tempo disponível para desenvolvimento |
| **P2** | Baixo risco ou alto custo de manutenção | Backlog ou manual |

## 6. Estratégia de cobertura

A pirâmide é invertida de propósito: o desafio é de UI, então a prioridade é **poucos testes E2E, bem escolhidos**, cada um agrupando cenários afins para reduzir o tempo de execução e o custo de manutenção.

| Teste | Cenários | Justificativa resumida |
|---|---|---|
| T01 Tabela carrega e é válida | USR-01, 02, 07 | Porta de entrada da jornada|
| T02 Busca/filtro + inexistente | USR-03, 04 | Operação mais usada + cenário negativo |
| T03 Ordenação e paginação | USR-05, 06 | Lógica própria, propensa a regressão |
| T04 Registro válido + reset | FRM-01, 05 | Caminho feliz do formulário |
| T05 Validações do formulário | FRM-02, 03, 04, 06 | Cenário negativo de maior valor |
| T06 Dropdown assíncrono | DYN-01, 02, 07 | Principal risco de flakiness |
| T07 Acessibilidade | A11Y-02, 06, 07 | axe + comportamento de foco |
| T08 Mobile | RSP-02, 04, 05 | Requisito obrigatório |


## 7. Estratégia de automação

| Tema | Decisão |
|---|---|
| **Framework** | Playwright com TypeScript: auto-waiting, multi-browser, trace viewer e emulação mobile nativos |
| **Seletores** | Ordem de preferência: `getByRole` (com nome) → `getByLabel` → `getByTestId` → texto. Sem XPath absoluto nem índices posicionais. Escopo por seção (`#tables`, `#forms`) para evitar colisões |
| **Sincronização** | Auto-waiting e *web-first assertions* (`expect(...).toBeVisible()`, `toHaveCount`). Proibido `waitForTimeout` como estratégia. No dropdown assíncrono, aguardar a condição observável (opções habilitadas) |
| **Dados de teste** | Dados fictícios gerados por *factory* em `src/data` (ex.: com `@faker-js/faker`, seed fixa quando reprodutibilidade for necessária). Nenhum dado sensível ou persistente |
| **Isolamento** | Cada teste abre página nova (contexto próprio); sem dependência de ordem nem de estado compartilhado |
| **Page Objects** | Leves, expondo ações e locators; **asserções permanecem nos testes** para não esconder a intenção |
| **Fixtures** | Fixture para navegação, tratamento do banner de cookies e coleta de erros de JS (`pageerror`) |
| **Tags** | `@smoke`, `@users`, `@forms`, `@dynamic`, `@a11y`, `@mobile`, `@negative` para execução seletiva |
| **Falhas** | Screenshot em falha, vídeo retido em falha, trace no primeiro retry (CI) |
| **Rede externa** | Bloquear imagens e recursos de terceiros não essenciais para reduzir ruído |
| **Acessibilidade** | `@axe-core/playwright` com escopo por seção; violações preexistentes e fora do controle documentadas, sem mascarar o resultado |

### Limitações do axe-core (a documentar também no README)

Ferramentas automáticas detectam aproximadamente uma parcela dos problemas de acessibilidade. **Exigem validação manual:** qualidade e sentido dos nomes acessíveis, ordem de leitura lógica, uso real com leitor de tela (NVDA, VoiceOver), usabilidade por teclado de ponta a ponta, informação transmitida só por cor e adequação do texto alternativo.

## 8. Navegadores e resoluções

| Projeto | Navegador/Dispositivo | Viewport | Testes | Motivo |
|---|---|---|---|---|
| `chromium` | Desktop Chrome | 1280×720 | Todos exceto T08 | Navegador de maior uso; base da suíte |
| `firefox` | Desktop Firefox | 1280×720 | `@smoke` + T02, T05, T06 | Segundo motor de renderização; foco nos fluxos de maior risco (formulário, async) |
| `mobile` | Pixel 7 (Chromium) | 412×915 | `@mobile` (T08) | Abaixo do breakpoint de 480 px do site; ativa o layout "Mobile Only" |

**Por que não rodar tudo em todos:** o ganho de detecção de bugs específicos de navegador está concentrado em formulários, foco e `<select>`. Replicar ordenação/paginação (lógica JS pura) em todos os motores aumenta tempo e superfície de flakiness sem retorno proporcional.

**Resoluções:** 1280×720 (laptop padrão) e 412×915 (smartphone Android comum). A faixa tablet (481–768 px) fica como próximo passo.

**Pendente:** WebKit (Safari) fica como evolução; no Linux do CI ele não reproduz fielmente o Safari real.

## 9. Frequência de execução recomendada

| Gatilho | Escopo | Objetivo |
|---|---|---|
| Pull request / push | `@smoke` em Chromium | Feedback rápido (< 3 min) |
| Merge na `main` | Suíte completa em Chromium + Firefox + mobile | Regressão |
| Diária (agendada) | Suíte completa | Detectar mudança no site de terceiros |
| Manual (`workflow_dispatch`) | Navegador e tag escolhidos | Investigação sob demanda |

> Respeitando o item 15 do enunciado: sem loops contínuos e com paralelismo limitado (2 workers no CI).

## 10. Critérios de entrada e saída

### Entrada (para executar a suíte)

- Aplicação acessível (HTTP 200 em `https://playwrightlab.github.io/`).
- Dependências instaladas (`npm ci`) e navegadores baixados (`npx playwright install`).
- Variáveis em `.env` configuradas (baseURL).

### Saída (para considerar a execução aceitável)

- 100% dos testes P0 passando.
- Nenhum teste com `skip`/`fixme` sem justificativa registrada.
- Flakiness: nenhum teste exigindo retry em 3 execuções consecutivas locais.
- Relatório HTML e artefatos (traces/screenshots em falha) publicados.
- Nenhum `waitForTimeout` no código.

## 11. Limitações conhecidas

- **Aplicação de terceiros**, sem controle do código, dos dados nem de versionamento; o conteúdo pode mudar sem aviso.
- **Dados sem API**: não é possível criar/limpar dados via backend; o isolamento depende de a página reiniciar o estado a cada carregamento.
- **Análise inicial feita sem renderização de JavaScript**: linhas da tabela, `data-testid` e mensagens exatas de erro precisam ser confirmados na exploração manual (Etapa 1) e esta documentação será atualizada.
- Teste de acessibilidade automatizado é parcial.
- Sem teste visual e sem WebKit.
- Execução depende da disponibilidade do GitHub Pages.

