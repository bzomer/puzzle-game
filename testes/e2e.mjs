// E2E: joga o protótipo DE VERDADE num Chromium headless — clica nos tubos
// pelo caminho ótimo, assiste os anúncios simulados, faz o desafio do dia,
// recarrega a página pra provar a persistência, e mede o layout de celular.
//
//   npm i playwright-core   (uma vez; o Chromium vem do ambiente)
//   node testes/e2e.mjs
//
// Não roda no CI (o harness puro cobre a lógica lá); este cobre o DOM, os
// handlers e o fluxo inteiro de uma sessão — 40 asserções em 10 cenários.
import { chromium } from 'playwright-core';
import http from 'http';
import { readFileSync, existsSync } from 'fs';

const html = readFileSync(new URL("../index.html", import.meta.url));
const server = http.createServer((q, r) => { r.setHeader('content-type', 'text/html; charset=utf-8'); r.end(html); }).listen(8123);

let exe;
for (const c of ['/opt/pw-browsers/chromium/chrome-linux/chrome',
                 '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
                 '/opt/pw-browsers/chromium']) if (existsSync(c)) { exe = c; break; }
const browser = await chromium.launch({ executablePath: exe, args: ['--no-proxy-server', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
const erros = [];
page.on('pageerror', e => erros.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });

let falhas = 0;
const ok = (cond, rot) => { console.log((cond ? '  ✓ ' : '  ✗ FALHOU: ') + rot); if (!cond) falhas++; };
const ev = (fn, ...a) => page.evaluate(fn, ...a);

const clicarTubo = i => ev((i) => {
  const cv = document.getElementById('tela');
  const r = cv.getBoundingClientRect();
  const p = posTubo(i);
  cv.dispatchEvent(new PointerEvent('pointerdown', {
    clientX: r.left + p.x + 10, clientY: r.top + p.y + 10, bubbles: true }));
}, i);

async function resolver() {
  for (let passo = 0; passo < 80; passo++) {
    if (await ev(() => jogo.travado || resolvido(jogo.tubos))) break;
    const mv = await ev(() => dicaOtima(jogo.tubos));
    if (!mv) return false;
    await clicarTubo(mv[0]);
    await clicarTubo(mv[1]);
  }
  await page.waitForFunction('sessao.encerrada || !jogo.travado', { timeout: 5000 });
  return true;
}

await page.goto('http://localhost:8123/');
await page.waitForFunction('typeof jogo !== "undefined" && jogo.par > 0', { timeout: 15000 });

console.log('T1 carga');
ok(erros.length === 0, 'sem erro de página na carga' + (erros.length ? ' → ' + erros[0] : ''));
ok(await ev(() => saldo()) === 10, 'saldo inicial 10');
ok(await ev(() => document.getElementById('btDesafio').textContent.includes('Desafio do dia')), 'desafio do dia disponível');
ok(await ev(() => jogo.faixa) === 'leve', 'primeiro tabuleiro é leve (aquecimento)');

console.log('T2 resolve o 1º tabuleiro clicando (caminho ótimo)');
const ganhou0 = await ev(() => sessao.ganho);
ok(await resolver(), 'tabuleiro resolvido por cliques');
ok(await ev(() => sessao.completados) === 1, 'completados = 1');
ok(await ev(() => sessao.ganho) > ganhou0, 'prêmio pago');
ok(await ev(() => sessao.sequencia) === 1, 'sequência = 1 (resolvido no par)');

console.log('T3 dica via anúncio simulado');
await page.click('#btDica');
await page.waitForTimeout(700);
ok(await ev(() => document.getElementById('btDica').textContent.includes('anúncio')), 'contagem do anúncio aparece no botão');
await page.waitForFunction('sessao.anuncios === 1', { timeout: 8000 });
ok(await ev(() => sessao.dicas) === 1, 'dica registrada');
ok(await ev(() => Array.isArray(jogo.dica)), 'movimento ótimo destacado');
await page.waitForFunction('jogo.dica === null', { timeout: 6000 });
ok(true, 'destaque some sozinho após ~4s');

console.log('T4 recipiente por moedas + resgate paga só a base');
const saldoAntes = await ev(() => saldo());
ok(saldoAntes >= 25, 'saldo dá pro recipiente (' + saldoAntes + ')');
await page.click('#btRecipiente');
ok(await ev(() => jogo.tubos.length) === 9, '9º tubo entrou no tabuleiro');
ok(await ev(() => sessao.gastoRecipientes) === 25, 'cobrou 25');
await ev(() => { jogo.historico.length && undefined; });
const seqAntes = await ev(() => sessao.sequencia);
const ganhoAntes = await ev(() => sessao.ganho);
ok(await resolver(), 'tabuleiro com recipiente resolvido');
ok(await ev(() => sessao.ganho) - ganhoAntes === 3, 'resgate pagou só a base (3)');
ok(await ev(() => sessao.sequencia) === seqAntes, 'sequência congelada, não quebrada');

console.log('T5 recipiente via anúncio quando sem saldo');
await ev(() => { banco = -saldo() + banco; atualizarHud(); });   // zera o saldo
ok(await ev(() => saldo()) === 0, 'saldo forçado a 0 pro teste');
ok(await ev(() => document.getElementById('btRecipiente').textContent.includes('anúncio')), 'botão oferece o anúncio');
await page.click('#btRecipiente');
await page.waitForFunction('jogo.recipienteComprado === true', { timeout: 9000 });
ok(await ev(() => sessao.anuncios) === 2, 'anúncio contado (intenção de rewarded)');
ok(await ev(() => jogo.tubos.length) === 9, 'tubo entregue após o anúncio');
await resolver();

console.log('T6 desafio do dia');
const estoqueAntes = await ev(() => estoqueRecipientes);
const ganhoAntesD = await ev(() => sessao.ganho);
await page.click('#btDesafio');
ok(await ev(() => jogo.ehDesafio) === true, 'desafio em andamento');
ok(await ev(() => jogo.faixa) === 'desafio', 'registrado como desafio');
ok(await resolver(), 'desafio resolvido');
ok(await ev(() => estoqueRecipientes) === estoqueAntes + 1, '+1 recipiente no estoque');
ok(await ev(() => diaDesafioFeito === diaHoje()), 'dia marcado como feito');
ok(await ev(() => document.getElementById('btDesafio').textContent.includes('amanhã')), 'botão vira "amanhã tem outro"');
ok(await ev(() => sessao.ganho) - ganhoAntesD >= 25 + 3, 'bônus de moedas do desafio pago');

console.log('T7 persistência: recarrega a página');
const saldoFinal = await ev(() => saldo());
await page.reload();
await page.waitForFunction('typeof jogo !== "undefined" && jogo.par > 0', { timeout: 15000 });
ok(await ev(() => banco) === saldoFinal, 'banco sobreviveu ao reload (' + saldoFinal + ')');
ok(await ev(() => estoqueRecipientes) >= 1, 'estoque de recipientes sobreviveu');
ok(await ev(() => document.getElementById('btDesafio').textContent.includes('amanhã')), 'desafio segue marcado como feito hoje');

console.log('T8 recipiente do estoque é grátis');
const g0 = await ev(() => sessao.gastoRecipientes);
await page.click('#btRecipiente');
ok(await ev(() => jogo.tubos.length) === 9, 'tubo entrou');
ok(await ev(() => sessao.gastoRecipientes) === g0, 'não cobrou nada (veio do estoque)');
ok(await ev(() => estoqueRecipientes) === 0, 'estoque baixou');

console.log('T9 fim de sessão e zerar');
await page.click('#btParei');
ok(await ev(() => document.getElementById('telaFim').classList.contains('on')), 'tela de veredito abriu');
await page.click('#btZerar');
await page.waitForFunction('!sessao.encerrada && jogo.par > 0', { timeout: 15000 });
ok(await ev(() => localStorage.getItem('sort-idle-v1')) === null, 'save apagado');
ok(await ev(() => saldo()) === 10, 'economia zerada (saldo 10)');

console.log('T10 celular (390px): layout não estoura');
await page.setViewportSize({ width: 390, height: 780 });
await page.reload();
await page.waitForFunction('typeof jogo !== "undefined" && jogo.par > 0', { timeout: 15000 });
ok(await ev(() => document.documentElement.scrollWidth) <= 390, 'sem rolagem horizontal');
ok(await ev(() => document.getElementById('btDica').offsetHeight) > 0, 'botões da loja visíveis');
await page.screenshot({ path: 'mobile.png' });
await page.setViewportSize({ width: 900, height: 800 });
await page.reload();
await page.waitForFunction('jogo.par > 0');
await page.screenshot({ path: 'desktop.png' });

ok(erros.length === 0, 'nenhum erro de página em toda a bateria' + (erros.length ? ' → ' + erros.join(' | ') : ''));

console.log(falhas === 0 ? '\nE2E: TUDO PASSOU' : `\nE2E: ${falhas} FALHA(S)`);
await browser.close();
server.close();
process.exit(falhas ? 1 : 0);
