// Harness de testes do protótipo — roda sem navegador e sem gente.
//
//   node prototipos/sort-idle/testes/harness.mjs
//
// Importa a lógica pura direto do prototipo.html (fonte única — se a lógica
// mudar lá, os testes veem a mudança; não existe cópia pra divergir), roda
// as baterias e escreve testes/evidencias.md. Sai com código ≠ 0 se
// qualquer asserção falhar, então serve de CI.

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const HTML = join(AQUI, "..", "prototipo.html");

// ── carga da lógica pura ────────────────────────────────────────────────
const html = readFileSync(HTML, "utf-8");
const js = html.split("<script>")[1].split("</script>")[0];
const puro = js.split("FIM DA LÓGICA PURA")[0];
// o marcador está no meio de um comentário — corta no início dele
const corte = puro.lastIndexOf("/*");
const codigo = puro.slice(0, corte) + `
export { CONFIG, corrida, podeDespejar, despejar, resolvido, emprensado,
  heuristica, chave, calcularPar, distribuir, gerar, premioDoTabuleiro,
  custoDesfazerPuro, dentroDaTolerancia, serializar, jogadaDoBot,
  medirDificuldade, faixaDoTabuleiro, gerarDirigido, producaoAcumulada };`;
const G = await import("data:text/javascript," + encodeURIComponent(codigo));

