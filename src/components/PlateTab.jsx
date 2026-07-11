import React, { useState } from 'react';
import { ALLMAP, LIB, N } from '../data.js';
import { computeTotals, ketoStatus, fmt, catLabel } from '../logic.js';

const CATS = ['meal', 'drink', 'protein', 'veg', 'fruit', 'fat', 'dairy', 'extra', 'custom'];

function KetoBox({ tot }) {
  const keto = ketoStatus(tot.netcarbs);
  return (
    <div className="ketobox">
      <div className={'kb ' + keto.cls}>
        <div className="kn">{fmt(tot.netcarbs || 0)}g</div>
        <div className="kl">Net carbs · {keto.label}</div>
      </div>
      <div className="kb">
        <div className="kn" style={{ color: 'var(--ink)' }}>{fmt(tot.carbs || 0)}g</div>
        <div className="kl">Total carbs</div>
      </div>
    </div>
  );
}

export default function PlateTab({ state, day, actions, onToast }) {
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  const [nut, setNut] = useState({});
  const locked = day.locked;
  const tot = computeTotals(state, state.activeDate);
  const query = q.toLowerCase();

  const qtyOf = (id) => { const e = day.today.find((x) => x.id === id); return e ? e.qty : 0; };
  const items = [...LIB, ...state.custom.map((c) => ({ ...c, cat: 'custom' }))].filter((it) => it.name.toLowerCase().includes(query));

  function add(id, label) { actions.addFood(id); if (onToast) onToast('✓ ' + (label ? label.split(' — ')[0] : 'Added')); }
  function renderAdd(it) {
    const qty = qtyOf(it.id);
    return (
      <div className="additem" key={it.id}>
        <div className="nm">{it.name}<small>{it.serving || ''}</small></div>
        <div className="stepper">
          <button onClick={() => actions.dec(it.id)} disabled={qty === 0}>−</button>
          <span className="q">{qty}×</span>
          <button onClick={() => (qty === 0 ? add(it.id, it.name) : actions.inc(it.id))}>＋</button>
        </div>
      </div>
    );
  }
  function saveCustom() {
    if (!name.trim()) return;
    const clean = {};
    Object.keys(nut).forEach((k) => { const v = parseFloat(nut[k]); if (!isNaN(v) && v !== 0) clean[k] = v; });
    actions.addCustom(name.trim(), clean);
    setName(''); setNut({});
    if (onToast) onToast('✓ ' + name.trim().split(' — ')[0]);
  }

  return (
    <div>
      {locked && <div className="banner lock">🔒 This day is locked. Tap Unlock on the Day tab to make changes.</div>}
      <KetoBox tot={tot} />

      <div className="h2">On the plate</div>
      <div className="plate">
        {day.today.length === 0 ? (
          <div className="empty">No food logged yet. Add something below.</div>
        ) : (
          day.today.map((e) => {
            const it = ALLMAP[e.id];
            if (!it) return null;
            return (
              <div className="row" key={e.id}>
                <div className="nm">{it.name}<small>{it.serving || ''}{it.note ? ' · ' + it.note : ''}</small></div>
                {locked ? (
                  <span style={{ color: '#9aa8b0', fontSize: 13, fontWeight: 600 }}>{e.qty}×</span>
                ) : (
                  <>
                    <div className="stepper">
                      <button onClick={() => actions.dec(e.id)}>−</button>
                      <span className="q">{e.qty}×</span>
                      <button onClick={() => actions.inc(e.id)}>＋</button>
                    </div>
                    <button className="rm" onClick={() => actions.remove(e.id)}>✕</button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="h2">Add to your plate</div>
      <input className="search" placeholder="Search foods & drinks…" value={q} onChange={(e) => setQ(e.target.value)} />
      {CATS.map((c) => {
        const list = items.filter((it) => it.cat === c);
        if (!list.length) return null;
        return (
          <div key={c}>
            <div className="cat">{catLabel(c)}</div>
            {list.map((it) => renderAdd(it))}
          </div>
        );
      })}
      {items.length === 0 && <p className="muted">No matches.</p>}

      <div className="h2">Add your own item</div>
      <div className="form">
        <input placeholder="Item name (e.g. Greek yogurt ½ cup)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="muted" style={{ marginBottom: 8 }}>Enter any amounts you know — leave the rest blank.</div>
        <div className="nutinputs">
          {N.filter((n) => n.k !== 'cal').map((n) => (
            <div key={n.k}>
              <label>{n.label} ({n.u || 'g'})</label>
              <input type="number" inputMode="decimal" placeholder="0" value={nut[n.k] ?? ''} onChange={(e) => setNut((p) => ({ ...p, [n.k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button className="btn" onClick={saveCustom}>Save & add to this day</button>
      </div>
    </div>
  );
}
