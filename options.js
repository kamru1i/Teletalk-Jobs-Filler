(function () {
  'use strict';

  const TD = window.TeletalkData;
  const Storage = window.TJFStorage;

  const UPPERCASE_KEYS = new Set([
    'name', 'father', 'mother', 'spouse_name', 'passport_no',
    'present_careof', 'present_village', 'present_post',
    'permanent_careof', 'permanent_village', 'permanent_post'
  ]);

  const CONDITIONAL_SELECTS = [
    { selectId: 'marital_status', wrapId: 'wrap_spouse_name', check: (v) => v === 'Married' },
    { selectId: 'nid_has', wrapId: 'wrap_nid_no', check: (v) => v === 'Yes' },
    { selectId: 'breg_has', wrapId: 'wrap_breg_no', check: (v) => v === 'Yes' },
    { selectId: 'passport_has', wrapId: 'wrap_passport_no', check: (v) => v === 'Yes' },
    { selectId: 'quota', wrapId: 'wrap_quota_details', check: (v) => Boolean(v && v !== 'Not Applicable') },
    { selectId: 'ssc_board', wrapId: 'wrap_ssc_board_other', check: (v) => v === 'Other' },
    { selectId: 'ssc_group', wrapId: 'wrap_ssc_group_other', check: (v) => v === 'Other' },
    { selectId: 'hsc_board', wrapId: 'wrap_hsc_board_other', check: (v) => v === 'Other' },
    { selectId: 'hsc_group', wrapId: 'wrap_hsc_group_other', check: (v) => v === 'Other' },
    { selectId: 'gra_subject', wrapId: 'wrap_gra_subject_other', check: (v) => v === 'Other' },
    { selectId: 'gra_institute', wrapId: 'wrap_gra_institute_other', check: (v) => v === 'Other' },
    { selectId: 'mas_subject', wrapId: 'wrap_mas_subject_other', check: (v) => v === 'Other' },
    { selectId: 'mas_institute', wrapId: 'wrap_mas_institute_other', check: (v) => v === 'Other' },
    { selectId: 'ssc_result_type', wrapId: 'wrap_ssc_result', check: isGpaResultType },
    { selectId: 'hsc_result_type', wrapId: 'wrap_hsc_result', check: isGpaResultType },
    { selectId: 'gra_result_type', wrapId: 'wrap_gra_result', check: isGpaResultType },
    { selectId: 'mas_result_type', wrapId: 'wrap_mas_result', check: isGpaResultType }
  ];

  const PERMANENT_FIELD_IDS = [
    'permanent_careof',
    'permanent_village',
    'permanent_district',
    'permanent_upazila',
    'permanent_post',
    'permanent_postcode'
  ];

  const GRA_FIELD_IDS = [
    'gra_exam', 'gra_subject', 'gra_subject_other', 'gra_institute',
    'gra_institute_other', 'gra_result_type', 'gra_result', 'gra_year', 'gra_duration'
  ];

  const MAS_FIELD_IDS = [
    'mas_exam', 'mas_subject', 'mas_subject_other', 'mas_institute',
    'mas_institute_other', 'mas_result_type', 'mas_result', 'mas_year', 'mas_duration'
  ];

  const els = {
    profileForm: document.getElementById('profileForm'),
    profileSelect: document.getElementById('profileSelect'),
    profileStats: document.getElementById('profileStats'),
    unsavedBadge: document.getElementById('unsavedBadge'),
    toast: document.getElementById('toast'),
    btnSaveProfile: document.getElementById('btnSaveProfile'),
    btnBottomSave: document.getElementById('btnBottomSave'),
    btnNewProfile: document.getElementById('btnNewProfile'),
    btnRenameProfile: document.getElementById('btnRenameProfile'),
    btnDuplicateProfile: document.getElementById('btnDuplicateProfile'),
    btnDeleteProfile: document.getElementById('btnDeleteProfile'),
    btnExport: document.getElementById('btnExport'),
    btnImport: document.getElementById('btnImport'),
    fileImport: document.getElementById('fileImport'),
    importBanner: document.getElementById('importBanner'),
    btnBannerChooseFile: document.getElementById('btnBannerChooseFile'),
    btnBannerDismiss: document.getElementById('btnBannerDismiss'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalTitle: document.getElementById('modalTitle'),
    modalDesc: document.getElementById('modalDesc'),
    modalInput: document.getElementById('modalInput'),
    btnModalCancel: document.getElementById('btnModalCancel'),
    btnModalSecondary: document.getElementById('btnModalSecondary'),
    btnModalConfirm: document.getElementById('btnModalConfirm'),
    dob: document.getElementById('dob'),
    dobPreview: document.getElementById('dobPreview'),
    mobile: document.getElementById('mobile'),
    confirm_mobile: document.getElementById('confirm_mobile'),
    mobileHint: document.getElementById('mobileHint'),
    same_as_present: document.getElementById('same_as_present'),
    permanentAddressBody: document.getElementById('permanentAddressBody'),
    gra_applicable: document.getElementById('gra_applicable'),
    graFieldsWrap: document.getElementById('graFieldsWrap'),
    mas_applicable: document.getElementById('mas_applicable'),
    masFieldsWrap: document.getElementById('masFieldsWrap'),
    exp_applicable: document.getElementById('exp_applicable'),
    expFieldsWrap: document.getElementById('expFieldsWrap'),
    jobExpList: document.getElementById('jobExpList'),
    btnAddJobExp: document.getElementById('btnAddJobExp'),
    tabButtons: Array.from(document.querySelectorAll('.tab-btn')),
    sectionPanels: Array.from(document.querySelectorAll('.section-panel'))
  };

  let currentState = null;
  let isDirty = false;
  let toastTimer = null;
  let autoSaveTimer = null;
  let activeSaveEpoch = 0;
  let modalResolve = null;
  let lastAutoMobile = '';

  function cancelPendingAutoSave() {
    activeSaveEpoch++;
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
  }

  function isGpaResultType(val) {
    return typeof val === 'string' && /gpa/i.test(val);
  }

  function showToast(message, type = 'success') {
    if (toastTimer) clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.className = `toast ${type}`;
    toastTimer = setTimeout(() => {
      els.toast.className = 'toast hidden';
    }, 3600);
  }

  function setDirty(flag) {
    isDirty = Boolean(flag);
    els.unsavedBadge.classList.toggle('hidden', !isDirty);
  }

  function populateSelectElement(sel, items, selectedValue = '', placeholder = 'Select') {
    if (!sel) return;
    const frag = document.createDocumentFragment();

    if (placeholder !== null) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = placeholder;
      frag.appendChild(opt);
    }

    const list = Array.isArray(items) ? items : [];
    for (const item of list) {
      const opt = document.createElement('option');
      if (item && typeof item === 'object') {
        opt.value = String(item.value ?? '');
        opt.textContent = String(item.label ?? item.value ?? '');
      } else {
        opt.value = item;
        opt.textContent = item;
      }
      frag.appendChild(opt);
    }

    sel.replaceChildren(frag);

    if (selectedValue) {
      const exists = Array.from(sel.options).some((o) => o.value === selectedValue);
      if (!exists) {
        const customOpt = document.createElement('option');
        customOpt.value = selectedValue;
        customOpt.textContent = selectedValue;
        customOpt.dataset.tjfCustom = '1';
        sel.appendChild(customOpt);
      }
      sel.value = selectedValue;
    } else {
      sel.value = '';
    }
  }

  function populateSelect(selectId, items, selectedValue = '', placeholder = 'Select') {
    populateSelectElement(document.getElementById(selectId), items, selectedValue, placeholder);
  }

  function initializeStaticDropdowns() {
    populateSelect('religion', TD.RELIGIONS);
    populateSelect('gender', TD.GENDERS);
    populateSelect('marital_status', TD.MARITAL_STATUSES);
    populateSelect('nid_has', TD.YES_NO, 'No', null);
    populateSelect('breg_has', TD.YES_NO, 'No', null);
    populateSelect('passport_has', TD.YES_NO, 'No', null);
    populateSelect('quota', TD.QUOTAS, 'Not Applicable');
    populateSelect('dep_status', TD.DEP_STATUSES, 'Not Applicable');

    populateSelect('present_district', TD.DISTRICTS);
    populateSelect('permanent_district', TD.DISTRICTS);
    populateSelect('present_upazila', [], '', 'Select District First');
    populateSelect('permanent_upazila', [], '', 'Select District First');

    populateSelect('ssc_exam', TD.SSC_EXAMS);
    populateSelect('ssc_board', TD.SSC_BOARDS);
    populateSelect('ssc_result_type', TD.SSC_RESULT_TYPES);
    populateSelect('ssc_group', TD.SSC_GROUPS);
    populateSelect('ssc_year', TD.PASSING_YEARS);

    populateSelect('hsc_exam', TD.HSC_EXAMS);
    populateSelect('hsc_board', TD.HSC_BOARDS);
    populateSelect('hsc_result_type', TD.HSC_RESULT_TYPES);
    populateSelect('hsc_group', TD.HSC_GROUPS);
    populateSelect('hsc_year', TD.PASSING_YEARS);

    populateSelect('gra_exam', TD.GRA_EXAMS);
    populateSelect('gra_subject', TD.GRA_SUBJECTS);
    populateSelect('gra_institute', TD.UNIVERSITIES);
    populateSelect('gra_result_type', TD.GRA_RESULT_TYPES);
    populateSelect('gra_year', TD.PASSING_YEARS);
    populateSelect('gra_duration', TD.GRA_DURATIONS);

    populateSelect('mas_exam', TD.MAS_EXAMS);
    populateSelect('mas_subject', TD.MAS_SUBJECTS);
    populateSelect('mas_institute', TD.UNIVERSITIES);
    populateSelect('mas_result_type', TD.MAS_RESULT_TYPES);
    populateSelect('mas_year', TD.PASSING_YEARS);
    populateSelect('mas_duration', TD.MAS_DURATIONS);

    populateSelect(
      'other_computer_proficiency',
      [
        { value: 'Skip', label: 'Select' },
        { value: 'Yes', label: 'Yes' }
      ],
      'Yes',
      null
    );
  }

  function syncSingleControlStyle(el) {
    if (!el || !el.classList || !el.classList.contains('form-control')) return;
    const rawVal = String(el.value || '').trim();
    const isPlaceholderChoice = el.id === 'other_computer_proficiency' && rawVal === 'Skip';
    const hasVal = !el.disabled && rawVal !== '' && !isPlaceholderChoice;
    el.classList.toggle('has-val', hasVal);
  }

  function syncFilledControlStyles() {
    if (!els.profileForm) return;
    for (const el of els.profileForm.querySelectorAll('.form-control')) {
      syncSingleControlStyle(el);
    }
  }

  function updateJobCardCounter(textarea, counterEl) {
    if (!textarea || !counterEl) return;
    const len = String(textarea.value || '').length;
    counterEl.textContent = String(Math.max(0, 300 - len));
    counterEl.classList.toggle('near-limit', len >= 270);
  }

  function buildJobFormGroup(labelText, controlEl, extraClass = '') {
    const row = document.createElement('div');
    row.className = extraClass ? `tt-form-row ${extraClass}` : 'tt-form-row';
    const label = document.createElement('label');
    label.className = 'tt-label';
    label.textContent = labelText;
    if (controlEl && controlEl.id) {
      label.htmlFor = controlEl.id;
    }
    const col = document.createElement('div');
    col.className = 'tt-control-col';
    col.appendChild(controlEl);
    row.appendChild(label);
    row.appendChild(col);
    return row;
  }

  function collectJobExperiences() {
    if (!els.jobExpList) return [{ ...Storage.DEFAULT_JOB_EXPERIENCE_ITEM }];
    const items = Array.from(els.jobExpList.querySelectorAll('.job-exp-item'));
    if (!items.length) return [{ ...Storage.DEFAULT_JOB_EXPERIENCE_ITEM }];

    return items.map((card) => {
      const rawItem = {};
      for (const fieldEl of card.querySelectorAll('[data-job-field]')) {
        const key = fieldEl.dataset.jobField;
        if (!key) continue;
        if (fieldEl.type === 'checkbox') {
          rawItem[key] = Boolean(fieldEl.checked);
        } else {
          rawItem[key] = String(fieldEl.value || '').trim();
        }
      }
      return Storage.normalizeJobExperienceItem(rawItem);
    });
  }

  function createJobExperienceCard(job, index, totalCount) {
    const norm = Storage.normalizeJobExperienceItem(job);
    const card = document.createElement('div');
    card.className = 'job-exp-item';
    card.dataset.jobIndex = String(index);

    const badge = document.createElement('span');
    badge.className = 'job-sl-badge';
    badge.textContent = String(index + 1);
    card.appendChild(badge);

    if (totalCount > 1) {
      const topbar = document.createElement('div');
      topbar.className = 'job-item-topbar';
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tt-remove-job-btn';
      removeBtn.textContent = '✕ Remove';
      removeBtn.addEventListener('click', () => {
        const jobs = collectJobExperiences();
        jobs.splice(index, 1);
        renderJobExperiences(jobs);
        refreshConditionalVisibility();
        setDirty(true);
        scheduleAutoSave();
      });
      topbar.appendChild(removeBtn);
      card.appendChild(topbar);
    }

    const twoCol = document.createElement('div');
    twoCol.className = 'tt-two-col';

    // Left column (Employed on, Designation/Post, Length of Service)
    const leftCol = document.createElement('div');
    leftCol.className = 'tt-compact-rows';

    const empSelect = document.createElement('select');
    empSelect.id = `job_${index}_employment_type`;
    empSelect.className = 'form-control';
    empSelect.dataset.jobField = 'employment_type';
    populateSelectElement(empSelect, TD.EMPLOYMENT_TYPES, norm.employment_type, 'Select');
    leftCol.appendChild(buildJobFormGroup('Employed on', empSelect));

    const desInput = document.createElement('input');
    desInput.type = 'text';
    desInput.id = `job_${index}_designation`;
    desInput.className = 'form-control';
    desInput.maxLength = 50;
    desInput.placeholder = 'e.g. IT Officer / Assistant Manager';
    desInput.dataset.jobField = 'designation';
    desInput.value = norm.designation;
    leftCol.appendChild(buildJobFormGroup('Designation/Post', desInput));

    const serviceRow = document.createElement('div');
    serviceRow.className = 'tt-form-row';
    const serviceLabel = document.createElement('label');
    serviceLabel.className = 'tt-label';
    serviceLabel.textContent = 'Length of Service';
    const serviceCol = document.createElement('div');
    serviceCol.className = 'tt-control-col';

    const serviceDates = document.createElement('div');
    serviceDates.className = 'tt-service-dates';

    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.id = `job_${index}_job_start_date`;
    startInput.className = 'form-control tt-date-input';
    startInput.dataset.jobField = 'job_start_date';
    startInput.value = norm.job_start_date;
    serviceLabel.htmlFor = startInput.id;

    const toSpan = document.createElement('span');
    toSpan.className = 'tt-date-to';
    toSpan.textContent = 'to';

    const endWrap = document.createElement('div');
    endWrap.className = 'tt-end-wrap';

    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.id = `job_${index}_job_end_date`;
    endInput.className = 'form-control tt-date-input';
    endInput.dataset.jobField = 'job_end_date';
    endInput.value = norm.job_end_date;

    const cwLabel = document.createElement('label');
    cwLabel.className = 'tt-curr-work';
    const cwCheck = document.createElement('input');
    cwCheck.type = 'checkbox';
    cwCheck.id = `job_${index}_currently_working`;
    cwCheck.dataset.jobField = 'currently_working';
    cwCheck.checked = norm.currently_working;
    cwCheck.addEventListener('change', refreshConditionalVisibility);
    cwLabel.htmlFor = cwCheck.id;
    const cwText = document.createElement('span');
    cwText.textContent = 'CurrentlyWorking';
    cwLabel.appendChild(cwCheck);
    cwLabel.appendChild(cwText);

    endWrap.appendChild(endInput);
    endWrap.appendChild(cwLabel);

    serviceDates.appendChild(startInput);
    serviceDates.appendChild(toSpan);
    serviceDates.appendChild(endWrap);
    serviceCol.appendChild(serviceDates);
    serviceRow.appendChild(serviceLabel);
    serviceRow.appendChild(serviceCol);
    leftCol.appendChild(serviceRow);

    // Right column (Organization, Address, Last Salary)
    const rightCol = document.createElement('div');
    rightCol.className = 'tt-compact-rows';

    const orgInput = document.createElement('input');
    orgInput.type = 'text';
    orgInput.id = `job_${index}_organization`;
    orgInput.className = 'form-control';
    orgInput.maxLength = 100;
    orgInput.placeholder = 'Company / Organization Name';
    orgInput.dataset.jobField = 'organization';
    orgInput.value = norm.organization;
    rightCol.appendChild(buildJobFormGroup('Organization', orgInput));

    const addrInput = document.createElement('input');
    addrInput.type = 'text';
    addrInput.id = `job_${index}_office_address`;
    addrInput.className = 'form-control';
    addrInput.maxLength = 100;
    addrInput.placeholder = 'Office Street, Road, Area, District';
    addrInput.dataset.jobField = 'office_address';
    addrInput.value = norm.office_address;
    rightCol.appendChild(buildJobFormGroup('Address', addrInput));

    const salaryInput = document.createElement('input');
    salaryInput.type = 'text';
    salaryInput.id = `job_${index}_last_salary`;
    salaryInput.className = 'form-control';
    salaryInput.maxLength = 30;
    salaryInput.placeholder = 'Optional';
    salaryInput.dataset.jobField = 'last_salary';
    salaryInput.value = norm.last_salary;
    rightCol.appendChild(buildJobFormGroup('Last Salary', salaryInput));

    twoCol.appendChild(leftCol);
    twoCol.appendChild(rightCol);
    card.appendChild(twoCol);

    // Bottom full-width Job Description row
    const descRow = document.createElement('div');
    descRow.className = 'tt-desc-row';

    const descTextarea = document.createElement('textarea');
    descTextarea.id = `job_${index}_job_description`;
    descTextarea.className = 'form-control';
    descTextarea.rows = 3;
    descTextarea.maxLength = 300;
    descTextarea.placeholder = 'Short summary of duties and responsibilities (max 300 characters)';
    descTextarea.dataset.jobField = 'job_description';
    descTextarea.value = norm.job_description;

    const descLabel = document.createElement('label');
    descLabel.className = 'tt-label';
    descLabel.textContent = 'Job Description';
    descLabel.htmlFor = descTextarea.id;
    descRow.appendChild(descLabel);

    const descField = document.createElement('div');
    descField.className = 'tt-control-col tt-desc-field';
    descField.appendChild(descTextarea);

    const counter = document.createElement('span');
    counter.className = 'char-counter';
    updateJobCardCounter(descTextarea, counter);
    descTextarea.addEventListener('input', () => updateJobCardCounter(descTextarea, counter));
    descField.appendChild(counter);

    descRow.appendChild(descField);
    card.appendChild(descRow);

    return card;
  }

  function renderJobExperiences(jobs) {
    if (!els.jobExpList) return;
    const list = Array.isArray(jobs) && jobs.length > 0
      ? jobs.map(Storage.normalizeJobExperienceItem)
      : [{ ...Storage.DEFAULT_JOB_EXPERIENCE_ITEM }];

    const frag = document.createDocumentFragment();
    list.forEach((job, idx) => {
      frag.appendChild(createJobExperienceCard(job, idx, list.length));
    });
    els.jobExpList.replaceChildren(frag);
  }

  function updateUpazilaDropdown(districtSelectId, upazilaSelectId, selectedUpazila = '') {
    const distEl = document.getElementById(districtSelectId);
    const distName = distEl ? distEl.value : '';
    const list = distName && TD.UPAZILAS_BY_DISTRICT[distName] ? TD.UPAZILAS_BY_DISTRICT[distName] : [];
    const placeholder = distName ? 'Select Upazila/P.S.' : 'Select District First';
    populateSelect(upazilaSelectId, list, selectedUpazila, placeholder);
  }

  function updateDobPreview() {
    const val = els.dob.value;
    if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      els.dobPreview.textContent = 'Auto-converts to MM/DD/YYYY, YYYY-MM-DD, or Day/Month/Year dropdowns.';
      els.dobPreview.className = 'field-hint';
      return;
    }
    const [yyyy, mm, dd] = val.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabel = months[parseInt(mm, 10) - 1] || mm;
    els.dobPreview.textContent = `Formatted: ${dd} ${monthLabel} ${yyyy} (MM/DD/YYYY: ${mm}/${dd}/${yyyy})`;
    els.dobPreview.className = 'field-hint hint-ok';
  }

  function updateMobileHint() {
    const m = els.mobile.value.trim();
    const cm = els.confirm_mobile.value.trim();
    if (!m && !cm) {
      els.mobileHint.textContent = 'Must match Mobile Number (Teletalk disables copy-paste, we autofill both!).';
      els.mobileHint.className = 'field-hint';
      return;
    }
    if (m && cm && m !== cm) {
      els.mobileHint.textContent = 'Mobile Number and Confirm Mobile Number do not match!';
      els.mobileHint.className = 'field-hint hint-warn';
      return;
    }
    if (m && !/^01\d{9}$/.test(m)) {
      els.mobileHint.textContent = 'BD mobile numbers are usually 11 digits starting with 01.';
      els.mobileHint.className = 'field-hint';
      return;
    }
    els.mobileHint.textContent = 'Mobile numbers match cleanly.';
    els.mobileHint.className = 'field-hint hint-ok';
  }

  function refreshConditionalVisibility() {
    for (const rule of CONDITIONAL_SELECTS) {
      const sel = document.getElementById(rule.selectId);
      const wrap = document.getElementById(rule.wrapId);
      if (!sel || !wrap) continue;
      const shouldShow = rule.check(sel.value);
      wrap.classList.toggle('hidden', !shouldShow);
    }

    // Same as Present Address lock & sync
    const sameChecked = els.same_as_present.checked;
    els.permanentAddressBody.classList.toggle('section-disabled', sameChecked);
    const permCard = document.getElementById('cardPermanentAddress');
    if (permCard) permCard.classList.toggle('fieldset-disabled', sameChecked);
    for (const id of PERMANENT_FIELD_IDS) {
      const field = document.getElementById(id);
      if (field) field.disabled = sameChecked;
    }

    // Graduation If Applicable toggle
    const graOn = els.gra_applicable.checked;
    els.graFieldsWrap.classList.toggle('section-disabled', !graOn);
    const graCard = document.getElementById('cardGraduation');
    if (graCard) graCard.classList.toggle('fieldset-disabled', !graOn);
    for (const id of GRA_FIELD_IDS) {
      const field = document.getElementById(id);
      if (field) field.disabled = !graOn;
    }

    // Masters If Applicable toggle
    const masOn = els.mas_applicable.checked;
    els.masFieldsWrap.classList.toggle('section-disabled', !masOn);
    const masCard = document.getElementById('cardMasters');
    if (masCard) masCard.classList.toggle('fieldset-disabled', !masOn);
    for (const id of MAS_FIELD_IDS) {
      const field = document.getElementById(id);
      if (field) field.disabled = !masOn;
    }

    // Job Experiences If Applicable toggle
    if (els.exp_applicable && els.expFieldsWrap) {
      const expOn = els.exp_applicable.checked;
      els.expFieldsWrap.classList.toggle('section-disabled', !expOn);
      const expCard = document.getElementById('cardJobExperience');
      if (expCard) expCard.classList.toggle('fieldset-disabled', !expOn);
      if (els.btnAddJobExp) els.btnAddJobExp.disabled = !expOn;
      for (const ctrl of els.expFieldsWrap.querySelectorAll('input, select, textarea, button')) {
        ctrl.disabled = !expOn;
      }
      if (expOn && els.jobExpList) {
        for (const card of els.jobExpList.querySelectorAll('.job-exp-item')) {
          const cw = card.querySelector('[data-job-field="currently_working"]');
          const endInput = card.querySelector('[data-job-field="job_end_date"]');
          if (cw && endInput) {
            endInput.disabled = cw.checked;
          }
        }
      }
    }

    syncFilledControlStyles();
  }

  function syncPresentToPermanent() {
    if (!els.same_as_present.checked) return;

    const presentDist = document.getElementById('present_district').value;
    const presentUpazila = document.getElementById('present_upazila').value;

    document.getElementById('permanent_careof').value = document.getElementById('present_careof').value;
    document.getElementById('permanent_village').value = document.getElementById('present_village').value;
    document.getElementById('permanent_district').value = presentDist;
    updateUpazilaDropdown('permanent_district', 'permanent_upazila', presentUpazila);
    document.getElementById('permanent_post').value = document.getElementById('present_post').value;
    document.getElementById('permanent_postcode').value = document.getElementById('present_postcode').value;
  }

  function renderProfileSelect(state) {
    const frag = document.createDocumentFragment();
    for (const p of state.profiles) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.profileName;
      if (p.id === state.activeProfileId) opt.selected = true;
      frag.appendChild(opt);
    }
    els.profileSelect.replaceChildren(frag);

    const active = state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
    updateProfileStatsText(active.data);
  }

  function updateProfileStatsText(data) {
    if (!els.profileStats) return;
    const count = Storage.countFilledFields(data);
    els.profileStats.textContent = `${count} field${count === 1 ? '' : 's'} saved`;
  }

  function populateFormFromProfile(profile) {
    const data = Storage.normalizeProfileData(profile.data);

    // Purge any custom options injected for previously viewed profiles
    if (els.profileForm) {
      for (const customOpt of els.profileForm.querySelectorAll('select option[data-tjf-custom="1"]')) {
        customOpt.remove();
      }
    }

    // Populate Districts first so Upazilas exist before assigning value
    document.getElementById('present_district').value = data.present_district || '';
    updateUpazilaDropdown('present_district', 'present_upazila', data.present_upazila || '');

    document.getElementById('permanent_district').value = data.permanent_district || '';
    updateUpazilaDropdown('permanent_district', 'permanent_upazila', data.permanent_upazila || '');

    for (const key of Object.keys(Storage.DEFAULT_PROFILE_DATA)) {
      if (
        key === 'present_district' ||
        key === 'present_upazila' ||
        key === 'permanent_district' ||
        key === 'permanent_upazila' ||
        key === 'job_experiences'
      ) {
        continue;
      }
      const el = document.getElementById(key);
      if (!el) continue;
      if (el.type === 'checkbox') {
        el.checked = Boolean(data[key]);
      } else if (el.tagName === 'SELECT') {
        const val = data[key] || '';
        if (val && !Array.from(el.options).some((o) => o.value === val)) {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          opt.dataset.tjfCustom = '1';
          el.appendChild(opt);
        }
        el.value = val;
      } else {
        el.value = data[key] || '';
      }
    }

    renderJobExperiences(data.job_experiences);

    lastAutoMobile = data.mobile || '';
    if (els.same_as_present.checked) {
      syncPresentToPermanent();
    }
    refreshConditionalVisibility();
    updateDobPreview();
    updateMobileHint();
    setDirty(false);
  }

  function collectFormData() {
    const raw = {};
    for (const key of Object.keys(Storage.DEFAULT_PROFILE_DATA)) {
      if (key === 'job_experiences') continue;
      const el = document.getElementById(key);
      if (!el) continue;
      if (el.type === 'checkbox') {
        raw[key] = Boolean(el.checked);
      } else {
        let val = String(el.value || '').trim();
        if (UPPERCASE_KEYS.has(key) && val) {
          val = val.toUpperCase();
        }
        raw[key] = val;
      }
    }

    raw.job_experiences = collectJobExperiences();

    if (raw.same_as_present) {
      raw.permanent_careof = raw.present_careof;
      raw.permanent_village = raw.present_village;
      raw.permanent_district = raw.present_district;
      raw.permanent_upazila = raw.present_upazila;
      raw.permanent_post = raw.present_post;
      raw.permanent_postcode = raw.present_postcode;
    }

    return Storage.normalizeProfileData(raw);
  }

  async function persistDraftSilently() {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
    if (!currentState) return;
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    if (!active) return;

    const epoch = activeSaveEpoch;
    const data = collectFormData();
    try {
      const res = await Storage.updateProfile(active.id, active.profileName, data);
      if (epoch !== activeSaveEpoch) return;
      currentState = res.state;
      updateProfileStatsText(res.profile.data);
      setDirty(false);
    } catch (_err) {
      // Keep dirty badge visible if silent persistence fails
    }
  }

  function scheduleAutoSave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      autoSaveTimer = null;
      persistDraftSilently();
    }, 350);
  }

  async function saveCurrentProfile() {
    cancelPendingAutoSave();
    if (!currentState) return;
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    if (!active) return;
    const data = collectFormData();

    try {
      const res = await Storage.updateProfile(active.id, active.profileName, data);
      currentState = res.state;
      populateFormFromProfile(res.profile);
      renderProfileSelect(currentState);
      setDirty(false);

      if (data.mobile && data.confirm_mobile && data.mobile !== data.confirm_mobile) {
        showToast('Saved, but note: Mobile Number and Confirm Mobile Number do not match!', 'warn');
      } else {
        showToast(`Profile "${res.profile.profileName}" saved successfully!`, 'success');
      }
    } catch (err) {
      showToast(`Failed to save profile: ${err.message || 'Storage error'}`, 'error');
    }
  }

  function askModal({
    title,
    desc,
    defaultValue = '',
    confirmLabel = 'Confirm',
    secondaryLabel = '',
    showInput = true,
    inputType = 'text',
    placeholder = 'Profile name...'
  }) {
    if (modalResolve) {
      closeModal({ action: 'cancel', value: '' });
    }
    return new Promise((resolve) => {
      modalResolve = resolve;
      els.modalTitle.textContent = title;
      els.modalDesc.textContent = desc;
      els.modalInput.type = inputType;
      els.modalInput.placeholder = placeholder;
      els.modalInput.value = defaultValue;
      els.modalInput.classList.toggle('hidden', !showInput);
      els.btnModalConfirm.textContent = confirmLabel;

      if (secondaryLabel) {
        els.btnModalSecondary.textContent = secondaryLabel;
        els.btnModalSecondary.classList.remove('hidden');
      } else {
        els.btnModalSecondary.classList.add('hidden');
      }

      els.modalBackdrop.classList.remove('hidden');
      if (showInput) {
        els.modalInput.focus();
        if (inputType !== 'password') {
          els.modalInput.select();
        }
      } else {
        els.btnModalConfirm.focus();
      }
    });
  }

  function closeModal(action = 'cancel') {
    const val = els.modalInput.value;
    els.modalInput.value = '';
    els.modalInput.type = 'text';
    els.modalInput.classList.remove('hidden');
    els.btnModalSecondary.classList.add('hidden');
    els.modalBackdrop.classList.add('hidden');
    if (modalResolve) {
      const fn = modalResolve;
      modalResolve = null;
      fn(
        action === 'cancel'
          ? { action: 'cancel', value: '' }
          : { action, value: val }
      );
    }
  }

  async function handleNewProfile() {
    cancelPendingAutoSave();
    const resModal = await askModal({
      title: 'Create New Applicant Profile',
      desc: 'Give this profile a clear name (e.g., "Friend 1", "Sister", or "Govt Job 2").',
      defaultValue: `Profile ${currentState.profiles.length + 1}`,
      confirmLabel: 'Create Profile'
    });
    const name = resModal.action === 'confirm' ? resModal.value.trim() : '';
    if (!name) return;
    try {
      const res = await Storage.createProfile(name);
      currentState = res.state;
      renderProfileSelect(currentState);
      populateFormFromProfile(res.profile);
      showToast(`Created new profile "${res.profile.profileName}".`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not create profile.', 'error');
    }
  }

  async function handleRenameProfile() {
    cancelPendingAutoSave();
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    const resModal = await askModal({
      title: 'Rename Profile',
      desc: `Enter a new name for "${active.profileName}".`,
      defaultValue: active.profileName,
      confirmLabel: 'Rename'
    });
    const nextName = resModal.action === 'confirm' ? resModal.value.trim() : '';
    if (!nextName || nextName === active.profileName) return;

    const currentData = collectFormData();
    const res = await Storage.updateProfile(active.id, nextName, currentData);
    currentState = res.state;
    renderProfileSelect(currentState);
    showToast(`Renamed profile to "${res.profile.profileName}".`, 'success');
  }

  async function handleDuplicateProfile() {
    cancelPendingAutoSave();
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    const resModal = await askModal({
      title: 'Duplicate Profile',
      desc: `Create a copy of "${active.profileName}" with all its saved fields.`,
      defaultValue: `${active.profileName} (Copy)`,
      confirmLabel: 'Duplicate'
    });
    const nextName = resModal.action === 'confirm' ? resModal.value.trim() : '';
    if (!nextName) return;

    try {
      const res = await Storage.createProfile(nextName, collectFormData());
      currentState = res.state;
      renderProfileSelect(currentState);
      populateFormFromProfile(res.profile);
      showToast(`Duplicated as "${res.profile.profileName}".`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not duplicate profile.', 'error');
    }
  }

  async function handleDeleteProfile() {
    cancelPendingAutoSave();
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    const isLast = currentState.profiles.length <= 1;
    const msg = isLast
      ? `Clear all saved fields in "${active.profileName}"?`
      : `Delete profile "${active.profileName}"? This cannot be undone unless you exported a JSON backup.`;

    if (!window.confirm(msg)) return;
    const res = await Storage.deleteProfile(active.id);
    currentState = res.state;
    const nextActive = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    renderProfileSelect(currentState);
    populateFormFromProfile(nextActive);
    showToast(res.resetOnly ? 'Profile cleared back to blank default.' : `Deleted "${active.profileName}".`, 'warn');
  }

  async function handleExport() {
    cancelPendingAutoSave();
    if (isDirty) {
      await saveCurrentProfile();
    }

    const modalRes = await askModal({
      title: '📤 Export Backup (JSON)',
      desc: 'Enter an optional password to AES-256 encrypt your sensitive NID/Passport data, or export plain JSON.',
      defaultValue: '',
      confirmLabel: '🔒 Export Encrypted',
      secondaryLabel: '📄 Export Plain JSON',
      showInput: true,
      inputType: 'password',
      placeholder: 'Encryption password...'
    });
    if (modalRes.action === 'cancel') return;

    if (modalRes.action === 'confirm' && !modalRes.value) {
      showToast('Enter a password to encrypt, or click "Export Plain JSON".', 'warn');
      return;
    }

    const passphrase = modalRes.action === 'confirm' ? modalRes.value : '';
    try {
      const json = await Storage.exportBackupJson(passphrase);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = Storage.formatLocalDateIso();
      const suffix = passphrase ? '-encrypted' : '';

      const a = document.createElement('a');
      a.href = url;
      a.download = `teletalk-jobs-filler-backup-${dateStr}${suffix}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast(
        passphrase
          ? 'Encrypted JSON backup exported! Keep your password safe.'
          : 'JSON backup exported! Store this file privately.',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Export failed.', 'error');
    }
  }

  async function handleImportFile(file) {
    if (!file) return;
    cancelPendingAutoSave();
    if (file.size > Storage.MAX_BACKUP_BYTES) {
      showToast('Backup file is too large (max 2 MB allowed).', 'error');
      els.fileImport.value = '';
      return;
    }

    try {
      const text = await file.text();
      const isEncrypted = Storage.isEncryptedBackupJson(text);
      const latestState = await Storage.getState();
      const hasExisting = latestState.profiles.some((p) => Storage.hasMeaningfulData(p.data));

      let mode = 'replace';
      let passphrase = '';

      if (isEncrypted || hasExisting) {
        const modalRes = await askModal({
          title: isEncrypted ? '🔒 Encrypted Backup Detected' : '📥 Restore Profiles from Backup',
          desc: hasExisting
            ? 'You already have saved profiles. Choose "Merge (Keep Existing)" or "Replace All".'
            : 'Enter the password used when exporting this encrypted backup.',
          defaultValue: '',
          confirmLabel: hasExisting ? 'Merge (Keep Existing)' : '🔓 Decrypt & Import',
          secondaryLabel: hasExisting ? 'Replace All' : '',
          showInput: isEncrypted,
          inputType: 'password',
          placeholder: 'Decryption password...'
        });

        if (modalRes.action === 'cancel') return;
        mode = hasExisting && modalRes.action === 'confirm' ? 'append' : 'replace';
        passphrase = modalRes.value;
      }

      const res = await Storage.importBackupJson(text, mode, passphrase);
      currentState = res.state;
      const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
      renderProfileSelect(currentState);
      populateFormFromProfile(active);
      els.importBanner.classList.add('hidden');
      showToast(
        mode === 'append'
          ? `Merged ${res.importedCount} profile(s) into your existing profiles!`
          : `Imported ${res.importedCount} profile(s) from backup!`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Invalid backup JSON file.', 'error');
    } finally {
      els.fileImport.value = '';
    }
  }

  function switchTab(tabKey) {
    for (const btn of els.tabButtons) {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    }
    for (const panel of els.sectionPanels) {
      const show = tabKey === 'all' || panel.dataset.section === tabKey;
      panel.classList.toggle('hidden', !show);
    }
  }

  function wireEvents() {
    // Tab switching
    for (const btn of els.tabButtons) {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    }

    // Profile switching
    els.profileSelect.addEventListener('change', async () => {
      cancelPendingAutoSave();
      if (isDirty) {
        const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId);
        if (active) {
          await Storage.updateProfile(active.id, active.profileName, collectFormData());
        }
      }
      const next = await Storage.setActiveProfile(els.profileSelect.value);
      currentState = await Storage.getState();
      renderProfileSelect(currentState);
      populateFormFromProfile(next);
      showToast(`Switched to "${next.profileName}".`, 'success');
    });

    // Save actions
    els.btnSaveProfile.addEventListener('click', saveCurrentProfile);
    els.profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveCurrentProfile();
    });

    // Ctrl+S / Cmd+S shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentProfile();
      }
    });

    // Warn on close if unsaved
    window.addEventListener('beforeunload', (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Profile toolbar buttons
    els.btnNewProfile.addEventListener('click', handleNewProfile);
    els.btnRenameProfile.addEventListener('click', handleRenameProfile);
    els.btnDuplicateProfile.addEventListener('click', handleDuplicateProfile);
    els.btnDeleteProfile.addEventListener('click', handleDeleteProfile);

    // Backup buttons
    els.btnExport.addEventListener('click', handleExport);
    els.btnImport.addEventListener('click', () => els.fileImport.click());
    els.btnBannerChooseFile.addEventListener('click', () => els.fileImport.click());
    els.btnBannerDismiss.addEventListener('click', () => els.importBanner.classList.add('hidden'));
    els.fileImport.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleImportFile(file);
    });

    // Modal handlers
    els.btnModalCancel.addEventListener('click', () => closeModal('cancel'));
    els.btnModalSecondary.addEventListener('click', () => closeModal('secondary'));
    els.btnModalConfirm.addEventListener('click', () => closeModal('confirm'));
    els.modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeModal('confirm');
      } else if (e.key === 'Escape') {
        closeModal('cancel');
      }
    });
    els.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === els.modalBackdrop) closeModal('cancel');
    });

    // Dynamic field behaviors
    els.dob.addEventListener('input', updateDobPreview);
    els.dob.addEventListener('change', updateDobPreview);

    els.mobile.addEventListener('input', () => {
      const currentVal = els.mobile.value.trim();
      if (!els.confirm_mobile.value.trim() || els.confirm_mobile.value.trim() === lastAutoMobile) {
        els.confirm_mobile.value = currentVal;
      }
      lastAutoMobile = currentVal;
      updateMobileHint();
    });
    els.confirm_mobile.addEventListener('input', updateMobileHint);

    document.getElementById('present_district').addEventListener('change', () => {
      updateUpazilaDropdown('present_district', 'present_upazila', '');
      syncPresentToPermanent();
    });

    document.getElementById('permanent_district').addEventListener('change', () => {
      updateUpazilaDropdown('permanent_district', 'permanent_upazila', '');
    });

    for (const id of ['present_careof', 'present_village', 'present_upazila', 'present_post', 'present_postcode']) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', syncPresentToPermanent);
        el.addEventListener('change', syncPresentToPermanent);
      }
    }

    els.same_as_present.addEventListener('change', () => {
      if (els.same_as_present.checked) {
        syncPresentToPermanent();
      }
      refreshConditionalVisibility();
    });

    els.gra_applicable.addEventListener('change', refreshConditionalVisibility);
    els.mas_applicable.addEventListener('change', refreshConditionalVisibility);
    if (els.exp_applicable) {
      els.exp_applicable.addEventListener('change', refreshConditionalVisibility);
    }
    if (els.btnAddJobExp) {
      els.btnAddJobExp.addEventListener('click', () => {
        const jobs = collectJobExperiences();
        jobs.push({ ...Storage.DEFAULT_JOB_EXPERIENCE_ITEM });
        renderJobExperiences(jobs);
        refreshConditionalVisibility();
        setDirty(true);
        scheduleAutoSave();
      });
    }

    for (const rule of CONDITIONAL_SELECTS) {
      const sel = document.getElementById(rule.selectId);
      if (sel) {
        sel.addEventListener('change', refreshConditionalVisibility);
      }
    }

    // Track dirty state, O(1) control border styling, and debounced auto-save on any form edit
    els.profileForm.addEventListener('input', (e) => {
      syncSingleControlStyle(e.target);
      setDirty(true);
      scheduleAutoSave();
    });
    els.profileForm.addEventListener('change', (e) => {
      syncSingleControlStyle(e.target);
      setDirty(true);
      scheduleAutoSave();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && (isDirty || autoSaveTimer)) {
        persistDraftSilently();
      }
    });
    window.addEventListener('pagehide', () => {
      if (isDirty || autoSaveTimer) {
        persistDraftSilently();
      }
    });
  }

  async function init() {
    initializeStaticDropdowns();
    wireEvents();

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'import') {
      els.importBanner.classList.remove('hidden');
    }

    currentState = await Storage.getState();
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    renderProfileSelect(currentState);
    populateFormFromProfile(active);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
