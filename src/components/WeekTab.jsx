import React from 'react';
import { N, MOOD_MAP, SLEEP_HRS } from '../data.js';
import { computeTotals, statusOf, ketoStatus, fmt, weekStartOf, shift, parseYmd, DOW, MONs, TODAY } from '../logic.js';
import NutrientGroups from './NutrientGroups.jsx';

const SLEEP_MAP = Object.fromEntries(SLEEP_HRS.map((s) => [s.id, s.label]));

export default function WeekTab({ state, actions }) {
  const start = weekStartOf(state.weekRef || state.activeDate);
  const days = [];
  for (let i = 0; i < 7; i++) days.push(shift(start, i));
  const s = parseYmd(days[0]), e = parseYmd(days[6]);
  const tracked = days.filter((ds) => { const r = state.days[ds]; return r && ((r.today && r.today.length > 0) || r.locked); });
  const cnt = tracked.length;

  let avg = {}, met = {}, counts = { good: 0, part: 0, gap: 0, over: 0 };
  if (cnt > 0) {
    const sum = {}; N.forEach((n) => { sum[n.k] = 0; met[n.k] = 0; });
    tracked.forEach((ds) => {
      const t = computeTotals(state, ds);
      N.forEach((n) => { sum[n.k] += t[n.k]; if (n.t && t[n.k] >= n.t) met[n.k]++; });
    });
    N.forEach((n) => { avg[n.k] = sum[n.k] / cnt; });
    N.forEach((n) => {
      if (n.t == null) return;
      const st = statusOf(n, avg[n.k]);
      if (st === 'good') counts.good++; else if (st === 'part') counts.part++; else if (st === 'gap') counts.gap++; else if (st === 'over') counts.over++;
    });
  }

  return (
    <div>
      <div className="weekhead">
        <button onClick={() => actions.setWeekRef(shift(weekStartOf(state.weekRef || state.activeDate), -7))}>‹</button>
        <div className="mo">{MONs[s.getMonth()]} {s.getDate()} – {MONs[e.getMonth()]} {e.getDate()}</div>
        <button onClick={() => actions.setWeekRef(shift(weekStartOf(state.weekRef || state.activeDate), 7))}>›</button>
      </div>

      {days.map((ds) => {
        const dt = parseYmd(ds);
        const r = state.days[ds];
        const mood = r && r.md ? MOOD_MAP[r.md] : null;
        const has = r && r.today && r.today.length > 0;
        const rit = r && r.habits ? Object.keys(r.habits).filter((k) => r.habits[k]).length : 0;
        const supps = r && r.stack ? Object.keys(r.stack).filter((k) => r.stack[k]).length : 0;
        const tot = has ? computeTotals(state, ds) : null;
        const anything = has || mood || rit > 0 || supps > 0 || (r && r.note) || (r && r.sleepHrs);
        return (
          <button className="daycard" key={ds} onClick={() => actions.setActiveDate(ds)}>
            <div className="dch">
              <span className="dcd">{DOW[dt.getDay()]} · {MONs[dt.getMonth()]} {dt.getDate()}{ds === TODAY ? ' · today' : ''}</span>
              {mood && <span className="moodpill" style={{ background: mood.color }}>{mood.label}</span>}
            </div>
            {anything ? (
              <div className="dcbody">
                {has && <span className="ovtag">{fmt(tot.netcarbs || 0)}g net · {Math.round(tot.cal)} cal</span>}
                {rit > 0 && <span className="ovtag">{rit} ritual{rit > 1 ? 's' : ''}</span>}
                {supps > 0 && <span className="ovtag">{supps} supp{supps > 1 ? 's' : ''}</span>}
                {r && r.sleepHrs && <span className="ovtag">{SLEEP_MAP[r.sleepHrs]} sleep</span>}
              </div>
            ) : <div className="dcempty">nothing logged</div>}
            {r && r.note ? <div className="ovnote">“{r.note}”</div> : null}
          </button>
        );
      })}

      <div className="h2">Week nutrient averages</div>
      <div className="muted" style={{ margin: '0 0 4px' }}>
        {cnt === 0 ? 'No days logged this week yet.' : 'Averaged over ' + cnt + ' logged day' + (cnt > 1 ? 's' : '')}
      </div>
      {cnt > 0 && (
        <>
          <div className="score" style={{ marginTop: 8 }}>
            <div className="card good"><div className="n">{counts.good}</div><div className="l">On target</div></div>
            <div className="card part"><div className="n">{counts.part}</div><div className="l">Partial</div></div>
            <div className="card gap"><div className="n">{counts.gap}</div><div className="l">Low</div></div>
            <div className="card over"><div className="n">{counts.over}</div><div className="l">Over limit</div></div>
          </div>
          <NutrientGroups tot={avg} met={met} cnt={cnt} />
        </>
      )}
      <p className="disc">
        Each day shows your mood, food, rituals, supplements, and note together, so you can see the whole week at a glance.
        Averages count only days you logged food (or locked).
      </p>
    </div>
  );
}
