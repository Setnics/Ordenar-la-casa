// ── Estado global ──
const state = {
  proyecto: '', cliente: '', monto: '', margenObj: '', margenEsp: '',
  horas: '', saturacion: '',
  // CT blocks: H, B, D, G, E, A, C, F
  H_base: null, H_paralelo: false, H_extra: false, H_abandono: false,
  B_base: null, B_futuro: false,
  D_base: null, D_dep: false,
  G_base: null, G_dispersa: false,
  E_base: null, E_multi: false, E_volatil: false,
  A_electro: false, A_civil: false, A_servicios: false, A_criticos: false, A_bms: false,
  C_base: null, C_validacion: false,
  F_base: null,
  // Probabilidad
  R: null, C: null, E: null,
};

const PARAMS = {
  alpha: 1, horasDisp: 160, montoMax: 2000000,
  umbralBID: 0.20, umbralPOSTERGAR: 0.08,
  satFactors: { Baja: 1.00, Media: 0.75, Alta: 0.45, Crítica: 0.20 },
  margenPorCT: { 1: 1.00, 2: 0.95, 3: 0.85, 4: 0.75, 5: 0.60 },
  To: { 1: 6, 2: 12, 3: 24, 4: 48, 5: 92 },
  capM: 1.30,
};

// ── Navegación ──
let currentStep = 1;
function goTo(step) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step-btn').forEach((b, i) => {
    b.classList.remove('active', 'done');
    if (i + 1 < step) b.classList.add('done');
    if (i + 1 === step) b.classList.add('active');
  });
  document.getElementById('sec' + step).classList.add('active');
  currentStep = step;
  if (step === 4) calcularResultados();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goTo = goTo;

// ── Calcular CT ──
function calcCT() {
  const Hs = { base: { null: 0, '0': 0, '10': 10, '20': 20 }[state.H_base] ?? 0, max: 50 };
  const Hq = Hs.base + (state.H_paralelo ? 10 : 0) + (state.H_extra ? 10 : 0) + (state.H_abandono ? 10 : 0);
  const H = Math.min(Hq, Hs.max) / Hs.max;

  const Bs = { null: 0, '0': 0, '10': 10, '25': 25 }[state.B_base] ?? 0;
  const Bq = Bs + (state.B_futuro ? 10 : 0);
  const B = Math.min(Bq, 35) / 35;

  const Ds = { null: 5, '5': 5, '10': 10, '15': 15 }[state.D_base] ?? 5;
  const Dq = Ds + (state.D_dep ? 5 : 0);
  const D = Math.min(Dq, 20) / 20;

  const Gs = { null: 0, '0': 0, '10': 10, '15': 15 }[state.G_base] ?? 0;
  const Gq = Gs + (state.G_dispersa ? 10 : 0);
  const G = Math.min(Gq, 25) / 25;

  const Es = { null: 0, '0': 0, '5': 5, '10': 10 }[state.E_base] ?? 0;
  const Eq = Es + (state.E_multi ? 5 : 0) + (state.E_volatil ? 10 : 0);
  const E = Math.min(Eq, 25) / 25;

  const discs = [state.A_electro, state.A_civil, state.A_servicios, state.A_criticos, state.A_bms];
  const nDisc = discs.filter(Boolean).length;
  const discPts = (state.A_electro ? 35 : 0) + (state.A_civil ? 35 : 0) + (state.A_servicios ? 10 : 0) + (state.A_criticos ? 10 : 0) + (state.A_bms ? 10 : 0);
  const interaccion = nDisc <= 1 ? 0 : nDisc === 2 ? 5 : nDisc === 3 ? 10 : nDisc === 4 ? 15 : 20;
  const A = Math.min(discPts + interaccion, 120) / 120;

  const Cs = { null: 0, '0': 0, '10': 10, '15': 15, '25': 25 }[state.C_base] ?? 0;
  const Cq = Cs + (state.C_validacion ? 10 : 0);
  const Cv = Math.min(Cq, 35) / 35;

  const Fs = { null: 0, '0': 0, '5': 5, '10': 10, '15': 15 }[state.F_base] ?? 0;
  const Fv = Math.min(Fs, 15) / 15;

  const pesos = { H: 25, B: 20, D: 15, G: 12, E: 10, A: 8, C: 7, F: 3 };
  const scores = { H, B, D, G, E, A, C: Cv, F: Fv };
  const CT = H * 25 + B * 20 + D * 15 + G * 12 + E * 10 + A * 8 + Cv * 7 + Fv * 3;

  return { CT, scores, pesos };
}

