import React from 'react';
import { MOODS } from '../data.js';

export default function MoodTab({ day, actions }) {
  const locked = day.locked;
  const moods = day.moods || {};
  return (
    <div>
      {locked && <div className="banner lock">🔒 This day is locked — unlock it on the Day tab to change these.</div>}
      <div className="moodcard">
        <div className="mh">How I'm feeling</div>
        <div className="msub">Tap any that fit — as many as you want. Tap again to remove.</div>
        <div className="moodchips">
          {MOODS.map((m) => (
            <button
              key={m.id}
              className={'moodchip' + (moods[m.id] ? ' on' : '')}
              disabled={locked}
              onClick={() => actions.toggleMood(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h2">Notes</div>
      <textarea
        className="moodnote"
        placeholder="Anything you want to remember about today — sleep, triggers, wins…"
        readOnly={locked}
        value={day.note || ''}
        onChange={(e) => actions.setNote(e.target.value)}
      />
      <p className="disc">Saved with the day, right next to your food and rituals. Included in your Copy backup.</p>
    </div>
  );
}
