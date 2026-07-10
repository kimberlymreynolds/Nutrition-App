import React from 'react';
import { N } from '../data.js';
import { GROUPS, statusOf, fmt } from '../logic.js';

function chipText(s, pct) {
  if (s === 'good') return '✓';
  if (s === 'part') return '~' + pct + '%';
  if (s === 'gap') return pct + '%';
  return 'OVER';
}

export default function NutrientGroups({ tot, met, cnt }) {
  return (
    <div>
      {GROUPS.map((gr) => (
        <div className="nutgroup" key={gr}>
          <div className="gh">{gr}</div>
          <div className="nutlist">
            {N.filter((n) => n.grp === gr).map((n) => {
              const v = tot[n.k];
              const s = statusOf(n, v);
              const pct = n.t ? Math.min(100, Math.round((v / n.t) * 100)) : 0;
              return (
                <div className="nut" key={n.k}>
                  <div className="top">
                    <span className="nn">
                      {n.label}
                      {s !== 'none' && <span className={'chip ' + s}>{chipText(s, pct)}</span>}
                    </span>
                    <span className="amt">
                      {fmt(v)}{n.u}
                      {n.t ? <span className="tg"> / {n.t}{n.u}</span> : null}
                    </span>
                  </div>
                  {n.src ? <div className="src">({n.src})</div> : null}
                  {n.t ? (
                    <div className="bar"><span className={'fill ' + s} style={{ width: pct + '%' }} /></div>
                  ) : null}
                  {met && n.t ? (
                    <div className="met">met {met[n.k]}/{cnt} day{cnt > 1 ? 's' : ''}</div>
                  ) : null}
                  {s === 'over' ? (
                    <div className="warn">⚠ above the {n.ul}{n.u} upper limit — worth checking with your mom</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