function ctDiscreto(ct) {
  if (ct < 20) return 1;
  if (ct < 40) return 2;
  if (ct < 60) return 3;
  if (ct < 80) return 4;
  return 5;
}

// ── Calcular FC ──
function calcFC() {
  const horas = parseFloat(state.horas);
  if (!isNaN(horas) && state.horas !== '') {
    const fc = Math.exp(-PARAMS.alpha * (horas / PARAMS.horasDisp));
    return { fc, modo: 'horas' };
  }
  if (state.saturacion && PARAMS.satFactors[state.saturacion] !== undefined) {
    return { fc: PARAMS.satFactors[state.saturacion], modo: 'saturacion' };
  }
  return { fc: null, modo: 'falta' };
}

// ── Calcular todos los resultados ──
function calcularResultados() {
  const { CT, scores, pesos } = calcCT();
  const ctD = ctDiscreto(CT);
  const To = PARAMS.To[ctD];

  // P
  const Rv = { Excelente: 1.00, Buena: 0.85, Intermedia: 0.65, Desconocido: 0.50, Mala: 0.30 };
  const Cv = { 'Único oferente': 1.00, 'Licitación privada': 0.60, 'Licitación pública': 0.35, 'Estudio de mercado': 0.20 };
  const Ev = { Alta: 1.00, Media: 0.75, Baja: 0.50, Nula: 0.30 };
  const P = (state.R && state.C && state.E) ? (Rv[state.R] ?? 0) * (Cv[state.C] ?? 0) * (Ev[state.E] ?? 0) : null;

  // I
  const monto = parseFloat(state.monto);
  const I = (!isNaN(monto) && monto > 0) ? Math.min(monto / PARAMS.montoMax, 1) : null;

  // M
  const mEsp = parseFloat(state.margenEsp);
  const mObj = parseFloat(state.margenObj);
  let M = null;
  if (!isNaN(mEsp) && state.margenEsp !== '' && !isNaN(mObj) && mObj > 0) {
    M = Math.min(mEsp / mObj, PARAMS.capM);
  } else {
    M = PARAMS.margenPorCT[ctD];
  }

  // FC
  const { fc: FC, modo } = calcFC();

  // VEC
  const VEC = (P !== null && I !== null && M !== null && FC !== null)
    ? P * I * M * FC : null;

  // IP
  const IP = (VEC !== null && To > 0) ? VEC / To : null;

  // Decisión
  let decision = 'nodata';
  if (VEC !== null) {
    if (VEC >= PARAMS.umbralBID) decision = 'bid';
    else if (VEC >= PARAMS.umbralPOSTERGAR) decision = 'postpone';
    else decision = 'nobid';
  }

  // Matriz CT × VEC
  let matrizDecision = null;
  let matrizConflicto = false;
  if (VEC !== null) {
    const vecCat = VEC < 0.08 ? 'bajo' : VEC < 0.20 ? 'medio' : 'alto';
    const tabla = {
      1: { bajo: 'POSTERGAR', medio: 'BID', alto: 'BID' },
      2: { bajo: 'POSTERGAR', medio: 'BID', alto: 'BID' },
      3: { bajo: 'NO-BID', medio: 'POSTERGAR', alto: 'BID' },
      4: { bajo: 'NO-BID', medio: 'NO-BID', alto: 'POSTERGAR' },
      5: { bajo: 'NO-BID', medio: 'NO-BID', alto: 'NO-BID' },
    };
    matrizDecision = tabla[ctD][vecCat];
    const decMap = { bid: 'BID', postpone: 'POSTERGAR', nobid: 'NO-BID' };
    matrizConflicto = (decMap[decision] !== matrizDecision);
  }

  renderResultados({ CT, ctD, To, P, I, M, FC, VEC, IP, decision, modo, scores, pesos, matrizDecision, matrizConflicto });
}

