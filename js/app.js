/* Juoksukoulu – progress tracker. Plain JS, state kept in localStorage. */
(function () {
  'use strict';

  const P = window.PROGRAM;
  const WEEKS = P.weeks.length;
  const STORAGE_KEY = 'juoksukoulu.v1';
  const DAY_MS = 86400000;

  // ---------------------------------------------------------------- i18n
  const T = {
    fi: {
      appName: 'Juoksukoulu',
      tabToday: 'Tänään', tabPlan: 'Ohjelma', tabProgress: 'Edistyminen', tabSettings: 'Asetukset',
      week: 'Viikko', weekShort: 'vko',
      types: { rest: 'Lepo', walk: 'Kävely', run: 'Juoksu', speed: 'Vauhti', long: 'Pitkä lenkki', goal: 'Tavoite / testi' },
      note: 'Muistiinpano (esim. matka, aika, fiilis)',
      markDone: 'Tehty ✓', markSkipped: 'Väliin jäi', toggleDone: 'Merkitse tehdyksi', todayLabel: 'Tänään', missedLabel: 'Merkitsemättä', clear: 'Tyhjennä', close: 'Sulje', addNote: 'Muistiinpano',
      statusDone: 'Tehty', statusSkipped: 'Väliin jäi',
      todayWorkout: 'Päivän harjoitus', thisWeek: 'Tämä viikko', weekDone: 'viikon harjoituksista tehty',
      notStarted: (n) => `Ohjelma alkaa ${n} päivän päästä. Tässä ensimmäinen harjoitus:`,
      finished: 'Koko vuoden ohjelma on takana. Onneksi olkoon – olet juoksija! 🎉',
      openPlan: 'Avaa koko ohjelma',
      workoutsDone: 'Harjoituksia tehty', onTrack: 'Tähän päivään mennessä', currentWeek: 'Nykyinen viikko',
      streak: 'Täysiä viikkoja putkeen', weeksOverview: 'Viikot', phases: 'Jaksot', milestones: 'Virstanpylväät',
      notes: 'Viimeisimmät muistiinpanot', noNotes: 'Ei vielä muistiinpanoja.',
      startDate: 'Ohjelman aloituspäivä',
      startDateHelp: 'Ohjelmaviikot kulkevat maanantaista sunnuntaihin. Jos valitset muun päivän kuin maanantain, ohjelma alkaa seuraavana maanantaina.',
      setWeekHelp: 'Kuluva viikko (ma–su) asetetaan valitsemaksesi ohjelmaviikoksi.',
      setWeek: 'Olen nyt viikolla', setWeekBtn: 'Aseta',
      backfill: 'Merkitse kaikki aiemmat päivät tehdyiksi',
      backfillConfirm: 'Merkitäänkö kaikki tätä päivää edeltävät merkitsemättömät päivät tehdyiksi?',
      exportBtn: 'Vie varmuuskopio (JSON)', importBtn: 'Tuo varmuuskopio',
      importOk: 'Varmuuskopio tuotu.', importFail: 'Tiedostoa ei voitu lukea.',
      reset: 'Nollaa kaikki tiedot', resetConfirm: 'Poistetaanko kaikki merkinnät ja asetukset?',
      dataTitle: 'Tiedot', dataHelp: 'Tiedot tallentuvat vain tähän selaimeen. Ota välillä varmuuskopio.',
      language: 'Kieli', guideTitle: 'Ohjeita',
      guide: [
        ['Rauhallinen juoksu', 'Vauhti, jossa pystyt puhumaan kokonaisia lauseita. Suurin osa juoksuista on tätä.'],
        ['Rennot vedot', 'Noin 20 s kiihdytys lähes kovaan vauhtiin rennosti, kävely- tai hölkkätauko välissä.'],
        ['Tempojuoksu', '”Mukavan raskas” tasainen vauhti, jossa puhe katkeilee.'],
        ['Vauhtileikittely', 'Vapaamuotoisia vauhdinvaihteluita fiiliksen mukaan.'],
        ['Mäkivedot', 'Lyhyet reippaat vedot ylämäkeen. Maltillinen jyrkkyys riittää.'],
        ['Missä tahansa', 'Kaikki harjoitukset sopivat sekä juoksumatolle että ulos. Valitse se, mikä sinulle sopii.'],
        ['Kevennysviikko', 'Joka 4. viikko harjoitellaan vähemmän, jotta keho ehtii vahvistua.'],
        ['Kuuntele kehoa', 'Jos olet kipeä tai viikko tuntuu liian raskaalta, toista se ennen kuin jatkat. Kuumeisena ei juosta.'],
      ],
      sourceNote: 'Viikot 1–11: Porin kaupungin liikuntayksikkö (KuntoPlus 4/02). Viikot 12–52: jatko-ohjelma.',
      of: '/',
    },
    en: {
      appName: 'Running School',
      tabToday: 'Today', tabPlan: 'Plan', tabProgress: 'Progress', tabSettings: 'Settings',
      week: 'Week', weekShort: 'wk',
      types: { rest: 'Rest', walk: 'Walk', run: 'Run', speed: 'Speed', long: 'Long run', goal: 'Goal / test' },
      note: 'Note (e.g. distance, time, how it felt)',
      markDone: 'Done ✓', markSkipped: 'Skipped', toggleDone: 'Mark as done', todayLabel: 'Today', missedLabel: 'Not marked', clear: 'Clear', close: 'Close', addNote: 'Note',
      statusDone: 'Done', statusSkipped: 'Skipped',
      todayWorkout: 'Today’s workout', thisWeek: 'This week', weekDone: 'of this week’s workouts done',
      notStarted: (n) => `The program starts in ${n} day(s). Here is your first workout:`,
      finished: 'You have finished the whole year. Congratulations – you are a runner! 🎉',
      openPlan: 'Open the full plan',
      workoutsDone: 'Workouts done', onTrack: 'So far', currentWeek: 'Current week',
      streak: 'Full weeks in a row', weeksOverview: 'Weeks', phases: 'Phases', milestones: 'Milestones',
      notes: 'Latest notes', noNotes: 'No notes yet.',
      startDate: 'Program start date',
      startDateHelp: 'Program weeks run from Monday to Sunday. If you pick a day other than Monday, the program starts the following Monday.',
      setWeekHelp: 'The current week (Mon–Sun) becomes the program week you choose.',
      setWeek: 'I am currently on week', setWeekBtn: 'Set',
      backfill: 'Mark all earlier days as done',
      backfillConfirm: 'Mark every unmarked day before today as done?',
      exportBtn: 'Export backup (JSON)', importBtn: 'Import backup',
      importOk: 'Backup imported.', importFail: 'Could not read the file.',
      reset: 'Reset all data', resetConfirm: 'Delete all entries and settings?',
      dataTitle: 'Data', dataHelp: 'Data is stored only in this browser. Export a backup now and then.',
      language: 'Language', guideTitle: 'Guide',
      guide: [
        ['Easy run', 'A pace at which you can speak in full sentences. Most runs are easy.'],
        ['Strides', 'About 20 s relaxed acceleration to near-fast pace, walk or jog in between.'],
        ['Tempo run', 'A “comfortably hard” steady pace where talking gets choppy.'],
        ['Fartlek', 'Free-form pace changes based on feel.'],
        ['Hill repeats', 'Short brisk efforts uphill. A moderate gradient is enough.'],
        ['Anywhere', 'Every session works on a treadmill or outside. Choose whichever suits you.'],
        ['Cut-back week', 'Every 4th week has less training so your body can adapt.'],
        ['Listen to your body', 'If you are sore or a week feels too hard, repeat it before moving on. Never run with a fever.'],
      ],
      sourceNote: 'Weeks 1–11: City of Pori sports unit (KuntoPlus 4/02). Weeks 12–52: continuation program.',
      of: '/',
    },
  };

  // ---------------------------------------------------------------- state
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const startOfToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const addDays = (dt, n) => { const r = new Date(dt); r.setDate(r.getDate() + n); return r; };
  // Program weeks always run Monday-Sunday.
  const mondayOf = (dt) => addDays(dt, -((dt.getDay() + 6) % 7));
  const mondayOnOrAfter = (dt) => mondayOf(addDays(dt, 6));
  const daysBetween = (a, b) => Math.round((b - a) / DAY_MS);

  function defaultState() {
    return {
      startDate: toISO(mondayOnOrAfter(startOfToday())),
      lang: (navigator.language || 'fi').toLowerCase().startsWith('fi') ? 'fi' : 'en',
      log: {},
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return sanitize(JSON.parse(raw));
    } catch (e) { /* ignore and fall back */ }
    return defaultState();
  }

  function sanitize(obj) {
    const base = defaultState();
    if (!obj || typeof obj !== 'object') return base;
    if (typeof obj.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.startDate)) {
      base.startDate = toISO(mondayOf(fromISO(obj.startDate)));
    }
    if (obj.lang === 'fi' || obj.lang === 'en') base.lang = obj.lang;
    if (obj.log && typeof obj.log === 'object') {
      for (const [k, v] of Object.entries(obj.log)) {
        if (!/^\d+:\d$/.test(k) || !v || typeof v !== 'object') continue;
        const entry = {};
        if (v.s === 'done' || v.s === 'skipped') entry.s = v.s;
        if (typeof v.note === 'string' && v.note.trim()) entry.note = v.note.slice(0, 1000);
        if (typeof v.t === 'number') entry.t = v.t;
        if (entry.s || entry.note) base.log[k] = entry;
      }
    }
    return base;
  }

  let state = loadState();
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } };
  const t = () => T[state.lang];

  // ---------------------------------------------------------------- helpers
  const key = (w, d) => `${w}:${d}`;
  const workout = (w, d) => P.weeks[w - 1][d];
  const entry = (w, d) => state.log[key(w, d)] || {};
  const dateFor = (w, d) => addDays(fromISO(state.startDate), (w - 1) * 7 + d);
  const phaseOf = (w) => P.phases.find((p) => w >= p.weeks[0] && w <= p.weeks[1]);
  const isWorkout = (w, d) => workout(w, d).type !== 'rest';

  function position() {
    const idx = daysBetween(fromISO(state.startDate), startOfToday());
    if (idx < 0) return { status: 'before', daysUntil: -idx, week: 1, day: 0, idx };
    const week = Math.floor(idx / 7) + 1;
    if (week > WEEKS) return { status: 'after', week: WEEKS, day: 6, idx };
    return { status: 'active', week, day: idx % 7, idx };
  }

  // Weekday names come from the real date, so a program started on any day
  // shows the right weekdays (e.g. "Keskiviikko" / "Ke").
  function weekday(dt, style) {
    const s = dt.toLocaleDateString(state.lang === 'fi' ? 'fi-FI' : 'en-GB', { weekday: style });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  const dayName = (w, d) => weekday(dateFor(w, d), 'long');
  const dayShort = (w, d) => weekday(dateFor(w, d), 'short');

  // Short date without year, e.g. "14.10." / "14 Oct".
  function fmtDay(dt) {
    return state.lang === 'fi'
      ? `${dt.getDate()}.${dt.getMonth() + 1}.`
      : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function fmtDate(dt) {
    return state.lang === 'fi'
      ? `${dt.getDate()}.${dt.getMonth() + 1}.${dt.getFullYear()}`
      : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function setEntry(w, d, status, note) {
    const k = key(w, d);
    const e = { ...(state.log[k] || {}) };
    if (status === 'clear') { delete e.s; delete e.t; }
    else if (status) { e.s = status; e.t = Date.now(); }
    if (note !== undefined) { if (note.trim()) e.note = note.trim(); else delete e.note; }
    if (e.s || e.note) state.log[k] = e; else delete state.log[k];
    save();
    render();
  }

  function weekStats(w) {
    let total = 0, done = 0, all = 0;
    for (let d = 0; d < 7; d++) {
      const e = entry(w, d);
      if (e.s === 'done') all++;
      if (!isWorkout(w, d)) continue;
      total++;
      if (e.s === 'done') done++;
    }
    return { total, done, all };
  }

  function stats() {
    const pos = position();
    let total = 0, done = 0, dueTotal = 0, dueDone = 0;
    for (let w = 1; w <= WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        if (!isWorkout(w, d)) continue;
        const isDone = entry(w, d).s === 'done';
        total++; if (isDone) done++;
        const idx = (w - 1) * 7 + d;
        if (pos.status !== 'before' && idx <= pos.idx) { dueTotal++; if (isDone) dueDone++; }
      }
    }
    // Consecutive fully completed weeks, counting back from the latest finished week.
    let streak = 0;
    const lastFull = pos.status === 'after' ? WEEKS : pos.week - 1;
    for (let w = lastFull; w >= 1; w--) {
      const s = weekStats(w);
      if (s.done === s.total) streak++; else break;
    }
    // Include the current week if it is already fully done.
    if (pos.status === 'active' && streak === lastFull) {
      const s = weekStats(pos.week);
      if (s.done === s.total) streak++;
    }
    return { total, done, dueTotal, dueDone, streak, pos };
  }

  // ---------------------------------------------------------------- rendering
  const $ = (sel) => document.querySelector(sel);
  let currentView = 'today';
  let justToggled = null;
  let scrollToCurrent = true;

  function badge(type) {
    return `<span class="badge type-${type}">${esc(t().types[type])}</span>`;
  }

  function statusLabel(e) {
    if (e.s === 'done') return `<span class="status done">${esc(t().statusDone)} ✓</span>`;
    if (e.s === 'skipped') return `<span class="status skipped">${esc(t().statusSkipped)}</span>`;
    return '';
  }

  function cellClasses(w, d, pos) {
    const e = entry(w, d);
    const idx = (w - 1) * 7 + d;
    const cls = ['cell', `type-${workout(w, d).type}`];
    if (e.s) cls.push(e.s);
    if (justToggled === key(w, d) && e.s === 'done') cls.push('pop');
    if (pos.status === 'active' && idx === pos.idx) cls.push('today');
    else if (pos.status !== 'before' && idx < pos.idx && !e.s && isWorkout(w, d)) cls.push('missed');
    return cls.join(' ');
  }

  function checkBtn(w, d) {
    const done = entry(w, d).s === 'done';
    return `<button class="check" data-act="done" data-w="${w}" data-d="${d}"
      aria-pressed="${done}" aria-label="${esc(t().toggleDone)}" title="${esc(t().toggleDone)}"></button>`;
  }

  function dayRow(w, d, pos) {
    const wo = workout(w, d);
    const e = entry(w, d);
    const isToday = pos.status === 'active' && (w - 1) * 7 + d === pos.idx;
    return `<div class="${cellClasses(w, d, pos)} row" role="button" tabindex="0" data-w="${w}" data-d="${d}">
      <span class="row-day">${esc(dayShort(w, d))}<small>${esc(fmtDay(dateFor(w, d)))}</small></span>
      <span class="row-text">${isToday ? `<span class="pill">${esc(t().todayLabel)}</span>` : ''}${esc(wo[state.lang])}${e.note ? `<em class="row-note">📝 ${esc(e.note)}</em>` : ''}</span>
      ${checkBtn(w, d)}
    </div>`;
  }

  function renderToday() {
    const L = t();
    const pos = position();
    const w = pos.week, d = pos.day;
    const phase = phaseOf(w);
    const wo = workout(w, d);
    const e = entry(w, d);
    const ws = weekStats(w);
    const pct = ws.total ? Math.round((ws.done / ws.total) * 100) : 0;

    let lead = '';
    if (pos.status === 'before') lead = `<p class="lead">${esc(L.notStarted(pos.daysUntil))}</p>`;
    if (pos.status === 'after') lead = `<p class="lead celebrate">${esc(L.finished)}</p>`;

    const note = P.weekNotes[w] ? `<p class="week-note">${esc(P.weekNotes[w][state.lang === 'fi' ? 0 : 1])}</p>` : '';

    $('#view-today').innerHTML = `
      ${lead}
      <div class="hero card">
        <div class="hero-head">
          <div>
            <div class="eyebrow">${esc(L.week)} ${w} ${L.of} ${WEEKS} · ${esc(phase[state.lang])}</div>
            <h1>${esc(dayName(w, d))} <span class="muted">${esc(fmtDay(dateFor(w, d)))}</span></h1>
          </div>
          ${badge(wo.type)}
        </div>
        <p class="hero-text">${esc(wo[state.lang])}</p>
        ${e.note ? `<p class="hero-note">📝 ${esc(e.note)}</p>` : ''}
        <div class="hero-actions">
          <button class="btn primary ${e.s === 'done' ? 'active' : ''}" data-act="done" data-w="${w}" data-d="${d}">${esc(L.markDone)}</button>
          <button class="btn ${e.s === 'skipped' ? 'active' : ''}" data-act="skipped" data-w="${w}" data-d="${d}">${esc(L.markSkipped)}</button>
          <button class="btn ghost" data-act="open" data-w="${w}" data-d="${d}">📝 ${esc(L.addNote)}</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>${esc(L.thisWeek)}</h2>
          <span class="muted">${ws.done}/${ws.total} ${esc(L.weekDone)}</span>
        </div>
        <div class="bar"><span style="width:${pct}%"></span></div>
        ${note}
        <div class="rows">${[0, 1, 2, 3, 4, 5, 6].map((dd) => dayRow(w, dd, pos)).join('')}</div>
      </div>
      <button class="btn ghost wide" data-goto="plan">${esc(L.openPlan)} →</button>
    `;
  }

  function renderPlan() {
    const L = t();
    const pos = position();
    const head = `<div class="grid-head"><span></span>${[0, 1, 2, 3, 4, 5, 6].map((d) => `<span>${esc(dayShort(1, d))}</span>`).join('')}</div>`;
    let html = `<div class="legend">${Object.keys(L.types).map((k) =>
      `<span class="legend-item type-${k}">${esc(L.types[k])}</span>`).join('')}</div>`;
    for (const phase of P.phases) {
      html += `<h2 class="phase-title"><span>${phase.id}</span>${esc(phase[state.lang])}
        <small>${esc(L.week)} ${phase.weeks[0]}–${phase.weeks[1]}</small></h2>`;
      html += `<div class="grid">${head}`;
      for (let w = phase.weeks[0]; w <= phase.weeks[1]; w++) {
        const isCurrent = pos.status === 'active' && w === pos.week;
        const ws = weekStats(w);
        html += `<div class="week ${isCurrent ? 'current' : ''}" id="week-${w}">
          <div class="week-label">
            <strong>${w}.</strong> ${esc(L.weekShort)}
            <small>${esc(fmtDate(dateFor(w, 0)).replace(/\.\d{4}$/, '.'))}</small>
            <small class="week-count">${ws.done}/${ws.total}</small>
          </div>`;
        for (let d = 0; d < 7; d++) {
          const wo = workout(w, d);
          const e = entry(w, d);
          html += `<div class="${cellClasses(w, d, pos)}" role="button" tabindex="0" data-w="${w}" data-d="${d}">
            <span class="cell-day">${esc(dayShort(w, d))}</span>
            <span class="cell-text">${esc(wo[state.lang])}</span>
            ${e.note ? '<span class="cell-note" title="note">📝</span>' : ''}
            ${checkBtn(w, d)}
          </div>`;
        }
        html += '</div>';
      }
      html += '</div>';
    }
    $('#view-plan').innerHTML = html;
  }

  function renderProgress() {
    const L = t();
    const s = stats();
    const pctAll = Math.round((s.done / s.total) * 100);
    const pctDue = s.dueTotal ? Math.round((s.dueDone / s.dueTotal) * 100) : 0;

    const squares = [];
    for (let w = 1; w <= WEEKS; w++) {
      const ws = weekStats(w);
      const f = ws.total ? ws.done / ws.total : 0;
      const level = f === 0 ? 0 : f < 0.34 ? 1 : f < 0.67 ? 2 : f < 1 ? 3 : 4;
      const cur = s.pos.status === 'active' && w === s.pos.week ? ' current' : '';
      squares.push(`<button class="sq l${level}${cur}" data-goto-week="${w}" title="${esc(L.week)} ${w}: ${ws.done}/${ws.total}">${w}</button>`);
    }

    const phases = P.phases.map((p) => {
      let total = 0, done = 0;
      for (let w = p.weeks[0]; w <= p.weeks[1]; w++) { const ws = weekStats(w); total += ws.total; done += ws.done; }
      const pct = Math.round((done / total) * 100);
      return `<li><div class="li-head"><span>${p.id}. ${esc(p[state.lang])}</span><span class="muted">${pct} %</span></div>
        <div class="bar"><span style="width:${pct}%"></span></div></li>`;
    }).join('');

    const milestones = P.milestones.map((m) => {
      const e = entry(m.week, m.day);
      const ok = e.s === 'done';
      return `<li class="${ok ? 'ok' : ''}"><span class="ms-icon">${ok ? '🏅' : '○'}</span>
        <span>${esc(m[state.lang])}</span>
        <span class="muted">${esc(L.weekShort)} ${m.week}${ok && e.t ? ' · ' + esc(fmtDate(new Date(e.t))) : ''}</span></li>`;
    }).join('');

    const notes = Object.entries(state.log)
      .filter(([, v]) => v.note)
      .map(([k, v]) => { const [w, d] = k.split(':').map(Number); return { w, d, v }; })
      .sort((a, b) => (b.w * 7 + b.d) - (a.w * 7 + a.d))
      .slice(0, 12)
      .map(({ w, d, v }) => `<li><button class="link" data-w="${w}" data-d="${d}">${esc(L.weekShort)} ${w} · ${esc(dayShort(w, d))}</button> ${esc(v.note)}</li>`)
      .join('');

    $('#view-progress').innerHTML = `
      <div class="tiles">
        <div class="tile"><div class="tile-num">${s.done}<small>/${s.total}</small></div><div class="tile-label">${esc(L.workoutsDone)}</div></div>
        <div class="tile"><div class="tile-num">${pctDue}<small> %</small></div><div class="tile-label">${esc(L.onTrack)} (${s.dueDone}/${s.dueTotal})</div></div>
        <div class="tile"><div class="tile-num">${s.pos.week}<small>/${WEEKS}</small></div><div class="tile-label">${esc(L.currentWeek)}</div></div>
        <div class="tile"><div class="tile-num">${s.streak}</div><div class="tile-label">${esc(L.streak)}</div></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>${esc(L.weeksOverview)}</h2><span class="muted">${pctAll} %</span></div>
        <div class="heatmap">${squares.join('')}</div>
      </div>
      <div class="card"><h2>${esc(L.milestones)}</h2><ul class="milestones">${milestones}</ul></div>
      <div class="card"><h2>${esc(L.phases)}</h2><ul class="phase-list">${phases}</ul></div>
      <div class="card"><h2>${esc(L.notes)}</h2>${notes ? `<ul class="notes">${notes}</ul>` : `<p class="muted">${esc(L.noNotes)}</p>`}</div>
    `;
  }

  function renderSettings() {
    const L = t();
    const pos = position();
    $('#view-settings').innerHTML = `
      <div class="card">
        <label class="field"><span>${esc(L.startDate)}</span>
          <input type="date" id="startDate" value="${state.startDate}"></label>
        <p class="muted small">${esc(L.startDateHelp)}</p>
        <div class="inline">
          <label class="field grow"><span>${esc(L.setWeek)}</span>
            <input type="number" id="weekNo" min="1" max="${WEEKS}" value="${pos.week}"></label>
          <button class="btn" id="setWeekBtn">${esc(L.setWeekBtn)}</button>
        </div>
        <p class="muted small">${esc(L.setWeekHelp)}</p>
        <button class="btn wide" id="backfillBtn">${esc(L.backfill)}</button>
      </div>
      <div class="card">
        <h2>${esc(L.language)}</h2>
        <div class="inline">
          <button class="btn ${state.lang === 'fi' ? 'primary' : ''}" data-lang="fi">Suomi</button>
          <button class="btn ${state.lang === 'en' ? 'primary' : ''}" data-lang="en">English</button>
        </div>
      </div>
      <div class="card">
        <h2>${esc(L.dataTitle)}</h2>
        <p class="muted small">${esc(L.dataHelp)}</p>
        <div class="stack">
          <button class="btn" id="exportBtn">${esc(L.exportBtn)}</button>
          <label class="btn file">${esc(L.importBtn)}<input type="file" id="importFile" accept="application/json,.json" hidden></label>
          <button class="btn danger" id="resetBtn">${esc(L.reset)}</button>
        </div>
      </div>
      <div class="card">
        <h2>${esc(L.guideTitle)}</h2>
        <dl class="guide">${L.guide.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>
      </div>
    `;
  }

  function renderChrome() {
    const L = t();
    document.documentElement.lang = state.lang;
    document.title = L.appName;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = L[el.dataset.i18n];
      if (typeof v === 'string') el.textContent = v;
    });
    $('#langToggle').textContent = state.lang === 'fi' ? 'EN' : 'FI';
    document.querySelectorAll('.tabs [data-view]').forEach((b) =>
      b.setAttribute('aria-selected', String(b.dataset.view === currentView)));
    document.querySelectorAll('.view').forEach((v) => { v.hidden = v.id !== `view-${currentView}`; });
  }

  function render() {
    renderChrome();
    if (currentView === 'today') renderToday();
    if (currentView === 'plan') {
      renderPlan();
      if (scrollToCurrent) {
        scrollToCurrent = false;
        const pos = position();
        const el = document.getElementById(`week-${pos.week}`);
        if (el && pos.week > 1) requestAnimationFrame(() => el.scrollIntoView({ block: 'center' }));
      }
    }
    if (currentView === 'progress') renderProgress();
    if (currentView === 'settings') renderSettings();
  }

  function show(view, weekToScroll) {
    currentView = view;
    scrollToCurrent = view === 'plan' && !weekToScroll;
    render();
    if (weekToScroll) {
      const el = document.getElementById(`week-${weekToScroll}`);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'center' }));
    } else if (view !== 'plan') {
      window.scrollTo(0, 0);
    }
  }

  // ---------------------------------------------------------------- dialog
  const dlg = $('#dayDialog');
  let dlgTarget = null;

  function openDay(w, d) {
    const L = t();
    const wo = workout(w, d);
    const e = entry(w, d);
    dlgTarget = { w, d };
    $('#dlgMeta').textContent = `${L.week} ${w} · ${dayName(w, d)} ${fmtDay(dateFor(w, d))}`;
    $('#dlgType').innerHTML = `${badge(wo.type)} ${statusLabel(e)}`;
    $('#dlgText').textContent = wo[state.lang];
    $('#dlgNote').value = e.note || '';
    dlg.returnValue = '';
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }

  dlg.addEventListener('close', () => {
    if (!dlgTarget) return;
    const { w, d } = dlgTarget;
    dlgTarget = null;
    const action = dlg.returnValue;
    const note = $('#dlgNote').value;
    if (action === 'done' || action === 'skipped' || action === 'clear') setEntry(w, d, action, note);
    else if (note.trim() !== (entry(w, d).note || '')) setEntry(w, d, null, note);
  });

  // ---------------------------------------------------------------- events
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('button, [data-goto-week], .cell[data-w]');
    if (!el) return;

    if (el.matches('.tabs [data-view]')) return show(el.dataset.view);
    if (el.id === 'langToggle') { state.lang = state.lang === 'fi' ? 'en' : 'fi'; save(); return render(); }
    if (el.dataset.lang) { state.lang = el.dataset.lang; save(); return render(); }
    if (el.dataset.goto) return show(el.dataset.goto);
    if (el.dataset.gotoWeek) return show('plan', Number(el.dataset.gotoWeek));

    const w = Number(el.dataset.w), d = Number(el.dataset.d);
    if (el.dataset.act && w) {
      const cur = entry(w, d).s;
      if (el.dataset.act === 'open') return openDay(w, d);
      justToggled = key(w, d);
      setEntry(w, d, cur === el.dataset.act ? 'clear' : el.dataset.act);
      justToggled = null;
      return;
    }
    if (w && el.closest('.view') && !el.closest('dialog')) return openDay(w, d);

    if (el.id === 'setWeekBtn') {
      const n = Math.min(WEEKS, Math.max(1, Number($('#weekNo').value) || 1));
      state.startDate = toISO(addDays(mondayOf(startOfToday()), -(n - 1) * 7));
      save(); return render();
    }
    if (el.id === 'backfillBtn') {
      if (!confirm(t().backfillConfirm)) return;
      const pos = position();
      const limit = pos.status === 'after' ? WEEKS * 7 : pos.idx;
      for (let i = 0; i < limit; i++) {
        const ww = Math.floor(i / 7) + 1, dd = i % 7;
        const k = key(ww, dd);
        if (!state.log[k] || !state.log[k].s) state.log[k] = { ...(state.log[k] || {}), s: 'done', t: dateFor(ww, dd).getTime() };
      }
      save(); return render();
    }
    if (el.id === 'exportBtn') {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `juoksukoulu-${toISO(new Date())}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return;
    }
    if (el.id === 'resetBtn') {
      if (!confirm(t().resetConfirm)) return;
      state = defaultState(); save(); return render();
    }
  });

  // Day cells are divs (they contain the check button), so give them keyboard activation.
  document.addEventListener('keydown', (ev) => {
    const cell = ev.target.closest && ev.target.closest('.cell[data-w]');
    if (!cell || ev.target !== cell || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    ev.preventDefault();
    openDay(Number(cell.dataset.w), Number(cell.dataset.d));
  });

  document.addEventListener('change', (ev) => {
    if (ev.target.id === 'startDate' && ev.target.value) {
      state.startDate = toISO(mondayOnOrAfter(fromISO(ev.target.value)));
      save(); render();
    }
    if (ev.target.id === 'importFile' && ev.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try { state = sanitize(JSON.parse(reader.result)); save(); render(); alert(t().importOk); }
        catch (e) { alert(t().importFail); }
      };
      reader.readAsText(ev.target.files[0]);
    }
  });

  // Re-render when the day changes while the app stays open.
  let lastDay = toISO(startOfToday());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && toISO(startOfToday()) !== lastDay) { lastDay = toISO(startOfToday()); render(); }
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  render();
})();
