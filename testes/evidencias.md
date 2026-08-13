# Evidências — harness do protótipo sort-idle

Gerado por `testes/harness.mjs` (rng com semente — reprodutível). A lógica testada é importada direto de `index.html`.

## 1. Invariantes sob jogo aleatório
300 partidas aleatórias: 224 vitórias, 18 becos, 0 quebras de invariante.
  ✓ nenhuma invariante quebrada (contagem de peças, capacidade, conservação de cor)

## 2. Solver: o par é o mínimo exato
  ✓ estado resolvido tem par 0
  ✓ par confirmado descendo o gradiente em 6/6 tabuleiros (deu 6/6)

## 3. Gerador (200 tabuleiros, 6 cores)
Tempo: 2275 ms no total (11.4 ms/tabuleiro).
Par: mín 13, mediana 18, máx 21.
  ✓ nenhum tabuleiro insolúvel ou trivial servido
  ✓ geração média abaixo de 150 ms (não trava navegador)

## 4. Bot guloso: score de dificuldade em 120 tabuleiros
Score: Q10 0.13 · Q25 0.20 · mediana 0.37 · Q75 0.70 · Q90 0.90 · máx 1.24
(As FAIXAS do CONFIG foram cortadas nesses quantis.)
Tabuleiros acima do TETO_PAREDE (1.7) no gerador cru: 0/120 (0%) — é o que o diretor filtra.
Correlações no mesmo conjunto: score×par ρ=0.32, score×nós ρ=0.16 — o bot mede outra coisa além do tamanho da solução.
  ✓ o score discrimina (não é constante)

## 5. Dados humanos (5 sessões, 66 tabuleiros): o que prevê o tempo
tempo×par: ρ=0.56 (n=105)
tempo×nós do A*: ρ=0.39 (n=57)
tempo×(movimentos/par): ρ=-0.25 (n=105)

**Correção que este harness impôs:** a conclusão anterior do projeto ("o par não prevê a dificuldade sentida") estava errada no agregado — com 61 tabuleiros, o par carrega sinal claro (ρ≈0,56). Ela parecia verdadeira dentro de cada sessão porque o gerador servia par quase constante (14–21, moda 19): sem variação, nenhuma correlação aparece. O que CONTINUA verdade, e importa mais: as catástrofes escapam do par.
Os 2 piores tempos (182s e 149s) tinham par 19 e 19 — ambos ≤ Q75 dos pares (19). O papel do bot no diretor é este: detectar a armadilha de busca que o par não vê (Kristensen et al. 2024: simulado + humano > qualquer um sozinho). Validação direta bot×humano vem das próximas sessões: o resumo copiável agora carrega os layouts exatos servidos.
  ✓ par carrega sinal no agregado (ρ>0,3) — corrigindo a conclusão anterior do projeto
  ✓ as 2 piores lutas humanas tinham par comum (≤Q75) — a cauda é invisível ao par; daí o bot

## 5b. Validação direta — sessões com os tabuleiros exatos
  ✓ s8-A-9tab-diretor: cadeia serializar→desserializar→solver íntegra (9/9)
  ✓ s8-A-9tab-diretor: economia (streak + resgates) reproduz a sessão à moeda (175 = 175)
  ✓ s8-A-9tab-diretor: maior sequência reproduzida (9 = 9)
s8-A-9tab-diretor (n=9): score-bot(50 rod.) ρ=-0.03, par ρ=0.02, ordem ρ=0.68.
  ✓ s9-B-22tab-diretor: cadeia serializar→desserializar→solver íntegra (22/22)
  ✓ s9-B-22tab-diretor: economia (streak + resgates) reproduz a sessão à moeda (564 = 564)
  ✓ s9-B-22tab-diretor: maior sequência reproduzida (22 = 22)
s9-B-22tab-diretor (n=22): score-bot(50 rod.) ρ=0.15, par ρ=0.53, ordem ρ=-0.17.
  ✓ s10-16tab-recipiente: cadeia serializar→desserializar→solver íntegra (16/16)
  ✓ s10-16tab-recipiente: economia (streak + resgates) reproduz a sessão à moeda (273 = 273)
  ✓ s10-16tab-recipiente: maior sequência reproduzida (13 = 13)
s10-16tab-recipiente (n=16): score-bot(50 rod.) ρ=0.07, par ρ=0.51, ordem ρ=-0.00.

Leitura das duas primeiras sessões pós-diretor: dentro da faixa segura, o par segue o melhor preditor grosso do tempo (ρ 0,53 no jogador B, n=22); o score do bot prevê pouco o tempo (0,02 e 0,25) — o papel dele é o filtro da cauda, não a régua fina. E o estado da pessoa pesa: na jogadora A o tempo subiu com a ordem (fadiga, ρ 0,68); no jogador B caiu (aprendizado, ρ −0,17), com as pesadas despencando de 149s na primeira para ~47s nas últimas.
  ✓ s8: sem parede (pior 1.4× a mediana; era 4,4× pré-diretor)
  ✓ s9: o pico (149s) foi resolvido NO PAR e a sessão seguiu por mais 16 tabuleiros — desafio vencível ≠ buraco negro

## 6. Diretor: 3 sessões simuladas de 12 tabuleiros
leve: 15 servidos, score médio 0.18
media: 15 servidos, score médio 0.53
pesada: 6 servidos, score médio 0.90
  ✓ 36 tabuleiros servidos sem falha
  ✓ nenhum buraco negro servido (score sempre ≤ TETO_PAREDE)
  ✓ os 2 primeiros de cada sessão são sempre leves (aquecimento)
  ✓ picos pesados existem no ciclo (≥2 por sessão de 12)
  ✓ a onda é real: pesada mais difícil que leve em média

## 7. Economia: 400 sessões × 30 tabuleiros (jogador sintético)
Renda média: 25.4 moedas/tabuleiro · pior saldo visto: 14
Sequência infla a renda total em 82% (multiplicador máximo atingido: ×2.0)
  ✓ saldo nunca fica negativo
  ✓ renda média por tabuleiro na escala legível (6–30)
  ✓ streak limitado: infla a renda em menos de 90% mesmo pra jogador ótimo
  ✓ multiplicador nunca passa do teto

## 8. Regressões dos bugs achados em playtest
  ✓ bancarrota pré-1º tabuleiro: desfazer nunca cobra antes da primeira vitória
  ✓ 2 desfazer grátis por tabuleiro
  ✓ 3º desfazer no mesmo tabuleiro cobra
  ✓ prêmio ordena qualidade: solução exata paga mais que folgada
  ✓ solução exata paga IGUAL em qualquer par (a folga é proporcional)
  ✓ acima da tolerância, só a base — bônus nunca negativo
  ✓ serialização compacta dos layouts (deu "01--5555")
  ✓ tabuleiro com recipiente extra paga só a base, mesmo batendo o par de 8 tubos com folga
  ✓ sem recipiente, o prêmio segue a fórmula normal
  ✓ o resgate custa mais que um tabuleiro bom rende — é socorro, não rotina

## 9. Desafio do dia e dica ótima
  ✓ mesmo dia → mesmo tabuleiro, sempre (determinístico)
  ✓ dia diferente → tabuleiro diferente
  ✓ o desafio é jogável e nunca é parede (par 17, score 1.40)
  ✓ o desafio se identifica como desafio no registro
  ✓ seguir só dicas resolve exatamente no par em 3/3 tabuleiros (deu 3/3) — a dica é o movimento ótimo, não um palpite

---
**Todas as asserções passaram.**
