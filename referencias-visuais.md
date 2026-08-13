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
da casa. Vocabulário mínimo, um significado por som:

| Som | Desenho |
| --- | --- |
| Despejo | "plop" que **sobe de tom conforme o tubo enche** (dá pra ouvir o tubo completando sem olhar — o clássico do gênero) |
| Tubo completo | acorde de duas notas, sincronizado com o flash (espera o bloco assentar) |
| Tabuleiro resolvido | arpejo maior curto — o tubo final cede a vez à fanfarra |
| Desfazer | blip descendente |
| Recipiente extra | duas notas graves ("algo se instalou") |
| Seleção | tique quase inaudível |

Botão 🔊/🔇 na fileira da loja; a preferência persiste no save. Se o
navegador bloquear áudio (autoplay), o jogo segue mudo sem reclamar. No
porte Godot cada `som*` vira um `AudioStreamPlayer` com sample de verdade.

## O que fica pro porte (Godot)

Anotado aqui pra não virar scope creep no protótipo:

- **Partículas** na conclusão do tabuleiro (confete contido, na paleta das
  tintas do tabuleiro — o cromo segue acromático).
- **Squash & stretch** no líquido ao assentar.
- **Vidro com forma de tubo** (cantos arredondados, gargalo) — hoje é
  retângulo puro por decisão; no Godot vira sprite/shader sem custo.
