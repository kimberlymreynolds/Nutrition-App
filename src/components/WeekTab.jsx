import React from 'react';
import { N, MOOD_MAP } from '../data.js';
import { computeTotals, statusOf, weekStartOf, shift, parseYmd, ymd, DOW, MONs, TODAY } from '../logic.js';
import NutrientGroups from './NutrientGroups.jsx';

const SLEEP_W = { u4: 25, '4_6': 50, '6_8': 75, '8p': 100 };

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
            <div className={cls.join(' ')} key={ds} style={style} onClick={() => actions.setActiveDate(ds)}>
              <span className="wd">{DOW[dt.getDay()][0]}</span>
              <span className="wn">{dt.getDate()}</span>
              {mood ? <span className="msq" style={{ background: mood.color }} /> : (has ? <span className="wdot" /> : null)}
              {sleepW ? <span className="slp" style={{ width: sleepW + '%' }} title="sleep" /> : null}
            </div>
          );
        })}
      </div>
      <div className="muted" style={{ margin: '6px 0 2px' }}>
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
        Averages count only days you actually logged food (or locked), so empty days don't drag the numbers down.
        “Met” shows how many of those days hit the target — that's your consistency.
      </p>
    </div>
  );
}
