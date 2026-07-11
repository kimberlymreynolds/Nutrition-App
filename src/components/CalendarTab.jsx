import React, { useState } from 'react';
import { MOOD_MAP, SLEEP_HRS } from '../data.js';
import { MON, MONs, DOW, TODAY, weekStartOf, shift, parseYmd } from '../logic.js';
import DayDetail from './DayDetail.jsx';
import BackupPanel from './BackupPanel.jsx';

const SLEEP_W = { u4: 25, '4_6': 50, '6_8': 75, '8p': 100 };
const dsOf = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

function WeekView({ state, actions }) {
  const start = weekStartOf(state.weekRef || state.activeDate);
  const days = []; for (let i = 0; i < 7; i++) days.push(shift(start, i));
  const s = parseYmd(days[0]), e = parseYmd(days[6]);
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
              {sleepW ? <span className="slp" style={{ width: sleepW + '%' }} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ state, actions }) {
  const { calYear, calMonth } = state;
  const first = new Date(calYear, calMonth, 1);
  const startDow = first.getDay();
  const dim = new Date(calYear, calMonth + 1, 0).getDate();
  function shiftMonth(delta) { let m = calMonth + delta, y = calYear; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } actions.setCal(y, m); }
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(<div className="cell empty" key={'e' + i} />);
  for (let day = 1; day <= dim; day++) {
    const ds = dsOf(calYear, calMonth, day);
    const r = state.days[ds];
    const has = r && r.today && r.today.length > 0;
    const mood = r && r.md ? MOOD_MAP[r.md] : null;
    const cls = ['cell'];
    if (has && !mood) cls.push('has');
    if (ds === state.activeDate) cls.push('active');
    if (ds === TODAY) cls.push('today');
    const style = mood ? { background: mood.med, borderColor: mood.color } : undefined;
    cells.push(
      <div className={cls.join(' ')} key={ds} style={style} onClick={() => actions.setActiveDate(ds)}>
        {day}
        {r && r.locked ? <span className="lk">🔒</span> : null}
        {has ? <span className="dot" /> : null}
      </div>
    );
  }
  return (
    <div>
      <div className="calhead">
        <button onClick={() => shiftMonth(-1)}>‹</button>
        <div className="mo">{MON[calMonth]} {calYear}</div>
        <button onClick={() => shiftMonth(1)}>›</button>
      </div>
      <div className="calgrid">
        {DOW.map((d) => <div className="dow" key={d}>{d[0]}</div>)}
        {cells}
      </div>
    </div>
  );
}

function YearView({ state, actions }) {
  const year = state.calYear;
  return (
    <div>
      <div className="calhead">
        <button onClick={() => actions.setCal(year - 1, state.calMonth)}>‹</button>
        <div className="mo">{year}</div>
        <button onClick={() => actions.setCal(year + 1, state.calMonth)}>›</button>
      </div>
      {MON.map((mName, m) => {
        const dim = new Date(year, m + 1, 0).getDate();
        const cells = [];
        for (let d = 1; d <= dim; d++) {
          const ds = dsOf(year, m, d);
          const r = state.days[ds];
          const mood = r && r.md ? MOOD_MAP[r.md] : null;
          const has = r && ((r.today && r.today.length > 0) || r.md);
          const bg = mood ? mood.color : (has ? '#CBC5DE' : '#EDEBF3');
          const active = ds === state.activeDate;
          cells.push(<span key={d} className={'ycell' + (active ? ' sel' : '')} style={{ background: bg }} title={ds} onClick={() => actions.setActiveDate(ds)} />);
        }
        return <div className="yrow" key={m}><span className="ymon">{MONs[m]}</span><div className="ycells">{cells}</div></div>;
      })}
    </div>
  );
}

export default function CalendarTab({ state, actions, onToast }) {
  const [view, setView] = useState('week');
  return (
    <div>
      <div className="seg" style={{ marginBottom: 12 }}>
        <button className={'segbtn' + (view === 'week' ? ' sel' : '')} onClick={() => setView('week')}>Week</button>
        <button className={'segbtn' + (view === 'month' ? ' sel' : '')} onClick={() => setView('month')}>Month</button>
        <button className={'segbtn' + (view === 'year' ? ' sel' : '')} onClick={() => setView('year')}>Year</button>
      </div>

      {view === 'week' && <WeekView state={state} actions={actions} />}
      {view === 'month' && <MonthView state={state} actions={actions} />}
      {view === 'year' && <YearView state={state} actions={actions} />}

      <p className="muted" style={{ margin: '4px 0 0' }}>Tap any day to see everything for it below.</p>
      <DayDetail state={state} ds={state.activeDate} />

      <div style={{ marginTop: 22, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
        <BackupPanel state={state} actions={actions} onToast={onToast} />
      </div>
    </div>
  );
}
