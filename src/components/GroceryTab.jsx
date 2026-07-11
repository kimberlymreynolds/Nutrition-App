import React, { useState } from 'react';
import { GROCERY_CATS } from '../data.js';

export default function GroceryTab({ state, actions, onToast }) {
  const [copyLabel, setCopyLabel] = useState('Copy grocery list');
  const grocery = state.grocery || {};
  const total = Object.keys(grocery).filter((k) => grocery[k]).length;

  function copyList() {
    const lines = [];
    GROCERY_CATS.forEach((c) => {
      const checked = c.items.filter((i) => grocery[i.id]);
      if (checked.length) {
        lines.push(c.cat.toUpperCase());
        checked.forEach((i) => lines.push('• ' + i.name));
        lines.push('');
      }
    });
    const text = lines.join('\n').trim();
    let done = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); done = true; } } catch (e) { /* ignore */ }
    setCopyLabel(done ? 'Copied ✓ — paste into Notes' : 'Copy failed — select & copy');
    setTimeout(() => setCopyLabel('Copy grocery list'), 2200);
    if (done && onToast) onToast('Grocery list copied');
  }

  return (
    <div>
      <div className="h2" style={{ marginTop: 4 }}>Grocery list</div>
      <p className="muted">Tap the things you need to buy, then tap Copy — you'll get a clean list grouped by section to paste into Notes or send to yourself.</p>

      <div style={{ display: 'flex', gap: 8, margin: '10px 0 14px' }}>
        <button className="btn" style={{ flex: 1, padding: 10, fontSize: 13 }} onClick={copyList}>{copyLabel}{total ? ' (' + total + ')' : ''}</button>
        <button className="btn ghost" style={{ flex: 'none', padding: '10px 14px', fontSize: 13 }} onClick={() => actions.clearGrocery()}>Clear</button>
      </div>

      {GROCERY_CATS.map((c) => (
        <div key={c.cat} className="gcat">
          <div className="cat">{c.cat}</div>
          {c.items.map((it) => {
            const on = !!grocery[it.id];
            return (
              <button key={it.id} className={'gitem' + (on ? ' on' : '')} onClick={() => actions.toggleGrocery(it.id)}>
                <span className="gbox">{on ? '✓' : ''}</span>
                <span className="gname">{it.name}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
