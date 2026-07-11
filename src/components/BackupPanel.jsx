import React, { useState } from 'react';

export default function BackupPanel({ state, actions, onToast }) {
  const [restoreText, setRestoreText] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy backup');
  const backup = JSON.stringify(state);

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
      <div className="h2">Back up your log</div>
      <p className="muted">Your log saves on this device automatically. To keep an extra copy or move it to another device, tap <b>Copy backup</b> and paste it into your Notes app. Paste it back here anytime to restore everything.</p>
      <textarea className="search" style={{ height: 70, fontSize: 10.5, fontFamily: 'monospace' }} readOnly value={backup} />
      <button className="btn" onClick={copy}>{copyLabel}</button>
      <div style={{ height: 10 }} />
      <textarea className="search" style={{ height: 60, fontSize: 10.5, fontFamily: 'monospace' }} placeholder="Paste a saved backup here…" value={restoreText} onChange={(e) => setRestoreText(e.target.value)} />
      <button className="btn ghost" onClick={doRestore}>Restore from backup</button>
    </div>
  );
}
