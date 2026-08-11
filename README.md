# Protótipo: puzzle de cor com meta idle

O passo 0 da [`proposta-proximo-jogo`](../../00-decisoes-de-partida/proposta-proximo-jogo.md).
Um arquivo, sem dependência, sem build: abrir `prototipo.html` no navegador.

**Ele não é o jogo.** É um instrumento para responder uma pergunta só:

> O tabuleiro prende por dez tabuleiros seguidos, **sem meta nenhuma**?

Se a resposta for não, a proposta morre aqui — e custou uma tarde em vez de dois
meses. Por isso o protótipo não tem economia, não tem melhoria, não tem anúncio:
qualquer uma dessas coisas mascararia a resposta.

## Por que HTML e não Godot

O precedente é do próprio projeto: o jogo-tuti nasceu como 1 arquivo HTML antes
de virar Godot. Aqui vale pelo mesmo motivo — a pergunta é de design, não de
engine, e o caminho mais curto até jogar num celular de verdade vence.

O porte é mecânico de propósito: **tudo é desenhado com retângulo**, então cada
`ctx.fillRect` vira um `draw_rect` em `desenho.gd`. Nenhum asset, nenhuma
imagem, nenhuma fonte externa.

## Como usar

1. Jogue os dez tabuleiros **de uma sentada**, como um jogador faria.
2. Se cansar antes, aperte **"Parei aqui"** — a resposta honesta é o dado mais
   valioso do protótipo. Não force os dez por disciplina; isso destrói a medição.
3. Leia o veredito. Ele se calcula sozinho.
4. Depois, veja a **tela de volta** e compare a ausência de 8 h com a de 24 h.

Vale rodar **no celular também**, não só no desktop — o manual insiste que o
primeiro teste em aparelho real acha em dois minutos o que semanas de conferência
automática não acham.

## O que ele mede

| Métrica | Alvo | De onde vem o alvo |
| --- | --- | --- |
| Tabuleiros completados | 10 / 10 | o critério de morte |
| Tempo de sessão | **10+ min** | benchmark do Basic Launch |
| Tempo por tabuleiro | 45–110 s | a conta das impressões da proposta |
| Movimentos vs. par | ≤ 115 % | se ninguém chega perto do par, o par está errado |
| Desfazer e reinícios | — | sinal de dificuldade e de beco sem saída |

O veredito combina as duas primeiras, que são as que decidem.

## Os números, todos em um lugar

No topo do `<script>`, em `CONFIG` — o mesmo contrato do `config.gd` do manual:

```js
CORES: 6, CAPACIDADE: 4, VAZIOS: 2, TABULEIROS_ALVO: 10,
MOEDA_BASE: 100, MOEDA_POR_MOVIMENTO_POUPADO: 25,
TETO_OFFLINE_HORAS: 8, PRODUCAO_POR_MIN: 12,
```

**O primeiro botão a girar é `CORES`.** Se a sessão fechar rápido demais, 7 ou 8
cores alongam o tabuleiro sem tocar em mais nada.

## O par é o mínimo de verdade

O par vem de um **A\*** com heurística admissível — para cada cor, o número de
recipientes que a contêm menos um; um movimento reduz essa soma em no máximo 1.
Recipientes são intercambiáveis, então o estado é canonizado por ordenação antes
de entrar na tabela, o que corta o espaço de busca em várias ordens de grandeza.

Uma versão anterior usava IDA\* e **não terminava** nesta profundidade: com par
em torno de 18 e transposições demais, sem tabela global a busca explode.

Medições (50 amostras, 6 cores, Node 22):

| | |
| --- | --- |
| Tempo do solver | mediana 16 ms, pior caso 47 ms |
| Par | mínimo 14, média 17,8, máximo 21 |
| Distribuições insolúveis | 0 em 50 — com 2 recipientes livres é raríssimo |
| Invariantes quebradas em 200 partidas aleatórias | 0 |
| Par confirmado descendo o gradiente do solver | 8 / 8 |
| Becos sem saída sob jogo **aleatório** | 9 em 200 (4,5 %) |

A última linha é a razão de o botão de reiniciar se anunciar sozinho quando não
há movimento legal: um humano cai nisso bem menos que o acaso, mas travado sem
aviso ele acha que é bug — e o playtest passa a medir a confusão em vez do jogo.

## O playtest — 11/08/2026

Duas sessões, com 6 cores:

| | Autor | Segundo testador |
| --- | --- | --- |
| Tabuleiros | 10 / 10 | 10 / 10 |
| Movimentos vs. par | 106 % | **110 %** |
| Desfazer | 4 | **0** |
| Reinícios | 0 | 0 |
| Tempo por tabuleiro | 63 s | 35 s |

