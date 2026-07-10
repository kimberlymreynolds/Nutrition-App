import React, { useState } from 'react';
import { LIB, N } from '../data.js';
import { catLabel } from '../logic.js';

const CATS = ['drink', 'protein', 'veg', 'fruit', 'fat', 'dairy', 'extra', 'custom'];

export default function FoodTab({ state, day, actions, onToast }) {
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  const [nut, setNut] = useState({});
  const locked = day.locked;
  const query = q.toLowerCase();

  const items = [...LIB, ...state.custom.map((c) => ({ ...c, cat: 'custom' }))].filter((it) => it.name.toLowerCase().includes(query));
  const quickMeals = LIB.filter((i) => i.cat === 'meal');

  function add(id, label) {
    actions.addFood(id);
    if (onToast) onToast('✓ ' + (label ? label.split(' — ')[0] : 'Added'));
  }
  const qtyOf = (id) => { const e = day.today.find((x) => x.id === id); return e ? e.qty : 0; };
  function renderItem(it) {
    const qty = qtyOf(it.id);
    return (
      <div className="additem" key={it.id}>
        <div className="nm">{it.name}<small>{it.serving || ''}</small></div>
        {qty > 0 ? (
          <div className="stepper">
            <button onClick={() => actions.dec(it.id)}>−</button>
            <span className="q">{qty}×</span>
            <button onClick={() => actions.inc(it.id)}>＋</button>
          </div>
        ) : (
          <button className="plus" onClick={() => add(it.id, it.name)}>＋</button>
        )}
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
      {locked && <div className="banner lock">🔒 This day is locked — unlock it on the Day tab to add items.</div>}
      <button className="btn danger" style={{ marginBottom: 10 }} onClick={() => actions.clearDay()}>Clear this day's food</button>
      <input className="search" placeholder="Search foods & drinks…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="cat">Your usual meals — quick add</div>
      {quickMeals.map((it) => renderItem(it))}

      {CATS.map((c) => {
        const list = items.filter((it) => it.cat === c);
        if (!list.length) return null;
        return (
          <div key={c}>
            <div className="cat">{catLabel(c)}</div>
            {list.map((it) => renderItem(it))}
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
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={nut[n.k] ?? ''}
                onChange={(e) => setNut((p) => ({ ...p, [n.k]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button className="btn" onClick={saveCustom}>Save & add to this day</button>
      </div>
    </div>
  );
}