// ── Render resultados ──
function renderResultados(r) {
  const fmt = (v, d = 4) => v !== null ? v.toFixed(d) : '—';
  const fmtPct = (v) => v !== null ? (v * 100).toFixed(1) + '%' : '—';

  setText('res-ct-cont', r.CT.toFixed(2));
  setText('res-ct-disc', r.ctD);
  setText('res-to', r.To + ' h');
  setText('res-p', fmtPct(r.P));
  setText('res-i', fmt(r.I, 3));
  setText('res-m', fmt(r.M, 3));
  setText('res-fc', fmt(r.FC, 4));
  setText('res-vec', r.VEC !== null ? r.VEC.toFixed(4) : '—');
  setText('res-ip', r.IP !== null ? r.IP.toFixed(4) : '—');

  // Modo capacidad
  const modeEl = document.getElementById('res-mode');
  modeEl.className = 'mode-badge';
  if (r.modo === 'horas') { modeEl.classList.add('hours'); modeEl.textContent = '⏱ Capacidad por horas'; }
  else if (r.modo === 'saturacion') { modeEl.classList.add('sat'); modeEl.textContent = '📊 Capacidad por saturación'; }
  else { modeEl.classList.add('miss'); modeEl.textContent = '⚠ Falta dato de capacidad'; }

  // Decisión
  const dc = document.getElementById('decision-card');
  const dt = document.getElementById('decision-text');
  const di = document.getElementById('decision-icon');
  const dd = document.getElementById('decision-desc');
  dc.className = 'decision-card ' + r.decision;
  const map = {
    bid: { text: 'BID', icon: '✅', desc: 'El proyecto es viable y prioritario para cotizar.' },
    postpone: { text: 'POSTERGAR', icon: '⏳', desc: 'El VEC es moderado. Se puede cotizar más adelante o con revisión.' },
    nobid: { text: 'NO-BID', icon: '🚫', desc: 'El VEC no justifica el esfuerzo de cotización en este momento.' },
    nodata: { text: 'SIN DATOS', icon: '❓', desc: 'Complete todos los parámetros para obtener una decisión.' },
  };
  dt.textContent = map[r.decision].text;
  di.textContent = map[r.decision].icon;
  dd.textContent = map[r.decision].desc;

  // Alerta falta dato
  const alertEl = document.getElementById('alert-missing');
  if (r.modo === 'falta' || r.P === null || r.I === null) {
    alertEl.classList.add('visible');
    let msgs = [];
    if (r.P === null) msgs.push('probabilidad (P)');
    if (r.I === null) msgs.push('monto del proyecto');
    if (r.modo === 'falta') msgs.push('capacidad (horas o saturación)');
    alertEl.innerHTML = '⚠ Faltan datos: ' + msgs.join(', ') + '.';
  } else {
    alertEl.classList.remove('visible');
  }

  // Matriz
  const matEl = document.getElementById('matriz-alert');
  if (r.matrizDecision !== null) {
    if (!r.matrizConflicto) {
      matEl.className = 'matrix-alert ok';
      matEl.innerHTML = '✔ Matriz CT×VEC confirma: <strong>' + r.matrizDecision + '</strong>. Sin conflicto.';
    } else {
      matEl.className = 'matrix-alert warn';
      matEl.innerHTML = '⚡ Conflicto: VEC indica <strong>' + map[r.decision]?.text + '</strong> pero Matriz CT×VEC sugiere <strong>' + r.matrizDecision + '</strong>. Revisión estratégica recomendada.';
    }
  } else {
    matEl.className = 'matrix-alert error';
    matEl.innerHTML = '— Complete los datos para evaluar la Matriz CT×VEC.';
  }

  // Gauge CT
  drawGauge(r.CT);

  // Barras CT por bloque
  const bloques = ['H', 'B', 'D', 'G', 'E', 'A', 'C', 'F'];
  bloques.forEach(b => {
    const fill = document.getElementById('bar-' + b);
    const score = document.getElementById('score-' + b);
    if (fill) fill.style.width = (r.scores[b] * 100).toFixed(1) + '%';
    if (score) score.textContent = (r.scores[b] * 100).toFixed(0) + '%';
  });
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Gauge SVG ──
function drawGauge(ct) {
  const svg = document.getElementById('gauge-svg');
  if (!svg) return;
  const pct = Math.min(ct / 100, 1);
  const r = 70, cx = 90, cy = 90;
  const startAngle = -210, endAngle = 30;
  const range = endAngle - startAngle;
  const angle = startAngle + pct * range;

  function polar(deg, radius) {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  }

  function arc(from, to, rad, color) {
    const [x1, y1] = polar(from, rad);
    const [x2, y2] = polar(to, rad);
    const large = (to - from > 180) ? 1 : 0;
    return `<path d="M${x1},${y1} A${rad},${rad} 0 ${large} 1 ${x2},${y2}" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  }

  const color = ct < 40 ? '#00e676' : ct < 70 ? '#ffd600' : '#ff1744';
  svg.innerHTML =
    arc(startAngle, endAngle, r, 'rgba(255,255,255,0.06)') +
    arc(startAngle, angle, r, color) +
    `<text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${color}">${ct.toFixed(1)}</text>` +
    `<text x="${cx}" y="${cy + 26}" text-anchor="middle" font-size="11" fill="#7a8aaa">CT Continuo</text>`;
}

// ── Saturación: deshabilitar si hay horas ──
function updateSatMode() {
  const horasVal = document.getElementById('inp-horas').value.trim();
  const satWrap = document.getElementById('sat-wrap');
  const satNotice = document.getElementById('sat-notice');
  if (horasVal !== '' && !isNaN(parseFloat(horasVal))) {
    satWrap.classList.add('sat-disabled');
    satNotice.classList.add('visible');
  } else {
    satWrap.classList.remove('sat-disabled');
    satNotice.classList.remove('visible');
  }
}

// ── Bind inputs Paso 1 ──
function bindStep1() {
  const binds = [
    ['inp-proyecto', 'proyecto'], ['inp-cliente', 'cliente'],
    ['inp-monto', 'monto'], ['inp-margen-obj', 'margenObj'],
    ['inp-margen-esp', 'margenEsp'], ['inp-horas', 'horas'],
  ];
  binds.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => { state[key] = el.value; updateSatMode(); });
  });
  const sat = document.getElementById('inp-sat');
  if (sat) sat.addEventListener('change', () => { state.saturacion = sat.value; });
}

