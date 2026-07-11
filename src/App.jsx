import React, { useState, useRef, useCallback } from 'react';
import { useStore, ensureDay } from './store.js';
import { parseYmd, DOW, MONs, TODAY } from './logic.js';
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

export default function App() {
  const { state, actions, persistOK } = useStore();
  const [tab, setTab] = useState('day');
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

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
    <>
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

      {tab === 'day' && <DayTab state={state} day={realDay} actions={actions} goTab={goTab} />}
      {tab === 'plate' && <PlateTab state={state} day={realDay} actions={actions} onToast={toast} />}
      {tab === 'stack' && <StackTab state={state} day={realDay} actions={actions} onToast={toast} />}
      {tab === 'mood' && <MoodTab day={realDay} actions={actions} />}
      {tab === 'feel' && <RitualsTab day={realDay} actions={actions} />}
      {tab === 'calendar' && <CalendarTab state={state} actions={actions} />}

      <div className="savebar">{persistOK ? 'Saved automatically on this device' : '⚠ Auto-save is blocked here — use “Copy backup” in the Stack tab to keep your log'}</div>

      <div className={'toast' + (toastMsg ? ' show' : '')}>{toastMsg}</div>
    </div>
    </>
  );
}
