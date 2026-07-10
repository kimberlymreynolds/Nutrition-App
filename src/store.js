import { useState, useEffect, useCallback, useMemo } from 'react';
import { ALLMAP } from './data.js';
import { ymd, TODAY } from './logic.js';

const KEY = 'kim-nutricalc-v2';

function defaultState() {
  const d = new Date();
  return { activeDate: TODAY, weekRef: TODAY, days: {}, custom: [], stackOn: [], calYear: d.getFullYear(), calMonth: d.getMonth() };
}

function normalize(s) {
  s.days = s.days || {};
  s.custom = s.custom || [];
  s.activeDate = s.activeDate || TODAY;
  s.weekRef = s.weekRef || s.activeDate;
  s.stackOn = s.stackOn || [];
  if (s.calYear == null) { const d = new Date(); s.calYear = d.getFullYear(); s.calMonth = d.getMonth(); }
  s.custom.forEach((it) => { ALLMAP[it.id] = it; });
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { /* ignore */ }
  return defaultState();
}

export function ensureDay(day, date) {
  if (!day.days[date]) day.days[date] = { today: [], locked: false, note: '', moods: {}, habits: {} };
  const d = day.days[date];
  if (d.today == null) d.today = [];
  if (d.note == null) d.note = '';
  if (d.moods == null) d.moods = {};
  if (d.habits == null) d.habits = {};
  return d;
}

export function useStore() {
  const [state, setState] = useState(loadState);
  const [persistOK, setPersistOK] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setPersistOK(true);
    } catch (e) {
      setPersistOK(false);
    }
  }, [state]);

  const mutate = useCallback((fn) => {
    setState((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const cur = () => ensureDay(state, state.activeDate);

  const actions = useMemo(() => ({
    setActiveDate(date) {
      mutate((s) => {
        s.activeDate = date;
        s.weekRef = date;
        const nd = date.split('-').map(Number);
        s.calYear = nd[0]; s.calMonth = nd[1] - 1;
      });
    },
    shiftDay(delta) {
      mutate((s) => {
        const d = new Date(...s.activeDate.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))));
        d.setDate(d.getDate() + delta);
        s.activeDate = ymd(d);
        s.weekRef = s.activeDate;
        s.calYear = d.getFullYear(); s.calMonth = d.getMonth();
      });
    },
    addFood(id) {
      mutate((s) => {
        const d = ensureDay(s, s.activeDate);
        if (d.locked) return;
        const e = d.today.find((x) => x.id === id);
        if (e) e.qty++;
        else d.today.push({ id, qty: 1 });
      });
    },
    inc(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; const x = d.today.find((y) => y.id === id); if (x) x.qty++; }); },
    dec(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; const x = d.today.find((y) => y.id === id); if (x) { x.qty--; if (x.qty <= 0) d.today = d.today.filter((y) => y.id !== id); } }); },
    remove(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.today = d.today.filter((y) => y.id !== id); }); },
    clearDay() { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.today = []; }); },
    toggleLock() { mutate((s) => { const d = ensureDay(s, s.activeDate); d.locked = !d.locked; }); },
    setNote(v) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.note = v; }); },
    toggleMood(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.moods = d.moods || {}; d.moods[id] = !d.moods[id]; }); },
    toggleHabit(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.habits = d.habits || {}; d.habits[id] = !d.habits[id]; }); },
    toggleStack(id) { mutate((s) => { if (s.stackOn.includes(id)) s.stackOn = s.stackOn.filter((x) => x !== id); else s.stackOn.push(id); }); },
    allStackOn(ids) { mutate((s) => { s.stackOn = ids.slice(); }); },
    allStackOff() { mutate((s) => { s.stackOn = []; }); },
    addCustom(name, nut) {
      mutate((s) => {
        const id = 'custom-' + Date.now();
        const item = { id, name, cat: 'custom', serving: 'custom', nut };
        s.custom.push(item);
        ALLMAP[id] = item;
        const d = ensureDay(s, s.activeDate);
        d.today.push({ id, qty: 1 });
      });
    },
    setWeekRef(ref) { mutate((s) => { s.weekRef = ref; }); },
    setCal(year, month) { mutate((s) => { s.calYear = year; s.calMonth = month; }); },
    restore(newState) { mutate((s) => { const n = normalize(newState); Object.keys(s).forEach((k) => delete s[k]); Object.assign(s, n); }); },
  }), [mutate]);

  return { state, cur, actions, persistOK };
}