**O núcleo passou.** Alguém que nunca tinha visto o jogo resolveu dez seguidos
quase no ótimo matemático, sem desfazer uma única vez.

O padrão entre as duas colunas é o achado: **o tempo variou quase o dobro, a
precisão quase não mudou.** Dificuldade aqui não separa quem resolve de quem
não resolve — separa quanto tempo leva. Mais cores vão alongar a partida, não
causar desistência.

### As duas coisas que o playtest quebrou

**O bônus de moeda era código morto.** As duas sessões fecharam com exatamente
1.000 moedas — 10 × `MOEDA_BASE`, zero de habilidade. A fórmula premiava
`par - movimentos`, e como o par é o mínimo exato do A*, essa diferença nunca é
positiva. Corrigido para premiar proximidade do par (`TOLERANCIA_PAR`); refeita
a conta com os mesmos desempenhos, dá 2.100 e 1.700, com 76 % e 71 % vindos de
habilidade.

**O cap de dez tabuleiros media a coisa errada.** Os tempos de sessão das duas
colunas (10:34 e 5:58) **não são tempo de sessão** — são tempo de cumprir uma
cota de dez, porque o protótipo encerrava sozinho ali. Ninguém parou por tédio.
O cap servia ao critério de morte e destruía a única outra métrica que importa.
Removido: agora a sessão só acaba em "Parei aqui", e o contador vira marcador
de quanto a pessoa aguentou.

Por isso os dois tempos acima **não devem ser usados** para decidir número de
cores. Esse número ainda não foi medido.

## A terceira sessão — sem cota

A primeira medição real de sessão, com o teste já sem limite de dez:

| | |
| --- | --- |
| Tabuleiros | **17**, parando por vontade própria |
| Tempo de sessão | **11:33** — acima dos 10 min de referência |
| Tempo médio | 40 s |
| Movimentos vs. par | 107 % |
| Desfazer / reinícios | 1 / 0 |

**O alvo de sessão está batido com 6 cores.** Some daqui a recomendação de subir
para 7 ou 8: ela existia para consertar um número que, medido direito, não
estava quebrado.

Três leituras dos dados por tabuleiro:

- **Foi tédio, não cansaço.** A precisão caiu de 105,5 % nos primeiros oito para
  109,2 % nos últimos nove, enquanto o tempo por tabuleiro ficou parado (40,8 s
  → 39,8 s). Quem cansa fica lento; quem enjoa fica desleixado.
- **A dificuldade é plana, e provavelmente é o motivo de a sessão terminar.**
  Dos 17 tabuleiros, **9 tiveram par exatamente 19**; desvio padrão de 1,87 num
  intervalo de 14 a 21. Onze minutos sem nada mudar.
- **O par está bem calibrado.** Três tabuleiros foram resolvidos **exatamente no
  par** — o ótimo é atingível por um humano, não é um número decorativo.

E a sessão derrubou a fórmula da moeda de novo — ver a nota de correção na
[proposta](../../00-decisoes-de-partida/proposta-proximo-jogo.md#3-a-meta-e-a-economia).

## O que ainda não está aqui

De propósito, para não contaminar a medição: economia, trilhas de melhoria,
anúncio de verdade, som, i18n, e o SDK do portal. A tela de volta usa **acúmulo
falso** — ela existe só para o momento do retorno ser sentido, não simulado com
fidelidade.

## Testar no celular

Dois caminhos.

**Na rede local**, sem publicar nada: `servir-na-rede.bat` serve esta pasta e o
celular abre pelo Wi-Fi. É o mesmo padrão do
[`06-modelos/testar-no-celular.bat`](../../06-modelos/testar-no-celular.bat),
menos o export do Godot, que aqui não existe.

**Pela internet**, em qualquer aparelho e sem login:
[bzomer.github.io/puzzle-game](https://bzomer.github.io/puzzle-game/) — servido
pelo GitHub Pages a partir de **[bzomer/puzzle-game](https://github.com/bzomer/puzzle-game)**,
um repositório público separado.

### Por que um repositório separado

Este manual é privado, e sites do GitHub Pages são **públicos mesmo quando saem
de um repositório privado**. Ligar o Pages aqui publicaria a pesquisa de
monetização e a proposta do próximo jogo junto. O repositório separado leva só
o protótipo — que não tem economia, nome nem marca — e o resto continua privado.

> **Cuidado com a divergência.** O `index.html` de lá é uma cópia do
> `prototipo.html` daqui. Ao mexer no protótipo, copie por cima e empurre nos
> dois. Este aqui é a fonte.
