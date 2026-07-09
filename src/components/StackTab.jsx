import React, { useState } from 'react';
import { STACK } from '../data.js';

export default function StackTab({ state, actions, onToast }) {
  const [restoreText, setRestoreText] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy backup');
  const backup = JSON.stringify(state);

  function copy() {
    let done = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(backup); done = true; }
    } catch (e) { /* ignore */ }
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
      <div className="h2">Your daily supplements</div>
      <p className="muted">
        Everything starts <b>off</b>. Turn on the ones you actually take — they'll then count toward every day
        automatically. Items marked “no charted nutrients” are part of your protocol but don't move the RDA numbers.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn" style={{ flex: 1, padding: 9, fontSize: 13 }} onClick={() => actions.allStackOn(STACK.map((s) => s.id))}>Turn all on</button>
        <button className="btn ghost" style={{ flex: 1, padding: 9, fontSize: 13 }} onClick={() => actions.allStackOff()}>Turn all off</button>
      </div>
      <div>
        {STACK.map((s) => {
          const on = state.stackOn.includes(s.id);
          return (
            <div className="tog" key={s.id}>
              <div className="nm">{s.name}<small>{s.serving}{s.note ? ' · ' + s.note : ''}</small></div>
              <button className={'switch ' + (on ? 'on' : '')} aria-label={'Toggle ' + s.name} onClick={() => actions.toggleStack(s.id)}><b /></button>
            </div>
          );
        })}
      </div>

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
