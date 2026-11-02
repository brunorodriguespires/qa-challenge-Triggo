# Front Web QA Challenge

Case técnico de Engenharia de Qualidade Front Web, com Playwright e TypeScript.
Aplicação-alvo: [PlayLab — Playwright Practice Arena](https://playwrightlab.github.io/)

**Documentação:** [estratégia de testes](docs/estrategia-de-testes.md) · [matriz de riscos](docs/matriz-de-riscos.md) · [matriz de cenários](docs/matriz-de-cenarios.md)

## Como executar

Requer Node.js 18 ou superior.

```bash
npm ci
npx playwright install chromium firefox
cp .env.example .env   # opcional: sem ele, a URL pública é usada

npm test               # suíte completa
npm run test:smoke     # apenas @smoke
npm run test:mobile    # projeto mobile
npm run typecheck
npm run report         # abre o último relatório HTML
```

Para reproduzir os dados de uma execução: `FAKER_SEED=123 npm test`.

## O que é testado

| Teste | Cobertura | Projetos |
|---|---|---|
| T01 | Tabela carrega com cabeçalhos, dados e perfis válidos | chromium, firefox |
| T02 | Busca com usuário existente e inexistente | chromium, firefox |
| T03 | Ordenação e paginação | chromium |
| T04 | Registro válido e reset | chromium, firefox |
| T05 | Validações e limites do formulário | chromium, firefox |
| T06 | Dropdown assíncrono | chromium, firefox |
| T07 | axe, labels e armadilha de foco | chromium |
| T08 | Adicionar usuário, sem scroll horizontal | chromium, mobile (Pixel 7) |

## Estrutura

```text
src/pages/      Page Objects: locators e ações, sem asserções
src/fixtures/   Abre a página, bloqueia terceiros, dispensa o banner de cookies e registra erros de JS
src/data/       Dados fictícios gerados com faker
tests/          Testes, por jornada
docs/           Estratégia e matrizes
```

## Pipeline

O [workflow](.github/workflows/playwright.yml) publica o relatório HTML e as evidências de falha como artefato.

| Gatilho | Escopo |
|---|---|
| Pull request | `@smoke` em Chromium |
| Push na `main` e execução diária | Suíte completa |
| Manual | Projeto e tag à escolha |

## Defeitos encontrados no site

| Defeito | Como a suíte trata |
|---|---|
| A bio aceita mais de 200 caracteres: o contador chega a `201/200` e não há erro (RF-10) | T05 registra o comportamento atual e anota `defeito-conhecido` |
| A busca sem resultado mostra `Showing 1-0 of 0 entries`, um intervalo incoerente | T02 valida apenas o total |
| Botões de página anterior e próxima sem nome acessível (`button-name`) | T07, lista de conhecidas |
| Checkboxes de seleção da tabela sem label (`label`) | T07, lista de conhecidas |
| Seletores de filtro e de linhas por página sem nome acessível (`select-name`) | T07, lista de conhecidas |
| Contraste insuficiente em badges de status e perfil, contador da bio, texto de paginação e botões primários, com razão de até 2,07:1 (`color-contrast`) | T07, lista de conhecidas |

Os detalhes do axe ficam anexados ao T07 no relatório (`axe-violacoes.json`).

## Decisões e limitações

- **Firefox tem timeouts maiores.** Nesta página, o Firefox tem travamentos intermitentes de vários segundos em ações comuns (clique, teclado, navegação), sem falha funcional. Por isso o projeto usa timeouts maiores, e a navegação espera `domcontentloaded`. A causa raiz não foi determinada e o problema foi reduzido, não eliminado: localmente, 1 de 3 execuções da suíte ainda falhou por timeout no Firefox. O CI faz 1 retry e ainda não confirmou se o problema se repete em Linux.
- **Lista de violações do axe por regra.** Uma regra nova falha o T07, mas um novo elemento em regra já conhecida não falha. O total por regra aparece nas anotações do relatório.
- **Limites do axe.** Ferramentas automáticas cobrem só parte da WCAG. Exigem validação manual: qualidade dos nomes acessíveis, ordem de leitura, uso com leitor de tela (NVDA, VoiceOver), navegação por teclado de ponta a ponta, informação transmitida só por cor e texto alternativo.
- **Site de terceiros.** O conteúdo pode mudar sem aviso, e os dados só existem em memória; cada carregamento reinicia o estado.
- **Fora do escopo:** WebKit, teste visual, faixa tablet e upload. Ver os [próximos passos](docs/estrategia-de-testes.md#12-próximos-passos).
