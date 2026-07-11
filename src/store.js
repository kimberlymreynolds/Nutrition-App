import { useState, useEffect, useCallback, useMemo } from 'react';
import { ALLMAP, STACK, DOSE } from './data.js';
import { ymd, TODAY } from './logic.js';

const KEY = 'kim-nutricalc-v2';

function defaultState() {
  const d = new Date();
  return { activeDate: TODAY, weekRef: TODAY, days: {}, custom: [], calYear: d.getFullYear(), calMonth: d.getMonth() };
}

function normalize(s) {
  s.days = s.days || {};
  s.custom = s.custom || [];
  s.activeDate = s.activeDate || TODAY;
  s.weekRef = s.weekRef || s.activeDate;
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
  if (!day.days[date]) day.days[date] = { today: [], locked: false, note: '', gratitude: ['', '', ''], moods: {}, habits: {}, stack: {}, md: null, mdEve: null, eveningOn: false, energy: null, sleepHrs: null, sleepFelt: {}, tank: null };
  const d = day.days[date];
  if (d.today == null) d.today = [];
  if (d.note == null) d.note = '';
  if (!Array.isArray(d.gratitude)) d.gratitude = ['', '', ''];
  if (d.moods == null) d.moods = {};
  if (d.habits == null) d.habits = {};
  if (d.stack == null) d.stack = {};
  if (d.md === undefined) d.md = null;
  if (d.mdEve === undefined) d.mdEve = null;
  if (d.eveningOn === undefined) d.eveningOn = false;
  if (d.energy === undefined) d.energy = null;
  if (d.sleepHrs === undefined) d.sleepHrs = null;
  if (d.sleepFelt == null || typeof d.sleepFelt !== 'object') d.sleepFelt = {};
  if (d.tank === undefined) d.tank = null;
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
    setGratitude(i, v) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; if (!Array.isArray(d.gratitude)) d.gratitude = ['', '', '']; d.gratitude[i] = v; }); },
    toggleMood(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.moods = d.moods || {}; d.moods[id] = !d.moods[id]; }); },
    setField(field, id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d[field] = d[field] === id ? null : id; }); },
    toggleEvening() { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.eveningOn = !d.eveningOn; }); },
    toggleHabit(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.habits = d.habits || {}; d.habits[id] = !d.habits[id]; }); },
    incStack(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.stack = d.stack || {}; d.stack[id] = (d.stack[id] || 0) + 1; }); },
    decStack(id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.stack = d.stack || {}; const v = (d.stack[id] || 0) - 1; if (v <= 0) delete d.stack[id]; else d.stack[id] = v; }); },
    takeUsualStack() { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.stack = {}; STACK.forEach((su) => { d.stack[su.id] = (DOSE[su.id] && DOSE[su.id].caps) || 1; }); }); },
    clearStack() { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d.stack = {}; }); },
    toggleIn(field, id) { mutate((s) => { const d = ensureDay(s, s.activeDate); if (d.locked) return; d[field] = d[field] || {}; d[field][id] = !d[field][id]; }); },
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
