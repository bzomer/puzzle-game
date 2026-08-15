// Harness de testes do protótipo — roda sem navegador e sem gente.
//
//   node testes/harness.mjs
//
// Importa a lógica pura direto do index.html (fonte única — se a lógica
// mudar lá, os testes veem a mudança; não existe cópia pra divergir), roda
// as baterias e escreve testes/evidencias.md. Sai com código ≠ 0 se
// qualquer asserção falhar, então serve de CI.

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const HTML = join(AQUI, "..", "index.html");

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
  medirDificuldade, faixaDoTabuleiro, gerarDirigido, premioFinal,
  tabuleiroDoDia, dicaOtima, hashDeTexto, rngDeSemente };`;
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
// Copiados dos resumos das sessões reais. j = jogador (A/B/C), t = segundos,
// m = movimentos da solução, d = despejos totais, nos = nós do A*, p = par.
// C = criança (7 anos) — perfil novo, não misturar com A/B nas médias.
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
  // a maior sessão até aqui — e a prova de campo da persistência: o banco
  // deste jogador começou nos 185 que a sessão anterior (outra pessoa, mesmo
  // aparelho) deixou salvos: 743 = 185 + 564 − 6.
  { id: "s9-B-22tab-diretor", j: "B",
    t: [29,45,31,70,57,149,68,57,58,39,65,53,35,47,41,44,42,39,30,52,48,47],
    m: [16,19,17,23,23,19,20,22,19,19,17,21,17,21,20,20,18,20,17,22,21,21],
    d: [16,19,17,23,23,24,20,22,19,19,17,21,17,21,20,20,18,20,17,22,21,21],
    nos: [505,273,700,3734,1095,1164,1513,3049,698,309,1317,801,439,1659,2397,1296,710,924,724,769,882,3063],
    p: [15,17,16,21,19,19,19,21,19,17,17,19,16,20,20,19,17,17,17,19,20,20],
    ganhoRelatado: 564, maiorSeq: 22,
    faixas: ["leve","leve","leve","media","media","pesada","leve","media","media","pesada","leve","media","media","pesada","leve","media","media","pesada","leve","media","media","pesada"],
    layouts: ("0011-3031-0341-5554-5224-2324-- 4352-4300-2245-3510-2310-5114-- " +
      "2050-4411-5041-2333-0214-5352-- 5021-4123-4323-4145-0501-0253-- " +
      "3135-5423-2001-0240-1425-3541-- 2410-2411-2333-0540-2345-5105-- " +
      "1212-2050-4510-4304-1335-5243-- 5031-4143-5025-2320-4152-4031-- " +
      "5534-1402-2341-1023-2145-0503-- 4112-2314-5134-3200-2055-3450-- " +
      "0042-5555-1413-0323-1434-2012-- 1213-2350-5140-4535-0244-3210-- " +
      "5504-1142-0312-2353-1500-2344-- 0154-4215-0514-2034-1523-3230-- " +
      "3520-3454-2512-3131-0544-0102-- 2351-4005-4252-3201-3314-4051-- " +
      "4433-1325-5112-4030-0150-4225-- 1413-1503-3440-0222-1535-4025-- " +
      "1435-1105-2040-4435-1032-3522-- 0354-1541-0410-3552-2403-3212-- " +
      "0520-1324-5314-5230-4115-0234-- 5230-5152-3040-1202-4143-1453--").split(" ") },
  // a sessão que decidiu o experimento da moeda: 3 recipientes comprados,
  // todos em tabuleiro de aperto, com ZERO desfazer — o recipiente substituiu
  // o desfazer como ferramenta de resgate. Produção segue 0/3 sessões.
  { id: "s10-16tab-recipiente", j: "?",
    t: [48,39,36,43,35,40,40,32,55,39,35,35,52,49,36,36],
    m: [23,19,20,21,20,20,20,15,21,21,17,19,22,21,20,19],
    d: [23,19,20,21,20,20,20,15,21,21,17,19,22,21,20,19],
    nos: [2000,938,1572,938,686,1221,710,214,609,1333,524,1434,1601,207,556,644],
    p: [20,18,19,19,19,19,19,13,19,20,15,18,18,18,18,17],
    ganhoRelatado: 273, maiorSeq: 13,
    recipientes: [0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0],
    faixas: ["leve","leve","leve","media","media","pesada","leve","media","media","pesada","leve","media","media","pesada","leve","media"],
    layouts: ("2534-0403-3153-1024-0515-4212-- 5114-0215-3132-2544-0430-3052-- " +
      "2055-5025-1011-4302-3424-3431-- 1323-5440-4053-4312-5121-0520-- " +
      "3023-1200-2410-5445-3215-1543-- 1034-1543-3150-1054-3254-0222-- " +
      "4221-4351-5130-4352-0300-2145-- 3200-4441-3555-4002-2132-5113-- " +
      "3013-2451-2300-5315-4204-1524-- 0534-0514-1223-1542-0423-3510-- " +
      "1533-1455-0040-3414-5223-2201-- 0351-2322-0004-5434-5312-1514-- " +
      "3001-0515-2043-2124-1554-3234-- 4453-4251-5310-0233-2154-0210-- " +
      "4121-2403-5503-0034-2151-5342-- 1245-0225-2053-1140-5334-4310--").split(" ") },
  // o primeiro jogador que não é adulto: sobrinho de 7 anos. 21 tabuleiros
  // (alvo 10) em 22:43, e a primeira sessão com o desafio do dia completado —
  // por isso ganhoRelatado inclui o bônus. Perfil oposto ao dos adultos: 30
  // desfazer (contra ~0) e 112% do par (contra ~105%), mas 20/21 dentro da
  // tolerância. O abandono do 22º foi com 0 movimento e 0 despejo em 18s,
  // num par 18 — a mediana da própria sessão. Não é parede: é hora de parar.
  { id: "s11-C-21tab-crianca", j: "C", idade: 7,
    t: [62,44,67,49,38,54,65,40,71,61,57,114,45,37,54,75,100,58,34,77,65],
    m: [20,19,19,18,18,21,21,21,24,18,20,25,21,17,23,23,23,20,19,22,21],
    d: [22,19,21,19,18,21,21,21,24,20,20,33,21,17,23,23,34,20,19,26,21],
    nos: [2219,835,1435,543,1217,1464,373,2812,2171,303,2643,881,3408,377,541,845,223,1489,345,666,1810],
    p: [19,18,18,17,18,18,18,20,20,17,19,18,21,16,20,18,18,18,19,18,19],
    ganhoRelatado: 388, maiorSeq: 11, bonusDesafio: true,
    gastoDesfazerRelatado: 34, saldoFinal: 380,
    scoresServidos: [0.11,0.26,0.30,0.63,0.63,1.15,0.26,0.50,0.46,0.98,0.41,
      0.41,0.35,0.86,0.09,0.76,0.41,0.83,0.14,0.85,0.80],
    recipientes: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    faixas: ["leve","leve","leve","media","media","pesada","leve","media","media","pesada","leve","media","media","pesada","leve","media","media","pesada","leve","media","desafio"],
    // o 22º, abandonado: par 18, 0 movimento, 0 despejo, 0 desfazer, 18 s
    abandonado: { par: 18, movimentos: 0, despejos: 0, desfazer: 0, t: 18 },
    layouts: ("0040-1505-4521-3441-3231-3252-- 0531-1324-4142-2533-5105-4002-- " +
      "5210-0210-4424-3351-1245-3530-- 1102-4215-2043-1330-5344-2550-- " +
      "1205-0054-5212-3314-3425-0341-- 3305-0340-5254-1304-1251-4122-- " +
      "5034-2014-0255-3342-3015-4121-- 1454-5131-2510-2420-5420-3033-- " +
      "2313-0302-5241-1014-5254-4530-- 3114-5502-0344-5311-0242-3205-- " +
      "0143-4244-5110-0201-3252-5353-- 2414-0533-1301-0232-4551-4520-- " +
      "4031-0505-3133-4252-4151-0242-- 4255-2441-3510-3224-1330-0510-- " +
      "2534-3154-0325-5201-3124-1040-- 0013-0524-1425-4543-3220-3151-- " +
      "0123-2013-1540-2344-4125-0355-- 2411-5153-0102-4452-2303-0354-- " +
      "1051-3215-0433-4523-5024-4102-- 2545-0425-3500-1324-1401-3312-- " +
      "4551-0403-1320-5321-0231-5424--").split(" ") },
];
const ADULTOS = HUMANOS.filter(h => h.j !== "C");

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
     "A lógica testada é importada direto de `index.html`.");

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
diga("\n## 5. Dados humanos adultos: o que prevê o tempo");
{
  // pooled, excluindo o 1º tabuleiro de cada sessão (aquecimento/aprendizado
  // contamina: os dois piores tempos da história foram 1ºs tabuleiros).
  // Só ADULTOS: a sessão da criança tem outra linha de base de velocidade e
  // misturar perfis inventaria correlação onde só há diferença entre pessoas.
  const T = [], P = [], FOLGA = [];
  const Tn = [], NOS = [];
  for (const h of ADULTOS) {
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
       `com ${T.length} tabuleiros, o par carrega sinal claro (ρ=${rPar.toFixed(2)}). Ela parecia ` +
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

// ═══ 5b. validação direta: sessões com layouts exatos ═══════════════════
diga("\n## 5b. Validação direta — sessões com os tabuleiros exatos");
{
  const desserializar = str => str.split("-").map(t => [...t].map(c => parseInt(c, 36)));
  for (const sx of HUMANOS.filter(h => h.layouts)) {
    const rng = rngCom(88);
    let paresOk = 0;
    const scores50 = [];
    sx.layouts.forEach((lay, i) => {
      const tubos = desserializar(lay);
      const pr = G.calcularPar(tubos).par;
      if (pr === sx.p[i]) paresOk++;
      scores50.push(G.medirDificuldade(tubos, pr, 50, rng).score);
    });
    afirma(paresOk === sx.layouts.length,
      `${sx.id}: cadeia serializar→desserializar→solver íntegra (${paresOk}/${sx.layouts.length})`);
    let ganho = 0, seq = 0, maxSeq = 0;
    sx.p.forEach((par, i) => {
      const vial = sx.recipientes ? sx.recipientes[i] === 1 : false;
      ganho += G.premioFinal(par, sx.m[i], seq, vial);
      if (vial) { /* resgate congela a sequência */ }
      else if (G.dentroDaTolerancia(par, sx.m[i])) {
        seq++; maxSeq = Math.max(maxSeq, seq);
      } else seq = 0;
    });
    // o desafio do dia paga por fora da fórmula do tabuleiro
    if (sx.bonusDesafio) ganho += G.CONFIG.DESAFIO_BONUS_MOEDAS;
    afirma(ganho === sx.ganhoRelatado,
      `${sx.id}: economia (streak + resgates${sx.bonusDesafio ? " + desafio" : ""}) reproduz a sessão à moeda (${ganho} = ${sx.ganhoRelatado})`);
    afirma(maxSeq === sx.maiorSeq, `${sx.id}: maior sequência reproduzida (${maxSeq} = ${sx.maiorSeq})`);
    const ordem = sx.t.map((_, i) => i + 1);
    diga(`${sx.id} (n=${sx.t.length}): score-bot(50 rod.) ρ=${spearman(scores50, sx.t).toFixed(2)}, ` +
         `par ρ=${spearman(sx.p, sx.t).toFixed(2)}, ` +
         `ordem ρ=${spearman(ordem, sx.t).toFixed(2)}.`);
  }
  diga("");
  diga("Leitura das quatro sessões pós-diretor: dentro da faixa segura, o par " +
       "segue o melhor preditor grosso do tempo entre os adultos (ρ 0,53 e " +
       "0,51, n=22 e 16); o score do bot prevê pouco o tempo em todas elas " +
       "(−0,03 a 0,18) — o papel dele é o filtro da cauda, não a régua fina. " +
       "E o estado da pessoa pesa mais que o tabuleiro: na jogadora A o tempo " +
       "subiu com a ordem (fadiga, ρ 0,68); no jogador B caiu (aprendizado, " +
       "ρ −0,17), com as pesadas despencando de 149s na primeira para ~47s nas " +
       "últimas. Na criança (s11) o par também desaba como preditor (ρ 0,09): " +
       "quem ainda está aprendendo a ler o tabuleiro não gasta o tempo onde a " +
       "busca é grande, e sim onde a leitura confunde — ver 5c.");
  // s8: sem parede
  const s8 = HUMANOS.find(h => h.id.startsWith("s8"));
  const pior8 = Math.max(...s8.t) / quantil(s8.t, 0.5);
  afirma(pior8 < 2, `s8: sem parede (pior ${pior8.toFixed(1)}× a mediana; era 4,4× pré-diretor)`);
  // s9: o pico de 149s NÃO foi parede — foi vencido NO PAR e a sessão seguiu
  const s9 = HUMANOS.find(h => h.id.startsWith("s9"));
  const iPior = s9.t.indexOf(Math.max(...s9.t));
  afirma(s9.m[iPior] === s9.p[iPior] && s9.t.length - iPior > 10,
    `s9: o pico (${s9.t[iPior]}s) foi resolvido NO PAR e a sessão seguiu por mais ${s9.t.length - 1 - iPior} tabuleiros — desafio vencível ≠ buraco negro`);
}

// ═══ 5c. o primeiro jogador criança (7 anos) ════════════════════════════
diga("\n## 5c. A sessão da criança (7 anos): o que ela testa que as outras não");
{
  const c = HUMANOS.find(h => h.j === "C");
  const n = c.t.length;
  const folga = c.m.map((m, i) => m / c.p[i]);
  const desfazer = c.d.map((d, i) => d - c.m[i]);
  const medAdulto = media(ADULTOS.flatMap(h => h.m.map((m, i) => m / h.p[i])));
  // só s3 e s4 são velhas demais pra ter despejo registrado — o desfazer
  // delas é desconhecido, não zero; a comparação exclui as duas.
  const comDespejo = ADULTOS.filter(h => h.d);
  diga(`n=${n} tabuleiros em 22:43 (alvo da sessão: ${G.CONFIG.TABULEIROS_ALVO}), ` +
       `mediana ${quantil(c.t, 0.5)}s. Precisão ${(media(folga) * 100).toFixed(0)}% do par ` +
       `contra ${(medAdulto * 100).toFixed(0)}% dos adultos; ` +
       `${soma(desfazer)} desfazer contra ${soma(comDespejo.map(h => soma(h.d) - soma(h.m)))} ` +
       `somados nas ${comDespejo.length} sessões adultas que registraram despejo.`);

  // 1. o desfazer: a conta fecha na moeda, e é a prova de campo do grátis×2
  let gasto = 0;
  desfazer.forEach((qtd, i) => {
    for (let k = 0; k < qtd; k++) gasto += G.custoDesfazerPuro(i, k);
  });
  const tabsComDesfazer = desfazer.filter(x => x > 0).length;
  const cobertosPeloGratis = desfazer.filter(x => x > 0 && x <= G.CONFIG.DESFAZER_GRATIS).length;
  afirma(gasto === c.gastoDesfazerRelatado,
    `desfazer: os ${soma(desfazer)} usos custam exatamente as ${c.gastoDesfazerRelatado} moedas relatadas — ` +
    "despejos−movimentos reconstrói o uso tabuleiro a tabuleiro, então a conta " +
    "fecha sem precisar acreditar no resumo");
  afirma(cobertosPeloGratis / tabsComDesfazer >= 0.5,
    `os 2 grátis por tabuleiro absorveram ${cobertosPeloGratis}/${tabsComDesfazer} dos tabuleiros com desfazer — ` +
    "a rajada custa, o tropeço não");
  afirma(gasto / c.ganhoRelatado < 0.15,
    `mesmo com ${soma(desfazer)} desfazer, o custo é ${(gasto / c.ganhoRelatado * 100).toFixed(0)}% do ganho ` +
    `(saldo final ${c.saldoFinal}) — o jogador impreciso não quebra`);

  // 2. a tolerância é o que salva a sequência de quem erra mais
  const dentroCom = tol => {
    let dentro = 0, seq = 0, max = 0;
    c.p.forEach((par, i) => {
      if (c.m[i] <= Math.round(par * tol)) { dentro++; seq++; max = Math.max(max, seq); }
      else seq = 0;
    });
    return { dentro, max };
  };
  const atual = dentroCom(G.CONFIG.TOLERANCIA_PAR), apertado = dentroCom(1.15);
  diga(`Tolerância ×${G.CONFIG.TOLERANCIA_PAR}: ${atual.dentro}/${n} dentro, maior sequência ${atual.max}. ` +
       `Com ×1,15 seria ${apertado.dentro}/${n} e sequência ${apertado.max}.`);
  afirma(atual.dentro >= n - 1 && atual.max > apertado.max,
    `a tolerância ×${G.CONFIG.TOLERANCIA_PAR} é o que mantém a sequência viva numa criança ` +
    `(${atual.max} contra ${apertado.max} se fosse ×1,15) — o gancho não exige precisão adulta`);

  // 3. o fim da sessão NÃO foi parede
  const pior = Math.max(...c.t) / quantil(c.t, 0.5);
  const parMediano = quantil(c.p, 0.5);
  afirma(pior < 2, `sem parede: pior tabuleiro ${pior.toFixed(2)}× a mediana (era 4,4× pré-diretor)`);
  afirma(c.abandonado.movimentos === 0 && c.abandonado.despejos === 0 &&
         c.abandonado.par <= parMediano,
    `o abandono foi saciedade, não parede: par ${c.abandonado.par} (mediana da sessão ${parMediano}), ` +
    `0 movimento e 0 despejo em ${c.abandonado.t}s — não houve luta perdida, houve fim de brincadeira`);

  // 4. nada que a máquina mede ordenou o tempo DELA
  const rs = {
    "score servido": spearman(c.scoresServidos, c.t),
    "par": spearman(c.p, c.t),
    "nós do A*": spearman(c.nos, c.t),
  };
  diga("Preditores contra o tempo dele: " +
       Object.entries(rs).map(([k, v]) => `${k} ρ=${v.toFixed(2)}`).join(", ") + ".");
  afirma(Object.values(rs).every(v => Math.abs(v) < 0.3),
    "nenhum preditor da máquina ordena o tempo deste jogador (|ρ|<0,3 em todos) — " +
    "o diretor filtra a cauda, não mede a experiência de uma criança");

  // 5. onde a dor realmente ficou: nos tabuleiros que a máquina achou fáceis
  const piores = desfazer.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, i]) => i);
  const scoreMediano = quantil(c.scoresServidos, 0.5);
  const nosMediano = quantil(c.nos, 0.5);
  piores.forEach(i => diga(`  tab ${i + 1}: ${c.t[i]}s, ${c.m[i]}/${c.p[i]} mov, ${desfazer[i]} desfazer, ` +
    `${c.nos[i]} nós, score ${c.scoresServidos[i]} (${c.faixas[i]}).`));
  afirma(piores.every(i => c.scoresServidos[i] <= scoreMediano && c.nos[i] <= nosMediano),
    "os 2 tabuleiros que mais doeram tinham score E nós do A* abaixo da mediana da sessão — " +
    "a dificuldade sentida por uma criança mora fora das duas réguas que o jogo tem");
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

  // (a produção passiva foi aposentada pelos dados: 0 compras em 3 sessões —
  //  os testes dela saíram junto; o gancho de volta agora é o desafio do dia,
  //  coberto na bateria 9)
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
  // recipiente extra: resgate paga só a base, sempre — sem exploit de folga
  afirma(G.premioFinal(18, 12, 8, true) === G.CONFIG.MOEDA_BASE,
    "tabuleiro com recipiente extra paga só a base, mesmo batendo o par de 8 tubos com folga");
  afirma(G.premioFinal(18, 18, 8, false) === G.premioDoTabuleiro(18, 18, 8),
    "sem recipiente, o prêmio segue a fórmula normal");
  afirma(G.CONFIG.CUSTO_RECIPIENTE > G.premioDoTabuleiro(18, 18, 0),
    "o resgate custa mais que um tabuleiro bom rende — é socorro, não rotina");
}

// ═══ 9. desafio do dia e dica ótima (o gancho de volta e o rewarded) ════
diga("\n## 9. Desafio do dia e dica ótima");
{
  // determinístico: o MESMO tabuleiro pro mundo inteiro no mesmo dia
  const d1 = G.tabuleiroDoDia("2026-08-13");
  const d1b = G.tabuleiroDoDia("2026-08-13");
  const d2 = G.tabuleiroDoDia("2026-08-14");
  afirma(G.serializar(d1.tubos) === G.serializar(d1b.tubos),
    "mesmo dia → mesmo tabuleiro, sempre (determinístico)");
  afirma(G.serializar(d1.tubos) !== G.serializar(d2.tubos),
    "dia diferente → tabuleiro diferente");
  afirma(d1.par > 0 && d1.dificuldade.score <= G.CONFIG.TETO_PAREDE,
    `o desafio é jogável e nunca é parede (par ${d1.par}, score ${d1.dificuldade.score.toFixed(2)})`);
  afirma(d1.faixa === "desafio", "o desafio se identifica como desafio no registro");

  // a dica é ótima DE VERDADE: seguir dicas resolve exatamente no par
  const rng = rngCom(99);
  let otimas = 0;
  for (let r = 0; r < 3; r++) {
    const { tubos, par } = G.gerar(rng);
    let T = tubos.map(t => t.slice()), passos = 0, ok = true;
    while (!G.resolvido(T) && passos <= par) {
      const mv = G.dicaOtima(T);
      if (!mv) { ok = false; break; }
      G.despejar(T, mv[0], mv[1]);
      passos++;
    }
    if (ok && G.resolvido(T) && passos === par) otimas++;
  }
  afirma(otimas === 3,
    `seguir só dicas resolve exatamente no par em 3/3 tabuleiros (deu ${otimas}/3) — a dica é o movimento ótimo, não um palpite`);
}

// ── fecho ───────────────────────────────────────────────────────────────
diga("\n---");
diga(falhas === 0
  ? "**Todas as asserções passaram.**"
  : `**${falhas} asserção(ões) FALHARAM.**`);
writeFileSync(join(AQUI, "evidencias.md"), R.join("\n") + "\n");
console.log(`\nRelatório escrito em testes/evidencias.md`);
process.exit(falhas === 0 ? 0 : 1);