// ── CT Block helpers ──
function bindExclusive(groupName, stateKey, buttons) {
  buttons.forEach(({ id, value }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      state[stateKey] = state[stateKey] === value ? null : value;
      buttons.forEach(b => {
        const btn = document.getElementById(b.id);
        if (btn) btn.classList.toggle('selected', state[stateKey] === b.value);
      });
    });
  });
}

function bindCheck(id, stateKey) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => {
    state[stateKey] = !state[stateKey];
    el.classList.toggle('checked', state[stateKey]);
    el.querySelector('.check-box').textContent = state[stateKey] ? '✓' : '';
  });
}

function bindStep2() {
  // H
  bindExclusive('H', 'H_base', [
    { id: 'H-std', value: '0' }, { id: 'H-red', value: '10' }, { id: 'H-crit', value: '20' }
  ]);
  bindCheck('H-paralelo', 'H_paralelo');
  bindCheck('H-extra', 'H_extra');
  bindCheck('H-abandono', 'H_abandono');
  // B
  bindExclusive('B', 'B_base', [
    { id: 'B-claro', value: '0' }, { id: 'B-parcial', value: '10' }, { id: 'B-ambiguo', value: '25' }
  ]);
  bindCheck('B-futuro', 'B_futuro');
  // D
  bindExclusive('D', 'D_base', [
    { id: 'D-pocas', value: '5' }, { id: 'D-varias', value: '10' }, { id: 'D-muchas', value: '15' }
  ]);
  bindCheck('D-dep', 'D_dep');
  // G
  bindExclusive('G', 'G_base', [
    { id: 'G-claras', value: '0' }, { id: 'G-parciales', value: '10' }, { id: 'G-sin', value: '15' }
  ]);
  bindCheck('G-dispersa', 'G_dispersa');
  // E
  bindExclusive('E', 'E_base', [
    { id: 'E-sin', value: '0' }, { id: 'E-uno', value: '5' }, { id: 'E-varios', value: '10' }
  ]);
  bindCheck('E-multi', 'E_multi');
  bindCheck('E-volatil', 'E_volatil');
  // A (acumulativo)
  ['electro', 'civil', 'servicios', 'criticos', 'bms'].forEach(k => {
    bindCheck('A-' + k, 'A_' + k);
  });
  // C
  bindExclusive('C', 'C_base', [
    { id: 'C-sin', value: '0' }, { id: 'C-basica', value: '10' },
    { id: 'C-detallada', value: '15' }, { id: 'C-adhoc', value: '25' }
  ]);
  bindCheck('C-validacion', 'C_validacion');
  // F
  bindExclusive('F', 'F_base', [
    { id: 'F-sin', value: '0' }, { id: 'F-std', value: '5' },
    { id: 'F-esp', value: '10' }, { id: 'F-compleja', value: '15' }
  ]);
}