// ── rng com semente (mulberry32): os números do relatório são reprodutíveis
function rngCom(semente) {
  let a = semente >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── dados humanos: as sessões de playtest, por tabuleiro ────────────────
// Copiados dos resumos das sessões reais. j = jogador (A/B), t = segundos,
// m = movimentos da solução, d = despejos totais, nos = nós do A*, p = par.
const HUMANOS = [
  { id: "s3-A-17tab", j: "A",
    t: [48,26,32,44,46,49,32,49,24,39,23,57,37,56,48,34,40],
    m: [20,17,19,18,17,20,21,21,16,21,15,22,20,22,21,18,23],
    p: [19,16,19,17,17,19,19,19,14,19,14,19,19,20,19,18,21] },
  { id: "s4-B-25tab", j: "B",
    t: [48,30,29,65,30,29,34,103,42,31,26,29,25,32,26,39,28,34,34,27,27,61,31,28,182],
    m: [20,17,18,18,21,18,20,21,23,19,16,16,18,19,18,20,19,21,19,19,22,20,18,21,19],
    p: [18,15,16,18,19,17,19,20,19,18,15,15,17,16,17,19,17,21,18,17,19,19,15,17,19] },
  { id: "s5-B-9tab", j: "B",
    t: [35,50,32,37,34,34,33,139,76],
    m: [17,17,17,20,18,21,19,18,20],
    d: [17,18,17,20,18,21,19,36,27],
    p: [16,16,16,20,17,19,18,17,19] },
  { id: "s6-A-5tab", j: "A",
    t: [58,35,52,24,35],
    m: [20,18,20,18,18],
    d: [22,18,21,18,18],
    nos: [866,923,1329,1125,538],
    p: [18,17,20,16,16] },
  { id: "s7-A-10tab", j: "A",
    t: [181,39,44,55,41,35,40,70,40,40],
    m: [20,16,18,22,20,20,21,20,17,19],
    d: [20,16,18,22,20,20,21,22,17,19],
    nos: [1495,209,1118,1772,1024,1271,2021,1421,628,1028],
    p: [19,14,17,19,18,19,20,19,17,18] },
  // primeira sessão pós-diretor — com os layouts exatos servidos
  { id: "s8-A-9tab-diretor", j: "A",
    t: [58,48,48,40,49,53,63,72,63],
    m: [22,20,20,18,19,22,21,19,22],
    d: [22,20,20,18,19,22,21,21,22],
    nos: [276,1300,1520,816,2177,1404,1943,462,1132],
    p: [19,19,19,17,19,20,20,18,18],
    ganhoRelatado: 175, maiorSeq: 9,
    faixas: ["leve","leve","leve","media","media","pesada","leve","media","media"],
    layouts: ("4325-1230-2035-0513-4451-2104-- 1245-0130-3005-1424-2514-3523-- " +
      "2323-0041-3510-2535-1425-4041-- 2513-1002-0112-4330-4554-4325-- " +
      "5350-3040-1250-5224-3441-1312-- 0432-0531-4315-2520-1243-0415-- " +
      "5245-3432-5304-3142-0510-0112-- 4510-0335-2254-3542-4013-2101-- " +
      "3241-5150-1313-5340-0524-4022--").split(" ") },
];

// ── utilidades ──────────────────────────────────────────────────────────
const soma = a => a.reduce((x, y) => x + y, 0);
const media = a => soma(a) / a.length;
const quantil = (a, q) => {
  const o = [...a].sort((x, y) => x - y);
  return o[Math.min(o.length - 1, Math.floor(q * o.length))];
};
function spearman(x, y) {
  const rank = a => {
    const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
    const r = Array(a.length);
    idx.forEach(([, i], k) => { r[i] = k + 1; });
    return r;
  };
  const rx = rank(x), ry = rank(y), n = x.length;
  const mx = media(rx), my = media(ry);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2; dy += (ry[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
}

let falhas = 0;
const R = [];   // linhas do relatório
const diga = l => { R.push(l); console.log(l); };
function afirma(ok, rotulo) {
  diga((ok ? "  ✓ " : "  ✗ FALHOU: ") + rotulo);
  if (!ok) falhas++;
}

diga("# Evidências — harness do protótipo sort-idle");
diga("");
diga("Gerado por `testes/harness.mjs` (rng com semente — reprodutível). " +
     "A lógica testada é importada direto de `prototipo.html`.");

// ═══ 1. invariantes sob jogo aleatório ══════════════════════════════════
diga("\n## 1. Invariantes sob jogo aleatório");
{
  const rng = rngCom(11);
  let quebras = 0, vitorias = 0, becos = 0;
  const N = 300;
  for (let r = 0; r < N; r++) {
    let { tubos } = G.gerar(rng);
    for (let passo = 0; passo < 250; passo++) {
      if (G.resolvido(tubos)) { vitorias++; break; }
      const legais = [];
      for (let i = 0; i < tubos.length; i++)
        for (let j = 0; j < tubos.length; j++)
          if (G.podeDespejar(tubos, i, j)) legais.push([i, j]);
      if (!legais.length) { becos++; break; }
      const [i, j] = legais[Math.floor(rng() * legais.length)];
      G.despejar(tubos, i, j);
      const todas = tubos.flat();
      if (todas.length !== G.CONFIG.CORES * G.CONFIG.CAPACIDADE) quebras++;
      for (let c = 0; c < G.CONFIG.CORES; c++)
        if (todas.filter(x => x === c).length !== G.CONFIG.CAPACIDADE) quebras++;
      if (tubos.some(t => t.length > G.CONFIG.CAPACIDADE)) quebras++;
      if (quebras) break;
    }
  }
  diga(`${N} partidas aleatórias: ${vitorias} vitórias, ${becos} becos, ${quebras} quebras de invariante.`);
  afirma(quebras === 0, "nenhuma invariante quebrada (contagem de peças, capacidade, conservação de cor)");
}

// ═══ 2. o par é o mínimo de verdade ═════════════════════════════════════
diga("\n## 2. Solver: o par é o mínimo exato");
{
  const rng = rngCom(22);
  const ok = [[0,0,0,0],[1,1,1,1],[2,2,2,2],[3,3,3,3],[4,4,4,4],[5,5,5,5],[],[]];
  afirma(G.resolvido(ok) && G.calcularPar(ok).par === 0, "estado resolvido tem par 0");
  let batidos = 0;
  for (let r = 0; r < 6; r++) {
    const { tubos, par } = G.gerar(rng);
    // desce o gradiente do solver: se cada passo reduz o par em exatamente 1,
    // o par declarado era alcançável e mínimo
    let T = tubos.map(t => t.slice()), passos = 0, falhou = false;
    while (!G.resolvido(T) && passos <= par + 1) {
      const alvo = G.calcularPar(T).par;
      let achou = false;
      for (let i = 0; i < T.length && !achou; i++)
        for (let j = 0; j < T.length && !achou; j++) {
          if (!G.podeDespejar(T, i, j)) continue;
          const C = T.map(t => t.slice());
          G.despejar(C, i, j);
          if (G.calcularPar(C).par === alvo - 1) { T = C; passos++; achou = true; }
        }
      if (!achou) { falhou = true; break; }
    }
    if (!falhou && passos === par) batidos++;
  }
  afirma(batidos === 6, `par confirmado descendo o gradiente em 6/6 tabuleiros (deu ${batidos}/6)`);
}

// ═══ 3. gerador: estatística de 200 tabuleiros ══════════════════════════
diga("\n## 3. Gerador (200 tabuleiros, 6 cores)");
let POOL = [];
{
  const rng = rngCom(33);
  const t0 = Date.now();
  for (let i = 0; i < 200; i++) POOL.push(G.gerar(rng));
  const dt = Date.now() - t0;
  const pares = POOL.map(b => b.par);
  diga(`Tempo: ${dt} ms no total (${(dt / 200).toFixed(1)} ms/tabuleiro).`);
  diga(`Par: mín ${Math.min(...pares)}, mediana ${quantil(pares, 0.5)}, máx ${Math.max(...pares)}.`);
  afirma(POOL.every(b => b.par > 0), "nenhum tabuleiro insolúvel ou trivial servido");
  afirma(dt / 200 < 150, "geração média abaixo de 150 ms (não trava navegador)");
}

// ═══ 4. bot: distribuição do score de dificuldade ═══════════════════════
diga("\n## 4. Bot guloso: score de dificuldade em 120 tabuleiros");
let SCORES = [];
{
  const rng = rngCom(44);
  for (const b of POOL.slice(0, 120))
    SCORES.push({ ...G.medirDificuldade(b.tubos, b.par, 12, rng), par: b.par, nos: b.nos });
  const s = SCORES.map(x => x.score);
  diga(`Score: Q10 ${quantil(s, .10).toFixed(2)} · Q25 ${quantil(s, .25).toFixed(2)} · ` +
       `mediana ${quantil(s, .5).toFixed(2)} · Q75 ${quantil(s, .75).toFixed(2)} · ` +
       `Q90 ${quantil(s, .90).toFixed(2)} · máx ${Math.max(...s).toFixed(2)}`);
  diga(`(As FAIXAS do CONFIG foram cortadas nesses quantis.)`);
  const acima = s.filter(x => x > G.CONFIG.TETO_PAREDE).length;
  diga(`Tabuleiros acima do TETO_PAREDE (${G.CONFIG.TETO_PAREDE}) no gerador cru: ` +
       `${acima}/120 (${(100 * acima / 120).toFixed(0)}%) — é o que o diretor filtra.`);
  diga(`Correlações no mesmo conjunto: score×par ρ=${spearman(s, SCORES.map(x => x.par)).toFixed(2)}, ` +
       `score×nós ρ=${spearman(s, SCORES.map(x => x.nos)).toFixed(2)} — ` +
       `o bot mede outra coisa além do tamanho da solução.`);
  afirma(quantil(s, .9) > quantil(s, .1), "o score discrimina (não é constante)");
}

// ═══ 5. dados humanos: o que prevê o tempo? ═════════════════════════════
diga("\n## 5. Dados humanos (5 sessões, 66 tabuleiros): o que prevê o tempo");
{
  // pooled, excluindo o 1º tabuleiro de cada sessão (aquecimento/aprendizado
  // contamina: os dois piores tempos da história foram 1ºs tabuleiros)
  const T = [], P = [], FOLGA = [];
  const Tn = [], NOS = [];
  for (const h of HUMANOS) {
    for (let i = 1; i < h.t.length; i++) {
      T.push(h.t[i]); P.push(h.p[i]); FOLGA.push(h.m[i] / h.p[i]);
      if (h.nos) { Tn.push(h.t[i]); NOS.push(h.nos[i]); }
    }
  }
  const rPar = spearman(T, P), rNos = spearman(Tn, NOS), rFolga = spearman(T, FOLGA);
  diga(`tempo×par: ρ=${rPar.toFixed(2)} (n=${T.length})`);
  diga(`tempo×nós do A*: ρ=${rNos.toFixed(2)} (n=${Tn.length})`);
  diga(`tempo×(movimentos/par): ρ=${rFolga.toFixed(2)} (n=${T.length})`);
  diga("");
  diga("**Correção que este harness impôs:** a conclusão anterior do projeto " +
       "(\"o par não prevê a dificuldade sentida\") estava errada no agregado — " +
       "com 61 tabuleiros, o par carrega sinal claro (ρ≈0,56). Ela parecia " +
       "verdadeira dentro de cada sessão porque o gerador servia par quase " +
       "constante (14–21, moda 19): sem variação, nenhuma correlação aparece. " +
       "O que CONTINUA verdade, e importa mais: as catástrofes escapam do par.");
  // as duas piores lutas da história (139 s e 182 s) tinham par comum —
  // o par prevê o grosso e erra exatamente a cauda, e a cauda é o churn
  const ord = T.map((t, i) => [t, P[i]]).sort((a, b) => b[0] - a[0]);
  const q75p = quantil(P, 0.75);
  const paredesComParComum = ord.slice(0, 2).every(([, par]) => par <= q75p);
  diga(`Os 2 piores tempos (${ord[0][0]}s e ${ord[1][0]}s) tinham par ` +
       `${ord[0][1]} e ${ord[1][1]} — ambos ≤ Q75 dos pares (${q75p}). ` +
       "O papel do bot no diretor é este: detectar a armadilha de busca que o " +
       "par não vê (Kristensen et al. 2024: simulado + humano > qualquer um " +
       "sozinho). Validação direta bot×humano vem das próximas sessões: o " +
       "resumo copiável agora carrega os layouts exatos servidos.");
  afirma(rPar > 0.3, "par carrega sinal no agregado (ρ>0,3) — corrigindo a conclusão anterior do projeto");
  afirma(paredesComParComum, "as 2 piores lutas humanas tinham par comum (≤Q75) — a cauda é invisível ao par; daí o bot");
}

// ═══ 5b. validação direta: sessão com layouts exatos ════════════════════
diga("\n## 5b. Validação direta — sessão 8, os 9 tabuleiros exatos");
{
  const s8 = HUMANOS.find(h => h.layouts);
  const desserializar = str => str.split("-").map(t => [...t].map(c => parseInt(c, 36)));
  const rng = rngCom(88);
  let paresOk = 0;
  const scores50 = [];
  s8.layouts.forEach((lay, i) => {
    const tubos = desserializar(lay);
    const pr = G.calcularPar(tubos).par;
    if (pr === s8.p[i]) paresOk++;
    scores50.push(G.medirDificuldade(tubos, pr, 50, rng).score);
  });
  afirma(paresOk === s8.layouts.length,
    `cadeia serializar→desserializar→solver íntegra: par bate em ${paresOk}/${s8.layouts.length}`);
  let ganho = 0, seq = 0;
  s8.p.forEach((par, i) => {
    ganho += G.premioDoTabuleiro(par, s8.m[i], seq);
    if (G.dentroDaTolerancia(par, s8.m[i])) seq++; else seq = 0;
  });
  afirma(ganho === s8.ganhoRelatado,
    `economia com streak reproduz a sessão real à moeda: ${ganho} = ${s8.ganhoRelatado}`);
  afirma(seq === s8.maiorSeq, `sequência reproduzida: ${seq} = ${s8.maiorSeq}`);
  const ordem = s8.t.map((_, i) => i + 1);
  diga(`Correlações com o tempo humano nos tabuleiros exatos (n=9): ` +
       `score-bot(50 rod.) ρ=${spearman(scores50, s8.t).toFixed(2)}, ` +
       `par ρ=${spearman(s8.p, s8.t).toFixed(2)}, ` +
       `nós ρ=${spearman(s8.nos, s8.t).toFixed(2)}, ` +
       `ORDEM ρ=${spearman(ordem, s8.t).toFixed(2)}.`);
  diga("Leitura honesta: dentro da faixa segura que o diretor serve, nenhuma " +
       "métrica de dificuldade previu o tempo desta jogadora — o que previu " +
       "foi a ordem (fadiga/atenção ao longo da sessão). O valor demonstrado " +
       "do diretor está na CAUDA: pior tabuleiro a 1,4× a mediana, contra " +
       "4,4× e 4,0× nas sessões pré-diretor. n=1 sessão; acumula nas próximas.");
  const pior = Math.max(...s8.t) / quantil(s8.t, 0.5);
  afirma(pior < 2, `sem parede na primeira sessão pós-diretor (pior ${pior.toFixed(1)}× a mediana, era 4,4× antes)`);
}

// ═══ 6. diretor de dificuldade ══════════════════════════════════════════
diga("\n## 6. Diretor: 3 sessões simuladas de 12 tabuleiros");
{
  const rng = rngCom(66);
  let servidos = 0, paredes = 0, aquecimentoOk = true, pesadasServidas = 0;
  const porFaixa = { leve: [], media: [], pesada: [] };
  for (let sessao = 0; sessao < 3; sessao++) {
    for (let idx = 0; idx < 12; idx++) {
      const b = G.gerarDirigido(idx, rng);
      servidos++;
      const score = b.dificuldade.score;
      porFaixa[b.faixa].push(score);
      if (score > G.CONFIG.TETO_PAREDE) paredes++;
      if (idx < 2 && b.faixa !== "leve") aquecimentoOk = false;
      if (b.faixa === "pesada") pesadasServidas++;
    }
  }
  for (const f of ["leve", "media", "pesada"])
    diga(`${f}: ${porFaixa[f].length} servidos, score médio ${media(porFaixa[f]).toFixed(2)}`);
  afirma(servidos === 36, "36 tabuleiros servidos sem falha");
  afirma(paredes === 0, "nenhum buraco negro servido (score sempre ≤ TETO_PAREDE)");
  afirma(aquecimentoOk, "os 2 primeiros de cada sessão são sempre leves (aquecimento)");
  afirma(pesadasServidas >= 6, "picos pesados existem no ciclo (≥2 por sessão de 12)");
  afirma(media(porFaixa.pesada) > media(porFaixa.leve),
    "a onda é real: pesada mais difícil que leve em média");
}

// ═══ 7. economia: 400 sessões simuladas ═════════════════════════════════
diga("\n## 7. Economia: 400 sessões × 30 tabuleiros (jogador sintético)");
{
  const rng = rngCom(77);
  // jogador sintético calibrado nas sessões reais: precisão 105–115% do par,
  // desfazer raro no jogo normal + rajada em tabuleiro-parede
  const normal = () => {
    const u = 1 - rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  let piorSaldo = Infinity, somaRenda = 0, somaTab = 0, maxMult = 0;
  let rendasSemStreak = 0, rendasComStreak = 0;
  for (let sess = 0; sess < 400; sess++) {
    let saldo = G.CONFIG.MOEDA_INICIAL, seq = 0, completados = 0;
    for (let tab = 0; tab < 30; tab++) {
      const b = POOL[Math.floor(rng() * POOL.length)];
      const razao = Math.max(1, 1.08 + 0.05 * normal());
      const mov = Math.round(b.par * razao);
      // desfazer: ~0,3/tabuleiro normal; 6% dos tabuleiros são luta (rajada)
      let undos = rng() < 0.26 ? 1 : 0;
      if (rng() < 0.06) undos += 4 + Math.floor(rng() * 10);
      for (let u = 0; u < undos; u++) {
        const custo = G.custoDesfazerPuro(completados, u);
        if (saldo >= custo) saldo -= custo;
      }
      const premio = G.premioDoTabuleiro(b.par, mov, seq);
      const semStreak = G.premioDoTabuleiro(b.par, mov, 0);
      rendasComStreak += premio; rendasSemStreak += semStreak;
      maxMult = Math.max(maxMult, premio / semStreak);
      saldo += premio; somaRenda += premio; somaTab++;
      if (G.dentroDaTolerancia(b.par, mov)) seq++; else seq = 0;
      completados++;
      piorSaldo = Math.min(piorSaldo, saldo);
    }
  }
  const rendaMedia = somaRenda / somaTab;
  const inflacao = rendasComStreak / rendasSemStreak;
  diga(`Renda média: ${rendaMedia.toFixed(1)} moedas/tabuleiro · pior saldo visto: ${piorSaldo}`);
  diga(`Sequência infla a renda total em ${((inflacao - 1) * 100).toFixed(0)}% ` +
       `(multiplicador máximo atingido: ×${maxMult.toFixed(1)})`);
  afirma(piorSaldo >= 0, "saldo nunca fica negativo");
  afirma(rendaMedia >= 6 && rendaMedia <= 30, "renda média por tabuleiro na escala legível (6–30)");
  afirma(inflacao < 1.9, "streak limitado: infla a renda em menos de 90% mesmo pra jogador ótimo");
  afirma(maxMult <= G.CONFIG.SEQUENCIA_MAX + 1e-9, "multiplicador nunca passa do teto");

  // produção: a curva de retorno tem que PIORAR com o nível
  const payback = n => Math.round(G.CONFIG.CUSTO_MELHORIA *
    Math.pow(G.CONFIG.CUSTO_CRESCIMENTO, n - 1)) /
    (n * G.CONFIG.PRODUCAO_POR_HORA * G.CONFIG.TETO_OFFLINE_HORAS);
  diga(`Payback (ausências de 8 h até pagar o nível): ` +
       [1, 2, 3, 4, 5].map(n => `n${n}=${payback(n).toFixed(1)}`).join(" · "));
  afirma(payback(5) > payback(1), "curva de retorno da produção piora no fim (teto natural)");
  afirma(payback(2) < payback(1), "o nível 2 rende MELHOR que o 1 — gancho deliberado da segunda compra");
  afirma(payback(3) < payback(4) && payback(4) < payback(5), "do nível 2 em diante o retorno só piora (monótono)");
  const passiva8h = 3 * G.CONFIG.PRODUCAO_POR_HORA * G.CONFIG.TETO_OFFLINE_HORAS;
  afirma(passiva8h < rendaMedia * 10,
    `passiva não supera o jogo: 8 h ausente no nível 3 (${passiva8h}) < 10 tabuleiros jogados (~${Math.round(rendaMedia * 10)})`);
}

// ═══ 8. regressões pontuais ═════════════════════════════════════════════
diga("\n## 8. Regressões dos bugs achados em playtest");
{
  afirma(G.custoDesfazerPuro(0, 99) === 0,
    "bancarrota pré-1º tabuleiro: desfazer nunca cobra antes da primeira vitória");
  afirma(G.custoDesfazerPuro(3, 0) === 0 && G.custoDesfazerPuro(3, 1) === 0,
    "2 desfazer grátis por tabuleiro");
  afirma(G.custoDesfazerPuro(3, 2) === G.CONFIG.CUSTO_DESFAZER,
    "3º desfazer no mesmo tabuleiro cobra");
  const exato = G.premioDoTabuleiro(18, 18, 0), folgado = G.premioDoTabuleiro(18, 24, 0);
  afirma(exato > folgado, "prêmio ordena qualidade: solução exata paga mais que folgada");
  afirma(G.premioDoTabuleiro(14, 14, 0) === G.premioDoTabuleiro(21, 21, 0),
    "solução exata paga IGUAL em qualquer par (a folga é proporcional)");
  afirma(G.premioDoTabuleiro(18, 40, 0) === G.CONFIG.MOEDA_BASE,
    "acima da tolerância, só a base — bônus nunca negativo");
  const enc = G.serializar([[0, 1], [], [5, 5, 5, 5]]);
  afirma(enc === "01--5555", `serialização compacta dos layouts (deu "${enc}")`);
}

// ═══ 9. persistência: a conta da volta ══════════════════════════════════
diga("\n## 9. Produção acumulada (a conta que traz a pessoa de volta)");
{
  const H = 3600000;
  afirma(G.producaoAcumulada(3, 24 * H) === 72,
    "teto de 8 h respeitado: 24 h fora no nível 3 rendem o mesmo que 8 h (72)");
  afirma(G.producaoAcumulada(0, 8 * H) === 0, "nível 0 nunca produz — a compra se ensina sozinha");
  afirma(G.producaoAcumulada(2, 0.5 * H) === 3, "meia hora no nível 2 rende 3 (produção é contínua, não por dia)");
  afirma(G.producaoAcumulada(1, 8 * H) === 24, "bate com a tabela da proposta: nível 1, 8 h → 24");
  afirma(G.producaoAcumulada(1, -5000) === 0, "relógio que anda pra trás não rende (clock skew)");
}

// ── fecho ───────────────────────────────────────────────────────────────
diga("\n---");
diga(falhas === 0
  ? "**Todas as asserções passaram.**"
  : `**${falhas} asserção(ões) FALHARAM.**`);
writeFileSync(join(AQUI, "evidencias.md"), R.join("\n") + "\n");
console.log(`\nRelatório escrito em testes/evidencias.md`);
process.exit(falhas === 0 ? 0 : 1);
