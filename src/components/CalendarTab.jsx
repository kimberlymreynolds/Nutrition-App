import React from 'react';
import { MON, DOW, TODAY } from '../logic.js';

export default function CalendarTab({ state, actions }) {
  const { calYear, calMonth } = state;
  const first = new Date(calYear, calMonth, 1);
  const start = first.getDay();
  const dim = new Date(calYear, calMonth + 1, 0).getDate();

  function shiftMonth(delta) {
    let m = calMonth + delta, y = calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    actions.setCal(y, m);
  }

  const cells = [];
  for (let i = 0; i < start; i++) cells.push(<div className="cell empty" key={'e' + i} />);
  for (let day = 1; day <= dim; day++) {
    const ds = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const rec = state.days[ds];
    const has = rec && rec.today && rec.today.length > 0;
    const cls = ['cell'];
    if (has) cls.push('has');
    if (ds === state.activeDate) cls.push('active');
    if (ds === TODAY) cls.push('today');
    cells.push(
      <div className={cls.join(' ')} key={ds} onClick={() => actions.setActiveDate(ds)}>
        {day}
        {rec && rec.locked ? <span className="lk">🔒</span> : null}
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
      <div className="callegend">
        <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--good-bg)', border: '1px solid #bfe0cd', borderRadius: 3 }} /> logged food &nbsp;·&nbsp;
        🔒 locked &nbsp;·&nbsp; <b style={{ color: 'var(--primary)' }}>bold outline</b> = today. Tap any day to open it.
      </div>
    </div>
  );
}