// ── Bind Paso 3 (Probabilidad) ──
function bindStep3() {
  const pickers = [
    { group: 'R', key: 'R', opts: ['Excelente','Buena','Intermedia','Desconocido','Mala'] },
    { group: 'Comp', key: 'C', opts: ['Único oferente','Licitación privada','Licitación pública','Estudio de mercado'] },
    { group: 'Exp', key: 'E', opts: ['Alta','Media','Baja','Nula'] },
  ];
  pickers.forEach(({ group, key, opts }) => {
    opts.forEach(opt => {
      const id = 'pick-' + group + '-' + opt.replace(/\s+/g, '_');
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        state[key] = state[key] === opt ? null : opt;
        opts.forEach(o => {
          const btn = document.getElementById('pick-' + group + '-' + o.replace(/\s+/g, '_'));
          if (btn) btn.classList.toggle('selected', state[key] === o);
        });
      });
    });
  });
}

function resetAll() {
  if (!confirm('¿Reiniciar toda la evaluación?')) return;
  Object.keys(state).forEach(k => {
    if (typeof state[k] === 'boolean') state[k] = false;
    else state[k] = k.endsWith('_base') || k === 'R' || k === 'C' || k === 'E' ? null : '';
  });
  document.querySelectorAll('.opt-btn.selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.check-item.checked').forEach(el => {
    el.classList.remove('checked');
    const box = el.querySelector('.check-box');
    if (box) box.textContent = '';
  });
  document.querySelectorAll('.pick-card.selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('input,select').forEach(el => { el.value = ''; });
  goTo(1);
}
window.resetAll = resetAll;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  bindStep1();
  bindStep2();
  bindStep3();
  goTo(1);
});
