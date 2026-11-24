(function (globalScope) {
  'use strict';

  const STORAGE_KEY = 'tjf_state';
  const BACKUP_APP_ID = 'Teletalk Jobs Filler';
  const BACKUP_VERSION = 1;
  const MAX_BACKUP_BYTES = 2 * 1024 * 1024; // 2 MB
  const MAX_PROFILES = 50;
  const MAX_JOBS_PER_PROFILE = 20;
  const MAX_FIELD_LENGTH = 500;
  const PBKDF2_ITERATIONS = 250000;

  let writeQueue = Promise.resolve();

  function enqueueWrite(taskFn) {
    const next = writeQueue.then(taskFn, taskFn);
    writeQueue = next.catch(() => {});
    return next;
  }

  function clampString(val, maxLen = MAX_FIELD_LENGTH) {
    if (val === undefined || val === null) return '';
    return String(val).slice(0, maxLen);
  }

  function formatLocalDateIso(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function bytesToBase64(bytes) {
    if (typeof btoa === 'function') {
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }
    throw new Error('Base64 encoding is unavailable in this environment.');
  }

  function base64ToBytes(b64) {
    if (typeof atob === 'function') {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(b64, 'base64'));
    }
    throw new Error('Base64 decoding is unavailable in this environment.');
  }

  function getWebCrypto() {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      return globalThis.crypto;
    }
    return null;
  }

  async function deriveAesKey(cryptoApi, passphrase, salt, iterations, usages) {
    const encoder = new TextEncoder();
    const keyMaterial = await cryptoApi.subtle.importKey(
      'raw',
      encoder.encode(String(passphrase)),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return cryptoApi.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      usages
    );
  }

  async function encryptTextAesGcm(plainText, passphrase) {
    const cryptoApi = getWebCrypto();
    if (!cryptoApi) {
      throw new Error('Web Crypto API is unavailable for backup encryption.');
    }
    const salt = cryptoApi.getRandomValues(new Uint8Array(16));
    const iv = cryptoApi.getRandomValues(new Uint8Array(12));
    const key = await deriveAesKey(cryptoApi, passphrase, salt, PBKDF2_ITERATIONS, ['encrypt']);
    const cipherBuf = await cryptoApi.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(plainText)
    );
    return {
      app: BACKUP_APP_ID,
      version: BACKUP_VERSION,
      encrypted: true,
      cipher: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations: PBKDF2_ITERATIONS,
      exportedAt: new Date().toISOString(),
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(cipherBuf))
    };
  }

  async function decryptTextAesGcm(envelope, passphrase) {
    const cryptoApi = getWebCrypto();
    if (!cryptoApi) {
      throw new Error('Web Crypto API is unavailable for backup decryption.');
    }
    const iter = Number(envelope.iterations);
    if (!Number.isInteger(iter) || iter < 10000 || iter > 2000000) {
      throw new Error('Encrypted backup has invalid key-derivation parameters.');
    }
    let salt;
    let iv;
    let cipherBytes;
    try {
      salt = base64ToBytes(String(envelope.salt || ''));
      iv = base64ToBytes(String(envelope.iv || ''));
      cipherBytes = base64ToBytes(String(envelope.ciphertext || ''));
    } catch (_err) {
      throw new Error('Encrypted backup data is malformed.');
    }
    if (salt.length < 8 || iv.length !== 12 || cipherBytes.length === 0) {
      throw new Error('Encrypted backup metadata is invalid.');
    }
    try {
      const key = await deriveAesKey(cryptoApi, passphrase, salt, iter, ['decrypt']);
      const plainBuf = await cryptoApi.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipherBytes
      );
      return new TextDecoder().decode(plainBuf);
    } catch (_err) {
      const err = new Error('Incorrect backup password or corrupted encrypted file.');
      err.code = 'INVALID_PASSWORD';
      throw err;
    }
  }

  function isEncryptedBackupJson(jsonString) {
    try {
      const parsed = JSON.parse(String(jsonString || ''));
      return Boolean(
        parsed &&
        typeof parsed === 'object' &&
        parsed.encrypted === true &&
        typeof parsed.ciphertext === 'string' &&
        typeof parsed.salt === 'string' &&
        typeof parsed.iv === 'string'
      );
    } catch (_err) {
      return false;
    }
  }

  const DEFAULT_JOB_EXPERIENCE_ITEM = {
    employment_type: '',
    designation: '',
    organization: '',
    office_address: '',
    job_start_date: '',
    job_end_date: '',
    currently_working: false,
    last_salary: '',
    job_description: ''
  };

  const JOB_EXPERIENCE_STRING_KEYS = [
    'employment_type',
    'designation',
    'organization',
    'office_address',
    'job_start_date',
    'job_end_date',
    'last_salary',
    'job_description'
  ];

  function normalizeJobExperienceItem(rawItem) {
    const src = rawItem && typeof rawItem === 'object' ? rawItem : {};
    const out = {};
    for (const field of JOB_EXPERIENCE_STRING_KEYS) {
      const maxLen = field === 'job_description' ? 300 : 200;
      out[field] = clampString(src[field], maxLen);
    }
    const cw = src.currently_working;
    out.currently_working = cw === true || cw === 'true' || cw === 1 || cw === '1';
    return out;
  }

  /**
   * Canonical profile schema. ZERO hardcoded personal details.
   * Stores human-readable labels so autofill works across both old PHP and modern Alljobs portals.
   */
  const DEFAULT_PROFILE_DATA = {
    // 1. Basic Information
    name: '',
    name_bn: '',
    father: '',
    father_bn: '',
    mother: '',
    mother_bn: '',
    dob: '',
    nationality: 'Bangladeshi',
    religion: '',
    gender: '',
    marital_status: '',
    spouse_name: '',
    nid_has: 'No',
    nid_no: '',
    breg_has: 'No',
    breg_no: '',
    passport_has: 'No',
    passport_no: '',
    mobile: '',
    confirm_mobile: '',
    email: '',
    quota: 'Not Applicable',
    quota_details: '',
    dep_status: 'Not Applicable',

    // 2. Address Information
    present_careof: '',
    present_village: '',
    present_district: '',
    present_upazila: '',
    present_post: '',
    present_postcode: '',
    same_as_present: false,
    permanent_careof: '',
    permanent_village: '',
    permanent_district: '',
    permanent_upazila: '',
    permanent_post: '',
    permanent_postcode: '',

    // 3. Educational Qualifications — SSC / Equivalent
    ssc_exam: '',
    ssc_board: '',
    ssc_board_other: '',
    ssc_roll: '',
    ssc_reg: '',
    ssc_result_type: '',
    ssc_result: '',
    ssc_group: '',
    ssc_group_other: '',
    ssc_year: '',

    // HSC / Equivalent
    hsc_exam: '',
    hsc_board: '',
    hsc_board_other: '',
    hsc_roll: '',
    hsc_reg: '',
    hsc_result_type: '',
    hsc_result: '',
    hsc_group: '',
    hsc_group_other: '',
    hsc_year: '',

    // Graduation / Equivalent
    gra_applicable: false,
    gra_exam: '',
    gra_subject: '',
    gra_subject_other: '',
    gra_institute: '',
    gra_institute_other: '',
    gra_result_type: '',
    gra_result: '',
    gra_year: '',
    gra_duration: '',

    // Masters / Equivalent
    mas_applicable: false,
    mas_exam: '',
    mas_subject: '',
    mas_subject_other: '',
    mas_institute: '',
    mas_institute_other: '',
    mas_result_type: '',
    mas_result: '',
    mas_year: '',
    mas_duration: '',

    // 4. Job Experiences & Other Qualifications / Experiences
    exp_applicable: false,
    job_experiences: [{ ...DEFAULT_JOB_EXPERIENCE_ITEM }],
    other_computer_proficiency: 'Yes'
  };

  const BOOLEAN_KEYS = new Set([
    'same_as_present',
    'gra_applicable',
    'mas_applicable',
    'exp_applicable'
  ]);

  const DEFAULT_BASELINE_VALUES = {
    nationality: 'Bangladeshi',
    nid_has: 'No',
    breg_has: 'No',
    passport_has: 'No',
    quota: 'Not Applicable',
    dep_status: 'Not Applicable',
    other_computer_proficiency: 'Yes'
  };

  function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return 'prof_' + crypto.randomUUID();
    }
    return 'prof_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function jobItemHasData(job) {
    if (!job || typeof job !== 'object') return false;
    if (job.currently_working === true) return true;
    return JOB_EXPERIENCE_STRING_KEYS.some((f) => String(job[f] || '').trim() !== '');
  }

  function normalizeProfileData(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const normalized = {};
    for (const key of Object.keys(DEFAULT_PROFILE_DATA)) {
      const defVal = DEFAULT_PROFILE_DATA[key];
      const rawVal = source[key];
      if (key === 'job_experiences') {
        if (Array.isArray(rawVal) && rawVal.length > 0) {
          normalized.job_experiences = rawVal.slice(0, MAX_JOBS_PER_PROFILE).map(normalizeJobExperienceItem);
        } else {
          normalized.job_experiences = [{ ...DEFAULT_JOB_EXPERIENCE_ITEM }];
        }
      } else if (key === 'other_computer_proficiency') {
        const cleaned = String(rawVal ?? '').trim().toLowerCase();
        if (cleaned === 'skip' || cleaned === 'no' || cleaned === '0' || cleaned === 'false' || cleaned === 'select' || cleaned === 'none') {
          normalized.other_computer_proficiency = 'Skip';
        } else {
          normalized.other_computer_proficiency = 'Yes';
        }
      } else if (BOOLEAN_KEYS.has(key)) {
        normalized[key] = rawVal === true || rawVal === 'true' || rawVal === 1 || rawVal === '1';
      } else if (rawVal === undefined || rawVal === null) {
        normalized[key] = defVal;
      } else {
        normalized[key] = clampString(rawVal, MAX_FIELD_LENGTH);
      }
    }

    // Legacy / imported compatibility: infer exp_applicable if omitted while job fields exist
    if (source.exp_applicable === undefined && Array.isArray(normalized.job_experiences)) {
      if (normalized.job_experiences.some(jobItemHasData)) {
        normalized.exp_applicable = true;
      }
    }

    // Legacy compatibility: normalize Yes/No flags if imported from older format
    if (normalized.nid_has !== 'Yes' && normalized.nid_has !== 'No') {
      normalized.nid_has = normalized.nid_no ? 'Yes' : 'No';
    }
    if (normalized.breg_has !== 'Yes' && normalized.breg_has !== 'No') {
      normalized.breg_has = normalized.breg_no ? 'Yes' : 'No';
    }
    if (normalized.passport_has !== 'Yes' && normalized.passport_has !== 'No') {
      normalized.passport_has = normalized.passport_no ? 'Yes' : 'No';
    }

    return normalized;
  }

  function createEmptyProfile(profileName = 'My Profile', seedData = null) {
    return {
      id: generateId(),
      profileName: clampString(String(profileName || 'My Profile').trim(), 60) || 'My Profile',
      updatedAt: new Date().toISOString(),
      data: normalizeProfileData(seedData)
    };
  }

  function normalizeState(rawState) {
    if (!rawState || typeof rawState !== 'object' || !Array.isArray(rawState.profiles) || rawState.profiles.length === 0) {
      const initial = createEmptyProfile('My Profile');
      return {
        version: BACKUP_VERSION,
        activeProfileId: initial.id,
        profiles: [initial]
      };
    }

    const seenIds = new Set();
    const profiles = [];
    const sourceProfiles = rawState.profiles.slice(0, MAX_PROFILES);
    for (let i = 0; i < sourceProfiles.length; i++) {
      const item = sourceProfiles[i];
      if (!item || typeof item !== 'object') continue;
      let id = typeof item.id === 'string' && item.id.trim() ? clampString(item.id.trim(), 64) : generateId();
      if (seenIds.has(id)) {
        id = generateId();
      }
      seenIds.add(id);

      const profileName = typeof item.profileName === 'string' && item.profileName.trim()
        ? clampString(item.profileName.trim(), 60)
        : `Profile ${profiles.length + 1}`;
      const updatedAt = typeof item.updatedAt === 'string' && item.updatedAt
        ? clampString(item.updatedAt, 40)
        : new Date().toISOString();
      const rawData = item.data && typeof item.data === 'object' ? item.data : item;
      profiles.push({
        id,
        profileName,
        updatedAt,
        data: normalizeProfileData(rawData)
      });
    }

    if (profiles.length === 0) {
      const initial = createEmptyProfile('My Profile');
      return {
        version: BACKUP_VERSION,
        activeProfileId: initial.id,
        profiles: [initial]
      };
    }

    const activeExists = profiles.some((p) => p.id === rawState.activeProfileId);
    return {
      version: BACKUP_VERSION,
      activeProfileId: activeExists ? rawState.activeProfileId : profiles[0].id,
      profiles
    };
  }

  function storageGet(key) {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(result ? result[key] : undefined);
        });
      } else if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(key);
          resolve(raw ? JSON.parse(raw) : undefined);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(undefined);
      }
    });
  }

  function storageSet(key, value) {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(value);
        });
      } else if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          resolve(value);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(value);
      }
    });
  }

  async function saveStateInternal(nextState) {
    const normalized = normalizeState(nextState);
    await storageSet(STORAGE_KEY, normalized);
    return normalized;
  }

  async function getState() {
    const raw = await storageGet(STORAGE_KEY);
    if (!raw || !Array.isArray(raw.profiles) || raw.profiles.length === 0) {
      return enqueueWrite(async () => {
        const latest = await storageGet(STORAGE_KEY);
        if (latest && Array.isArray(latest.profiles) && latest.profiles.length > 0) {
          return normalizeState(latest);
        }
        return saveStateInternal(normalizeState(raw));
      });
    }
    return normalizeState(raw);
  }

  async function saveState(nextState) {
    return enqueueWrite(() => saveStateInternal(nextState));
  }

  async function getActiveProfile() {
    const state = await getState();
    return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
  }

  async function setActiveProfile(profileId) {
    return enqueueWrite(async () => {
      const state = normalizeState(await storageGet(STORAGE_KEY));
      const target = state.profiles.find((p) => p.id === profileId);
      if (!target) {
        throw new Error('Selected profile was not found.');
      }
      state.activeProfileId = target.id;
      await saveStateInternal(state);
      return target;
    });
  }

  async function createProfile(profileName, seedData = null) {
    return enqueueWrite(async () => {
      const state = normalizeState(await storageGet(STORAGE_KEY));
      if (state.profiles.length >= MAX_PROFILES) {
        throw new Error(`Maximum limit of ${MAX_PROFILES} profiles reached.`);
      }
      const cleanName = clampString(String(profileName || '').trim(), 60) || `Profile ${state.profiles.length + 1}`;
      const newProfile = createEmptyProfile(cleanName, seedData);
      state.profiles.push(newProfile);
      state.activeProfileId = newProfile.id;
      await saveStateInternal(state);
      return { state, profile: newProfile };
    });
  }

  async function updateProfile(profileId, profileName, data) {
    return enqueueWrite(async () => {
      const state = normalizeState(await storageGet(STORAGE_KEY));
      const idx = state.profiles.findIndex((p) => p.id === profileId);
      if (idx === -1) {
        throw new Error('Profile not found.');
      }
      const existing = state.profiles[idx];
      const cleanName = clampString(
        String(profileName !== undefined ? profileName : existing.profileName).trim(),
        60
      ) || existing.profileName;
      const updated = {
        id: existing.id,
        profileName: cleanName,
        updatedAt: new Date().toISOString(),
        data: normalizeProfileData(data !== undefined ? data : existing.data)
      };
      state.profiles[idx] = updated;
      await saveStateInternal(state);
      return { state, profile: updated };
    });
  }

  async function deleteProfile(profileId) {
    return enqueueWrite(async () => {
      const state = normalizeState(await storageGet(STORAGE_KEY));
      if (state.profiles.length <= 1) {
        // Reset single remaining profile back to blank default rather than leaving zero profiles
        const reset = createEmptyProfile('My Profile');
        const next = {
          version: BACKUP_VERSION,
          activeProfileId: reset.id,
          profiles: [reset]
        };
        await saveStateInternal(next);
        return { state: next, resetOnly: true };
      }

      const filtered = state.profiles.filter((p) => p.id !== profileId);
      if (filtered.length === state.profiles.length) {
        throw new Error('Profile not found.');
      }
      const nextActive = state.activeProfileId === profileId ? filtered[0].id : state.activeProfileId;
      const next = {
        version: BACKUP_VERSION,
        activeProfileId: nextActive,
        profiles: filtered
      };
      await saveStateInternal(next);
      return { state: next, resetOnly: false };
    });
  }

  function countFilledFields(data) {
    const norm = normalizeProfileData(data);
    let count = 0;
    for (const key of Object.keys(DEFAULT_PROFILE_DATA)) {
      if (BOOLEAN_KEYS.has(key)) continue;
      if (key === 'job_experiences') {
        if (norm.exp_applicable && Array.isArray(norm.job_experiences)) {
          for (const job of norm.job_experiences) {
            for (const f of JOB_EXPERIENCE_STRING_KEYS) {
              if (String(job[f] || '').trim() !== '') count += 1;
            }
          }
        }
        continue;
      }
      if (key === 'spouse_name' && norm.marital_status !== 'Married') continue;
      if (key === 'nid_no' && norm.nid_has !== 'Yes') continue;
      if (key === 'breg_no' && norm.breg_has !== 'Yes') continue;
      if (key === 'passport_no' && norm.passport_has !== 'Yes') continue;
      if (key === 'quota_details' && (norm.quota === 'Not Applicable' || !norm.quota)) continue;
      if (key.startsWith('gra_') && !norm.gra_applicable) continue;
      if (key.startsWith('mas_') && !norm.mas_applicable) continue;
      if (key === 'other_computer_proficiency' && norm.other_computer_proficiency === 'Skip') continue;
      if (key.endsWith('_other') && !norm[key]) continue;

      const val = String(norm[key] || '').trim();
      if (val !== '') {
        count++;
      }
    }
    return count;
  }

  function hasMeaningfulData(data) {
    const norm = normalizeProfileData(data);
    for (const key of Object.keys(DEFAULT_PROFILE_DATA)) {
      if (BOOLEAN_KEYS.has(key)) {
        if (norm[key] === true) return true;
        continue;
      }
      if (key === 'job_experiences') {
        if (Array.isArray(norm.job_experiences)) {
          for (const job of norm.job_experiences) {
            if (jobItemHasData(job)) return true;
          }
        }
        continue;
      }
      const val = String(norm[key] || '').trim();
      if (!val) continue;
      if (key === 'other_computer_proficiency' && (val === 'Yes' || val === 'Skip')) continue;
      if (Object.prototype.hasOwnProperty.call(DEFAULT_BASELINE_VALUES, key)) {
        if (val !== DEFAULT_BASELINE_VALUES[key]) return true;
      } else {
        return true;
      }
    }
    return false;
  }

  async function exportBackupJson(passphrase = '') {
    const state = await getState();
    const payload = {
      app: BACKUP_APP_ID,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      activeProfileId: state.activeProfileId,
      profiles: state.profiles
    };
    const jsonText = JSON.stringify(payload, null, 2);
    const pass = String(passphrase || '');
    if (pass.length > 0) {
      const encryptedEnvelope = await encryptTextAesGcm(jsonText, pass);
      return JSON.stringify(encryptedEnvelope, null, 2);
    }
    return jsonText;
  }

  function getUtf8ByteSize(str) {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str).length;
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.byteLength(str, 'utf8');
    }
    return str.length * 2;
  }

  async function importBackupJson(jsonString, mode = 'replace', passphrase = '') {
    const rawStr = String(jsonString || '');
    if (getUtf8ByteSize(rawStr) > MAX_BACKUP_BYTES) {
      throw new Error('Backup file is too large (max 2 MB allowed).');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawStr);
    } catch (_err) {
      throw new Error('Invalid JSON file. Please choose a valid Teletalk Jobs Filler backup (.json) file.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Backup file format is invalid.');
    }

    if (parsed.encrypted === true && typeof parsed.ciphertext === 'string') {
      const pass = String(passphrase || '');
      if (!pass) {
        const err = new Error('This backup is password-protected. Please enter the decryption password.');
        err.code = 'PASSWORD_REQUIRED';
        throw err;
      }
      const decryptedJson = await decryptTextAesGcm(parsed, pass);
      try {
        parsed = JSON.parse(decryptedJson);
      } catch (_err) {
        throw new Error('Decrypted backup payload is not valid JSON.');
      }
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Decrypted backup format is invalid.');
      }
    }

    let importedProfiles = [];
    let importedActiveId = null;

    if (Array.isArray(parsed.profiles)) {
      if (parsed.profiles.length === 0) {
        throw new Error('Backup file contains no profiles.');
      }
      importedProfiles = parsed.profiles
        .filter((p) => p && typeof p === 'object')
        .slice(0, MAX_PROFILES)
        .map((p, idx) => ({
          id: typeof p.id === 'string' && p.id.trim() ? clampString(p.id.trim(), 64) : generateId(),
          profileName: typeof p.profileName === 'string' && p.profileName.trim()
            ? clampString(p.profileName.trim(), 60)
            : `Imported Profile ${idx + 1}`,
          updatedAt: typeof p.updatedAt === 'string' && p.updatedAt ? clampString(p.updatedAt, 40) : new Date().toISOString(),
          data: normalizeProfileData(p.data && typeof p.data === 'object' ? p.data : p)
        }));
      importedActiveId = typeof parsed.activeProfileId === 'string' ? clampString(parsed.activeProfileId, 64) : null;
    } else if (Array.isArray(parsed)) {
      importedProfiles = parsed
        .filter((p) => p && typeof p === 'object')
        .slice(0, MAX_PROFILES)
        .map((p, idx) => ({
          id: typeof p.id === 'string' && p.id.trim() ? clampString(p.id.trim(), 64) : generateId(),
          profileName: typeof p.profileName === 'string' && p.profileName.trim()
            ? clampString(p.profileName.trim(), 60)
            : `Imported Profile ${idx + 1}`,
          updatedAt: new Date().toISOString(),
          data: normalizeProfileData(p.data && typeof p.data === 'object' ? p.data : p)
        }));
    } else if (parsed.data && typeof parsed.data === 'object') {
      importedProfiles = [createEmptyProfile(parsed.profileName || 'Imported Profile', parsed.data)];
    } else {
      const hasRecognizedKey = Object.keys(DEFAULT_PROFILE_DATA).some((k) => Object.prototype.hasOwnProperty.call(parsed, k));
      if (!hasRecognizedKey) {
        throw new Error('This JSON file does not match the Teletalk Jobs Filler backup format.');
      }
      importedProfiles = [createEmptyProfile(parsed.profileName || 'Imported Profile', parsed)];
      mode = 'append';
    }

    if (importedProfiles.length === 0) {
      throw new Error('No valid profiles found in the backup file.');
    }

    return enqueueWrite(async () => {
      if (mode === 'append') {
        const current = normalizeState(await storageGet(STORAGE_KEY));
        const existingIds = new Set(current.profiles.map((p) => p.id));
        const slotsLeft = Math.max(0, MAX_PROFILES - current.profiles.length);
        const toAppend = importedProfiles.slice(0, slotsLeft);
        if (toAppend.length === 0) {
          throw new Error(`Cannot merge: maximum limit of ${MAX_PROFILES} profiles is already saved.`);
        }
        for (const prof of toAppend) {
          if (existingIds.has(prof.id)) {
            prof.id = generateId();
          }
          existingIds.add(prof.id);
          current.profiles.push(prof);
        }
        current.activeProfileId = toAppend[0].id;
        const saved = await saveStateInternal(current);
        return { state: saved, importedCount: toAppend.length };
      }

      const saved = await saveStateInternal({
        version: BACKUP_VERSION,
        activeProfileId: importedActiveId || importedProfiles[0].id,
        profiles: importedProfiles
      });
      return { state: saved, importedCount: importedProfiles.length };
    });
  }

  const TJFStorage = {
    STORAGE_KEY,
    MAX_BACKUP_BYTES,
    MAX_PROFILES,
    MAX_JOBS_PER_PROFILE,
    DEFAULT_PROFILE_DATA,
    DEFAULT_JOB_EXPERIENCE_ITEM,
    formatLocalDateIso,
    isEncryptedBackupJson,
    normalizeJobExperienceItem,
    normalizeProfileData,
    createEmptyProfile,
    getState,
    saveState,
    getActiveProfile,
    setActiveProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    countFilledFields,
    hasMeaningfulData,
    exportBackupJson,
    importBackupJson
  };

  if (typeof window !== 'undefined') {
    window.TJFStorage = TJFStorage;
  }
  if (typeof globalScope !== 'undefined') {
    globalScope.TJFStorage = TJFStorage;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TJFStorage;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
