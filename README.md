# puzzle-game

**Jogar: https://bzomer.github.io/puzzle-game/**

Um puzzle de organização por cor com uma meta-camada por cima. Um arquivo
(`index.html`), sem dependência, sem build. Também dá pra baixar e abrir com
dois cliques.

## O núcleo

Recipientes com camadas de cor embaralhadas. Toque num, toque no outro: a
camada de cima se move se a cor bater. Acaba quando cada recipiente tem uma
cor só.

Nasceu como instrumento pra responder uma pergunta binária — *"o tabuleiro
prende por dez tabuleiros seguidos, sem meta nenhuma?"* — e a resposta foi
sim, validada por dez sessões de playtest com dois jogadores reais. A partir
daí virou protótipo de verdade: o resto deste documento é o que mudou desde
então, e por quê.

## O par é o mínimo de verdade

O número de movimentos ao lado do seu não é palpite. Vem de um **A\*** com
heurística admissível — para cada cor, o número de recipientes que a contêm
menos um; um movimento reduz essa soma em no máximo 1, então ela nunca
superestima. Recipientes são intercambiáveis, então o estado é canonizado por
ordenação antes de entrar na tabela de transposição, o que corta o espaço de
busca em várias ordens de grandeza. Mediana de geração: ~15 ms.

(Uma versão anterior usava IDA\* e não terminava nessa profundidade — sem
tabela global de estados, as transposições explodem a busca.)

## O diretor de dificuldade

Tabuleiros não são sorteados às cegas. Um **bot guloso** joga cada candidato
12 vezes e mede taxa de beco + excesso de movimentos; esse score decide a
faixa (leve / média / pesada) e nenhum tabuleiro acima do teto de parede é
servido — nunca. As duas primeiras rodadas de cada sessão são sempre leves
(aquecimento), depois o ciclo é leve → média → média → pesada.

Motivo: sessões antigas mostraram dificuldade plana matando o interesse (o
mesmo par servido 9 vezes em 17 tabuleiros) e uma parede isolada (4,4× a
mediana) encerrando outra sessão sem aviso. Depois do diretor, o pior
tabuleiro de uma sessão de 22 caiu pra 1,4× a mediana — e picos de dificuldade
deixaram de expulsar: viraram desafios vencíveis que a sessão atravessa.

## O teste que faltava: uma criança de 7 anos

Onze sessões, e até a décima todas de adulto. A décima primeira foi um
sobrinho de 7 anos: **21 tabuleiros em 22:43**, o dobro do alvo da sessão.
Ele joga com um perfil oposto ao dos adultos — 112% do par contra 108%, e
**30 desfazer contra 38 somados nas seis sessões adultas que registraram
despejo**. Três
coisas ficaram sabidas, e nenhuma delas dava pra saber com adultos:

- **A tolerância de ×1,3 é o que segura o gancho de quem ainda erra.** Com
  ela, 20 dos 21 tabuleiros entraram e a maior sequência foi 11. Com ×1,15
  seriam 16 e a sequência cairia pra 8. A folga não é generosidade com o
  placar: é a diferença entre uma criança manter a sequência viva ou perdê-la
  a cada três tabuleiros.
- **O desfazer grátis pagou a conta.** Os 2 grátis por tabuleiro absorveram
  inteiros 4 dos 7 tabuleiros em que ele desfez; os 30 usos custaram 34
  moedas, 9% do ganho, e a sessão fechou com 380 no banco. O ajuste que
  nasceu de uma sessão que quebrou com saldo 7 aguentou uma carga de desfazer
  muito maior que a que o motivou.
- **A dor mora fora das duas réguas que o jogo tem.** Os dois tabuleiros que
  mais doeram (114s com 8 desfazer; 100s com 11) tinham score 0,41 — meio da
  faixa média — e nós do A* abaixo da mediana da sessão; um deles com 223
  nós, o *menor* da sessão inteira. Nem o score do bot, nem o par, nem o
  tamanho da busca ordenam o tempo dele (|ρ|<0,3 em todos). O diretor filtra
  a cauda catastrófica, e isso ele fez: pior tabuleiro em 1,97× a mediana,
  nenhuma parede. Mas ele não mede o que confunde uma criança — para isso
  não existe régua no jogo hoje.

E o fim da sessão não foi expulsão: o 22º tabuleiro foi abandonado com **0
movimento, 0 despejo e 18 segundos**, num par 18 — a mediana da própria
sessão. Ninguém perdeu uma luta ali; a brincadeira acabou.

## A economia — o que sobreviveu e o que não

**A moeda não compra mais moeda.** A primeira versão tinha uma melhoria de
produção passiva (moeda rendendo moeda com o tempo); em três sessões de
playtest, zero compras — o ciclo era fechado em si mesmo e não tinha sentido
nenhum. Foi **aposentada**.

O que ficou, e por quê:

- **Prêmio proporcional ao par**, não a movimentos absolutos — solução exata
  paga igual em qualquer tabuleiro, seja ele fácil ou difícil.
- **Sequência**: tabuleiros seguidos dentro da tolerância multiplicam o
  próximo prêmio em +10%, teto ×2. Mostrada no HUD como a coisa que se está
  prestes a perder.
- **Desfazer é pago** (2 moedas, 2 grátis por tabuleiro) — sem isso dava pra
  caçar o ótimo por tentativa e erro e sempre maximizar o bônus.
