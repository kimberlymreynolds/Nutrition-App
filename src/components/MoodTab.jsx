import React from 'react';
import { MOODS, MOOD_LEVELS, ENERGY_LEVELS, SLEEP_HRS, SLEEP_FELT, TANK_LEVELS } from '../data.js';

function Seg({ options, value, locked, onPick, wrap }) {
  return (
    <div className={wrap ? 'segwrap' : 'seg'}>
      {options.map((o) => (
        <button key={o.id} className={'segbtn' + (value === o.id ? ' sel' : '')} disabled={locked} onClick={() => onPick(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

function MoodScale({ value, locked, onPick }) {
  return (
    <div className="mscale">
      {MOOD_LEVELS.map((m) => (
        <button
          key={m.id}
          className={'mlv' + (value === m.id ? ' sel' : '')}
          style={{ background: m.color }}
          disabled={locked}
          onClick={() => onPick(m.id)}
        >{m.label}</button>
      ))}
    </div>
  );
}

export default function MoodTab({ day, actions }) {
  const locked = day.locked;
  const moods = day.moods || {};
  const set = (field) => (id) => actions.setField(field, id);

  return (
    <div>
      {locked && <div className="banner lock">🔒 This day is locked — unlock it on the Day tab to change these.</div>}

      <p className="moodintro">This is your daily check-in — a place to notice how today actually felt, not to grade it. There's no right answer, no streak, and nothing to score. Tap whatever fits and leave the rest blank. Over time these turn into a picture you can look back on: where your mood sat, how you slept, what you had room for, and what you were grateful for. That's the whole point — so you (and your care team) can see your own patterns clearly.</p>

      <div className="mgroup">
        <div className="glabel">How's the day sitting?</div>
        <MoodScale value={day.md} locked={locked} onPick={set('md')} />
      </div>

      {day.eveningOn ? (
        <div className="mgroup">
          <div className="glabel">And by evening?</div>
          <MoodScale value={day.mdEve} locked={locked} onPick={set('mdEve')} />
        </div>
      ) : (
        <button className="evebtn" disabled={locked} onClick={() => actions.toggleEvening()}>+ Add an evening check</button>
      )}

      <div className="mgroup">
        <div className="glabel">Energy</div>
        <Seg options={ENERGY_LEVELS} value={day.energy} locked={locked} onPick={set('energy')} />
      </div>

      <div className="mgroup">
        <div className="glabel">Last night's sleep</div>
        <div className="sublabel">How long</div>
        <Seg options={SLEEP_HRS} value={day.sleepHrs} locked={locked} onPick={set('sleepHrs')} />
        <div className="sublabel" style={{ marginTop: 8 }}>How it felt — tap all that fit</div>
        <div className="segwrap">
          {SLEEP_FELT.map((o) => (
            <button
              key={o.id}
              className={'segbtn' + (day.sleepFelt && day.sleepFelt[o.id] ? ' sel' : '')}
              disabled={locked}
              onClick={() => actions.toggleIn('sleepFelt', o.id)}
            >{o.label}</button>
          ))}
        </div>
      </div>

      <div className="mgroup">
        <div className="glabel">Room in the tank</div>
        <div className="sublabel">Your sensory space today</div>
        <Seg options={TANK_LEVELS} value={day.tank} locked={locked} onPick={set('tank')} />
      </div>

      <div className="mgroup">
        <div className="glabel">Anything else here?</div>
        <div className="moodchips">
          {MOODS.map((m) => (
            <button key={m.id} className={'moodchip' + (moods[m.id] ? ' on' : '')} disabled={locked} onClick={() => actions.toggleMood(m.id)}>{m.label}</button>
          ))}
        </div>
      </div>

      <div className="mgroup">
        <div className="glabel">Grateful for</div>
        <div className="msub">Three good things about today.</div>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            className="gratinput"
            placeholder={['One…', 'Two…', 'Three…'][i]}
            readOnly={locked}
            value={(day.gratitude && day.gratitude[i]) || ''}
            onChange={(e) => actions.setGratitude(i, e.target.value)}
          />
        ))}
      </div>

      <div className="mgroup">
        <div className="glabel">Notes</div>
        <textarea
          className="moodnote"
          placeholder="Anything you want to remember about today — triggers, wins, what helped…"
          readOnly={locked}
          value={day.note || ''}
          onChange={(e) => actions.setNote(e.target.value)}
        />
      </div>

      <p className="disc">Saved with the day, next to your food and rituals. No streaks, no scores — just your day, so you (and your care team) can look back and see it. Your colors show up on the Week and Calendar tabs.</p>
    </div>
  );
}
