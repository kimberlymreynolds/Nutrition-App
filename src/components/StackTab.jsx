import React, { useState } from 'react';
import { STACK, DOSE } from '../data.js';

export default function StackTab({ state, day, actions, onToast }) {
  const [restoreText, setRestoreText] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy backup');
  const backup = JSON.stringify(state);
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

  function copy() {
    let done = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(backup); done = true; } } catch (e) { /* ignore */ }
    setCopyLabel(done ? 'Copied ✓ — paste into Notes' : 'Select the text & copy');
    setTimeout(() => setCopyLabel('Copy backup'), 2200);
  }
  function doRestore() {
    const v = restoreText.trim();
    if (!v) return;
    try {
      const s = JSON.parse(v);
      if (!s || typeof s !== 'object') throw new Error('bad');
      actions.restore(s);
      setRestoreText('');
      if (onToast) onToast('Restored ✓');
    } catch (e) {
      alert("That backup couldn't be read — make sure you pasted the whole thing.");
    }
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

      <div className="h2">Back up your log</div>
      <p className="muted">
        Auto-save can be wiped by some in-app browsers when you close the link. To keep your log safe, tap
        <b> Copy backup</b> and paste it into your Notes app. Paste it back here anytime to restore everything.
      </p>
      <textarea className="search" style={{ height: 80, fontSize: 10.5, fontFamily: 'monospace' }} readOnly value={backup} />
      <button className="btn" onClick={copy}>{copyLabel}</button>
      <div style={{ height: 10 }} />
      <textarea className="search" style={{ height: 70, fontSize: 10.5, fontFamily: 'monospace' }} placeholder="Paste a saved backup here…" value={restoreText} onChange={(e) => setRestoreText(e.target.value)} />
      <button className="btn ghost" onClick={doRestore}>Restore from backup</button>
    </div>
  );
}
