# Referências visuais — o que o gênero faz, e o que disso entrou aqui

Levantamento feito antes da rodada de melhorias de HUD/feedback (ago/2026).
O critério de seleção: só entra o que os líderes do gênero *sort* fazem em
consenso, ou o que a literatura de game feel sustenta — e só se couber na
regra da casa: **cromo acromático** (a única cor da tela é o líquido) e
**canvas só com retângulo** (pra que o porte pro Godot via `draw_rect`
continue mecânico).

## As referências

**Líderes do gênero (Water Sort / Ball Sort e derivados)**

- [Water Sort: Color Tube Puzzle](https://play.google.com/store/apps/details?id=water.sort.puzzle.color.sort.games) e
  [SortPuz](https://play.google.com/store/apps/details?id=sortpuz.water.sort.puzzle.game) — o consenso visual do gênero:
  - o tubo selecionado **se ergue** ("este está na mão");
  - o despejo é **animado** — o líquido viaja da origem ao destino;
  - tubo completado ganha **celebração imediata** (brilho/confete/check);
  - trio de power-ups sempre visível: Undo / Hint / Extra Bottle
    (já era o nosso trio, validado em playtest);
  - design "clean e minimalista": o HUD não compete com o tabuleiro.
- [Guia de estratégia Water Sort](https://funhub1.com/blog/water-sort-puzzle-guide) —
  confirma o papel do undo/hint na experiência: ferramenta de experimentação,
  não muleta (a nossa economia do desfazer pago segue mais dura que o gênero,
  de propósito — é instrumento de medição).

**Game feel / juice**

- [Making a Game Feel "Juicy" with Simple Effects](https://resprawn.medium.com/when-you-play-a-great-game-it-feels-good-d23761b6eccf) —
  a tríade: resposta instantânea ao input, feedback legível por ação, e a
  camada de polish (squash & stretch, partículas, som) por cima.
- [How to Make Your Game Feel Good](https://egmatic.com/blog/how-to-make-your-game-feel-good) —
  feedback tem que aparecer **onde a ação aconteceu**, não só num contador.
- [The Juice is Not Worth the Squeeze](https://www.wayline.io/blog/juice-visual-polish-game-development) —
  o contraponto que valida a nossa ordem: polish **não salva** núcleo fraco.
  Este projeto validou o núcleo primeiro (10 sessões de playtest) e só agora
  investe em feel — a ordem certa.

## O que entrou nesta rodada

Tudo cosmético: o estado do jogo **nunca espera** animação, e o toque nunca
é bloqueado — o E2E clica no ritmo dele e nada muda.

| Melhoria | Referência | Como |
| --- | --- | --- |
| Barra de progresso do tabuleiro | gênero: "quanto falta" sempre visível | linha de 4px sob o HUD, tubos completos / cores |
| Animação de despejo | gênero: o líquido viaja | bloco-retângulo em arco curto, ~170ms, ease-out |
| Flash no tubo completado | gênero: celebração imediata | borda **na cor concluída** + véu de luz branca esmaecendo em ~650ms (feedback de playtest: verde igual pra todos ficava errado) |
| Tubo selecionado se ergue | gênero: "está na mão" | tubo inteiro sobe 5px (a corrida do topo já subia) |
| "+N moedas" / "−N" flutuante | juice: feedback onde a ação aconteceu | texto mono sobre o palco, sobe e some |
| Pulso nos valores do HUD | juice: aviso periférico de mudança | scale 1.28→1 em 220ms, só quando o valor muda |

Tudo respeita `prefers-reduced-motion`: com motion reduzido, animações de
canvas não rodam e os avisos aparecem parados.

## Rodada 2: som

Entrou logo em seguida, sintetizado em Web Audio — **zero asset**, na regra
da casa. A primeira versão usava bips crus de oscilador; o playtest vetou
("não gostei dos sons") e a direção escolhida foi **musical minimalista**:
teclas de marimba sintetizadas (fundamental + parcial ~4× que morre rápido,
ataque macio, decaimento longo), tudo na **pentatônica de dó** — qualquer
sequência soa consonante, nunca "erra". Vocabulário mínimo, um significado
por som:

Segunda rodada de veto: nota musical em cada movimento cansa — os sons
FREQUENTES viraram outra família (percussão abafada / silêncio), e as notas
ficaram só nos momentos de conquista.

| Som | Desenho |
| --- | --- |
| Despejo | percussão abafada ("toc" de madeira com feltro), grave e curtíssima, subindo um nadinha conforme o tubo enche — informação, não melodia |
| Seleção | **mudo** — o tubo erguendo é o feedback |
| Tubo completo | duas teclas (mi5 → dó6), sincronizadas com o flash (esperam o bloco assentar) |
| Tabuleiro resolvido | arpejo pentatônico calmo — o tubo final cede a vez |
| Desfazer | tecla grave curta |
| Recipiente extra | duas teclas graves ("algo se instalou") |

Botão 🔊/🔇 na fileira da loja; a preferência persiste no save. Se o
navegador bloquear áudio (autoplay), o jogo segue mudo sem reclamar. No
porte Godot cada `som*` vira um `AudioStreamPlayer` com sample de verdade.

## Rodada 3: estrutura de telas e identidade ("cara de jogo")

Veto de playtest na estética de instrumento: "continua muito cara de teste
(...) não é uma cara de um jogo legalzinho". Pesquisa antes de mexer — a
pergunta era se o costume pede tela inicial com mapa de fases:

- [Poki: quality guidelines](https://sdk.poki.com/poki-quality-guidelines) e
  [requirements](https://sdk.poki.com/new-requirements) — na web o costume é
  o CONTRÁRIO de menu: mínimo de telas, jogador dentro do jogo em <10 s.
- Líderes do gênero ([Water Sort](https://play.google.com/store/apps/details?id=water.sort.puzzle.color.sort.games),
  [SortPuz](https://play.google.com/store/apps/details?id=sortpuz.water.sort.puzzle.game)) —
  abrem direto na fase atual; a progressão é **número de fase contínuo**
  ("Level 234"), sem mapa (mapa é meta de match-3). O que É universal:
  tela de **"level complete"** com o prêmio.
- [Hypercasual UI/UX guide](https://pixune.com/blog/hypercasual-games-ui-ux-design-guide/) —
  botões grandes e amigáveis, clareza acima de tudo.

O que entrou, seguindo o consenso:

- **Tela inicial leve**: paleta das 8 tintas como marca, título, UM botão
  ("Jogar — fase N") e fichas de status (moedas, fases completas, desafio).
  O relógio da sessão só liga no toque em Jogar — tempo de menu não suja a
  métrica de sessão.
- **Fase global persistida**: contagem de tabuleiros completados de todos os
  tempos, o número que só cresce. O "N/10" do instrumento saiu do HUD; o
  alvo de 10 por sessão segue vivo em `sessao.completados` e no veredito.
- **Carta de fase concluída**: pula no centro com o prêmio e some sozinha
  (1,4 s) — celebração sem clique extra entre fases.
- **Cromo com cor**: `--realce` (o azul das tintas, promovido a marca) nos
  botões fortes; cantos arredondados em botões e cartas; **tubos com cara de
  tubo** no canvas (boca reta, fundo arredondado, líquido recortado pela
  forma do vidro — no Godot vira `StyleBoxFlat` com `corner_radius`).

## O que fica pro porte (Godot)

Anotado aqui pra não virar scope creep no protótipo:

- **Partículas** na conclusão do tabuleiro (confete contido, na paleta das
  tintas do tabuleiro — o cromo segue acromático).
- **Squash & stretch** no líquido ao assentar.
- **Vidro com forma de tubo** (cantos arredondados, gargalo) — hoje é
  retângulo puro por decisão; no Godot vira sprite/shader sem custo.
