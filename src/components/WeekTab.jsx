import React from 'react';
import { MOOD_MAP, SLEEP_HRS } from '../data.js';
import { computeTotals, fmt, weekStartOf, shift, parseYmd, DOW, MONs, TODAY } from '../logic.js';

const SLEEP_MAP = Object.fromEntries(SLEEP_HRS.map((s) => [s.id, s.label]));
const SLEEP_W = { u4: 25, '4_6': 50, '6_8': 75, '8p': 100 };

export default function WeekTab({ state, actions, goTab }) {
  const start = weekStartOf(state.weekRef || state.activeDate);
  const days = [];
  for (let i = 0; i < 7; i++) days.push(shift(start, i));
  const s = parseYmd(days[0]), e = parseYmd(days[6]);

  const open = (ds) => { actions.setActiveDate(ds); if (goTab) goTab('day'); };

  return (
    <div>
      <div className="weekhead">
        <button onClick={() => actions.setWeekRef(shift(weekStartOf(state.weekRef || state.activeDate), -7))}>‹</button>
        <div className="mo">{MONs[s.getMonth()]} {s.getDate()} – {MONs[e.getMonth()]} {e.getDate()}</div>
        <button onClick={() => actions.setWeekRef(shift(weekStartOf(state.weekRef || state.activeDate), 7))}>›</button>
      </div>

      <div className="wstrip">
        {days.map((ds) => {
          const dt = parseYmd(ds);
          const r = state.days[ds];
          const has = r && r.today && r.today.length > 0;
          const mood = r && r.md ? MOOD_MAP[r.md] : null;
          const cls = ['wcell'];
          if (has && !mood) cls.push('has');
          if (ds === state.activeDate) cls.push('active');
          if (ds === TODAY) cls.push('today');
          const style = mood ? { background: mood.med, borderColor: mood.color } : undefined;
          const sleepW = r && r.sleepHrs ? SLEEP_W[r.sleepHrs] : null;
          return (
            <div className={cls.join(' ')} key={ds} style={style} onClick={() => open(ds)}>
              <span className="wd">{DOW[dt.getDay()][0]}</span>
              <span className="wn">{dt.getDate()}</span>
              {mood ? <span className="msq" style={{ background: mood.color }} /> : (has ? <span className="wdot" /> : null)}
              {sleepW ? <span className="slp" style={{ width: sleepW + '%' }} title="sleep" /> : null}
            </div>
          );
        })}
      </div>
      <p className="muted" style={{ margin: '2px 0 10px' }}>Tap a day to open everything for it — mood, food, stack, and vitamins.</p>

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
          <button className="daycard" key={ds} onClick={() => open(ds)}>
            <div className="dch">
              <span className="dcd">{DOW[dt.getDay()]} · {MONs[dt.getMonth()]} {dt.getDate()}{ds === TODAY ? ' · today' : ''}</span>
              {mood ? <span className="moodpill" style={{ background: mood.color }}>{mood.label}</span> : <span className="ovgo">Open ›</span>}
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
    </div>
  );
}
