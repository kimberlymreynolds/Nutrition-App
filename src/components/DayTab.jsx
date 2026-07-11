import React from 'react';
import { STACK, HABITS, MOOD_MAP, ENERGY_LEVELS, SLEEP_HRS } from '../data.js';
import { computeTotals, ketoStatus, fmt } from '../logic.js';

const ENERGY_MAP = Object.fromEntries(ENERGY_LEVELS.map((e) => [e.id, e.label]));
const SLEEP_MAP = Object.fromEntries(SLEEP_HRS.map((s) => [s.id, s.label]));
const HABIT_MAP = Object.fromEntries(HABITS.map((h) => [h.id, h.label]));

function Card({ title, onGo, empty, children }) {
  return (
    <button className="ovcard" onClick={onGo}>
      <div className="ovh">
        <span className="ovt">{title}</span>
        <span className="ovgo">Open ›</span>
      </div>
      {empty ? <div className="ovempty">{empty}</div> : <div className="ovbody">{children}</div>}
    </button>
  );
}

export default function DayTab({ state, day, actions, goTab }) {
  const tot = computeTotals(state, state.activeDate);
  const keto = ketoStatus(tot.netcarbs);
  const foods = day.today.length;
  const stackTaken = STACK.filter((s) => day.stack && day.stack[s.id]).map((s) => ({ name: s.name, caps: day.stack[s.id] }));
  const ritualsDone = HABITS.filter((h) => day.habits && day.habits[h.id]).map((h) => HABIT_MAP[h.id]);
  const mood = day.md ? MOOD_MAP[day.md] : null;

  return (
    <div>
      {day.locked && <div className="banner lock">🔒 This day is logged and locked. Tap Unlock above to make changes.</div>}

      <Card title="Mood" onGo={() => goTab('mood')} empty={(!mood && !day.energy && !day.sleepHrs && !day.note) ? 'Not set yet — tap to check in.' : null}>
        {mood && <span className="moodpill" style={{ background: mood.color }}>{mood.label}</span>}
        {day.energy && <span className="ovtag">{ENERGY_MAP[day.energy]} energy</span>}
        {day.sleepHrs && <span className="ovtag">{SLEEP_MAP[day.sleepHrs]} hrs sleep</span>}
        {day.note ? <div className="ovnote">“{day.note}”</div> : null}
      </Card>

      <Card title="On the plate" onGo={() => goTab('plate')} empty={foods === 0 ? 'No food logged yet — tap to add.' : null}>
        <span className={'moodpill ' + keto.cls} data-keto>{fmt(tot.netcarbs || 0)}g net carbs · {keto.label}</span>
        <span className="ovtag">{Math.round(tot.cal)} cal</span>
        <span className="ovtag">{foods} food{foods === 1 ? '' : 's'}</span>
      </Card>

      <Card title="Stack" onGo={() => goTab('stack')} empty={stackTaken.length === 0 ? 'None logged yet — tap to log what you took.' : null}>
        {stackTaken.length > 0 && <div className="ovlist">{stackTaken.map((s) => s.name + (s.caps > 1 ? ' ×' + s.caps : '')).join(' · ')}</div>}
      </Card>

      <Card title="Rituals" onGo={() => goTab('feel')} empty={ritualsDone.length === 0 ? 'None checked yet — tap to log your practices.' : null}>
        {ritualsDone.length > 0 && <div className="ovlist">{ritualsDone.join(' · ')}</div>}
      </Card>
    </div>
  );
}
