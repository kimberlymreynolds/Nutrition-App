import { N, STACK, ALLMAP, DOSE } from './data.js';

export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ymd(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function parseYmd(s) {
  const p = s.split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}
export function shift(s, delta) {
  const d = parseYmd(s);
  d.setDate(d.getDate() + delta);
  return ymd(d);
}
export function weekStartOf(ref) {
  const d = parseYmd(ref);
  d.setDate(d.getDate() - d.getDay());
  return ymd(d);
}
export const TODAY = ymd(new Date());

export function computeTotals(state, date) {
  const tot = {};
  N.forEach((n) => { tot[n.k] = 0; });
  const d = state.days[date];
  if (d && d.stack) {
    STACK.forEach((s) => {
      const caps = d.stack[s.id];
      if (!caps) return;
      const std = (DOSE[s.id] && DOSE[s.id].caps) || 1;
      const f = caps / std;
      for (const k in s.nut) tot[k] += s.nut[k] * f;
    });
  }
  if (d && d.today) {
    d.today.forEach((e) => {
      const it = ALLMAP[e.id];
      if (!it) return;
      for (const k in it.nut) tot[k] += it.nut[k] * e.qty;
    });
  }
  return tot;
}

function shortName(name) { return name.split(' — ')[0]; }

export function contributions(state, date, key) {
  const out = [];
  const d = state.days[date];
  if (d && d.stack) {
    STACK.forEach((s) => {
      const caps = d.stack[s.id];
      if (caps && s.nut[key]) {
        const std = (DOSE[s.id] && DOSE[s.id].caps) || 1;
        out.push({ name: shortName(s.name), qty: caps, amt: s.nut[key] * (caps / std), sup: true });
      }
    });
  }
  if (d && d.today) {
    d.today.forEach((e) => {
      const it = ALLMAP[e.id];
      if (it && it.nut[key]) out.push({ name: shortName(it.name), qty: e.qty, amt: it.nut[key] * e.qty, sup: false });
    });
  }
  out.sort((a, b) => b.amt - a.amt);
  return out;
}

export function statusOf(n, v) {
  if (n.ul && v > n.ul) return 'over';
  if (n.t == null) return 'none';
  if (v >= n.t) return 'good';
  if (v >= n.t * 0.5) return 'part';
  return 'gap';
}

export function fmt(v) {
  if (v >= 100) return Math.round(v);
  if (v >= 10) return Math.round(v * 10) / 10;
  return Math.round(v * 100) / 100;
}

export function scoreCounts(tot) {
  let good = 0, part = 0, gap = 0, over = 0;
  N.forEach((n) => {
    if (n.t == null) return;
    const s = statusOf(n, tot[n.k]);
    if (s === 'good') good++;
    else if (s === 'part') part++;
    else if (s === 'gap') gap++;
    else if (s === 'over') over++;
  });
  return { good, part, gap, over };
}

export function ketoStatus(netcarbs) {
  const nc = netcarbs || 0;
  if (nc < 20) return { cls: 'good', label: 'In keto range' };
  if (nc <= 50) return { cls: 'part', label: 'Borderline' };
  return { cls: 'over', label: 'Above keto range' };
}

export function naK(sodium, potassium) {
  const na = sodium || 0, k = potassium || 0;
  if (k <= 0) return { cls: 'none', value: '—', label: 'Sodium : Potassium' };
  const r = na / k;
  const cls = r <= 1.0 ? 'good' : r <= 2.0 ? 'part' : 'over';
  return { cls, value: (Math.round(r * 100) / 100).toFixed(2), label: 'Na : K · aim below 1.0' };
}

export const GROUPS = [...new Set(N.map((n) => n.grp))];

export function catLabel(c) {
  return {
    drink: 'Drinks', protein: 'Proteins & seafood', veg: 'Vegetables & greens',
    fruit: 'Fruit', fat: 'Fats & nuts', dairy: 'Dairy', extra: 'Extras', custom: 'Your custom items',
  }[c] || c;
}
