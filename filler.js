(function () {
  'use strict';

  if (typeof window !== 'undefined' && window.__TELETALK_JOBS_FILLER_ACTIVE__) {
    return;
  }
  if (typeof window !== 'undefined') {
    window.__TELETALK_JOBS_FILLER_ACTIVE__ = true;
  }

  const STYLE_ID = 'tjf-injected-styles';
  const TOAST_ID = 'tjf-autofill-toast';
  const DEFAULT_WAIT_TIMEOUT_MS = 3000;

  const MONTH_NAMES = [
    ['january', 'jan', '01', '1'],
    ['february', 'feb', '02', '2'],
    ['march', 'mar', '03', '3'],
    ['april', 'apr', '04', '4'],
    ['may', '05', '5'],
    ['june', 'jun', '06', '6'],
    ['july', 'jul', '07', '7'],
    ['august', 'aug', '08', '8'],
    ['september', 'sep', 'sept', '09', '9'],
    ['october', 'oct', '10'],
    ['november', 'nov', '11'],
    ['december', 'dec', '12']
  ];

  /**
   * Bidirectional alias groups for Bangladesh districts, upazilas, boards,
   * exams, result types, quotas, universities, and durations.
   */
  const ALIAS_GROUPS = [
    // Districts & Boards (Old vs New spellings)
    ['chattogram', 'chittagong', 'ctg'],
    ['cumilla', 'comilla'],
    ['barishal', 'barisal'],
    ['jashore', 'jessore'],
    ['bogura', 'bogra'],
    ['brahmanbaria', 'b.baria', 'b baria'],
    ['chapai nawabganj', 'chapainawabganj', 'nawabganj'],
    ["cox's bazar", 'coxs bazar', 'coxsbazar'],
    ['jhalakathi', 'jhalokati', 'jhalokathi'],
    ['khagrachhari', 'khagrachari'],
    ['lakshmipur', 'laxmipur'],
    ['moulvibazar', 'maulvibazar', 'moulovi bazar'],
    ['netrokona', 'netrakona'],
    ['madrasah', 'madrasa'],
    ['bangladesh technical education board (bteb)', 'technical', 'bteb', 'bangladesh technical education board'],
    ['cambridge international - igce', 'cambridge international', 'igce', 'igcse'],
    ['edexcel international', 'edexcel'],

    // Upazila known spelling variations in Teletalk databases
    ['agailihara', 'agailjhara'],
    ['gaibanda sadar', 'gaibandha sadar'],
    ['gobidaganj', 'gobindaganj'],
    ['shajhanpur', 'shajahanpur'],
    ['dhonbari', 'dhanbari'],
    ['chhagalnayian', 'chhagalnaiya'],
    ['daganbhuyian', 'daganbhuiyan'],
    ['chowghacha', 'chougachha', 'chaugachha'],
    ['komol nogor', 'kamalnagar'],
    ['siddirganj', 'siddhirganj'],
    ['shantiganj/ dakshin sunamganj', 'dakshin sunamganj', 'shantiganj'],
    ['bhalukha', 'bhaluka'],
    ['hossenpur', 'hossainpur'],
    ['tungi para', 'tungipara'],
    ['sher e bangla nagar', 'sher-e-bangla nagar'],
    ['barishal sadar (kotwali)', 'barishal sadar', 'barisal sadar'],
    ['noakhali sadar (sudharam)', 'noakhali sadar', 'sudharam'],
    ['boalia (sadar)', 'rajshahi sadar', 'boalia'],
    ['palong(sadar)', 'shariatpur sadar', 'palong'],
    ['nesarabad (swarupkati)', 'swarupkati', 'nesarabad'],
    ['kawkhali (betbunia)', 'kawkhali'],

    // Basic Info options
    ['islam', 'muslim'],
    ['hinduism', 'hindu'],
    ['buddhism', 'buddhist'],
    ['christianity', 'christian'],
    ['single', 'unmarried'],
    ['not applicable', 'non quota', 'non-quota', 'none', 'n/a'],
    ['child of freedom fighter', 'freedom fighter', 'ff'],
    ['physically challenged', 'physically handicapped', 'disabled'],
    ['govt. employee', 'govt. service', 'government service', 'govt employee'],
    ['semi govt. employee', 'semi-govt. service', 'semi govt employee'],

    // Education Results, Exams, Durations
    ['gpa(out of 5)', 'gpa (out of 5)', 'gpa out of 5', 'cgpa(out of 5)', 'cgpa (out of 5)', 'cgpa out of 5'],
    ['gpa(out of 4)', 'gpa (out of 4)', 'gpa out of 4', 'cgpa(out of 4)', 'cgpa (out of 4)', 'cgpa out of 4'],
    ['1st division', 'first division', '1st class', 'first class'],
    ['2nd division', 'second division', '2nd class', 'second class'],
    ['3rd division', 'third division', '3rd class', 'third class'],
    ['honors', 'honours'],
    ['pass course', 'degree (pass)', 'degree pass'],
    ['m.b.b.s./b.d.s', 'mbbs/bds', 'mbbs'],
    ['o level/cambridge', 'o level', 'o-level'],
    ['a level/sr. cambridge', 'a level', 'a-level'],
    ['01 year', '1 year', '1yr'],
    ['1.5 years', '1.5 year'],
    ['02 years', '2 years', '2yrs'],
    ['2.5 years', '2.5 year'],
    ['03 years', '3 years', '3yrs'],
    ['04 years', '4 years', '4yrs'],
    ['05 years', '5 years', '5yrs'],
    ['3+ years', '03+', '3+', 'more than 3 years'],

    // Universities
    ['dhaka university', 'university of dhaka', 'du'],
    ['rajshahi university', 'university of rajshahi', 'ru'],
    ['chittagong university', 'university of chittagong', 'cu'],
    ['barisal university', 'university of barisal', 'bu'],
    ['rangpur university', 'begum rokeya university, rangpur', 'begum rokeya university'],
    ['islamic university, kushtia', 'islamic university, bangladesh', 'islamic university'],
    ['jessore science & technology university', 'jessore university of science & technology', 'just'],
    ['bangladesh university of engineering & technology', 'buet'],
    ['dhaka university of engineering & technology', 'duet'],
    ['chittagong university of engineering & technology', 'cuet'],
    ['khulna university of engineering and technology', 'kuet'],
    ['rajshahi university of engineering & technology', 'ruet'],
    ['shahjalal university of science & technology', 'sust'],
    ['the university of asia pacific', 'university of asia pacific', 'uap'],
    ['southern university bangladesh', 'southern university of bangladesh, chittagong'],

    // Employment Types (Job Experiences)
    ['regular basis under revenue budget', 'regular basis', 'revenue budget'],
    ['ad-hoc basis under revenue budget', 'adhoc basis under revenue budget', 'ad-hoc basis', 'adhoc'],
    ['temporary basis under revenue budget', 'temporary basis'],
    ['work charged basis under revenue budget', 'work charged'],
    ['autonomous/semi autonomous organization', 'autonomous / semi autonomous organization', 'autonomous organization', 'semi autonomous organization', 'autonomous'],
    ['private organization', 'private service', 'private company', 'private'],
    ['business/self employed', 'business / self employed', 'self employed', 'self-employed', 'business']
  ];

  const ALIAS_LOOKUP = (() => {
    const map = new Map();
    for (const group of ALIAS_GROUPS) {
      const normalizedGroup = group.map((item) => normalizeText(item));
      for (const item of normalizedGroup) {
        if (!map.has(item)) {
          map.set(item, new Set());
        }
        const bucket = map.get(item);
        for (const peer of normalizedGroup) {
          bucket.add(peer);
        }
      }
    }
    return map;
  })();

  function normalizeText(str) {
    return String(str || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[`'’‘]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function compactText(str) {
    return normalizeText(str).replace(/[^a-z0-9\u0980-\u09ff]/g, '');
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    if (el.type === 'hidden') return false;
    let curr = el;
    while (curr && curr !== document.body && curr.nodeType === 1) {
      const style = window.getComputedStyle(curr);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      if (curr.classList && curr.classList.contains('hide')) {
        return false;
      }
      if (curr.hidden) {
        return false;
      }
      curr = curr.parentElement;
    }
    return true;
  }

  function isElementInteractive(el) {
    return Boolean(el && el.isConnected && !el.disabled && isElementVisible(el));
  }

  function matchesKind(el, kind) {
    if (!el || el.nodeType !== 1) return false;
    const tag = el.tagName;
    if (kind === 'select') return tag === 'SELECT';
    if (kind === 'checkbox') return tag === 'INPUT' && el.type === 'checkbox';
    if (kind === 'date') return tag === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'hidden' && el.type !== 'submit';
    if (kind === 'selectOrRadio') return tag === 'SELECT' || (tag === 'INPUT' && el.type === 'radio');
    if (kind === 'text') {
      if (tag === 'TEXTAREA') return true;
      if (tag === 'INPUT') {
        const t = (el.type || 'text').toLowerCase();
        return !['checkbox', 'radio', 'hidden', 'submit', 'button', 'reset', 'file', 'image'].includes(t);
      }
      return false;
    }
    return true;
  }

  function findSectionContainer(sectionKey) {
    if (!sectionKey || sectionKey === 'basic') {
      return document;
    }

    const sectionIdHints = {
      ssc: ['#sscSection', '#ssc_section', '#ssc_fieldset'],
      hsc: ['#hscSection', '#hsc_section', '#hsc_fieldset'],
      graduation: ['#graSection', '#gra_section', '#graduationSection', '#grad_section'],
      masters: ['#masSection', '#mas_section', '#mastersSection'],
      job_experience: ['#expSection', '#jobExpSection', '#experienceSection', '#exp_section'],
      other_experience: ['#otherExpSection', '#other_exp_section', '#otherQualificationSection']
    };

    if (sectionIdHints[sectionKey]) {
      for (const sel of sectionIdHints[sectionKey]) {
        const found = document.querySelector(sel);
        if (found) return found;
      }
    }

    const headingRegexes = {
      present_address: /present\s*address|বর্তমান\s*ঠিকানা|mailing\s*address/i,
      permanent_address: /permanent\s*address|স্থায়ী\s*ঠিকানা|স্থায়ী\s*ঠিকানা/i,
      ssc: /s\.?s\.?c\s*\/\s*equivalent|s\.?s\.?c\.?\s*level|secondary\s*school|মাধ্যমিক/i,
      hsc: /h\.?s\.?c\s*\/\s*equivalent|h\.?s\.?c\.?\s*level|higher\s*secondary|উচ্চ\s*মাধ্যমিক/i,
      graduation: /graduation|bachelor|honours|honors|স্নাতক/i,
      masters: /masters|master's|post\s*grad|স্নাতকোত্তর/i,
      job_experience: /job\s*experiences?|professional\s*experiences?|employment\s*history|চাকরির\s*অভিজ্ঞতা/i,
      other_experience: /other\s*qualifications?\s*(?:\/|\s*or\s*|\s*and\s*)?\s*experiences?|other\s*experiences?|অন্যান্য\s*যোগ্যতা/i
    };

    const rx = headingRegexes[sectionKey];
    if (!rx) return document;

    const fieldsets = Array.from(document.querySelectorAll('fieldset'));
    for (const fs of fieldsets) {
      const legend = fs.querySelector('legend');
      if (legend && rx.test(legend.textContent || '')) {
        return fs;
      }
    }

    const headingNodes = Array.from(document.querySelectorAll('legend, h1, h2, h3, h4, h5, h6, th, td, div.panel-heading, div.card-header'));
    for (const node of headingNodes) {
      const txt = normalizeText(node.textContent || '');
      if (txt.length > 0 && txt.length < 90 && rx.test(txt)) {
        const container = node.closest('fieldset, section, .card, .panel, table');
        if (container) return container;
      }
    }

    return document;
  }

  function findControlNearLabel(labelEl, kind) {
    if (labelEl.htmlFor) {
      const target = document.getElementById(labelEl.htmlFor);
      if (target && matchesKind(target, kind)) return target;
    }

    const nested = Array.from(labelEl.querySelectorAll('input, select, textarea')).find((el) => matchesKind(el, kind));
    if (nested) return nested;

    const group = labelEl.closest('.form-group, .row, .form-row, .col, td, th, tr');
    if (group) {
      const controls = Array.from(group.querySelectorAll('input, select, textarea')).filter((el) => matchesKind(el, kind));
      if (controls.length === 1) return controls[0];
      // If multiple controls (e.g. select + gpa input), pick first matching kind after label
      if (controls.length > 1) return controls[0];
    }

    let sibling = labelEl.nextElementSibling;
    while (sibling) {
      if (matchesKind(sibling, kind)) return sibling;
      const inside = Array.from(sibling.querySelectorAll('input, select, textarea')).find((el) => matchesKind(el, kind));
      if (inside) return inside;
      sibling = sibling.nextElementSibling;
    }

    return null;
  }

  function findFieldElement(descriptor) {
    const { selectors = [], labelPatterns = [], kind = 'text', section = 'basic' } = descriptor;

    // Layer 1: Direct selector matching filtered by expected control kind
    for (const sel of selectors) {
      let candidates;
      try {
        candidates = Array.from(document.querySelectorAll(sel));
      } catch (_err) {
        continue;
      }
      for (const el of candidates) {
        if (matchesKind(el, kind)) {
          return el;
        }
      }
    }

    // Layer 2: Section-scoped label & table-cell heuristic
    if (labelPatterns.length === 0) return null;
    const container = findSectionContainer(section);

    // 2A. Inspect <label> elements
    const labels = Array.from(container.querySelectorAll('label'));
    for (const label of labels) {
      const text = normalizeText(label.textContent || '').replace(/\*+$/, '').trim();
      if (!text) continue;
      if (labelPatterns.some((rx) => rx.test(text))) {
        const control = findControlNearLabel(label, kind);
        if (control) return control;
      }
    }

    // 2B. Inspect legacy <td> / <th> cells
    const cells = Array.from(container.querySelectorAll('td, th'));
    for (const cell of cells) {
      if (cell.querySelector('input, select, textarea') && (cell.textContent || '').trim().length > 80) {
        continue;
      }
      const cellText = normalizeText(cell.textContent || '').replace(/[:*]+$/, '').trim();
      if (!cellText || cellText.length > 80) continue;
      if (labelPatterns.some((rx) => rx.test(cellText))) {
        // Check inside same cell first
        const sameCell = Array.from(cell.querySelectorAll('input, select, textarea')).find((el) => matchesKind(el, kind));
        if (sameCell) return sameCell;

        // Walk sibling <td> cells in the same <tr>
        let nextCell = cell.nextElementSibling;
        let hops = 0;
        while (nextCell && hops < 3) {
          const found = Array.from(nextCell.querySelectorAll('input, select, textarea')).find((el) => matchesKind(el, kind));
          if (found) return found;
          nextCell = nextCell.nextElementSibling;
          hops++;
        }
      }
    }

    return null;
  }

  function setNativeValue(el, value) {
    const tag = el.tagName;
    let proto = HTMLElement.prototype;
    if (tag === 'INPUT') proto = HTMLInputElement.prototype;
    else if (tag === 'TEXTAREA') proto = HTMLTextAreaElement.prototype;
    else if (tag === 'SELECT') proto = HTMLSelectElement.prototype;

    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && typeof desc.set === 'function') {
      desc.set.call(el, value);
    } else {
      el.value = value;
    }
  }

  function dispatchFieldEvents(el, includeKeyup = true) {
    try {
      el.dispatchEvent(new FocusEvent('focus', { bubbles: false }));
    } catch (_e) {
      el.dispatchEvent(new Event('focus', { bubbles: false }));
    }

    try {
      el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
    } catch (_e) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (includeKeyup) {
      try {
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Unidentified' }));
      } catch (_e) {
        // Ignore in restricted environments
      }
    }

    el.dispatchEvent(new Event('change', { bubbles: true }));

    try {
      el.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    } catch (_e) {
      el.dispatchEvent(new Event('blur', { bubbles: false }));
    }
  }

  function buildTargetCandidates(targetValue) {
    const norm = normalizeText(targetValue);
    const candidates = new Set([norm]);
    const aliases = ALIAS_LOOKUP.get(norm);
    if (aliases) {
      for (const a of aliases) candidates.add(a);
    }
    return Array.from(candidates);
  }

  function findMatchingOption(selectEl, targetValue) {
    if (!selectEl || !targetValue) return null;
    const options = Array.from(selectEl.options || []).filter((opt) => {
      if (opt.disabled) return false;
      const val = String(opt.value || '').trim();
      const txt = normalizeText(opt.textContent || '');
      if (val === '' && (txt === '' || txt === 'select' || txt.startsWith('select ') || txt.startsWith('--'))) {
        return false;
      }
      return true;
    });

    if (options.length === 0) return null;

    const candidates = buildTargetCandidates(targetValue);
    const compactCandidates = candidates.map((c) => compactText(c)).filter(Boolean);

    // Tier 1: Exact value or normalized case-insensitive exact label
    for (const cand of candidates) {
      for (const opt of options) {
        if (normalizeText(opt.value) === cand || normalizeText(opt.textContent) === cand) {
          return opt;
        }
      }
    }

    // Tier 2: Compact alphanumeric/Bangla comparison (handles S.S.C vs SSC, NarailSadar vs Narail Sadar, GPA(out of 5) vs GPA (out of 5))
    for (const comp of compactCandidates) {
      for (const opt of options) {
        if (compactText(opt.textContent) === comp || compactText(opt.value) === comp) {
          return opt;
        }
      }
    }

    // Tier 3: Parenthetical / Sadar strip match (e.g. "Barishal Sadar" <-> "Barishal Sadar (Kotwali)")
    for (const cand of candidates) {
      const candBase = cand.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
      for (const opt of options) {
        const optNorm = normalizeText(opt.textContent);
        const optBase = optNorm.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
        if (candBase && optBase && (optBase === candBase || compactText(optBase) === compactText(candBase))) {
          return opt;
        }
      }
    }

    // Tier 4: Safe word-boundary substring match (min 4 chars; prevents "male" matching "female")
    for (const cand of candidates) {
      if (cand.length < 4) continue;
      const wordRx = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(cand)}(?:$|[^a-z0-9])`, 'i');
      for (const opt of options) {
        const optNorm = normalizeText(opt.textContent);
        if (wordRx.test(optNorm)) {
          return opt;
        }
        if (optNorm.length >= 4) {
          const revRx = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(optNorm)}(?:$|[^a-z0-9])`, 'i');
          if (revRx.test(cand)) {
            return opt;
          }
        }
      }
    }

    return null;
  }

  function getValidOptionCount(selectEl) {
    if (!selectEl) return 0;
    return Array.from(selectEl.options || []).filter((o) => !o.disabled && String(o.value || '').trim() !== '').length;
  }

  function waitForSelectOptions(finderFn, targetValue, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
    return new Promise((resolve) => {
      const checkReady = () => {
        const sel = finderFn();
        if (!sel || sel.disabled) return null;
        if (targetValue) {
          const matched = findMatchingOption(sel, targetValue);
          if (matched) return sel;
        } else if (getValidOptionCount(sel) > 0) {
          return sel;
        }
        return null;
      };

      const initial = checkReady();
      if (initial) {
        resolve(initial);
        return;
      }

      let done = false;
      let observer = null;
      let pollId = null;
      let timeoutId = null;

      const finish = (result) => {
        if (done) return;
        done = true;
        if (observer) observer.disconnect();
        if (pollId) clearInterval(pollId);
        if (timeoutId) clearTimeout(timeoutId);
        resolve(result);
      };

      if (typeof MutationObserver !== 'undefined' && document.body) {
        observer = new MutationObserver(() => {
          const found = checkReady();
          if (found) finish(found);
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['disabled', 'class', 'style']
        });
      }

      pollId = setInterval(() => {
        const found = checkReady();
        if (found) finish(found);
      }, 80);

      timeoutId = setTimeout(() => {
        finish(finderFn());
      }, timeoutMs);
    });
  }

  function waitForVisibleAndEnabled(finderFn, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
    return new Promise((resolve) => {
      const checkReady = () => {
        const el = finderFn();
        if (el && isElementInteractive(el)) return el;
        return null;
      };

      const initial = checkReady();
      if (initial) {
        resolve(initial);
        return;
      }

      let done = false;
      let observer = null;
      let pollId = null;
      let timeoutId = null;

      const finish = (result) => {
        if (done) return;
        done = true;
        if (observer) observer.disconnect();
        if (pollId) clearInterval(pollId);
        if (timeoutId) clearTimeout(timeoutId);
        resolve(result);
      };

      if (typeof MutationObserver !== 'undefined' && document.body) {
        observer = new MutationObserver(() => {
          const found = checkReady();
          if (found) finish(found);
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['disabled', 'class', 'style', 'hidden']
        });
      }

      pollId = setInterval(() => {
        const found = checkReady();
        if (found) finish(found);
      }, 80);

      timeoutId = setTimeout(() => {
        finish(finderFn());
      }, timeoutMs);
    });
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tjf-field-filled {
        border: 2px solid #22c55e !important;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2) !important;
        background-color: #f0fdf4 !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
      }
      .tjf-field-warning {
        border: 2px solid #f59e0b !important;
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.24) !important;
        background-color: #fefce8 !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
      }
      #${TOAST_ID} {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2147483647;
        max-width: 390px;
        min-width: 280px;
        background: #064e3b;
        color: #ecfdf5;
        border: 1.5px solid #10b981;
        border-radius: 12px;
        padding: 13px 15px;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-size: 13.5px;
        line-height: 1.45;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      #${TOAST_ID}.tjf-toast-warn {
        background: #78350f;
        color: #fffbeb;
        border-color: #f59e0b;
      }
      #${TOAST_ID} .tjf-toast-body {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      #${TOAST_ID} .tjf-toast-title {
        font-weight: 700;
        font-size: 13.5px;
      }
      #${TOAST_ID} .tjf-toast-sub {
        font-size: 12px;
        opacity: 0.92;
      }
      #${TOAST_ID} .tjf-toast-close {
        background: transparent;
        border: none;
        color: inherit;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        opacity: 0.8;
        padding: 2px 4px;
      }
      #${TOAST_ID} .tjf-toast-close:hover {
        opacity: 1;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  let toastAutoHideTimer = null;

  function showToast(title, subtitle = '', variant = 'info', autoHideMs = 0) {
    injectStyles();
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      const body = document.createElement('div');
      body.className = 'tjf-toast-body';
      const titleEl = document.createElement('div');
      titleEl.className = 'tjf-toast-title';
      const subEl = document.createElement('div');
      subEl.className = 'tjf-toast-sub';
      body.appendChild(titleEl);
      body.appendChild(subEl);

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'tjf-toast-close';
      closeBtn.textContent = '✕';
      closeBtn.title = 'Dismiss';
      closeBtn.addEventListener('click', () => {
        toast.remove();
      });

      toast.appendChild(body);
      toast.appendChild(closeBtn);
      (document.body || document.documentElement).appendChild(toast);
    }

    toast.className = variant === 'warn' ? 'tjf-toast-warn' : '';
    toast.querySelector('.tjf-toast-title').textContent = title;
    const subEl = toast.querySelector('.tjf-toast-sub');
    subEl.textContent = subtitle;
    subEl.style.display = subtitle ? 'block' : 'none';

    if (toastAutoHideTimer) {
      clearTimeout(toastAutoHideTimer);
      toastAutoHideTimer = null;
    }
    if (autoHideMs > 0) {
      toastAutoHideTimer = setTimeout(() => {
        const current = document.getElementById(TOAST_ID);
        if (current) current.remove();
      }, autoHideMs);
    }
  }

  function clearPreviousHighlights() {
    document.querySelectorAll('.tjf-field-filled, .tjf-field-warning').forEach((el) => {
      el.classList.remove('tjf-field-filled', 'tjf-field-warning');
    });
  }

  function attachClearOnEdit(el) {
    if (!el || el.dataset.tjfBound) return;
    el.dataset.tjfBound = '1';
    const clearFn = () => {
      el.classList.remove('tjf-field-filled', 'tjf-field-warning');
    };
    el.addEventListener('input', clearFn, { once: false });
    el.addEventListener('change', clearFn, { once: false });
  }

  function markFilled(el) {
    if (!el) return;
    el.classList.remove('tjf-field-warning');
    el.classList.add('tjf-field-filled');
    attachClearOnEdit(el);
  }

  function markWarning(el) {
    if (!el) return;
    el.classList.remove('tjf-field-filled');
    el.classList.add('tjf-field-warning');
    attachClearOnEdit(el);
  }

  function toggleCheckbox(checkbox, targetChecked) {
    if (!checkbox || checkbox.disabled) return false;
    const desired = Boolean(targetChecked);
    if (checkbox.checked !== desired) {
      // Teletalk uses inline onclick="ifApplicable(this)" / onclick="onOffSameAsBtn(this)"
      checkbox.click();
      if (checkbox.checked !== desired) {
        checkbox.checked = desired;
        dispatchFieldEvents(checkbox, false);
      }
    }
    return true;
  }

  function fillTextField(el, value, stats) {
    if (!el || !value) return false;
    // Leave pre-verified locked fields intact if already populated
    if ((el.disabled || el.readOnly) && String(el.value || '').trim() !== '') {
      markFilled(el);
      stats.filledCount++;
      return true;
    }
    if (!isElementInteractive(el)) return false;

    const strVal = String(value).trim();
    const maxLen = el.maxLength && el.maxLength > 0 ? el.maxLength : 0;
    const finalVal = maxLen > 0 ? strVal.slice(0, maxLen) : strVal;

    setNativeValue(el, finalVal);
    dispatchFieldEvents(el, true);
    markFilled(el);
    stats.filledCount++;
    return true;
  }

  function selectOptionSmart(selectEl, targetValue, stats) {
    if (!selectEl || !targetValue) return false;
    if ((selectEl.disabled || selectEl.readOnly) && String(selectEl.value || '').trim() !== '') {
      markFilled(selectEl);
      stats.filledCount++;
      return true;
    }
    if (!isElementInteractive(selectEl)) return false;

    const matched = findMatchingOption(selectEl, targetValue);
    if (!matched) {
      markWarning(selectEl);
      stats.mismatchedElements.add(selectEl);
      return false;
    }

    setNativeValue(selectEl, matched.value);
    matched.selected = true;
    dispatchFieldEvents(selectEl, false);
    markFilled(selectEl);
    stats.filledCount++;
    return true;
  }

  function fillSelectOrRadio(descriptor, targetValue, stats) {
    if (!targetValue) return false;
    const el = findFieldElement(descriptor);
    if (!el) return false;

    if (el.tagName === 'SELECT') {
      return selectOptionSmart(el, targetValue, stats);
    }

    if (el.type === 'radio' && el.name) {
      const radios = Array.from(document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`));
      const targetNorm = normalizeText(targetValue);
      const candidates = buildTargetCandidates(targetValue);
      for (const radio of radios) {
        const lbl = radio.id ? document.querySelector(`label[for="${CSS.escape(radio.id)}"]`) : radio.closest('label');
        const lblText = normalizeText(lbl ? lbl.textContent : '');
        const valText = normalizeText(radio.value);
        if (candidates.includes(valText) || candidates.includes(lblText) || (targetNorm && valText === targetNorm)) {
          radio.click();
          dispatchFieldEvents(radio, false);
          markFilled(radio);
          stats.filledCount++;
          return true;
        }
      }
    }
    return false;
  }

  function formatDobForTextInput(isoDate, inputEl) {
    const [yyyy, mm, dd] = isoDate.split('-');
    const hint = (
      (inputEl.placeholder || '') + ' ' +
      (inputEl.getAttribute('data-format') || '') + ' ' +
      (inputEl.title || '')
    ).toLowerCase();

    if (/yyyy[-/]mm[-/]dd/.test(hint)) {
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/dd[-/]mm[-/]yyyy/.test(hint)) {
      return `${dd}/${mm}/${yyyy}`;
    }
    return `${mm}/${dd}/${yyyy}`;
  }

  function fillDob(dobValue, stats) {
    if (!dobValue || !/^\d{4}-\d{2}-\d{2}$/.test(dobValue)) return;
    const [yyyy, mm, dd] = dobValue.split('-');

    const mainDob = findFieldElement(FIELD_MAP.dob);
    if (mainDob) {
      if ((mainDob.disabled || mainDob.readOnly) && String(mainDob.value || '').trim() !== '') {
        markFilled(mainDob);
        stats.filledCount++;
        return;
      }
      if (isElementInteractive(mainDob)) {
        const valToSet = mainDob.type === 'date' ? dobValue : formatDobForTextInput(dobValue, mainDob);
        setNativeValue(mainDob, valToSet);
        dispatchFieldEvents(mainDob, true);
        markFilled(mainDob);
        stats.filledCount++;
        return;
      }
    }

    // Fallback: Legacy 3-dropdown Date of Birth (Day / Month / Year)
    const dayEl = findFieldElement(FIELD_MAP.dob_day);
    const monthEl = findFieldElement(FIELD_MAP.dob_month);
    const yearEl = findFieldElement(FIELD_MAP.dob_year);

    if (dayEl) {
      const dayNum = String(parseInt(dd, 10));
      if (!selectOptionSmart(dayEl, dd, stats)) {
        selectOptionSmart(dayEl, dayNum, stats);
      }
    }
    if (monthEl) {
      const monthIdx = parseInt(mm, 10) - 1;
      const monthAliases = MONTH_NAMES[monthIdx] || [mm];
      let matched = false;
      for (const alias of monthAliases) {
        if (findMatchingOption(monthEl, alias)) {
          matched = selectOptionSmart(monthEl, alias, stats);
          break;
        }
      }
      if (!matched) {
        markWarning(monthEl);
        stats.mismatchedElements.add(monthEl);
      }
    }
    if (yearEl) {
      selectOptionSmart(yearEl, yyyy, stats);
    }
  }

  /**
   * Field descriptors covering Modern Alljobs/DGBPO IDs + Legacy PHP Ministry names + Bangla/English label fallbacks.
   */
  const FIELD_MAP = {
    name: {
      kind: 'text',
      section: 'basic',
      selectors: ['#name', '[name="name"]', '#applicant_name', '[name="applicant_name"]', '#app_name', '[name="app_name"]'],
      labelPatterns: [/applicant'?s\s*name/i, /^name\s*of\s*(?:the\s*)?applicant/i]
    },
    name_bn: {
      kind: 'text',
      section: 'basic',
      selectors: ['#name_bn', '[name="name_bn"]', '#bname', '[name="bname"]', '#applicant_name_bn', '[name="applicant_name_bn"]'],
      labelPatterns: [/আবেদনকারীর\s*নাম/, /name.*bangla/i]
    },
    father: {
      kind: 'text',
      section: 'basic',
      selectors: ['#father', '[name="father"]', '#fname', '[name="fname"]', '#father_name', '[name="father_name"]'],
      labelPatterns: [/^father'?s\s*name$/i, /father'?s\s*name\s*(?:\(english\))?/i]
    },
    father_bn: {
      kind: 'text',
      section: 'basic',
      selectors: ['#father_bn', '[name="father_bn"]', '#bfname', '[name="bfname"]', '#father_name_bn', '[name="father_name_bn"]'],
      labelPatterns: [/পিতার\s*নাম/, /father.*bangla/i]
    },
    mother: {
      kind: 'text',
      section: 'basic',
      selectors: ['#mother', '[name="mother"]', '#mname', '[name="mname"]', '#mother_name', '[name="mother_name"]'],
      labelPatterns: [/^mother'?s\s*name$/i, /mother'?s\s*name\s*(?:\(english\))?/i]
    },
    mother_bn: {
      kind: 'text',
      section: 'basic',
      selectors: ['#mother_bn', '[name="mother_bn"]', '#bmname', '[name="bmname"]', '#mother_name_bn', '[name="mother_name_bn"]'],
      labelPatterns: [/মাতার\s*নাম/, /mother.*bangla/i]
    },
    dob: {
      kind: 'date',
      section: 'basic',
      selectors: ['#dob', '[name="dob"]', '#birth_date', '[name="birth_date"]', '#date_of_birth', '[name="date_of_birth"]'],
      labelPatterns: [/date\s*of\s*birth/i, /জন্ম\s*তারিখ/]
    },
    dob_day: {
      kind: 'select',
      section: 'basic',
      selectors: ['#b_day', '[name="b_day"]', '#dob_day', '[name="dob_day"]', '#day', '[name="day"]'],
      labelPatterns: [/^day$/i]
    },
    dob_month: {
      kind: 'select',
      section: 'basic',
      selectors: ['#b_month', '[name="b_month"]', '#dob_month', '[name="dob_month"]', '#month', '[name="month"]'],
      labelPatterns: [/^month$/i]
    },
    dob_year: {
      kind: 'select',
      section: 'basic',
      selectors: ['#b_year', '[name="b_year"]', '#dob_year', '[name="dob_year"]', '#year', '[name="year"]'],
      labelPatterns: [/^year$/i]
    },
    nationality: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#nationality', '[name="nationality"]'],
      labelPatterns: [/nationality/i, /জাতীয়তা|জাতীয়তা/]
    },
    religion: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#religion', '[name="religion"]'],
      labelPatterns: [/religion/i, /ধর্ম/]
    },
    gender: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#gender', '[name="gender"]', '#sex', '[name="sex"]'],
      labelPatterns: [/^gender$/i, /^sex$/i, /লিঙ্গ/]
    },
    nid_has: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#nid', '[name="nid"]', '#nid_status', '[name="nid_status"]', '#has_nid', '[name="has_nid"]'],
      labelPatterns: [/^national\s*id$/i, /^nid$/i, /জাতীয়\s*পরিচয়পত্র|জাতীয়\s*পরিচয়পত্র/]
    },
    nid_no: {
      kind: 'text',
      section: 'basic',
      selectors: ['#nid_no', '[name="nid_no"]', '#nid_number', '[name="nid_number"]', '#national_id', '[name="national_id"]', '#nid', '[name="nid"]'],
      labelPatterns: [/national\s*id\s*(?:number|no)/i, /nid\s*(?:number|no)/i]
    },
    breg_has: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#breg', '[name="breg"]', '#breg_status', '[name="breg_status"]', '#birth_reg', '[name="birth_reg"]'],
      labelPatterns: [/^birth\s*registration$/i, /জন্ম\s*নিবন্ধন/]
    },
    breg_no: {
      kind: 'text',
      section: 'basic',
      selectors: ['#breg_no', '[name="breg_no"]', '#breg_number', '[name="breg_number"]', '#birth_reg_no', '[name="birth_reg_no"]', '#breg', '[name="breg"]'],
      labelPatterns: [/birth\s*registration\s*(?:number|no)/i]
    },
    passport_has: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#passport', '[name="passport"]', '#passport_status', '[name="passport_status"]'],
      labelPatterns: [/^passport\s*id$/i, /^passport$/i, /পাসপোর্ট/]
    },
    passport_no: {
      kind: 'text',
      section: 'basic',
      selectors: ['#passport_no', '[name="passport_no"]', '#passport_number', '[name="passport_number"]', '#passport', '[name="passport"]'],
      labelPatterns: [/passport\s*(?:number|no)/i]
    },
    marital_status: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#marital_status', '[name="marital_status"]', '#mstatus', '[name="mstatus"]', '#marital', '[name="marital"]'],
      labelPatterns: [/marital\s*status/i, /বৈবাহিক\s*অবস্থা/]
    },
    spouse_name: {
      kind: 'text',
      section: 'basic',
      selectors: ['#spouse_name', '[name="spouse_name"]', '#sname', '[name="sname"]', '#spouse', '[name="spouse"]'],
      labelPatterns: [/spouse\s*name/i, /স্বামী\/স্ত্রী/]
    },
    mobile: {
      kind: 'text',
      section: 'basic',
      selectors: ['#mobile', '[name="mobile"]', '#mobileno', '[name="mobileno"]', '#mobile_no', '[name="mobile_no"]', '#phone', '[name="phone"]'],
      labelPatterns: [/^mobile\s*(?:number|no)?$/i, /মোবাইল/]
    },
    confirm_mobile: {
      kind: 'text',
      section: 'basic',
      selectors: ['#confirm_mobile', '[name="confirm_mobile"]', '#c_mobile', '[name="c_mobile"]', '#confirm_mobileno', '[name="confirm_mobileno"]', '#retype_mobile', '[name="retype_mobile"]'],
      labelPatterns: [/confirm\s*mobile/i, /re-?type\s*mobile/i]
    },
    email: {
      kind: 'text',
      section: 'basic',
      selectors: ['#email', '[name="email"]', '#email_address', '[name="email_address"]'],
      labelPatterns: [/^e-?mail/i, /ই-মেইল|ইমেইল/]
    },
    quota: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#quota', '[name="quota"]'],
      labelPatterns: [/^quota$/i, /কোটা/]
    },
    quota_details: {
      kind: 'text',
      section: 'basic',
      selectors: ['#quota_details', '[name="quota_details"]', '#ff_details', '[name="ff_details"]'],
      labelPatterns: [/freedom\s*fighter\s*details/i, /quota\s*details/i]
    },
    dep_status: {
      kind: 'selectOrRadio',
      section: 'basic',
      selectors: ['#dep_status', '[name="dep_status"]', '#dept_status', '[name="dept_status"]', '#departmental_status', '[name="departmental_status"]'],
      labelPatterns: [/departmental\s*status/i, /বিভাগীয়\s*অবস্থা|বিভাগীয়\s*অবস্থা/]
    },

    // Present Address
    present_careof: {
      kind: 'text',
      section: 'present_address',
      selectors: ['#present_careof', '[name="present_careof"]', '#present_care', '[name="present_care"]', '#care_of_present', '[name="care_of_present"]'],
      labelPatterns: [/care\s*of/i]
    },
    present_village: {
      kind: 'text',
      section: 'present_address',
      selectors: ['#present_village', '[name="present_village"]', '#present_vill', '[name="present_vill"]', '#present_address', '[name="present_address"]'],
      labelPatterns: [/village|road|house|flat/i]
    },
    present_district: {
      kind: 'select',
      section: 'present_address',
      selectors: ['#present_district', '[name="present_district"]', '#present_dist', '[name="present_dist"]', '#menu_one', '[name="menu_one"]'],
      labelPatterns: [/^district$/i, /জেলা/]
    },
    present_upazila: {
      kind: 'select',
      section: 'present_address',
      selectors: ['#present_upazila', '[name="present_upazila"]', '#present_thana', '[name="present_thana"]', '#present_ps', '[name="present_ps"]', '#menu_one_list', '[name="menu_one_list"]'],
      labelPatterns: [/upazila|thana|p\.?s\.?/i, /উপজেলা|থানা/]
    },
    present_post: {
      kind: 'text',
      section: 'present_address',
      selectors: ['#present_post', '[name="present_post"]', '#present_po', '[name="present_po"]', '#present_post_office', '[name="present_post_office"]'],
      labelPatterns: [/post\s*office/i, /ডাকঘর/]
    },
    present_postcode: {
      kind: 'text',
      section: 'present_address',
      selectors: ['#present_postcode', '[name="present_postcode"]', '#present_pc', '[name="present_pc"]', '#present_post_code', '[name="present_post_code"]'],
      labelPatterns: [/post\s*code/i, /পোস্ট\s*কোড/]
    },

    same_as_present: {
      kind: 'checkbox',
      section: 'permanent_address',
      selectors: ['#same_as_present', '[name="same_as_present"]', '#same_address', '[name="same_address"]', '#copy_address', '[name="copy_address"]'],
      labelPatterns: [/same\s*as\s*present/i]
    },

    // Permanent Address
    permanent_careof: {
      kind: 'text',
      section: 'permanent_address',
      selectors: ['#permanent_careof', '[name="permanent_careof"]', '#permanent_care', '[name="permanent_care"]', '#care_of_permanent', '[name="care_of_permanent"]'],
      labelPatterns: [/care\s*of/i]
    },
    permanent_village: {
      kind: 'text',
      section: 'permanent_address',
      selectors: ['#permanent_village', '[name="permanent_village"]', '#permanent_vill', '[name="permanent_vill"]', '#permanent_address', '[name="permanent_address"]'],
      labelPatterns: [/village|road|house|flat/i]
    },
    permanent_district: {
      kind: 'select',
      section: 'permanent_address',
      selectors: ['#permanent_district', '[name="permanent_district"]', '#permanent_dist', '[name="permanent_dist"]', '#menu_two', '[name="menu_two"]'],
      labelPatterns: [/^district$/i, /জেলা/]
    },
    permanent_upazila: {
      kind: 'select',
      section: 'permanent_address',
      selectors: ['#permanent_upazila', '[name="permanent_upazila"]', '#permanent_thana', '[name="permanent_thana"]', '#permanent_ps', '[name="permanent_ps"]', '#menu_two_list', '[name="menu_two_list"]'],
      labelPatterns: [/upazila|thana|p\.?s\.?/i, /উপজেলা|থানা/]
    },
    permanent_post: {
      kind: 'text',
      section: 'permanent_address',
      selectors: ['#permanent_post', '[name="permanent_post"]', '#permanent_po', '[name="permanent_po"]', '#permanent_post_office', '[name="permanent_post_office"]'],
      labelPatterns: [/post\s*office/i, /ডাকঘর/]
    },
    permanent_postcode: {
      kind: 'text',
      section: 'permanent_address',
      selectors: ['#permanent_postcode', '[name="permanent_postcode"]', '#permanent_pc', '[name="permanent_pc"]', '#permanent_post_code', '[name="permanent_post_code"]'],
      labelPatterns: [/post\s*code/i, /পোস্ট\s*কোড/]
    },

    // SSC / Equivalent
    ssc_exam: {
      kind: 'select',
      section: 'ssc',
      selectors: ['#ssc_exam', '[name="ssc_exam"]', '#exam1', '[name="exam1"]'],
      labelPatterns: [/examination/i]
    },
    ssc_board: {
      kind: 'select',
      section: 'ssc',
      selectors: ['#ssc_board', '[name="ssc_board"]', '#institute1', '[name="institute1"]', '#board1', '[name="board1"]'],
      labelPatterns: [/^board$/i]
    },
    ssc_board_other: {
      kind: 'text',
      section: 'ssc',
      selectors: ['#ssc_board_other', '[name="ssc_board_other"]', '#other_institute1', '[name="other_institute1"]'],
      labelPatterns: []
    },
    ssc_roll: {
      kind: 'text',
      section: 'ssc',
      selectors: ['#ssc_roll', '[name="ssc_roll"]', '#roll1', '[name="roll1"]'],
      labelPatterns: [/roll\s*no/i]
    },
    ssc_reg: {
      kind: 'text',
      section: 'ssc',
      selectors: ['#ssc_reg', '[name="ssc_reg"]', '#reg1', '[name="reg1"]', '#ssc_reg_no', '[name="ssc_reg_no"]'],
      labelPatterns: [/reg(?:istration)?\s*no/i]
    },
    ssc_result_type: {
      kind: 'select',
      section: 'ssc',
      selectors: ['#ssc_result_type', '[name="ssc_result_type"]', '#result1', '[name="result1"]', '#ssc_result', '[name="ssc_result"]'],
      labelPatterns: [/^result$/i, /result\s*type/i]
    },
    ssc_result: {
      kind: 'text',
      section: 'ssc',
      selectors: ['#ssc_result', '[name="ssc_result"]', '#result_gpa1', '[name="result_gpa1"]', '#ssc_gpa', '[name="ssc_gpa"]', '#ssc_point', '[name="ssc_point"]'],
      labelPatterns: [/gpa|point/i]
    },
    ssc_group: {
      kind: 'select',
      section: 'ssc',
      selectors: ['#ssc_group', '[name="ssc_group"]', '#subject1', '[name="subject1"]'],
      labelPatterns: [/group\s*\/\s*subject/i, /^group$/i]
    },
    ssc_group_other: {
      kind: 'text',
      section: 'ssc',
      selectors: ['#ssc_group_other', '[name="ssc_group_other"]', '#other_subject1', '[name="other_subject1"]'],
      labelPatterns: []
    },
    ssc_year: {
      kind: 'select',
      section: 'ssc',
      selectors: ['#ssc_year', '[name="ssc_year"]', '#year1', '[name="year1"]'],
      labelPatterns: [/passing\s*year/i]
    },

    // HSC / Equivalent
    hsc_exam: {
      kind: 'select',
      section: 'hsc',
      selectors: ['#hsc_exam', '[name="hsc_exam"]', '#exam2', '[name="exam2"]'],
      labelPatterns: [/examination/i]
    },
    hsc_board: {
      kind: 'select',
      section: 'hsc',
      selectors: ['#hsc_board', '[name="hsc_board"]', '#institute2', '[name="institute2"]', '#board2', '[name="board2"]'],
      labelPatterns: [/^board$/i]
    },
    hsc_board_other: {
      kind: 'text',
      section: 'hsc',
      selectors: ['#hsc_board_other', '[name="hsc_board_other"]', '#other_institute2', '[name="other_institute2"]'],
      labelPatterns: []
    },
    hsc_roll: {
      kind: 'text',
      section: 'hsc',
      selectors: ['#hsc_roll', '[name="hsc_roll"]', '#roll2', '[name="roll2"]'],
      labelPatterns: [/roll\s*no/i]
    },
    hsc_reg: {
      kind: 'text',
      section: 'hsc',
      selectors: ['#hsc_reg', '[name="hsc_reg"]', '#reg2', '[name="reg2"]', '#hsc_reg_no', '[name="hsc_reg_no"]'],
      labelPatterns: [/reg(?:istration)?\s*no/i]
    },
    hsc_result_type: {
      kind: 'select',
      section: 'hsc',
      selectors: ['#hsc_result_type', '[name="hsc_result_type"]', '#result2', '[name="result2"]', '#hsc_result', '[name="hsc_result"]'],
      labelPatterns: [/^result$/i, /result\s*type/i]
    },
    hsc_result: {
      kind: 'text',
      section: 'hsc',
      selectors: ['#hsc_result', '[name="hsc_result"]', '#result_gpa2', '[name="result_gpa2"]', '#hsc_gpa', '[name="hsc_gpa"]', '#hsc_point', '[name="hsc_point"]'],
      labelPatterns: [/gpa|point/i]
    },
    hsc_group: {
      kind: 'select',
      section: 'hsc',
      selectors: ['#hsc_group', '[name="hsc_group"]', '#subject2', '[name="subject2"]'],
      labelPatterns: [/group\s*\/\s*subject/i, /^group$/i]
    },
    hsc_group_other: {
      kind: 'text',
      section: 'hsc',
      selectors: ['#hsc_group_other', '[name="hsc_group_other"]', '#other_subject2', '[name="other_subject2"]'],
      labelPatterns: []
    },
    hsc_year: {
      kind: 'select',
      section: 'hsc',
      selectors: ['#hsc_year', '[name="hsc_year"]', '#year2', '[name="year2"]'],
      labelPatterns: [/passing\s*year/i]
    },

    // Graduation / Equivalent
    gra_applicable: {
      kind: 'checkbox',
      section: 'graduation',
      selectors: ['#if_applicable_gra', '[name="if_applicable_gra"]', '#if_applicable_3', '[name="if_applicable_3"]', '#gra_applicable', '[name="gra_applicable"]'],
      labelPatterns: [/if\s*applicable/i]
    },
    gra_exam: {
      kind: 'select',
      section: 'graduation',
      selectors: ['#gra_exam', '[name="gra_exam"]', '#exam3', '[name="exam3"]'],
      labelPatterns: [/examination/i]
    },
    gra_subject: {
      kind: 'select',
      section: 'graduation',
      selectors: ['#gra_subject', '[name="gra_subject"]', '#subject3', '[name="subject3"]'],
      labelPatterns: [/subject\s*\/\s*degree/i, /^subject$/i]
    },
    gra_subject_other: {
      kind: 'text',
      section: 'graduation',
      selectors: ['#gra_subject_other', '[name="gra_subject_other"]', '#other_subject3', '[name="other_subject3"]'],
      labelPatterns: []
    },
    gra_institute: {
      kind: 'select',
      section: 'graduation',
      selectors: ['#gra_institute', '[name="gra_institute"]', '#institute3', '[name="institute3"]', '#gra_university', '[name="gra_university"]'],
      labelPatterns: [/university|inst/i]
    },
    gra_institute_other: {
      kind: 'text',
      section: 'graduation',
      selectors: ['#gra_institute_other', '[name="gra_institute_other"]', '#other_institute3', '[name="other_institute3"]'],
      labelPatterns: []
    },
    gra_result_type: {
      kind: 'select',
      section: 'graduation',
      selectors: ['#gra_result_type', '[name="gra_result_type"]', '#result3', '[name="result3"]', '#gra_result', '[name="gra_result"]'],
      labelPatterns: [/^result$/i, /result\s*type/i]
    },
    gra_result: {
      kind: 'text',
      section: 'graduation',
      selectors: ['#gra_result', '[name="gra_result"]', '#result_gpa3', '[name="result_gpa3"]', '#gra_gpa', '[name="gra_gpa"]'],
      labelPatterns: [/gpa|cgpa|point/i]
    },
    gra_year: {
      kind: 'select',
      section: 'graduation',
      selectors: ['#gra_year', '[name="gra_year"]', '#year3', '[name="year3"]'],
      labelPatterns: [/passing\s*year/i]
    },
    gra_duration: {
      kind: 'select',
      section: 'graduation',
      selectors: ['#gra_duration', '[name="gra_duration"]', '#duration3', '[name="duration3"]', '#course_duration3', '[name="course_duration3"]'],
      labelPatterns: [/course\s*duration/i]
    },

    // Masters / Equivalent
    mas_applicable: {
      kind: 'checkbox',
      section: 'masters',
      selectors: ['#if_applicable_mas', '[name="if_applicable_mas"]', '#if_applicable_4', '[name="if_applicable_4"]', '#mas_applicable', '[name="mas_applicable"]'],
      labelPatterns: [/if\s*applicable/i]
    },
    mas_exam: {
      kind: 'select',
      section: 'masters',
      selectors: ['#mas_exam', '[name="mas_exam"]', '#exam4', '[name="exam4"]'],
      labelPatterns: [/examination/i]
    },
    mas_subject: {
      kind: 'select',
      section: 'masters',
      selectors: ['#mas_subject', '[name="mas_subject"]', '#subject4', '[name="subject4"]'],
      labelPatterns: [/subject\s*\/\s*degree/i, /^subject$/i]
    },
    mas_subject_other: {
      kind: 'text',
      section: 'masters',
      selectors: ['#mas_subject_other', '[name="mas_subject_other"]', '#other_subject4', '[name="other_subject4"]'],
      labelPatterns: []
    },
    mas_institute: {
      kind: 'select',
      section: 'masters',
      selectors: ['#mas_institute', '[name="mas_institute"]', '#institute4', '[name="institute4"]', '#mas_university', '[name="mas_university"]'],
      labelPatterns: [/university|inst/i]
    },
    mas_institute_other: {
      kind: 'text',
      section: 'masters',
      selectors: ['#mas_institute_other', '[name="mas_institute_other"]', '#other_institute4', '[name="other_institute4"]'],
      labelPatterns: []
    },
    mas_result_type: {
      kind: 'select',
      section: 'masters',
      selectors: ['#mas_result_type', '[name="mas_result_type"]', '#result4', '[name="result4"]', '#mas_result', '[name="mas_result"]'],
      labelPatterns: [/^result$/i, /result\s*type/i]
    },
    mas_result: {
      kind: 'text',
      section: 'masters',
      selectors: ['#mas_result', '[name="mas_result"]', '#result_gpa4', '[name="result_gpa4"]', '#mas_gpa', '[name="mas_gpa"]'],
      labelPatterns: [/gpa|cgpa|point/i]
    },
    mas_year: {
      kind: 'select',
      section: 'masters',
      selectors: ['#mas_year', '[name="mas_year"]', '#year4', '[name="year4"]'],
      labelPatterns: [/passing\s*year/i]
    },
    mas_duration: {
      kind: 'select',
      section: 'masters',
      selectors: ['#mas_duration', '[name="mas_duration"]', '#duration4', '[name="duration4"]', '#course_duration4', '[name="course_duration4"]'],
      labelPatterns: [/course\s*duration/i]
    }
  };

  async function fillYesNoWithDetails(toggleDescriptor, detailDescriptor, hasFlag, detailVal, stats) {
    const hasToggle = findFieldElement(toggleDescriptor);
    if (hasToggle) {
      const normalizedFlag = normalizeText(hasFlag) === 'yes' || (!hasFlag && detailVal) ? 'Yes' : 'No';
      fillSelectOrRadio(toggleDescriptor, normalizedFlag, stats);
      if (normalizedFlag === 'Yes' && detailVal) {
        const detailEl = await waitForVisibleAndEnabled(() => findFieldElement(detailDescriptor));
        fillTextField(detailEl, detailVal, stats);
      }
      return;
    }

    // Legacy portal without Yes/No select: direct text field
    if (detailVal && (normalizeText(hasFlag) === 'yes' || !hasFlag)) {
      const directEl = findFieldElement(detailDescriptor);
      if (directEl) {
        fillTextField(directEl, detailVal, stats);
      }
    }
  }

  async function fillEduBlock(prefix, data, stats) {
    const examDesc = FIELD_MAP[`${prefix}_exam`];
    const boardDesc = FIELD_MAP[`${prefix}_board`];
    const boardOtherDesc = FIELD_MAP[`${prefix}_board_other`];
    const rollDesc = FIELD_MAP[`${prefix}_roll`];
    const regDesc = FIELD_MAP[`${prefix}_reg`];
    const resTypeDesc = FIELD_MAP[`${prefix}_result_type`];
    const resValDesc = FIELD_MAP[`${prefix}_result`];
    const groupDesc = FIELD_MAP[`${prefix}_group`];
    const groupOtherDesc = FIELD_MAP[`${prefix}_group_other`];
    const yearDesc = FIELD_MAP[`${prefix}_year`];

    // 1. Examination FIRST because selecting Exam triggers population of Group/Subject options
    if (data[`${prefix}_exam`]) {
      const examEl = await waitForSelectOptions(() => findFieldElement(examDesc), data[`${prefix}_exam`]);
      selectOptionSmart(examEl, data[`${prefix}_exam`], stats);
    }

    // 2. Board (+ Other board if applicable)
    if (data[`${prefix}_board`]) {
      const boardEl = findFieldElement(boardDesc);
      const ok = selectOptionSmart(boardEl, data[`${prefix}_board`], stats);
      if (ok && normalizeText(data[`${prefix}_board`]) === 'other' && data[`${prefix}_board_other`]) {
        const otherEl = await waitForVisibleAndEnabled(() => findFieldElement(boardOtherDesc));
        fillTextField(otherEl, data[`${prefix}_board_other`], stats);
      }
    }

    // 3. Roll No & Optional Reg No
    if (data[`${prefix}_roll`]) {
      fillTextField(findFieldElement(rollDesc), data[`${prefix}_roll`], stats);
    }
    if (data[`${prefix}_reg`]) {
      fillTextField(findFieldElement(regDesc), data[`${prefix}_reg`], stats);
    }

    // 4. Result Type -> Wait for GPA input if GPA/CGPA
    if (data[`${prefix}_result_type`]) {
      const resTypeEl = findFieldElement(resTypeDesc);
      const ok = selectOptionSmart(resTypeEl, data[`${prefix}_result_type`], stats);
      if (ok && /gpa/i.test(data[`${prefix}_result_type`]) && data[`${prefix}_result`]) {
        const gpaEl = await waitForVisibleAndEnabled(() => findFieldElement(resValDesc));
        fillTextField(gpaEl, data[`${prefix}_result`], stats);
      }
    }

    // 5. Group/Subject (wait for Exam onchange to populate options)
    if (data[`${prefix}_group`]) {
      const grpEl = await waitForSelectOptions(() => findFieldElement(groupDesc), data[`${prefix}_group`]);
      const ok = selectOptionSmart(grpEl, data[`${prefix}_group`], stats);
      if (ok && normalizeText(data[`${prefix}_group`]) === 'other' && data[`${prefix}_group_other`]) {
        const otherGrpEl = await waitForVisibleAndEnabled(() => findFieldElement(groupOtherDesc));
        fillTextField(otherGrpEl, data[`${prefix}_group_other`], stats);
      }
    }

    // 6. Passing Year
    if (data[`${prefix}_year`]) {
      selectOptionSmart(findFieldElement(yearDesc), data[`${prefix}_year`], stats);
    }
  }

  async function fillHigherEduBlock(prefix, applicableFlag, data, stats) {
    const checkDesc = FIELD_MAP[`${prefix}_applicable`];
    const examDesc = FIELD_MAP[`${prefix}_exam`];
    const subjDesc = FIELD_MAP[`${prefix}_subject`];
    const subjOtherDesc = FIELD_MAP[`${prefix}_subject_other`];
    const instDesc = FIELD_MAP[`${prefix}_institute`];
    const instOtherDesc = FIELD_MAP[`${prefix}_institute_other`];
    const resTypeDesc = FIELD_MAP[`${prefix}_result_type`];
    const resValDesc = FIELD_MAP[`${prefix}_result`];
    const yearDesc = FIELD_MAP[`${prefix}_year`];
    const durDesc = FIELD_MAP[`${prefix}_duration`];

    const checkbox = findFieldElement(checkDesc);
    if (!applicableFlag) {
      if (checkbox && checkbox.checked) {
        toggleCheckbox(checkbox, false);
      }
      return;
    }

    if (checkbox) {
      toggleCheckbox(checkbox, true);
      await waitForVisibleAndEnabled(() => findFieldElement(examDesc));
    }

    // 1. Examination FIRST because it populates Subject/Degree options
    if (data[`${prefix}_exam`]) {
      const examEl = await waitForSelectOptions(() => findFieldElement(examDesc), data[`${prefix}_exam`]);
      selectOptionSmart(examEl, data[`${prefix}_exam`], stats);
    }

    // 2. Subject / Degree
    if (data[`${prefix}_subject`]) {
      const subjEl = await waitForSelectOptions(() => findFieldElement(subjDesc), data[`${prefix}_subject`]);
      const ok = selectOptionSmart(subjEl, data[`${prefix}_subject`], stats);
      if (ok && normalizeText(data[`${prefix}_subject`]) === 'other' && data[`${prefix}_subject_other`]) {
        const otherSubjEl = await waitForVisibleAndEnabled(() => findFieldElement(subjOtherDesc));
        fillTextField(otherSubjEl, data[`${prefix}_subject_other`], stats);
      }
    }

    // 3. University / Institute
    if (data[`${prefix}_institute`]) {
      const instEl = findFieldElement(instDesc);
      const ok = selectOptionSmart(instEl, data[`${prefix}_institute`], stats);
      if (ok && normalizeText(data[`${prefix}_institute`]) === 'other' && data[`${prefix}_institute_other`]) {
        const otherInstEl = await waitForVisibleAndEnabled(() => findFieldElement(instOtherDesc));
        fillTextField(otherInstEl, data[`${prefix}_institute_other`], stats);
      }
    }

    // 4. Result Type + CGPA
    if (data[`${prefix}_result_type`]) {
      const resTypeEl = findFieldElement(resTypeDesc);
      const ok = selectOptionSmart(resTypeEl, data[`${prefix}_result_type`], stats);
      if (ok && /gpa/i.test(data[`${prefix}_result_type`]) && data[`${prefix}_result`]) {
        const cgpaEl = await waitForVisibleAndEnabled(() => findFieldElement(resValDesc));
        fillTextField(cgpaEl, data[`${prefix}_result`], stats);
      }
    }

    // 5. Passing Year & Course Duration
    if (data[`${prefix}_year`]) {
      selectOptionSmart(findFieldElement(yearDesc), data[`${prefix}_year`], stats);
    }
    if (data[`${prefix}_duration`]) {
      selectOptionSmart(findFieldElement(durDesc), data[`${prefix}_duration`], stats);
    }
  }

  function hasFilledJobItem(job) {
    if (!job || typeof job !== 'object') return false;
    if (job.currently_working === true) return true;
    const keys = [
      'employment_type',
      'designation',
      'organization',
      'office_address',
      'job_start_date',
      'job_end_date',
      'last_salary',
      'job_description'
    ];
    return keys.some((k) => String(job[k] || '').trim() !== '');
  }

  function fillDateControl(el, isoDate, stats) {
    if (!el || !isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
    if ((el.disabled || el.readOnly) && String(el.value || '').trim() !== '') {
      markFilled(el);
      stats.filledCount++;
      return true;
    }
    if (!isElementInteractive(el)) return false;

    const valToSet = el.type === 'date' ? isoDate : formatDobForTextInput(isoDate, el);
    setNativeValue(el, valToSet);
    dispatchFieldEvents(el, true);
    markFilled(el);
    stats.filledCount++;
    return true;
  }

  function queryFirstInScope(scope, selectors) {
    for (const sel of selectors) {
      const found = scope.querySelector(sel);
      if (found) return found;
    }
    return null;
  }

  async function fillSingleJobBlock(job, getControl, stats) {
    const todayIso = new Date().toISOString().slice(0, 10);

    if (job.employment_type) {
      selectOptionSmart(getControl('employment_type', '.employment_type'), job.employment_type, stats);
    }
    fillTextField(getControl('designation', '.designation'), job.designation, stats);
    fillTextField(getControl('organization', '.organization'), job.organization, stats);
    fillTextField(getControl('office_address', '.office_address'), job.office_address, stats);
    fillDateControl(getControl('job_start_date', '.job_start_date'), job.job_start_date, stats);

    const currCb = getControl('currently_working', '.currently_working');
    const endEl = getControl('job_end_date', '.job_end_date');
    if (job.currently_working) {
      if (currCb && !currCb.disabled) {
        toggleCheckbox(currCb, true);
        markFilled(currCb);
        stats.filledCount++;
        await delay(100);
      }
      if (endEl && isElementInteractive(endEl) && !String(endEl.value || '').trim()) {
        fillDateControl(endEl, job.job_end_date || endEl.getAttribute('max') || todayIso, stats);
      }
    } else {
      if (currCb && currCb.checked && !currCb.disabled) {
        toggleCheckbox(currCb, false);
        await delay(80);
      }
      if (job.job_end_date) {
        fillDateControl(endEl, job.job_end_date, stats);
      }
    }

    if (job.last_salary) {
      fillTextField(getControl('last_salary', '.last_salary'), job.last_salary, stats);
    }
    if (job.job_description) {
      fillTextField(getControl('job_description', '.job_description'), job.job_description, stats);
    }
  }

  async function fillJobExperiences(data, stats) {
    const expContainer = findSectionContainer('job_experience');
    const scope = expContainer && expContainer !== document ? expContainer : document;

    const expCheckbox =
      queryFirstInScope(scope, ['#if_applicable_exp', '[name="if_applicable_exp"]', '.if_applicable_exp']) ||
      queryFirstInScope(document, ['#if_applicable_exp', '[name="if_applicable_exp"]', '.if_applicable_exp']);

    const jobs = (Array.isArray(data.job_experiences) ? data.job_experiences : []).filter(hasFilledJobItem);
    if (!data.exp_applicable || jobs.length === 0) {
      if (expCheckbox && expCheckbox.checked) {
        toggleCheckbox(expCheckbox, false);
      }
      return;
    }

    const hasJobSection = Boolean(
      expCheckbox ||
      (expContainer && expContainer !== document) ||
      scope.querySelector('.jobExpTemplate') ||
      scope.querySelector('[name="job[0][employment_type]"]') ||
      document.getElementById('employment_type') ||
      scope.querySelector('[name="employment_type"]')
    );
    if (!hasJobSection) return;

    if (expCheckbox) {
      toggleCheckbox(expCheckbox, true);
      markFilled(expCheckbox);
      stats.filledCount++;
      await waitForVisibleAndEnabled(
        () =>
          scope.querySelector('.employment_type') ||
          scope.querySelector('[name="job[0][employment_type]"]') ||
          document.getElementById('employment_type'),
        1500
      );
    }

    const getBlocks = () => Array.from(scope.querySelectorAll('.jobExpTemplate'));

    if (getBlocks().length > 0) {
      while (getBlocks().length < jobs.length) {
        const addBtn =
          document.getElementById('addNewJob') ||
          scope.querySelector('#addNewJob') ||
          Array.from(scope.querySelectorAll('button, a')).find((b) => {
            const txt = b.textContent || '';
            const onClick = b.getAttribute('onclick') || '';
            return /add\s*more|add\s*new/i.test(txt) || /addNewExp/i.test(onClick);
          });
        if (!addBtn || addBtn.disabled) break;

        const prevCount = getBlocks().length;
        addBtn.click();
        await waitForVisibleAndEnabled(() => {
          const b = getBlocks()[prevCount];
          if (!b) return null;
          return b.querySelector('.employment_type') || b.querySelector('select') || b.querySelector('input');
        }, 1200);

        if (getBlocks().length <= prevCount) break;
      }

      const blocks = getBlocks();
      const count = Math.min(jobs.length, blocks.length);
      for (let i = 0; i < count; i++) {
        const block = blocks[i];
        await fillSingleJobBlock(
          jobs[i],
          (prop, cls) => block.querySelector(`[name="job[${i}][${prop}]"]`) || block.querySelector(cls),
          stats
        );
      }
      return;
    }

    // Legacy single-block fallback when .jobExpTemplate wrapper is absent
    await fillSingleJobBlock(
      jobs[0],
      (prop, cls) => queryFirstInScope(scope, [`#${prop}`, `[name="${prop}"]`, cls]),
      stats
    );
  }

  function findRowQuestionText(row, selectEl) {
    const insideLabel = row ? row.querySelector('label') : null;
    if (insideLabel && insideLabel.textContent) {
      return insideLabel.textContent;
    }
    if (selectEl && selectEl.id) {
      const forLabel = Array.from(document.querySelectorAll('label')).find((l) => l.htmlFor === selectEl.id);
      if (forLabel && forLabel.textContent) {
        return forLabel.textContent;
      }
    }
    return (row && row.textContent) || '';
  }

  async function fillOtherExperiences(data, stats) {
    const otherContainer = findSectionContainer('other_experience');
    const searchRoot = otherContainer && otherContainer !== document ? otherContainer : document;

    let rows = Array.from(searchRoot.querySelectorAll('.other_exp'));
    if (rows.length === 0 && otherContainer && otherContainer !== document) {
      rows = Array.from(otherContainer.querySelectorAll('.form-group, tr')).filter((r) => Boolean(r.querySelector('select')));
    }
    if (rows.length === 0) {
      const directSel = document.querySelector('[name="other_exp[0][value]"]');
      if (directSel) {
        const parentRow = directSel.closest('.form-group, tr, div') || directSel.parentElement;
        if (parentRow) rows = [parentRow];
      }
    }

    for (const row of rows) {
      const selectEl = row.querySelector('.exp_value') || row.querySelector('select');
      if (!selectEl) continue;

      const qText = findRowQuestionText(row, selectEl);
      let target = '';
      if (/\bcomputer\b|proficiency\s+in\s+operating|relevant\s+field|কম্পিউটার/i.test(qText)) {
        target = data.other_computer_proficiency || '';
      } else if (/\btyping\b|\bshorthand\b|\bstenograph|\bspeed\b|\bwpm\b|টাইপ|মুদ্রাক্ষর|সাঁটলিপি/i.test(qText)) {
        target = data.other_typing_speed || '';
      } else {
        target = data.other_default_response || '';
      }

      if (!target) continue;

      const ok = selectOptionSmart(selectEl, target, stats);
      if (ok && normalizeText(target) === 'yes' && data.other_exp_details) {
        const detailEl = await waitForVisibleAndEnabled(
          () => Array.from(row.querySelectorAll('input, textarea')).find((el) => matchesKind(el, 'text') && isElementInteractive(el)),
          600
        );
        if (detailEl && isElementInteractive(detailEl) && !String(detailEl.value || '').trim()) {
          fillTextField(detailEl, data.other_exp_details, stats);
        }
      }
    }
  }

  function highlightMissingRequiredFields(stats) {
    const requiredControls = Array.from(document.querySelectorAll('input[required], select[required], textarea[required]'));
    for (const el of requiredControls) {
      if (!isElementInteractive(el)) continue;
      const idOrName = ((el.id || '') + ' ' + (el.name || '')).toLowerCase();
      // Never flag the final declaration checkbox ('agree') or buttons
      if (el.type === 'checkbox' && idOrName.includes('agree')) continue;
      if (['submit', 'button', 'reset', 'hidden'].includes((el.type || '').toLowerCase())) continue;

      const val = el.type === 'checkbox' ? (el.checked ? '1' : '') : String(el.value || '').trim();
      if (!val) {
        markWarning(el);
        stats.mismatchedElements.add(el);
      }
    }
  }

  async function autofillForm(profileData, profileName = '') {
    const data = profileData || {};
    const stats = {
      filledCount: 0,
      mismatchedElements: new Set()
    };

    clearPreviousHighlights();
    const label = profileName ? ` (${profileName})` : '';

    // Step 1: Basic Information
    showToast(`⏳ Step 1/4: Filling Basic Information${label}...`, 'Matching names, DOB, IDs, mobile & quota');

    fillTextField(findFieldElement(FIELD_MAP.name), data.name, stats);
    fillTextField(findFieldElement(FIELD_MAP.name_bn), data.name_bn, stats);
    fillTextField(findFieldElement(FIELD_MAP.father), data.father, stats);
    fillTextField(findFieldElement(FIELD_MAP.father_bn), data.father_bn, stats);
    fillTextField(findFieldElement(FIELD_MAP.mother), data.mother, stats);
    fillTextField(findFieldElement(FIELD_MAP.mother_bn), data.mother_bn, stats);

    fillDob(data.dob, stats);

    fillSelectOrRadio(FIELD_MAP.nationality, data.nationality || 'Bangladeshi', stats);
    fillSelectOrRadio(FIELD_MAP.religion, data.religion, stats);
    fillSelectOrRadio(FIELD_MAP.gender, data.gender, stats);

    await fillYesNoWithDetails(FIELD_MAP.nid_has, FIELD_MAP.nid_no, data.nid_has, data.nid_no, stats);
    await fillYesNoWithDetails(FIELD_MAP.breg_has, FIELD_MAP.breg_no, data.breg_has, data.breg_no, stats);
    await fillYesNoWithDetails(FIELD_MAP.passport_has, FIELD_MAP.passport_no, data.passport_has, data.passport_no, stats);

    if (data.marital_status) {
      const maritalOk = fillSelectOrRadio(FIELD_MAP.marital_status, data.marital_status, stats);
      if (maritalOk && normalizeText(data.marital_status) === 'married' && data.spouse_name) {
        const spouseEl = await waitForVisibleAndEnabled(() => findFieldElement(FIELD_MAP.spouse_name));
        fillTextField(spouseEl, data.spouse_name, stats);
      }
    }

    fillTextField(findFieldElement(FIELD_MAP.mobile), data.mobile, stats);
    fillTextField(findFieldElement(FIELD_MAP.confirm_mobile), data.confirm_mobile || data.mobile, stats);
    fillTextField(findFieldElement(FIELD_MAP.email), data.email, stats);

    if (data.quota) {
      const quotaOk = fillSelectOrRadio(FIELD_MAP.quota, data.quota, stats);
      if (quotaOk && normalizeText(data.quota) !== 'not applicable' && data.quota_details) {
        const quotaDetEl = await waitForVisibleAndEnabled(() => findFieldElement(FIELD_MAP.quota_details), 1200);
        if (quotaDetEl && isElementInteractive(quotaDetEl)) {
          fillTextField(quotaDetEl, data.quota_details, stats);
        }
      }
    }

    if (data.dep_status) {
      fillSelectOrRadio(FIELD_MAP.dep_status, data.dep_status, stats);
    }

    // Step 2: Address Information
    showToast(`⏳ Step 2/4: Filling Addresses & waiting for Upazilas${label}...`, 'Handling District -> Upazila/P.S. dropdowns');

    fillTextField(findFieldElement(FIELD_MAP.present_careof), data.present_careof, stats);
    fillTextField(findFieldElement(FIELD_MAP.present_village), data.present_village, stats);

    if (data.present_district) {
      const presDistEl = findFieldElement(FIELD_MAP.present_district);
      const distOk = selectOptionSmart(presDistEl, data.present_district, stats);
      if (distOk && data.present_upazila) {
        const presUpazilaEl = await waitForSelectOptions(
          () => findFieldElement(FIELD_MAP.present_upazila),
          data.present_upazila
        );
        selectOptionSmart(presUpazilaEl, data.present_upazila, stats);
      }
    }

    fillTextField(findFieldElement(FIELD_MAP.present_post), data.present_post, stats);
    fillTextField(findFieldElement(FIELD_MAP.present_postcode), data.present_postcode, stats);

    const sameCheckbox = findFieldElement(FIELD_MAP.same_as_present);
    if (data.same_as_present) {
      if (sameCheckbox) {
        toggleCheckbox(sameCheckbox, true);
        markFilled(sameCheckbox);
        stats.filledCount++;
        await delay(250);
      }

      // If permanent fields remain editable & empty (portal lacks JS auto-copy), populate from present data
      const permCareEl = findFieldElement(FIELD_MAP.permanent_careof);
      if (permCareEl && isElementInteractive(permCareEl) && !String(permCareEl.value || '').trim()) {
        fillTextField(permCareEl, data.present_careof, stats);
        fillTextField(findFieldElement(FIELD_MAP.permanent_village), data.present_village, stats);
        if (data.present_district) {
          const permDistOk = selectOptionSmart(findFieldElement(FIELD_MAP.permanent_district), data.present_district, stats);
          if (permDistOk && data.present_upazila) {
            const permUpazilaEl = await waitForSelectOptions(
              () => findFieldElement(FIELD_MAP.permanent_upazila),
              data.present_upazila
            );
            selectOptionSmart(permUpazilaEl, data.present_upazila, stats);
          }
        }
        fillTextField(findFieldElement(FIELD_MAP.permanent_post), data.present_post, stats);
        fillTextField(findFieldElement(FIELD_MAP.permanent_postcode), data.present_postcode, stats);
      } else if (data.present_upazila) {
        // Handle portals where same_as_present sets permanent_district and AJAX-loads permanent_upazila
        const permUpazilaEl = findFieldElement(FIELD_MAP.permanent_upazila);
        if (permUpazilaEl && isElementInteractive(permUpazilaEl) && !String(permUpazilaEl.value || '').trim()) {
          const loadedUpazila = await waitForSelectOptions(
            () => findFieldElement(FIELD_MAP.permanent_upazila),
            data.present_upazila
          );
          if (loadedUpazila && isElementInteractive(loadedUpazila)) {
            selectOptionSmart(loadedUpazila, data.present_upazila, stats);
          }
        }
      }
    } else {
      if (sameCheckbox && sameCheckbox.checked) {
        toggleCheckbox(sameCheckbox, false);
        await delay(150);
      }
      fillTextField(findFieldElement(FIELD_MAP.permanent_careof), data.permanent_careof, stats);
      fillTextField(findFieldElement(FIELD_MAP.permanent_village), data.permanent_village, stats);
      if (data.permanent_district) {
        const permDistEl = findFieldElement(FIELD_MAP.permanent_district);
        const distOk = selectOptionSmart(permDistEl, data.permanent_district, stats);
        if (distOk && data.permanent_upazila) {
          const permUpazilaEl = await waitForSelectOptions(
            () => findFieldElement(FIELD_MAP.permanent_upazila),
            data.permanent_upazila
          );
          selectOptionSmart(permUpazilaEl, data.permanent_upazila, stats);
        }
      }
      fillTextField(findFieldElement(FIELD_MAP.permanent_post), data.permanent_post, stats);
      fillTextField(findFieldElement(FIELD_MAP.permanent_postcode), data.permanent_postcode, stats);
    }

    // Step 3: Educational Qualifications
    showToast(`⏳ Step 3/4: Filling Educational Qualifications${label}...`, 'Processing SSC, HSC, Graduation & Masters');

    await fillEduBlock('ssc', data, stats);
    await fillEduBlock('hsc', data, stats);
    await fillHigherEduBlock('gra', Boolean(data.gra_applicable), data, stats);
    await fillHigherEduBlock('mas', Boolean(data.mas_applicable), data, stats);

    // Step 4: Job Experiences & Other Qualifications / Experiences
    showToast(`⏳ Step 4/4: Filling Job & Other Experiences${label}...`, 'Processing work history & post-specific qualifications');

    await fillJobExperiences(data, stats);
    await fillOtherExperiences(data, stats);

    // Highlight any empty required inputs (such as Captcha or missing profile fields)
    highlightMissingRequiredFields(stats);

    const warningCount = stats.mismatchedElements.size;
    if (stats.filledCount === 0) {
      showToast(
        '⚠️ No Teletalk application fields detected',
        'Open the full Teletalk application form page and try again.',
        'warn',
        8000
      );
    } else if (warningCount > 0) {
      showToast(
        `✅ Autofill Complete! Filled ${stats.filledCount} field(s).`,
        `⚠️ ${warningCount} field(s) highlighted in yellow (e.g. Captcha / missing info). Please review before submitting.`,
        'info',
        10000
      );
    } else {
      showToast(
        `✅ Autofill Complete! Filled ${stats.filledCount} field(s).`,
        'Please review all entries carefully before submitting.',
        'info',
        9000
      );
    }

    return {
      ok: true,
      filledCount: stats.filledCount,
      warningCount
    };
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!message || message.action !== 'TJF_AUTOFILL') {
        return false;
      }
      autofillForm(message.profile, message.profileName)
        .then((res) => sendResponse(res))
        .catch((err) => {
          showToast('❌ Autofill encountered an error', err.message || 'Please review the page.', 'warn', 8000);
          sendResponse({ ok: false, error: err.message || 'Autofill error' });
        });
      return true;
    });
  }

  // Expose internal engine for automated verification scripts without polluting production runtime
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      autofillForm,
      findMatchingOption,
      selectOptionSmart,
      findFieldElement,
      FIELD_MAP,
      normalizeText,
      compactText
    };
  } else if (typeof window !== 'undefined') {
    window.__TJF_ENGINE__ = {
      autofillForm,
      findMatchingOption,
      selectOptionSmart,
      findFieldElement
    };
  }
})();