- **Recipiente extra**: a única compra que muda o *jogo*, não só o placar. Um
  tubo vazio a mais, no meio do tabuleiro, na hora do aperto — 25 moedas ou
  de graça se vier do estoque do desafio do dia. É resgate, não rotina: o
  prêmio daquele tabuleiro cai pra base (senão comprar facilidade aumentaria
  o bônus de folga) e a sequência **congela** em vez de quebrar. Numa sessão
  de 16 tabuleiros, 3 foram comprados — todos em momentos de aperto real, com
  zero desfazer na sessão inteira. É a compra que provou ter sentido.

## Desafio do dia, dica, e anúncio simulado

**Desafio do dia**: um tabuleiro pesado, **determinístico pela data** — o
mesmo pro mundo inteiro, trocando à meia-noite. Prêmio: moedas + um
recipiente pro estoque. É o gancho de retorno, no padrão do gênero (Water
Sort, Ball Sort e afins premiam assim, não com produção passiva).

**Dica**: destaca o próximo movimento que reduz o par em 1 — a jogada ótima
de verdade, não um palpite. Verificado: seguir só dicas resolve exatamente no
par, sempre.

Os dois — dica e recipiente extra sem saldo — custam um **anúncio simulado**
(5 segundos de contagem regressiva no próprio botão). O jogo ainda não tem
anúncio de verdade; a contagem de quantas vezes alguém topa esperar é a
métrica de intenção de rewarded que dá pra medir antes de existir um SDK de
portal integrado.

## Persistência

O jogo salva de verdade (`localStorage`): saldo, estoque de recipientes e o
dia do último desafio feito — gravado a cada tabuleiro, cada compra, e quando
a aba se esconde (celular mata aba sem avisar; esse é o único momento
garantido). Fechar e reabrir no dia seguinte é, literalmente, o teste de
retenção D1.

## Testes

**`testes/harness.mjs`** — roda sem navegador e sem gente:

```
npm test
```

Importa a lógica pura **direto de `index.html`** (fonte única — não existe
cópia pra divergir) e escreve `testes/evidencias.md`. Roda em CI a cada push
(`.github/workflows/testes.yml`). Cobre: invariantes sob partidas aleatórias,
exatidão do solver, estatística do gerador, distribuição do score de
dificuldade, **dados reais de onze sessões de playtest embutidos** (com os
layouts exatos, pra validar o bot contra humano sem transitividade),
comportamento do diretor, simulação de economia, determinismo do desafio do
dia, otimalidade da dica, e regressão de cada bug que o playtest achou.

**`testes/e2e.mjs`** — o jogo jogado por um navegador de verdade
(Playwright/Chromium): resolve tabuleiros clicando nos tubos pelo caminho
ótimo, assiste os anúncios simulados, compra recipiente pelas três vias,
completa o desafio do dia, recarrega a página pra provar a persistência, e
confere o layout em tela de celular. Não roda em CI (depende de navegador
instalado); é a verificação local antes de publicar:

```
npm i
npm run e2e
```

## Testar no celular

Pela internet, sem login: **bzomer.github.io/puzzle-game**. Na rede local,
sem publicar nada: `servir-na-rede.bat` serve esta pasta pro celular abrir
pelo Wi-Fi (Windows).

## Os números, todo em um lugar

No topo do `<script>` de `index.html`, em `CONFIG`:

```js
CORES: 6, CAPACIDADE: 4, VAZIOS: 2, TABULEIROS_ALVO: 10,
MOEDA_BASE: 3, MOEDA_POR_FOLGA: 50, TOLERANCIA_PAR: 1.3, MOEDA_INICIAL: 10,
CUSTO_DESFAZER: 2, DESFAZER_GRATIS: 2,
SEQUENCIA_BONUS: 0.1, SEQUENCIA_MAX: 2,
CUSTO_RECIPIENTE: 25,
DESAFIO_BONUS_MOEDAS: 25, DESAFIO_BONUS_RECIPIENTES: 1,
FAIXAS: { leve, media, pesada }, TETO_PAREDE: 1.7,
```

## Créditos de assets

Ícones de [game-icons.net](https://game-icons.net) (Lorc e Delapouite,
[CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)); molduras de
[Fantasy UI Borders](https://kenney.nl/assets/fantasy-ui-borders) (Kenney,
CC0); fontes Pirata One e Almendra (Google Fonts, OFL). Detalhes e
histórico das decisões visuais em `referencias-visuais.md`.

## Quem lidera o gênero

Quem ganha dinheiro com puzzle nos portais, quanto, e o que dá pra copiar sem
virar clone: [`lideres-do-genero.md`](lideres-do-genero.md). Resumo — o líder é
**block puzzle** (Block Blast, só anúncio, D1 de 26,1 %), o nosso subgênero
(sort) é o que mais depende de anúncio dos três de topo, e o buraco medido aqui
é que **nunca medimos D1 fora do playtest**.

## Origem

Nasceu como protótipo de um item da pesquisa e proposta de próximo jogo em
[bzomer/manual-de-jogos](https://github.com/bzomer/manual-de-jogos) (repo
privado — o manual de como fazer e publicar jogos web). Este repositório
existe separado porque o GitHub Pages é público mesmo saindo de um repo
privado, e porque o projeto cresceu demais pra caber como subpasta: economia,
diretor de dificuldade, harness de testes e bateria E2E próprios, com CI
independente.
