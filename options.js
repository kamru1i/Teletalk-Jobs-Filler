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
  let modalResolve = null;
  let lastAutoMobile = '';

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
    sel.innerHTML = '';

    if (placeholder !== null) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = placeholder;
      sel.appendChild(opt);
    }

    const list = Array.isArray(items) ? items : [];
    for (const item of list) {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item;
      sel.appendChild(opt);
    }

    if (selectedValue) {
      const exists = Array.from(sel.options).some((o) => o.value === selectedValue);
      if (!exists) {
        const customOpt = document.createElement('option');
        customOpt.value = selectedValue;
        customOpt.textContent = selectedValue;
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

    populateSelect('other_computer_proficiency', TD.YES_NO, '', 'Select');
    populateSelect('other_typing_speed', TD.YES_NO, '', 'Select');
    populateSelect('other_default_response', TD.YES_NO, '', 'Leave empty (Do not auto-answer)');
  }

  function updateJobCardCounter(textarea, counterEl) {
    if (!textarea || !counterEl) return;
    const len = String(textarea.value || '').length;
    counterEl.textContent = `${len} / 300`;
    counterEl.classList.toggle('near-limit', len >= 270);
  }

  function buildJobFormGroup(labelText, controlEl, extraClass = '') {
    const group = document.createElement('div');
    group.className = extraClass ? `form-group ${extraClass}` : 'form-group';
    const label = document.createElement('label');
    label.textContent = labelText;
    group.appendChild(label);
    group.appendChild(controlEl);
    return group;
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

    // Header
    const header = document.createElement('div');
    header.className = 'job-exp-header';

    const badge = document.createElement('div');
    badge.className = 'job-exp-badge';
    const numSpan = document.createElement('span');
    numSpan.className = 'job-exp-index';
    numSpan.textContent = String(index + 1);
    const titleSpan = document.createElement('span');
    titleSpan.textContent = `Job Experience #${index + 1}`;
    badge.appendChild(numSpan);
    badge.appendChild(titleSpan);
    header.appendChild(badge);

    if (totalCount > 1) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn-danger-outline btn-sm';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        const jobs = collectJobExperiences();
        jobs.splice(index, 1);
        renderJobExperiences(jobs);
        refreshConditionalVisibility();
        setDirty(true);
      });
      header.appendChild(removeBtn);
    }
    card.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'form-grid two-col';

    // Employed on
    const empSelect = document.createElement('select');
    empSelect.className = 'form-control';
    empSelect.dataset.jobField = 'employment_type';
    populateSelectElement(empSelect, TD.EMPLOYMENT_TYPES, norm.employment_type, 'Select Employment Type');
    grid.appendChild(buildJobFormGroup('Employed on', empSelect));

    // Organization
    const orgInput = document.createElement('input');
    orgInput.type = 'text';
    orgInput.className = 'form-control';
    orgInput.maxLength = 100;
    orgInput.placeholder = 'e.g. Company / Organization Name';
    orgInput.dataset.jobField = 'organization';
    orgInput.value = norm.organization;
    grid.appendChild(buildJobFormGroup('Organization', orgInput));

    // Designation / Post
    const desInput = document.createElement('input');
    desInput.type = 'text';
    desInput.className = 'form-control';
    desInput.maxLength = 50;
    desInput.placeholder = 'e.g. IT Officer / Assistant Manager';
    desInput.dataset.jobField = 'designation';
    desInput.value = norm.designation;
    grid.appendChild(buildJobFormGroup('Designation / Post', desInput));

    // Office Address
    const addrInput = document.createElement('input');
    addrInput.type = 'text';
    addrInput.className = 'form-control';
    addrInput.maxLength = 100;
    addrInput.placeholder = 'Office Street, Road, Area, District';
    addrInput.dataset.jobField = 'office_address';
    addrInput.value = norm.office_address;
    grid.appendChild(buildJobFormGroup('Office Address', addrInput));

    // Length of Service + Currently Working
    const serviceWrap = document.createElement('div');
    serviceWrap.className = 'form-group';
    const serviceLabel = document.createElement('label');
    serviceLabel.textContent = 'Length of Service';
    serviceWrap.appendChild(serviceLabel);

    const dateRow = document.createElement('div');
    dateRow.className = 'date-range-row';

    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.className = 'form-control';
    startInput.dataset.jobField = 'job_start_date';
    startInput.value = norm.job_start_date;

    const toSpan = document.createElement('span');
    toSpan.className = 'date-range-sep';
    toSpan.textContent = 'to';

    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.className = 'form-control';
    endInput.dataset.jobField = 'job_end_date';
    endInput.value = norm.job_end_date;

    dateRow.appendChild(startInput);
    dateRow.appendChild(toSpan);
    dateRow.appendChild(endInput);
    serviceWrap.appendChild(dateRow);

    const cwLabel = document.createElement('label');
    cwLabel.className = 'currently-working-inline';
    const cwCheck = document.createElement('input');
    cwCheck.type = 'checkbox';
    cwCheck.dataset.jobField = 'currently_working';
    cwCheck.checked = norm.currently_working;
    cwCheck.addEventListener('change', refreshConditionalVisibility);
    const cwText = document.createElement('span');
    cwText.textContent = 'Currently Working';
    cwLabel.appendChild(cwCheck);
    cwLabel.appendChild(cwText);
    serviceWrap.appendChild(cwLabel);
    grid.appendChild(serviceWrap);

    // Optional Last Drawn Salary
    const salaryInput = document.createElement('input');
    salaryInput.type = 'text';
    salaryInput.className = 'form-control';
    salaryInput.maxLength = 30;
    salaryInput.placeholder = 'Optional (e.g. 35000)';
    salaryInput.dataset.jobField = 'last_salary';
    salaryInput.value = norm.last_salary;
    const salaryGroup = buildJobFormGroup('Last Drawn Salary (Optional)', salaryInput);
    const salaryHint = document.createElement('span');
    salaryHint.className = 'field-hint';
    salaryHint.textContent = 'Filled automatically only if the portal displays a salary field.';
    salaryGroup.appendChild(salaryHint);
    grid.appendChild(salaryGroup);

    // Job Description
    const descGroup = document.createElement('div');
    descGroup.className = 'form-group full-width';
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Job Description';
    descGroup.appendChild(descLabel);

    const descTextarea = document.createElement('textarea');
    descTextarea.className = 'form-control';
    descTextarea.rows = 3;
    descTextarea.maxLength = 300;
    descTextarea.placeholder = 'Short summary of duties and responsibilities (max 300 characters)';
    descTextarea.dataset.jobField = 'job_description';
    descTextarea.value = norm.job_description;
    descGroup.appendChild(descTextarea);

    const metaRow = document.createElement('div');
    metaRow.className = 'desc-meta-row';
    const descHint = document.createElement('span');
    descHint.className = 'field-hint';
    descHint.textContent = 'Teletalk limits Job Description to 300 characters and blocks paste — our extension fills it safely.';
    const counter = document.createElement('span');
    counter.className = 'char-counter';
    updateJobCardCounter(descTextarea, counter);
    descTextarea.addEventListener('input', () => updateJobCardCounter(descTextarea, counter));
    metaRow.appendChild(descHint);
    metaRow.appendChild(counter);
    descGroup.appendChild(metaRow);
    grid.appendChild(descGroup);

    card.appendChild(grid);
    return card;
  }

  function renderJobExperiences(jobs) {
    if (!els.jobExpList) return;
    const list = Array.isArray(jobs) && jobs.length > 0
      ? jobs.map(Storage.normalizeJobExperienceItem)
      : [{ ...Storage.DEFAULT_JOB_EXPERIENCE_ITEM }];

    els.jobExpList.innerHTML = '';
    list.forEach((job, idx) => {
      els.jobExpList.appendChild(createJobExperienceCard(job, idx, list.length));
    });
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
    for (const id of PERMANENT_FIELD_IDS) {
      const field = document.getElementById(id);
      if (field) field.disabled = sameChecked;
    }

    // Graduation If Applicable toggle
    const graOn = els.gra_applicable.checked;
    els.graFieldsWrap.classList.toggle('section-disabled', !graOn);
    for (const id of GRA_FIELD_IDS) {
      const field = document.getElementById(id);
      if (field) field.disabled = !graOn;
    }

    // Masters If Applicable toggle
    const masOn = els.mas_applicable.checked;
    els.masFieldsWrap.classList.toggle('section-disabled', !masOn);
    for (const id of MAS_FIELD_IDS) {
      const field = document.getElementById(id);
      if (field) field.disabled = !masOn;
    }

    // Job Experiences If Applicable toggle
    if (els.exp_applicable && els.expFieldsWrap) {
      const expOn = els.exp_applicable.checked;
      els.expFieldsWrap.classList.toggle('section-disabled', !expOn);
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
    els.profileSelect.innerHTML = '';
    for (const p of state.profiles) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.profileName;
      if (p.id === state.activeProfileId) opt.selected = true;
      els.profileSelect.appendChild(opt);
    }

    const active = state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
    const count = Storage.countFilledFields(active.data);
    els.profileStats.textContent = `${count} field${count === 1 ? '' : 's'} saved`;
  }

  function populateFormFromProfile(profile) {
    const data = Storage.normalizeProfileData(profile.data);

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

  async function saveCurrentProfile() {
    if (!currentState) return;
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    const data = collectFormData();

    if (data.mobile && data.confirm_mobile && data.mobile !== data.confirm_mobile) {
      showToast('Saved, but note: Mobile Number and Confirm Mobile Number do not match!', 'warn');
    } else {
      showToast(`Profile "${active.profileName}" saved successfully!`, 'success');
    }

    const res = await Storage.updateProfile(active.id, active.profileName, data);
    currentState = res.state;
    populateFormFromProfile(res.profile);
    renderProfileSelect(currentState);
    setDirty(false);
  }

  function askModal({ title, desc, defaultValue = '', confirmLabel = 'Confirm' }) {
    return new Promise((resolve) => {
      modalResolve = resolve;
      els.modalTitle.textContent = title;
      els.modalDesc.textContent = desc;
      els.modalInput.value = defaultValue;
      els.btnModalConfirm.textContent = confirmLabel;
      els.modalBackdrop.classList.remove('hidden');
      els.modalInput.focus();
      els.modalInput.select();
    });
  }

  function closeModal(result) {
    els.modalBackdrop.classList.add('hidden');
    if (modalResolve) {
      const fn = modalResolve;
      modalResolve = null;
      fn(result);
    }
  }

  async function handleNewProfile() {
    const name = await askModal({
      title: 'Create New Applicant Profile',
      desc: 'Give this profile a clear name (e.g., "Friend 1", "Sister", or "Govt Job 2").',
      defaultValue: `Profile ${currentState.profiles.length + 1}`,
      confirmLabel: 'Create Profile'
    });
    if (!name) return;
    const res = await Storage.createProfile(name);
    currentState = res.state;
    renderProfileSelect(currentState);
    populateFormFromProfile(res.profile);
    showToast(`Created new profile "${res.profile.profileName}".`, 'success');
  }

  async function handleRenameProfile() {
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    const nextName = await askModal({
      title: 'Rename Profile',
      desc: `Enter a new name for "${active.profileName}".`,
      defaultValue: active.profileName,
      confirmLabel: 'Rename'
    });
    if (!nextName || nextName === active.profileName) return;

    const currentData = collectFormData();
    const res = await Storage.updateProfile(active.id, nextName, currentData);
    currentState = res.state;
    renderProfileSelect(currentState);
    showToast(`Renamed profile to "${res.profile.profileName}".`, 'success');
  }

  async function handleDuplicateProfile() {
    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    const nextName = await askModal({
      title: 'Duplicate Profile',
      desc: `Create a copy of "${active.profileName}" with all its saved fields.`,
      defaultValue: `${active.profileName} (Copy)`,
      confirmLabel: 'Duplicate'
    });
    if (!nextName) return;

    const res = await Storage.createProfile(nextName, collectFormData());
    currentState = res.state;
    renderProfileSelect(currentState);
    populateFormFromProfile(res.profile);
    showToast(`Duplicated as "${res.profile.profileName}".`, 'success');
  }

  async function handleDeleteProfile() {
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
    if (isDirty) {
      await saveCurrentProfile();
    }
    const json = await Storage.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);

    const a = document.createElement('a');
    a.href = url;
    a.download = `teletalk-jobs-filler-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('JSON backup exported! Store this file safely.', 'success');
  }

  async function handleImportFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const hasExisting = currentState && currentState.profiles.some((p) => Storage.hasMeaningfulData(p.data));
      if (hasExisting) {
        const confirmed = window.confirm(
          'Importing a full backup will replace your current saved profiles on this browser.\n\nClick OK to restore from the backup file, or Cancel to keep existing profiles.'
        );
        if (!confirmed) return;
      }
      const res = await Storage.importBackupJson(text, 'replace');
      currentState = res.state;
      const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
      renderProfileSelect(currentState);
      populateFormFromProfile(active);
      els.importBanner.classList.add('hidden');
      showToast(`Imported ${res.importedCount} profile(s) from backup!`, 'success');
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
    els.btnModalCancel.addEventListener('click', () => closeModal(null));
    els.btnModalConfirm.addEventListener('click', () => {
      const val = els.modalInput.value.trim();
      closeModal(val || null);
    });
    els.modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = els.modalInput.value.trim();
        closeModal(val || null);
      } else if (e.key === 'Escape') {
        closeModal(null);
      }
    });
    els.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === els.modalBackdrop) closeModal(null);
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
      });
    }

    for (const rule of CONDITIONAL_SELECTS) {
      const sel = document.getElementById(rule.selectId);
      if (sel) {
        sel.addEventListener('change', refreshConditionalVisibility);
      }
    }

    // Track dirty state on any form edit
    els.profileForm.addEventListener('input', () => setDirty(true));
    els.profileForm.addEventListener('change', () => setDirty(true));
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
