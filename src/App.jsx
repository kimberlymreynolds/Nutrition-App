import React, { useState, useRef, useCallback } from 'react';
import { useStore, ensureDay } from './store.js';
import { ALLMAP } from './data.js';
import { parseYmd, DOW, MONs, TODAY } from './logic.js';
import { RecipeContext } from './components/recipe.jsx';
import DayTab from './components/DayTab.jsx';
import PlateTab from './components/PlateTab.jsx';
import StackTab from './components/StackTab.jsx';
import MoodTab from './components/MoodTab.jsx';
import RitualsTab from './components/RitualsTab.jsx';
import CalendarTab from './components/CalendarTab.jsx';

const TABS = [
  { id: 'day', label: 'Day' },
  { id: 'plate', label: 'Plate' },
  { id: 'stack', label: 'Stack' },
  { id: 'mood', label: 'Mood' },
  { id: 'feel', label: 'Rituals' },
  { id: 'calendar', label: 'Calendar' },
];

function RecipeModal({ meal, onClose }) {
  if (!meal || !meal.recipe) return null;
  const r = meal.recipe;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{meal.name}</span>
          <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {r.makes ? <div className="muted" style={{ marginBottom: 10 }}>{r.makes} · one serving is {meal.serving}</div> : <div className="muted" style={{ marginBottom: 10 }}>{meal.serving}</div>}
        <div className="detlabel">Ingredients</div>
        <ul className="recipe-list">{r.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
        {r.steps ? (
          <>
            <div className="detlabel" style={{ marginTop: 14 }}>How to make it</div>
            <ol className="recipe-steps">{r.steps.map((s, idx) => <li key={idx}>{s}</li>)}</ol>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function App() {
  const { state, actions, persistOK } = useStore();
  const [tab, setTab] = useState('day');
  const [toastMsg, setToastMsg] = useState('');
  const [recipeId, setRecipeId] = useState(null);
  const toastTimer = useRef(null);
  const openRecipe = useCallback((id) => setRecipeId(id), []);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 1200);
  }, []);

  const day = ensureDay(structuredClone(state), state.activeDate);
  const realDay = state.days[state.activeDate] || day;
  const dt = parseYmd(state.activeDate);
  const locked = realDay.locked;

  function goTab(name) { setTab(name); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <RecipeContext.Provider value={openRecipe}>
    <div className="bg-atmos" aria-hidden="true" />
    <div className="wrap">
      <div className="eyebrow eyebrow-hero">Daily tracker &amp; log</div>

      <div className="datebar">
        <button className="dnav" onClick={() => actions.shiftDay(-1)}>‹</button>
        <div className="dlabel">
          <div className="d1">{DOW[dt.getDay()]}, {MONs[dt.getMonth()]} {dt.getDate()}</div>
          <div className="d2">{(state.activeDate === TODAY ? 'TODAY · ' : '') + dt.getFullYear()}</div>
        </div>
        <button className={'lockbtn ' + (locked ? 'locked' : 'unlocked')} onClick={() => actions.toggleLock()}>{locked ? '🔓 Unlock' : '🔒 Lock'}</button>
        <button className="dnav" onClick={() => actions.shiftDay(1)}>›</button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <div key={t.id} className={'tab' + (tab === t.id ? ' active' : '')} onClick={() => goTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab === 'day' && <DayTab state={state} day={realDay} actions={actions} onToast={toast} />}
      {tab === 'plate' && <PlateTab state={state} day={realDay} actions={actions} onToast={toast} />}
      {tab === 'stack' && <StackTab state={state} day={realDay} actions={actions} onToast={toast} />}
      {tab === 'mood' && <MoodTab day={realDay} actions={actions} />}
      {tab === 'feel' && <RitualsTab day={realDay} actions={actions} />}
      {tab === 'calendar' && <CalendarTab state={state} actions={actions} onToast={toast} />}

      <div className="savebar">{persistOK ? 'Saved automatically on this device' : '⚠ Auto-save is blocked here — use “Copy backup” in the Stack tab to keep your log'}</div>

      <div className={'toast' + (toastMsg ? ' show' : '')}>{toastMsg}</div>
    </div>
    {recipeId && <RecipeModal meal={ALLMAP[recipeId]} onClose={() => setRecipeId(null)} />}
    </RecipeContext.Provider>
  );
}
