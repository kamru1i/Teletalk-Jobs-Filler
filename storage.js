(function (globalScope) {
  'use strict';

  const STORAGE_KEY = 'tjf_state';
  const BACKUP_APP_ID = 'Teletalk Jobs Filler';
  const BACKUP_VERSION = 1;

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
    mas_duration: ''
  };

  const BOOLEAN_KEYS = new Set([
    'same_as_present',
    'gra_applicable',
    'mas_applicable'
  ]);

  const DEFAULT_BASELINE_VALUES = {
    nationality: 'Bangladeshi',
    nid_has: 'No',
    breg_has: 'No',
    passport_has: 'No',
    quota: 'Not Applicable',
    dep_status: 'Not Applicable'
  };

  function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return 'prof_' + crypto.randomUUID();
    }
    return 'prof_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function normalizeProfileData(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const normalized = {};
    for (const key of Object.keys(DEFAULT_PROFILE_DATA)) {
      const defVal = DEFAULT_PROFILE_DATA[key];
      const rawVal = source[key];
      if (BOOLEAN_KEYS.has(key)) {
        normalized[key] = rawVal === true || rawVal === 'true' || rawVal === 1 || rawVal === '1';
      } else if (rawVal === undefined || rawVal === null) {
        normalized[key] = defVal;
      } else {
        normalized[key] = String(rawVal);
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
      profileName: String(profileName || 'My Profile').trim() || 'My Profile',
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
    for (let i = 0; i < rawState.profiles.length; i++) {
      const item = rawState.profiles[i];
      if (!item || typeof item !== 'object') continue;
      let id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : generateId();
      if (seenIds.has(id)) {
        id = generateId();
      }
      seenIds.add(id);

      const profileName = typeof item.profileName === 'string' && item.profileName.trim()
        ? item.profileName.trim()
        : `Profile ${profiles.length + 1}`;
      const updatedAt = typeof item.updatedAt === 'string' && item.updatedAt
        ? item.updatedAt
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

  async function getState() {
    const raw = await storageGet(STORAGE_KEY);
    const state = normalizeState(raw);
    if (!raw || !Array.isArray(raw.profiles) || raw.profiles.length === 0) {
      await storageSet(STORAGE_KEY, state);
    }
    return state;
  }

  async function saveState(nextState) {
    const normalized = normalizeState(nextState);
    await storageSet(STORAGE_KEY, normalized);
    return normalized;
  }

  async function getActiveProfile() {
    const state = await getState();
    return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
  }

  async function setActiveProfile(profileId) {
    const state = await getState();
    const target = state.profiles.find((p) => p.id === profileId);
    if (!target) {
      throw new Error('Selected profile was not found.');
    }
    state.activeProfileId = target.id;
    await saveState(state);
    return target;
  }

  async function createProfile(profileName, seedData = null) {
    const state = await getState();
    const cleanName = String(profileName || '').trim() || `Profile ${state.profiles.length + 1}`;
    const newProfile = createEmptyProfile(cleanName, seedData);
    state.profiles.push(newProfile);
    state.activeProfileId = newProfile.id;
    await saveState(state);
    return { state, profile: newProfile };
  }

  async function updateProfile(profileId, profileName, data) {
    const state = await getState();
    const idx = state.profiles.findIndex((p) => p.id === profileId);
    if (idx === -1) {
      throw new Error('Profile not found.');
    }
    const existing = state.profiles[idx];
    const cleanName = String(profileName !== undefined ? profileName : existing.profileName).trim() || existing.profileName;
    const updated = {
      id: existing.id,
      profileName: cleanName,
      updatedAt: new Date().toISOString(),
      data: normalizeProfileData(data !== undefined ? data : existing.data)
    };
    state.profiles[idx] = updated;
    await saveState(state);
    return { state, profile: updated };
  }

  async function deleteProfile(profileId) {
    const state = await getState();
    if (state.profiles.length <= 1) {
      // Reset single remaining profile back to blank default rather than leaving zero profiles
      const reset = createEmptyProfile('My Profile');
      const next = {
        version: BACKUP_VERSION,
        activeProfileId: reset.id,
        profiles: [reset]
      };
      await saveState(next);
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
    await saveState(next);
    return { state: next, resetOnly: false };
  }

  function countFilledFields(data) {
    const norm = normalizeProfileData(data);
    let count = 0;
    for (const key of Object.keys(DEFAULT_PROFILE_DATA)) {
      if (BOOLEAN_KEYS.has(key)) continue;
      if (key === 'spouse_name' && norm.marital_status !== 'Married') continue;
      if (key === 'nid_no' && norm.nid_has !== 'Yes') continue;
      if (key === 'breg_no' && norm.breg_has !== 'Yes') continue;
      if (key === 'passport_no' && norm.passport_has !== 'Yes') continue;
      if (key === 'quota_details' && (norm.quota === 'Not Applicable' || !norm.quota)) continue;
      if (key.startsWith('gra_') && !norm.gra_applicable) continue;
      if (key.startsWith('mas_') && !norm.mas_applicable) continue;
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
      const val = String(norm[key] || '').trim();
      if (!val) continue;
      if (Object.prototype.hasOwnProperty.call(DEFAULT_BASELINE_VALUES, key)) {
        if (val !== DEFAULT_BASELINE_VALUES[key]) return true;
      } else {
        return true;
      }
    }
    return false;
  }

  async function exportBackupJson() {
    const state = await getState();
    const payload = {
      app: BACKUP_APP_ID,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      activeProfileId: state.activeProfileId,
      profiles: state.profiles
    };
    return JSON.stringify(payload, null, 2);
  }

  async function importBackupJson(jsonString, mode = 'replace') {
    let parsed;
    try {
      parsed = JSON.parse(String(jsonString || ''));
    } catch (_err) {
      throw new Error('Invalid JSON file. Please choose a valid Teletalk Jobs Filler backup (.json) file.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Backup file format is invalid.');
    }

    let importedProfiles = [];
    let importedActiveId = null;

    if (Array.isArray(parsed.profiles)) {
      if (parsed.profiles.length === 0) {
        throw new Error('Backup file contains no profiles.');
      }
      importedProfiles = parsed.profiles
        .filter((p) => p && typeof p === 'object')
        .map((p, idx) => ({
          id: typeof p.id === 'string' && p.id.trim() ? p.id.trim() : generateId(),
          profileName: typeof p.profileName === 'string' && p.profileName.trim()
            ? p.profileName.trim()
            : `Imported Profile ${idx + 1}`,
          updatedAt: typeof p.updatedAt === 'string' && p.updatedAt ? p.updatedAt : new Date().toISOString(),
          data: normalizeProfileData(p.data && typeof p.data === 'object' ? p.data : p)
        }));
      importedActiveId = typeof parsed.activeProfileId === 'string' ? parsed.activeProfileId : null;
    } else if (Array.isArray(parsed)) {
      importedProfiles = parsed
        .filter((p) => p && typeof p === 'object')
        .map((p, idx) => ({
          id: typeof p.id === 'string' && p.id.trim() ? p.id.trim() : generateId(),
          profileName: typeof p.profileName === 'string' && p.profileName.trim()
            ? p.profileName.trim()
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

    if (mode === 'append') {
      const current = await getState();
      const existingIds = new Set(current.profiles.map((p) => p.id));
      for (const prof of importedProfiles) {
        if (existingIds.has(prof.id)) {
          prof.id = generateId();
        }
        existingIds.add(prof.id);
        current.profiles.push(prof);
      }
      current.activeProfileId = importedProfiles[0].id;
      const saved = await saveState(current);
      return { state: saved, importedCount: importedProfiles.length };
    }

    const saved = await saveState({
      version: BACKUP_VERSION,
      activeProfileId: importedActiveId || importedProfiles[0].id,
      profiles: importedProfiles
    });
    return { state: saved, importedCount: importedProfiles.length };
  }

  const TJFStorage = {
    STORAGE_KEY,
    DEFAULT_PROFILE_DATA,
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
