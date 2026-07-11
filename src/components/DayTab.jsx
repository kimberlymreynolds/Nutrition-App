import React from 'react';
import { computeTotals, scoreCounts } from '../logic.js';
import DayDetail from './DayDetail.jsx';

export default function DayTab({ state, day, actions, onToast }) {
  const tot = computeTotals(state, state.activeDate);
  const sc = scoreCounts(tot);

  function confirmClear() {
    const ok = window.confirm('Clear everything logged for this day?\n\nFood, mood, rituals, stack, gratitude, and notes will all be erased for this day. This can’t be undone.');
    if (ok && actions) {
      actions.clearDayAll();
      if (onToast) onToast('Day cleared');
    }
  }

  return (
    <div>
      {day.locked && <div className="banner lock">🔒 This day is logged and locked. Tap Unlock above to make changes.</div>}

      <div className="score" style={{ marginTop: 0 }}>
        <div className="card good"><div className="n">{sc.good}</div><div className="l">On target</div></div>
        <div className="card part"><div className="n">{sc.part}</div><div className="l">Partial</div></div>
        <div className="card gap"><div className="n">{sc.gap}</div><div className="l">Low</div></div>
        <div className="card over"><div className="n">{sc.over}</div><div className="l">Over limit</div></div>
      </div>

      <DayDetail state={state} ds={state.activeDate} hideHeader />

      <div style={{ marginTop: 26, textAlign: 'center' }}>
        <button className="clearday-btn" onClick={confirmClear}>Clear this day…</button>
      </div>
    </div>
  );
}
