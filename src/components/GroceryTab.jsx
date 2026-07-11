import React, { useState } from 'react';
import { GROCERY_CATS } from '../data.js';

export default function GroceryTab({ state, actions, onToast }) {
  const [view, setView] = useState('pantry');
  const [q, setQ] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy grocery list');
  const grocery = state.grocery || {};
  const total = Object.keys(grocery).filter((k) => grocery[k]).length;
  const query = q.trim().toLowerCase();

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
      <div className="seg" style={{ marginTop: 4, marginBottom: 12 }}>
        <button className={'segbtn' + (view === 'pantry' ? ' sel' : '')} onClick={() => setView('pantry')}>Pantry</button>
        <button className={'segbtn' + (view === 'list' ? ' sel' : '')} onClick={() => setView('list')}>Grocery list{total ? ' (' + total + ')' : ''}</button>
      </div>

      {view === 'pantry' ? (
        <>
          <div className="h2">Pantry</div>
          <p className="muted">Everything you keep on hand. Tap anything you need to buy — it moves to your <b>Grocery list</b>.</p>
          <input className="search" placeholder="Search the pantry…" value={q} onChange={(e) => setQ(e.target.value)} />
          {GROCERY_CATS.map((c) => {
            const list = query ? c.items.filter((it) => it.name.toLowerCase().includes(query)) : c.items;
            if (!list.length) return null;
            return (
              <div key={c.cat} className="gcat">
                <div className="cat">{c.cat}</div>
                {list.map((it) => {
                  const on = !!grocery[it.id];
                  return (
                    <div className="tog" key={it.id}>
                      <div className="nm">{it.name}</div>
                      <button className={'switch ' + (on ? 'on' : '')} aria-label={it.name} onClick={() => actions.toggleGrocery(it.id)}><b /></button>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {query && !GROCERY_CATS.some((c) => c.items.some((it) => it.name.toLowerCase().includes(query))) && (
            <p className="muted">No matches for “{q}”.</p>
          )}
        </>
      ) : (
        <>
          <div className="h2">Grocery list</div>
          {total === 0 ? (
            <p className="muted">Nothing to buy yet. Go to <b>Pantry</b> and tap what you need.</p>
          ) : (
            <>
              <p className="muted">Your to-purchase list. Tap an item when it's in your cart to check it off, or tap Copy to send it to Notes.</p>
              <div style={{ display: 'flex', gap: 8, margin: '10px 0 14px', alignItems: 'stretch' }}>
                <button className="btn" style={{ flex: 1, width: 'auto' }} onClick={copyList}>{copyLabel} ({total})</button>
                <button className="btn ghost" style={{ flex: 'none', width: 'auto', padding: '10px 14px', fontSize: 13 }} onClick={() => actions.clearGrocery()}>Clear</button>
              </div>
              {GROCERY_CATS.map((c) => {
                const need = c.items.filter((it) => grocery[it.id]);
                if (!need.length) return null;
                return (
                  <div key={c.cat} className="gcat">
                    <div className="cat">{c.cat}</div>
                    {need.map((it) => (
                      <div className="tog" key={it.id}>
                        <div className="nm">{it.name}</div>
                        <button className="switch on" aria-label={it.name} onClick={() => actions.toggleGrocery(it.id)}><b /></button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
