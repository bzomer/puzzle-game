# Protótipo — puzzle de organização por cor

**Jogar: https://bzomer.github.io/puzzle-game/**

Um arquivo, sem dependência, sem build, sem asset. Também dá pra baixar
`index.html` e abrir com dois cliques.

## Isto não é um jogo

É um instrumento, feito para responder uma pergunta só:

> O tabuleiro prende por **dez tabuleiros seguidos**?

Por isso ele não tem economia, progressão, som nem loja. Qualquer uma dessas
coisas mascararia a resposta — um núcleo morno parece divertido quando há uma
barra de progresso enchendo do lado.

## Como jogar

Toque num recipiente para pegar a camada de cima, toque em outro para
despejar. Só entra em cima de espaço vazio ou da mesma cor. Acaba quando cada
recipiente tiver uma cor só.

Se quiser levar a sério como teste: jogue os dez de uma sentada e, **se cansar
antes, aperte "Parei aqui"**. A resposta honesta é o dado que interessa; forçar
os dez por disciplina destrói a medição. No fim ele calcula o veredito sozinho.

## O par é o mínimo de verdade

O número de movimentos ao lado do seu não é um chute. Vem de uma busca **A\***
com heurística admissível: para cada cor, o número de recipientes que a contêm
menos um — um movimento reduz essa soma em no máximo 1, então ela nunca
superestima. Recipientes são intercambiáveis, então o estado é canonizado por
ordenação antes de entrar na tabela, o que corta o espaço de busca em várias
ordens de grandeza.

Uma versão anterior usava IDA\* e **não terminava** nesta profundidade: com o
par em torno de 18 e transposições demais, sem tabela global a busca explode.

Medido em 50 amostras com 6 cores, em Node 22:

| | |
| --- | --- |
| Tempo do solver | mediana 16 ms, pior caso 47 ms |
| Par | mínimo 14, média 17,8, máximo 21 |
| Distribuições insolúveis | 0 em 50 |
| Invariantes quebradas em 200 partidas aleatórias | 0 |
| Par confirmado descendo o gradiente do solver | 8 / 8 |
| Becos sem saída sob jogo **aleatório** | 9 em 200 (4,5 %) |

A última linha é a razão de o botão de reiniciar se anunciar sozinho quando não
resta movimento legal: um humano cai nisso bem menos que o acaso, mas travado
sem aviso ele acha que é bug.

## Sem asset nenhum

Tudo é `fillRect` num canvas — o vidro, o líquido, a borda. Nenhuma imagem,
nenhuma fonte externa, nenhuma requisição. São 29 KB no total, e é de propósito:
o porte para uma engine que desenhe com retângulo fica mecânico.

O cromo da interface é acromático pelo mesmo motivo estético: como o jogo
inteiro é cor saturada, tudo em volta é cinza para não brigar.

## Os números

No topo do `<script>`, em `CONFIG`. O primeiro a girar é `CORES` — se a sessão
fechar rápido demais, 7 ou 8 alongam o tabuleiro sem tocar em mais nada.
