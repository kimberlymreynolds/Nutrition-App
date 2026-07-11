import React from 'react';
import { STACK, DOSE } from '../data.js';

export default function StackTab({ state, day, actions }) {
  const locked = day.locked;
  const stack = day.stack || {};
  const EXTRA = ['chromium', 'dake'];
  const basics = STACK.filter((s) => !EXTRA.includes(s.id));
  const extra = STACK.filter((s) => EXTRA.includes(s.id));

  function renderSupp(s) {
    const dose = DOSE[s.id] || { caps: 1, unit: 'unit' };
    const taken = stack[s.id] || 0;
    return (
      <div className="tog" key={s.id}>
        <div className="nm">
          {s.name}
          <small>{s.serving}{s.note ? ' · ' + s.note : ''} · usually {dose.caps} {dose.unit}</small>
        </div>
        <div className="stepper">
          <button onClick={() => actions.decStack(s.id)} disabled={locked || taken === 0}>−</button>
          <span className="q">{taken}×</span>
          <button onClick={() => actions.incStack(s.id)} disabled={locked}>＋</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {locked && <div className="banner lock">🔒 This day is locked — unlock it on the Day tab to change these.</div>}
      <div className="h2">Supplements taken today</div>
      <p className="muted">
        Log how many you actually took — the number is capsules/units, so if you take 1 instead of your usual 2, the
        nutrients count for just 1. Items marked “no charted nutrients” are part of your protocol but don't move the RDA numbers.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn" style={{ flex: 1, padding: 9, fontSize: 13 }} onClick={() => actions.takeUsualStack()}>Take my usual stack</button>
        <button className="btn ghost" style={{ flex: 1, padding: 9, fontSize: 13 }} onClick={() => actions.clearStack()}>Clear</button>
      </div>

      <div className="cat" style={{ marginTop: 4 }}>Basics</div>
      {basics.map(renderSupp)}
      <div className="cat">Extra credit</div>
      {extra.map(renderSupp)}
    </div>
  );
}
