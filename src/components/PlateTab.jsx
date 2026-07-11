import React, { useState } from 'react';
import { ALLMAP, LIB } from '../data.js';
import { computeTotals, ketoStatus, fmt, catLabel } from '../logic.js';
import { FoodName } from './recipe.jsx';

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

function roundNut(n) {
  const o = {};
  for (const k in n) { const v = Math.round(n[k] * 10) / 10; if (v !== 0) o[k] = v; }
  return o;
}

export default function PlateTab({ state, day, actions, onToast }) {
  const [q, setQ] = useState('');
  const [mealName, setMealName] = useState('');
  const [mealItems, setMealItems] = useState([]); // [{ id, qty }]
  const [mq, setMq] = useState('');
  const locked = day.locked;
  const tot = computeTotals(state, state.activeDate);
  const query = q.toLowerCase();

  const qtyOf = (id) => { const e = day.today.find((x) => x.id === id); return e ? e.qty : 0; };
  const items = [...LIB, ...state.custom].filter((it) => it.name.toLowerCase().includes(query));

  function add(id, label) { actions.addFood(id); if (onToast) onToast('✓ ' + (label ? label.split(' — ')[0] : 'Added')); }
  function renderAdd(it) {
    const qty = qtyOf(it.id);
    return (
      <div className="additem" key={it.id}>
        <div className="nm"><FoodName it={it} /><small>{it.serving || ''}</small></div>
        <div className="stepper">
          <button onClick={() => actions.dec(it.id)} disabled={qty === 0}>−</button>
          <span className="q">{qty}×</span>
          <button onClick={() => (qty === 0 ? add(it.id, it.name) : actions.inc(it.id))}>＋</button>
        </div>
      </div>
    );
  }
  // ---- Meal builder ----
  const mealQtyOf = (id) => { const e = mealItems.find((x) => x.id === id); return e ? e.qty : 0; };
  function addIng(id) { setMealItems((p) => (p.find((x) => x.id === id) ? p.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) : [...p, { id, qty: 1 }])); }
  function incIng(id) { setMealItems((p) => p.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x))); }
  function decIng(id) { setMealItems((p) => p.flatMap((x) => (x.id === id ? (x.qty <= 1 ? [] : [{ ...x, qty: x.qty - 1 }]) : [x]))); }

  const mealNut = (() => {
    const sum = {};
    mealItems.forEach(({ id, qty }) => { const it = ALLMAP[id]; if (!it || !it.nut) return; for (const k in it.nut) sum[k] = (sum[k] || 0) + it.nut[k] * qty; });
    return sum;
  })();

  const ingResults = mq.trim()
    ? [...LIB, ...state.custom].filter((it) => it.cat !== 'meal' && it.name.toLowerCase().includes(mq.toLowerCase())).slice(0, 10)
    : [];

  function saveMeal() {
    if (!mealName.trim() || mealItems.length === 0) return;
    const parts = mealItems.map(({ id, qty }) => { const it = ALLMAP[id]; return { name: it.name, serving: it.serving, qty }; });
    const serving = parts.map((p) => (p.qty > 1 ? p.qty + '× ' : '') + p.name).join(' · ');
    const ingredients = parts.map((p) => (p.qty > 1 ? p.qty + ' × ' : '') + p.name + (p.serving ? ' (' + p.serving + ')' : ''));
    const item = { id: 'custom-' + Date.now(), name: mealName.trim(), cat: 'meal', serving, nut: roundNut(mealNut), recipe: { ingredients } };
    actions.addCustomFood(item);
    setMealName(''); setMealItems([]); setMq('');
    if (onToast) onToast('✓ ' + item.name);
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

      <div className="h2">Build your own meal</div>
      <div className="form">
        <input placeholder="Meal name (e.g. Egg scramble)" value={mealName} onChange={(e) => setMealName(e.target.value)} />
        <div className="muted" style={{ marginBottom: 10 }}>Pick the foods in this meal and set the amounts. The nutrients add up for you, and the meal is saved so you can log it again with one tap.</div>

        {mealItems.length > 0 && (
          <>
            <div className="cat">In this meal</div>
            {mealItems.map(({ id, qty }) => {
              const it = ALLMAP[id];
              if (!it) return null;
              return (
                <div className="additem" key={id}>
                  <div className="nm">{it.name}<small>{it.serving || ''}</small></div>
                  <div className="stepper">
                    <button onClick={() => decIng(id)}>−</button>
                    <span className="q">{qty}×</span>
                    <button onClick={() => incIng(id)}>＋</button>
                  </div>
                </div>
              );
            })}
            <div className="mealsum">
              <span><b>{fmt(mealNut.cal || 0)}</b> cal</span>
              <span><b>{fmt(mealNut.protein || 0)}g</b> protein</span>
              <span><b>{fmt(mealNut.netcarbs || 0)}g</b> net carbs</span>
              <span><b>{fmt(mealNut.fat || 0)}g</b> fat</span>
            </div>
          </>
        )}

        <input className="search" style={{ marginTop: mealItems.length ? 12 : 0 }} placeholder="Search foods to add…" value={mq} onChange={(e) => setMq(e.target.value)} />
        {mq.trim() && (
          ingResults.length ? ingResults.map((it) => (
            <div className="additem" key={it.id}>
              <div className="nm">{it.name}<small>{it.serving || ''}</small></div>
              <div className="stepper">
                <button onClick={() => decIng(it.id)} disabled={mealQtyOf(it.id) === 0}>−</button>
                <span className="q">{mealQtyOf(it.id)}×</span>
                <button onClick={() => addIng(it.id)}>＋</button>
              </div>
            </div>
          )) : <p className="muted">No matches. Ask to add a food if it's not in the list.</p>
        )}

        <button className="btn" onClick={saveMeal} disabled={!mealName.trim() || mealItems.length === 0} style={{ marginTop: 12 }}>Save meal &amp; add to this day</button>
      </div>
    </div>
  );
}
