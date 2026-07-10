import React from 'react';

function Scale({ value, locked, onPick }) {
  return (
    <div className="scale">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
        <button key={i} className={value === i ? 'sel' : ''} disabled={locked} onClick={() => onPick(i)}>{i}</button>
      ))}
    </div>
  );
}

export default function FeelTab({ day, actions }) {
  const locked = day.locked;
  return (
    <div>
      {locked && <div className="banner lock">🔒 This day is locked — unlock it on the Day tab to change these.</div>}
      <div className="moodcard">
        <div className="mh">How you felt today</div>
        <div className="msub">Tap a number 1–10. Tap it again to clear. Tracks alongside your food.</div>
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
      <p className="disc">
        This is saved with the day, so mood and energy sit right next to what you ate — handy when you're looking back for
        patterns. It's included in your Copy backup too.
      </p>
    </div>
  );
}
