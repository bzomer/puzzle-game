# O puzzle mais rentável dos portais pesquisados

Adendo a [`o-que-monetiza`](https://github.com/bzomer/manual-de-jogos) do manual,
que fechou com um buraco declarado na §14: *"Benchmarks de puzzle nas páginas de
monetização — o portal só publica action, shooting, driving, word e clicker.
Puzzle aparece em conselhos, sem números — irônico, sendo 20,6 % do tempo de
jogo."*

Este documento fecha o buraco pelo outro lado: em vez de esperar o portal
publicar, identifica **quem já ganha** e quanto, cruzando três coisas que são
públicas.

## A resposta, em uma frase

**Block Blast!**, da Hungry Studio — um puzzle de encaixe de blocos em grade
8×8, monetizado **só com anúncio**, sem compra nenhuma. É descrito como o maior
jogo de receita de anúncio do planeta, e o subgênero dele leva a maior fatia da
receita de puzzle casual.

E o achado que interessa mais que o nome: **ele não está nos portais que
pesquisamos.** O que está lá são clones e adaptações — inclusive um exclusivo da
Poki feito por um estúdio estreante.

---

## 1. Como "mais rentável" foi decidido, já que ninguém publica receita

Nenhum portal publica receita por jogo — o manual já tinha registrado isso
("RPM real, por gênero ou em geral. Não é público"). Então a pergunta foi
respondida por triangulação de três dados que existem:

| Eixo | O que dá | Confiança |
| --- | --- | --- |
| **Receita do jogo no mobile** | o mesmo conteúdo, o mesmo loop, medido por AppMagic/Sensor Tower e por comunicado do próprio estúdio | alta no ranking, média no valor absoluto |
| **Fatia do subgênero na receita de puzzle** | qual *forma* de puzzle converte, independente do título | alta |
| **Presença e posição nos portais** | se aquela forma migrou pro navegador e como | média — os portais não publicam plays por jogo |

**Ressalva de método, herdada e agravada:** o proxy desta sessão bloqueia
`crazygames.com`, `poki.com`, `appmagic.rocks`, `mobidictum.com` e outros. Todos
os números abaixo vieram por **extração de busca sobre essas páginas**, não por
leitura direta — a mesma limitação que a §14 do manual registrou. Conferir na
fonte antes de apostar dinheiro em qualquer um deles.

---

## 2. O líder, em números

| | Block Blast! (Hungry Studio, 2022) |
| --- | --- |
| Receita estimada | **US$ 584 mil/dia** (~US$ 17,5 mi/mês) por uma estimativa; **US$ 1 mi/dia** por outra |
| Monetização | **100 % anúncio**, sem IAP |
| Jogadores | **70 mi DAU**, **300 mi MAU**, 200+ países |
| Downloads | **368 mi em 2025** — jogo mais baixado do mundo, dois anos seguidos |
| Posição | nº 1 mundial em downloads em jan e fev/2026 (AppMagic) |
| **Retenção D1** | **26,1 %** |
| Ajuste fino | +5 % de ARPDAU só trocando SDK de anúncio; dezenas de milhares de testes A/B em posicionamento |

As duas estimativas de receita (584 mil e 1 milhão por dia) são de terceiros e
divergem em 70 %. **A ordem de grandeza é o dado; o número não é.**

### A linha que mais ensina é a da retenção

**26,1 % de D1 contra os 6,7 % de média do CrazyGames.** É quase 4×. Isso não é
diferença de canal — é o mesmo tipo de jogador casual. É diferença de *jogo*.

O manual já dizia que "nenhum jogo de portal vive de retenção; vive de fluxo".
Continua verdade, mas o Block Blast mostra o outro lado: **retenção é o
multiplicador que se aplica ao fluxo que o portal manda de graça**, e é a única
variável da conta que depende inteiramente de nós.

---

## 3. O pódio por forma de puzzle

Da medição da AppMagic sobre puzzle hipercasual/hybridcasual (trimestre de
referência: Q1/2025):

| Forma | Fatia da receita de puzzle | Como monetiza | Exemplos |
| --- | --- | --- | --- |
| **Block puzzle** | **71 %** | anúncio | Block Blast!, Blockudoku |
| **Screw puzzle** | 20 % | anúncio + IAP | Screw Jam, Nuts and Bolts |
| **Sort puzzle** | 9 % | **ganha ao menos tanto de anúncio quanto de IAP, provavelmente mais** | Water Sort, Magic Sort! |

Duas correções de leitura antes de tirar conclusão:

1. **Block puzzle foi o subgênero que mais cresceu do ano**, em receita e em
   downloads. Não é liderança de inércia.
2. **A fatia de 9 % do sort é fatia de IAP, e o sort é o subgênero mais
   dependente de anúncio dos três.** Medido pela moeda que o portal paga —
   anúncio — o sort está subrepresentado nessa tabela, não superestimado. O sort
   cresceu **116 %** e, no começo de 2026, passou o blast em receita de IAP.

**Isso é a coisa mais importante deste documento para o nosso caso.** Nosso jogo
é sort. A tabela parece dizer "você escolheu o 3º lugar"; o que ela diz de
verdade é "você escolheu o único dos três cuja receita já é anúncio por
natureza" — que é exatamente a única receita que existe no CrazyGames.

---

## 4. O que está nos portais, de fato

| Portal | O que tem da forma líder | Observação |
| --- | --- | --- |
| **Poki** | **Blocky Blast Puzzle** (OPlay Games) — **exclusivo da Poki**, 4,3★, entre os jogos em alta | é a **primeira publicação do estúdio** na plataforma |
| **Poki** | Nuts and Bolts: Screwing Puzzle, Screw Jam Puzzle, World of Screw (Unico Studio) | a forma nº 2 chegou inteira, e com estúdio de nome |
| **CrazyGames** | BlockBuster Puzzle, Block Blaster e uma aba `/t/block` inteira | clones sob nomes próprios |
| **Ambos** | 2048, Bubble Shooter, Sudoku, Mahjong | os perenes, que ninguém desbanca e ninguém enriquece |

**O Block Blast oficial não foi confirmado em nenhum dos dois.** Boa parte do que
uma busca devolve como "Block Blast no CrazyGames/Poki" são **sites-espelho**
(`crazygames-poki.com`, `poki.to`, `blockblastonline.com`, `blockblasts.io`) —
não os portais. O manual já avisava pra não usar contagens vindas de espelho; a
mesma armadilha vale aqui.

O que isso significa, na prática:

> A forma de puzzle mais rentável do mundo chegou aos portais **sem dono**. Quem
> ocupa o espaço dela é clone genérico e um estreante que a Poki decidiu
> promover como exclusivo. Não há incumbente de anos como no `.io`.

---

## 5. O tamanho do prêmio, nos portais

| | Poki | CrazyGames |
| --- | --- | --- |
| Escala | **1 bi de plays/mês**, 100 mi MAU, 625 mi de jogadores em 2025 | ~35 mi MAU, ~300 mi plays/mês, ~4.500 jogos |
| Divisão | 50 % (**100 % do tráfego que você trouxer**) | 60 % anúncio / 70 % compras |
| Topo do catálogo | estúdios de topo chegam a **€1 mi/ano** — e a Poki afirma ter multiplicado a receita dos melhores por **10×** | não publicado |
| Referência de plays | Rainbow Obby (Emolingo, 2→5 funcionários) passou de **100 mi de plays** | — |

A Poki tem 600+ estúdios e 65 funcionários, sem investidor externo. O €1 mi/ano
do topo já aparecia no manual, via Naavik; aqui ele vem confirmado pela própria
Poki, com o detalhe novo do 10×.

---

## 6. O que o líder faz que nós já fazemos — e o que não fazemos

Comparação direta com o que está em `index.html`, sem generosidade:

| Mecanismo do Block Blast | Nós | Situação |
| --- | --- | --- |
| Só anúncio, zero IAP | anúncio simulado (dica, recipiente) | **igual** — e o portal paga 60 % disso |
| Legível em 10 s, zero tutorial | cor com cor, tabuleiro montado na abertura | **igual** |
| Sem asset pesado | tudo procedural, 1 arquivo | **melhor** — cabe folgado nos 20 MB da home mobile |
| **Falha frequente + rede de segurança por rewarded** | temos o aviso de "sem saída" e o recipiente extra como resgate | **igual em espécie, menor em frequência** — nosso tabuleiro tem fim; o dele não |
| **Sem fim: tabuleiro infinito até travar** | tabuleiro acaba resolvido, em 60–90 s | **diferente** — é a diferença estrutural |
| Volta várias vezes por dia | Desafio do Dia, determinístico pela data | **igual em intenção**, sem medição real ainda |
| **Dezenas de milhares de testes A/B em posicionamento de anúncio** | zero; 11 sessões de playtest com 3 pessoas | **é aqui que estamos a anos-luz** |
| D1 de 26,1 % | desconhecido — nunca medido fora do playtest | **buraco** |

### A diferença estrutural, e por que ela importa

O Block Blast **não tem vitória**. Você joga até travar, e travar é o momento em
que o rewarded aparece ("continue", "desfaça", "quebre um bloco"). Cada partida
gera fracasso, e fracasso é o gatilho de anúncio de maior conversão que existe.

O nosso tabuleiro **termina resolvido**. O fracasso, no nosso jogo, é raro por
construção: o diretor de dificuldade existe justamente pra impedir a parede.
Otimizamos contra a coisa que o líder monetiza.

Não é erro — é a diferença entre um jogo de sessão e um jogo de placar infinito,
e a nossa escolha protege o eixo de habilidade. Mas tem consequência mensurável:
**menos momentos de aperto por minuto = menos oportunidades de rewarded.** A
nossa versão do aperto é o "sem saída", e ele hoje é raro *de propósito*.

---

## 7. O que fazer com isso — três leituras, em ordem de custo

**A. Não mudar o núcleo, e mirar o aperto.** O sort é o subgênero de anúncio dos
três, cresceu 116 %, e temos um protótipo com solver exato, diretor de
dificuldade e economia validados por 11 sessões. Jogar isso fora pra virar o
clone nº 40 de block puzzle é trocar uma vantagem real por uma commodity. O
ajuste barato é **aumentar a densidade de momentos de aperto** sem quebrar o
diretor — o "sem saída" e o recipiente extra já são o encaixe; a alavanca é
`TETO_PAREDE` e a distribuição de faixas, não código novo.

**B. O que copiar sem discussão:** a disciplina de teste A/B em posicionamento.
Dezenas de milhares de testes valeram +5 % de ARPDAU só de troca de SDK. Nós
temos zero. O primeiro passo não é um jogo novo, é **medir D1 de verdade** — que
hoje é um número que não existe.

**C. Se o objetivo for teto máximo de receita e não este jogo:** a resposta é
block puzzle, sem empate, e a janela está aberta nos portais (sem incumbente
oficial, com a Poki promovendo estreante). Mas quase nada do que construímos
transfere — o A*, o par de movimentos, o diretor e a economia por eficiência
existem porque o nosso puzzle **tem solução ótima**; block puzzle infinito não
tem. Seria um projeto novo, não uma virada.

A recomendação é **A + B**. C fica registrado como o que a evidência diz, não
como o que o esforço acumulado recomenda.

---

## 8. O que não deu pra saber

Registrado pra ninguém procurar duas vezes:

- **Plays por jogo em qualquer um dos dois portais.** Nenhum dos dois publica, e
  os números que aparecem em busca vêm de sites-espelho. Não usar.
- **Receita de qualquer jogo de puzzle *no portal*.** Só existe receita de mobile.
  A ponte entre as duas é inferência, não medição.
- **Se o Block Blast oficial está no CrazyGames ou na Poki.** Bloqueio de proxy
  impediu confirmar na fonte; as evidências que aparecem são de espelhos.
- **Plays do Blocky Blast Puzzle**, o exclusivo da Poki. Só rating (4,3★) e o
  rótulo de "em alta".
- **A divergência de 584 mil vs. 1 milhão por dia.** Duas estimativas de
  terceiros, nenhuma auditada, nenhuma confirmada pelo estúdio.

---

## Fontes

**O líder e o subgênero**

- [Block Blast Revenue, Downloads & User Statistics (2026)](https://www.blog.udonis.co/statistics/block-blast) — Udonis
- [Block Blast by Hungry Studio is doing $1M a Day](https://www.gamigion.com/block-blast-by-hungry-studio-is-doing-1m-a-day/) — Gamigion
- [Hungry Studio's Block Blast! Reinforces Its Position…](https://www.businesswire.com/news/home/20260312302688/en/Hungry-Studios-Block-Blast-Reinforces-Its-Position-Among-the-Free-Mobile-Games-Players-Turn-to-Most) — Business Wire, mar/2026 (DAU/MAU, ranking AppMagic)
- [How to Develop a Game Like Block Blast — The $584K/Day Puzzle](https://www.capermint.com/blog/develop-a-game-like-block-blast/) — Capermint (D1 de 26,1 %)
- [Hungry Studio's Block Blast Enjoys 5% ARPDAU Lift with the InMobi SDK](https://advertising.inmobi.com/case-study/hungry-studios-block-blast-enjoys-5-arpdau-lift-with-the-inmobi-sdk) — InMobi
- [Top 10 Hybridcasual Games in Q1 2025: The Great Puzzle Takeover](https://appmagic.rocks/blog/hybridcasual-q1-2025/?hl=en) — AppMagic (71 / 20 / 9)
- [Sort, block, and screw mechanics are reshaping the puzzle games market](https://mobidictum.com/sort-block-screw-mechanics-puzzle-games-market/) — Mobidictum sobre AppMagic (+116 %, anúncio ≥ IAP no sort)
- [Puzzle Games Revenue and Usage Statistics (2026)](https://www.businessofapps.com/data/puzzle-games-market/) — Business of Apps

**Os portais**

- [Blocky Blast Puzzle](https://poki.com/en/g/blocky-blast-puzzle) e [Nuts and Bolts: Screwing Puzzle](https://poki.com/en/g/nuts-and-bolts-screwing-puzzle) — Poki
- [How Poki's developer-first approach drove 1 billion game plays](https://techfundingnews.com/browser-gaming-website-poki-won-big-at-the-dutch-game-awards-celebrating-hitting-1-billion-monthly-plays/) — TFN
- [Poki hits 1B monthly plays as developer-first model boosts top studio revenues tenfold](https://app.dealroom.co/news/feed/poki-hits-1b-monthly-plays-as-developer-first-model-boosts-top-studio-revenues-tenfold-1) — Dealroom
- [Poki Announces Milestone of 625 Million Players](https://finance.yahoo.com/sectors/technology/articles/poki-announces-milestone-625-million-050000965.html) — Access Newswire
- [Block Games](https://www.crazygames.com/t/block), [BlockBuster Puzzle](https://www.crazygames.com/game/blockbuster-puzzle), [Block Blaster](https://www.crazygames.com/game/block-puzzle-master) — CrazyGames
- [Web Game Monetization: What the Data Actually Says (2026)](https://app.cinevva.com/guides/web-game-monetization) — Cinevva
