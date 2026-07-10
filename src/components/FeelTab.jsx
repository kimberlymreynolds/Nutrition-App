import React from 'react';
import { HABITS } from '../data.js';

function Scale({ value, locked, onPick }) {
  return (
    <div className="scale">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
        <button key={i} className={value === i ? 'sel' : ''} disabled={locked} onClick={() => onPick(i)}>{i}</button>
      ))}
    </div>
  );
}

function HabitRow({ habit, on, locked, onToggle }) {
  return (
    <button className={'habit' + (on ? ' on' : '')} disabled={locked} onClick={onToggle}>
      <span className="box">{on ? '✓' : ''}</span>
      <span className="hl">{habit.label}{habit.note ? <small> · {habit.note}</small> : null}</span>
    </button>
  );
}

export default function FeelTab({ day, actions }) {
  const locked = day.locked;
  const habits = day.habits || {};
  const daily = HABITS.filter((h) => h.grp === 'daily');
  const occasional = HABITS.filter((h) => h.grp === 'occasional');

  return (
    <div>
      {locked && <div className="banner lock">🔒 This day is locked — unlock it on the Day tab to change these.</div>}

      <div className="moodcard">
        <div className="mh">How you felt today</div>
        <div className="msub">Tap a number 1–10. Tap it again to clear.</div>
        <div className="moodrow">
          <div className="ml">Mood{day.mood ? ' · ' + day.mood + '/10' : ''}</div>
          <Scale value={day.mood} locked={locked} onPick={actions.setMood} />
        </div>
        <div className="moodrow">
          <div className="ml">Energy{day.energy ? ' · ' + day.energy + '/10' : ''}</div>
          <Scale value={day.energy} locked={locked} onPick={actions.setEnergy} />
        </div>
        <textarea
          className="moodnote"
          placeholder="Notes — sleep, symptoms, anything worth remembering…"
          readOnly={locked}
          value={day.note || ''}
          onChange={(e) => actions.setNote(e.target.value)}
        />
      </div>

      <div className="h2">What I did today</div>
      <div className="msub" style={{ marginBottom: 8 }}>Tap each practice you did. It saves with the day, so you can see it next to your food and how you felt.</div>
      {daily.map((h) => (
        <HabitRow key={h.id} habit={h} on={!!habits[h.id]} locked={locked} onToggle={() => actions.toggleHabit(h.id)} />
      ))}

      <div className="h2">Now and then</div>
      <div className="msub" style={{ marginBottom: 8 }}>Not daily — just check the day you do it, and it's on the record.</div>
      {occasional.map((h) => (
        <HabitRow key={h.id} habit={h} on={!!habits[h.id]} locked={locked} onToggle={() => actions.toggleHabit(h.id)} />
      ))}

      <p className="disc">Everything here saves with the day and rides along in your Copy backup.</p>
    </div>
  );
}
