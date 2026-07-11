import React from 'react';
import { MOOD_MAP, SLEEP_HRS, SLEEP_FELT, ENERGY_LEVELS, TANK_LEVELS, HABITS, STACK, ALLMAP } from '../data.js';
import { computeTotals, ketoStatus, fmt, contributions, parseYmd, DOW, MONs, TODAY } from '../logic.js';
import NutrientGroups from './NutrientGroups.jsx';

const SLEEP_MAP = Object.fromEntries(SLEEP_HRS.map((s) => [s.id, s.label]));
const ENERGY_MAP = Object.fromEntries(ENERGY_LEVELS.map((e) => [e.id, e.label]));
const TANK_MAP = Object.fromEntries(TANK_LEVELS.map((t) => [t.id, t.label]));
const HABIT_MAP = Object.fromEntries(HABITS.map((h) => [h.id, h.label]));
const SLEEPFELT_MAP = Object.fromEntries(SLEEP_FELT.map((f) => [f.id, f.label]));

function KetoBox({ tot }) {
  const keto = ketoStatus(tot.netcarbs);
  return (
    <div className="ketobox">
      <div className={'kb ' + keto.cls}><div className="kn">{fmt(tot.netcarbs || 0)}g</div><div className="kl">Net carbs · {keto.label}</div></div>
      <div className="kb"><div className="kn" style={{ color: 'var(--ink)' }}>{fmt(tot.carbs || 0)}g</div><div className="kl">Total carbs</div></div>
    </div>
  );
}

export default function DayDetail({ state, ds, hideHeader }) {
  const r = state.days[ds] || {};
  const tot = computeTotals(state, ds);
  const dt = parseYmd(ds);
  const mood = r.md ? MOOD_MAP[r.md] : null;
  const moodEve = r.mdEve ? MOOD_MAP[r.mdEve] : null;
  const sleepFelt = r.sleepFelt ? Object.keys(r.sleepFelt).filter((k) => r.sleepFelt[k]).map((k) => SLEEPFELT_MAP[k]) : [];
  const grat = (r.gratitude || []).filter((g) => g && g.trim());
  const foods = (r.today || []).map((e) => ({ it: ALLMAP[e.id], qty: e.qty })).filter((x) => x.it);
  const stackTaken = STACK.filter((s) => r.stack && r.stack[s.id]).map((s) => s.name + (r.stack[s.id] > 1 ? ' ×' + r.stack[s.id] : ''));
  const ritualsDone = HABITS.filter((h) => r.habits && r.habits[h.id]).map((h) => HABIT_MAP[h.id]);

  return (
    <div>
      {!hideHeader && <div className="h2" style={{ marginTop: 14 }}>{DOW[dt.getDay()]}, {MONs[dt.getMonth()]} {dt.getDate()}{ds === TODAY ? ' · today' : ''}</div>}

      <div className="detbox">
        <div className="detlabel">Mood</div>
        {mood && <span className="moodpill" style={{ background: mood.color }}>{mood.label}</span>}
        {moodEve && <span className="ovtag">→ {moodEve.label} by evening</span>}
        {r.energy && <span className="ovtag">{ENERGY_MAP[r.energy]} energy</span>}
        {r.tank && <span className="ovtag">tank: {TANK_MAP[r.tank]}</span>}
        {r.sleepHrs && <span className="ovtag">{SLEEP_MAP[r.sleepHrs]} sleep{sleepFelt.length ? ' · ' + sleepFelt.join(', ') : ''}</span>}
        {grat.length ? <div className="detlist" style={{ marginTop: 6 }}>Grateful: {grat.join(' · ')}</div> : null}
        {r.note ? <div className="ovnote">“{r.note}”</div> : null}
        {!(mood || moodEve || r.energy || r.tank || r.sleepHrs || grat.length || r.note) && <span className="muted">—</span>}
      </div>

      <div className="detbox">
        <div className="detlabel">On the plate · {Math.round(tot.cal)} cal</div>
        {foods.length ? (
          <div className="detfoods">
            {foods.map((f, i) => (
              <div className="dfrow" key={i}>
                <div className="nm">{f.it.name}<small>{f.it.serving || ''}</small></div>
                <span className="q">{f.qty}×</span>
              </div>
            ))}
          </div>
        ) : <span className="muted">—</span>}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12 }}>
          <KetoBox tot={tot} />
        </div>
      </div>

      <div className="detbox">
        <div className="detlabel">Stack</div>
        {stackTaken.length ? (
          <div className="detchips">{stackTaken.map((n, i) => <span className="dchip sup" key={i}>{n}</span>)}</div>
        ) : <span className="muted">—</span>}
      </div>

      <div className="detbox">
        <div className="detlabel">Rituals</div>
        {ritualsDone.length ? (
          <div className="detchips">{ritualsDone.map((n, i) => <span className="dchip rit" key={i}>{n}</span>)}</div>
        ) : <span className="muted">—</span>}
      </div>

      <div className="detlabel" style={{ margin: '4px 0 0' }}>Vitamins &amp; nutrients</div>
      <NutrientGroups tot={tot} contribFor={(k) => contributions(state, ds, k)} />
      <p className="disc">Under each nutrient are the foods that gave you it. General adult-female RDA/AI targets; upper limits where they exist. For your own awareness, not medical advice.</p>
    </div>
  );
}
