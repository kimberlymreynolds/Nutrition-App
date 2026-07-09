import React from 'react';
import { ALLMAP } from '../data.js';
import { computeTotals, ketoStatus, naK, fmt } from '../logic.js';
import NutrientGroups from './NutrientGroups.jsx';

function KetoBox({ tot }) {
  const keto = ketoStatus(tot.netcarbs);
  const nak = naK(tot.sodium, tot.potassium);
  return (
    <div className="ketobox">
      <div className={'kb ' + keto.cls}>
        <div className="kn">{fmt(tot.netcarbs || 0)}g</div>
        <div className="kl">Net carbs · {keto.label}</div>
      </div>
      <div className={'kb ' + nak.cls}>
        <div className="kn">{nak.value}</div>
        <div className="kl">{nak.label}</div>
      </div>
    </div>
  );
}

function MoodCard({ day, actions }) {
  const locked = day.locked;
  const Scale = ({ value, onPick }) => (
    <div className="scale">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
        <button key={i} className={value === i ? 'sel' : ''} disabled={locked} onClick={() => onPick(i)}>{i}</button>
      ))}
    </div>
  );
  return (
    <div className="moodcard">
      <div className="mh">How you felt today</div>
      <div className="msub">Tap a number 1–10. Tap it again to clear. Tracks alongside your food.</div>
      <div className="moodrow">
        <div className="ml">Mood{day.mood ? ' · ' + day.mood + '/10' : ''}</div>
        <Scale value={day.mood} onPick={actions.setMood} />
      </div>
      <div className="moodrow">
        <div className="ml">Energy{day.energy ? ' · ' + day.energy + '/10' : ''}</div>
        <Scale value={day.energy} onPick={actions.setEnergy} />
      </div>
      <textarea
        className="moodnote"
        placeholder="Notes — sleep, symptoms, anything worth remembering…"
        readOnly={locked}
        value={day.note || ''}
        onChange={(e) => actions.setNote(e.target.value)}
      />
    </div>
  );
}

export default function DayTab({ state, day, actions }) {
  const tot = computeTotals(state, state.activeDate);
  const locked = day.locked;
  return (
    <div>
      {locked && <div className="banner lock">🔒 This day is logged and locked. Tap Unlock to make changes.</div>}
      <KetoBox tot={tot} />
      <div className="h2">On the plate</div>
      <div className="plate">
        {day.today.length === 0 ? (
          <div className="empty">No food logged for this day yet. Tap the Food tab.</div>
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
      <MoodCard day={day} actions={actions} />
      <NutrientGroups tot={tot} />
      <p className="disc">
        Targets are general adult-female RDA/AI values; upper limits shown where one exists. Food values are standard
        estimates. Not medical advice — confirm your vitamin A/D totals and anything therapeutic with your mom and your labs.
      </p>
    </div>
  );
}
