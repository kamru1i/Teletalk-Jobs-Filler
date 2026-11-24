(function () {
  'use strict';

  const els = {
    siteBadge: document.getElementById('siteBadge'),
    profileSwitcher: document.getElementById('profileSwitcher'),
    fieldCountBadge: document.getElementById('fieldCountBadge'),
    profileSummary: document.getElementById('profileSummary'),
    statusBanner: document.getElementById('statusBanner'),
    actionPrompt: document.getElementById('actionPrompt'),
    promptTitle: document.getElementById('promptTitle'),
    promptDesc: document.getElementById('promptDesc'),
    promptInput: document.getElementById('promptInput'),
    btnPromptPrimary: document.getElementById('btnPromptPrimary'),
    btnPromptSecondary: document.getElementById('btnPromptSecondary'),
    btnPromptCancel: document.getElementById('btnPromptCancel'),
    btnAutofill: document.getElementById('btnAutofill'),
    btnOpenOptions: document.getElementById('btnOpenOptions'),
    btnExport: document.getElementById('btnExport'),
    btnImport: document.getElementById('btnImport'),
    importDrawer: document.getElementById('importDrawer'),
    dropZone: document.getElementById('dropZone'),
    btnBrowseInTab: document.getElementById('btnBrowseInTab'),
    btnCloseImport: document.getElementById('btnCloseImport')
  };

  let currentState = null;
  let promptResolve = null;

  function showStatus(message, type = 'info') {
    els.statusBanner.textContent = message;
    els.statusBanner.className = `status-banner ${type}`;
  }

  function hideStatus() {
    els.statusBanner.className = 'status-banner hidden';
    els.statusBanner.textContent = '';
  }

  function closeActionPrompt(choice = 'cancel') {
    const password = els.promptInput ? els.promptInput.value : '';
    if (els.promptInput) {
      els.promptInput.value = '';
      els.promptInput.classList.add('hidden');
    }
    if (els.actionPrompt) {
      els.actionPrompt.classList.add('hidden');
    }
    if (promptResolve) {
      const resolveFn = promptResolve;
      promptResolve = null;
      resolveFn({ choice, password });
    }
  }

  function openActionPrompt({
    title,
    desc,
    showPassword = false,
    passwordPlaceholder = 'Optional encryption password...',
    primaryLabel = 'Confirm',
    secondaryLabel = '',
    cancelLabel = 'Cancel'
  }) {
    if (promptResolve) {
      closeActionPrompt('cancel');
    }
    return new Promise((resolve) => {
      promptResolve = resolve;
      els.promptTitle.textContent = title || '';
      els.promptDesc.textContent = desc || '';
      els.btnPromptPrimary.textContent = primaryLabel;

      if (secondaryLabel) {
        els.btnPromptSecondary.textContent = secondaryLabel;
        els.btnPromptSecondary.classList.remove('hidden');
      } else {
        els.btnPromptSecondary.classList.add('hidden');
      }

      els.btnPromptCancel.textContent = cancelLabel || 'Cancel';

      if (showPassword) {
        els.promptInput.value = '';
        els.promptInput.placeholder = passwordPlaceholder;
        els.promptInput.classList.remove('hidden');
      } else {
        els.promptInput.value = '';
        els.promptInput.classList.add('hidden');
      }

      els.actionPrompt.classList.remove('hidden');
      if (showPassword) {
        els.promptInput.focus();
      } else {
        els.btnPromptCancel.focus();
      }
    });
  }

  function parseTabUrl(url) {
    if (!url) return null;
    try {
      return new URL(url);
    } catch (_err) {
      return null;
    }
  }

  function isTeletalkUrl(url) {
    const parsed = parseTabUrl(url);
    if (!parsed) return false;
    return parsed.hostname === 'teletalk.com.bd' || parsed.hostname.endsWith('.teletalk.com.bd');
  }

  function isRestrictedUrl(url) {
    if (!url) return true;
    const lower = url.toLowerCase();
    return (
      lower.startsWith('chrome://') ||
      lower.startsWith('chrome-extension://') ||
      lower.startsWith('edge://') ||
      lower.startsWith('brave://') ||
      lower.startsWith('opera://') ||
      lower.startsWith('vivaldi://') ||
      lower.startsWith('devtools://') ||
      lower.startsWith('about:') ||
      lower.startsWith('view-source:') ||
      lower.includes('chromewebstore.google.com') ||
      lower.includes('chrome.google.com/webstore') ||
      lower.includes('microsoftedge.microsoft.com/addons')
    );
  }

  async function detectActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs && tabs[0];
      if (!tab || !tab.url) {
        els.siteBadge.textContent = 'No Tab';
        els.siteBadge.className = 'site-badge badge-neutral';
        return null;
      }

      const parsed = parseTabUrl(tab.url);
      if (isTeletalkUrl(tab.url)) {
        if (parsed && parsed.protocol === 'http:') {
          els.siteBadge.textContent = 'Teletalk (HTTP ⚠️)';
          els.siteBadge.className = 'site-badge badge-http';
          els.siteBadge.title = 'Connected over unencrypted HTTP';
        } else {
          els.siteBadge.textContent = 'Teletalk Ready';
          els.siteBadge.className = 'site-badge badge-teletalk';
          els.siteBadge.title = 'Official Teletalk domain';
        }
      } else if (isRestrictedUrl(tab.url)) {
        els.siteBadge.textContent = 'Browser Page';
        els.siteBadge.className = 'site-badge badge-warn';
      } else {
        els.siteBadge.textContent = 'Non-Teletalk';
        els.siteBadge.className = 'site-badge badge-neutral';
      }
      return tab;
    } catch (_err) {
      els.siteBadge.textContent = 'Ready';
      els.siteBadge.className = 'site-badge badge-neutral';
      return null;
    }
  }

  function renderProfileList(state) {
    currentState = state;
    els.profileSwitcher.replaceChildren();

    for (const profile of state.profiles) {
      const opt = document.createElement('option');
      opt.value = profile.id;
      opt.textContent = profile.profileName;
      if (profile.id === state.activeProfileId) {
        opt.selected = true;
      }
      els.profileSwitcher.appendChild(opt);
    }

    const active = state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
    const count = window.TJFStorage.countFilledFields(active.data);
    els.fieldCountBadge.textContent = `${count} field${count === 1 ? '' : 's'} saved`;

    els.profileSummary.replaceChildren();
    if (!window.TJFStorage.hasMeaningfulData(active.data)) {
      const span = document.createElement('span');
      span.className = 'summary-muted';
      span.textContent = 'No applicant details saved yet. Click "Edit / Manage Saved Data" below.';
      els.profileSummary.appendChild(span);
      return;
    }

    const nameEl = document.createElement('div');
    nameEl.className = 'summary-name';
    nameEl.textContent = active.data.name || '(Name not set)';

    const metaParts = [];
    if (active.data.mobile) metaParts.push(active.data.mobile);
    if (active.data.present_district) metaParts.push(active.data.present_district);
    if (active.data.ssc_year) metaParts.push(`SSC ${active.data.ssc_year}`);
    if (active.data.exp_applicable) metaParts.push('Job Exp ✓');
    if (active.data.other_computer_proficiency === 'Yes') metaParts.push('Computer: Yes');

    const metaEl = document.createElement('div');
    metaEl.className = 'summary-meta';
    metaEl.textContent = metaParts.length > 0 ? metaParts.join(' • ') : 'Click Edit to review details';

    els.profileSummary.appendChild(nameEl);
    els.profileSummary.appendChild(metaEl);
  }

  async function sendAutofillMessage(tabId, profile) {
    return chrome.tabs.sendMessage(tabId, {
      action: 'TJF_AUTOFILL',
      profile: profile.data,
      profileName: profile.profileName
    });
  }

  async function handleAutofill() {
    hideStatus();
    if (window.TJFStorage && typeof window.TJFStorage.getState === 'function') {
      currentState = await window.TJFStorage.getState();
      renderProfileList(currentState);
    }
    if (!currentState) return;

    const active = currentState.profiles.find((p) => p.id === currentState.activeProfileId) || currentState.profiles[0];
    if (!window.TJFStorage.hasMeaningfulData(active.data)) {
      showStatus('This profile has no saved data yet. Click "Edit / Manage Saved Data" to enter your info first.', 'warn');
      return;
    }

    const tab = await detectActiveTab();
    if (!tab || !tab.id) {
      showStatus('Could not detect the active browser tab.', 'error');
      return;
    }

    if (isRestrictedUrl(tab.url)) {
      showStatus('Please open a Teletalk job application page (*.teletalk.com.bd) before clicking Auto Fill.', 'warn');
      return;
    }

    const parsedTab = parseTabUrl(tab.url);
    const onTeletalk = isTeletalkUrl(tab.url);
    if (!onTeletalk) {
      const hostLabel =
        (parsedTab && parsedTab.hostname) ||
        (tab.url.startsWith('file://') ? 'local HTML file' : 'this external page');
      const confirmRes = await openActionPrompt({
        title: '⚠️ Non-Teletalk Site Detected',
        desc: `This page (${hostLabel}) is NOT *.teletalk.com.bd. Autofilling writes your personal info (NID, DOB, Mobile, Address) to this page. Continue?`,
        showPassword: false,
        primaryLabel: 'Fill Anyway',
        cancelLabel: 'Cancel'
      });
      if (confirmRes.choice !== 'primary') {
        showStatus('Autofill cancelled — open a *.teletalk.com.bd application page to fill safely.', 'info');
        return;
      }
    }

    els.btnAutofill.disabled = true;
    els.btnAutofill.querySelector('span:last-child').textContent = 'Filling Form...';

    try {
      const expectedVersion =
        chrome.runtime && typeof chrome.runtime.getManifest === 'function'
          ? chrome.runtime.getManifest().version
          : '1.2.0';

      let response = null;
      let invokedViaExecuteScript = false;

      try {
        // Inject filler.js on demand only if missing or outdated on this tab
        const verCheck = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (ver) => Boolean(window.__TJF_ENGINE__ && window.__TJF_ENGINE__.version === ver),
          args: [expectedVersion]
        });
        const isCurrentLoaded = Boolean(verCheck && verCheck[0] && verCheck[0].result);
        if (!isCurrentLoaded) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['filler.js']
          });
        }

        const execResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (profileData, profileName) => {
            if (window.__TJF_ENGINE__ && typeof window.__TJF_ENGINE__.autofillForm === 'function') {
              return window.__TJF_ENGINE__.autofillForm(profileData, profileName);
            }
            return null;
          },
          args: [active.data, active.profileName]
        });
        response = execResults && execResults[0] ? execResults[0].result : null;
        if (response !== null && response !== undefined) {
          invokedViaExecuteScript = true;
        }
      } catch (_execErr) {
        if (invokedViaExecuteScript) {
          throw _execErr;
        }
      }

      if (!invokedViaExecuteScript) {
        response = await sendAutofillMessage(tab.id, active);
      }

      const httpNote = onTeletalk && parsedTab && parsedTab.protocol === 'http:'
        ? ' ⚠️ (Unsecured HTTP connection)'
        : '';

      if (response && response.ok) {
        const filled = response.filledCount || 0;
        const warnings = response.warningCount || 0;
        const missingJob = Boolean(response.missingJobProfileData);
        if (filled === 0) {
          showStatus('No matching application fields were found on this page. Make sure the application form is open.', 'warn');
        } else if (missingJob) {
          showStatus(
            `Autofilled ${filled} fields, but Job Experiences "If Applicable" is checked with no job data in "${active.profileName}". Open Edit / Manage Saved Data to add it.${httpNote}`,
            'warn'
          );
        } else {
          const reviewNote = warnings > 0 ? ` • ${warnings} field(s) highlighted in yellow to review.` : '. Please review & enter Captcha.';
          showStatus(`Autofilled ${filled} fields using "${active.profileName}"${reviewNote}${httpNote}`, 'success');
        }
      } else if (response && response.busy) {
        showStatus('Autofill is already running on this tab — please wait a moment.', 'info');
      } else {
        showStatus((response && response.error) || 'Could not autofill this page. Open the Teletalk application form first.', 'warn');
      }
    } catch (err) {
      const msg = err && err.message ? err.message : '';
      if (tab.url && tab.url.startsWith('file://')) {
        showStatus('To test on local HTML files, enable "Allow access to file URLs" in chrome://extensions details.', 'warn');
      } else {
        showStatus(`Could not connect to page (${msg || 'reload the Teletalk tab and try again'}).`, 'error');
      }
    } finally {
      els.btnAutofill.disabled = false;
      els.btnAutofill.querySelector('span:last-child').textContent = 'Auto Fill Current Form';
    }
  }

  function openOptions(extraQuery = '') {
    const url = chrome.runtime.getURL('options.html' + extraQuery);
    chrome.tabs.create({ url });
  }

  async function handleExport() {
    hideStatus();
    try {
      const promptRes = await openActionPrompt({
        title: '📤 Export Backup (JSON)',
        desc: 'Protect sensitive NID/Passport info with a password (AES-256 encrypted), or export plain JSON.',
        showPassword: true,
        passwordPlaceholder: 'Enter password to encrypt...',
        primaryLabel: '🔒 Encrypted',
        secondaryLabel: '📄 Plain JSON',
        cancelLabel: 'Cancel'
      });

      if (promptRes.choice === 'cancel') return;
      if (promptRes.choice === 'primary' && !promptRes.password) {
        showStatus('Please type a password to encrypt, or click "Plain JSON".', 'warn');
        return;
      }

      const passphrase = promptRes.choice === 'primary' ? promptRes.password : '';
      const jsonText = await window.TJFStorage.exportBackupJson(passphrase);
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = window.TJFStorage.formatLocalDateIso();
      const suffix = passphrase ? '-encrypted' : '';

      const link = document.createElement('a');
      link.href = url;
      link.download = `teletalk-jobs-filler-backup-${dateStr}${suffix}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showStatus(
        passphrase
          ? 'Encrypted backup JSON downloaded! Remember your password to restore.'
          : 'Backup JSON downloaded! Keep this file private & secure.',
        'success'
      );
    } catch (err) {
      showStatus(`Export failed: ${err.message}`, 'error');
    }
  }

  async function processImportedFile(file) {
    if (!file) return;
    hideStatus();
    if (file.size > window.TJFStorage.MAX_BACKUP_BYTES) {
      showStatus('Backup file is too large (max 2 MB allowed).', 'error');
      return;
    }

    try {
      const text = await file.text();
      const isEncrypted = window.TJFStorage.isEncryptedBackupJson(text);
      const latestState = await window.TJFStorage.getState();
      const hasExisting = latestState.profiles.some((p) => window.TJFStorage.hasMeaningfulData(p.data));

      let mode = 'replace';
      let passphrase = '';

      if (isEncrypted || hasExisting) {
        const promptRes = await openActionPrompt({
          title: isEncrypted ? '🔒 Encrypted Backup Detected' : '📥 Confirm Backup Restore',
          desc: hasExisting
            ? 'You already have saved profiles. Choose "Merge" to keep them or "Replace All" to overwrite.'
            : 'Enter the password used when exporting this encrypted backup.',
          showPassword: isEncrypted,
          passwordPlaceholder: 'Decryption password...',
          primaryLabel: hasExisting ? 'Merge (Keep)' : '🔓 Import',
          secondaryLabel: hasExisting ? 'Replace All' : '',
          cancelLabel: 'Cancel'
        });

        if (promptRes.choice === 'cancel') return;
        mode = hasExisting && promptRes.choice === 'primary' ? 'append' : 'replace';
        passphrase = promptRes.password;
      }

      const result = await window.TJFStorage.importBackupJson(text, mode, passphrase);
      renderProfileList(result.state);
      els.importDrawer.classList.add('hidden');
      showStatus(
        mode === 'append'
          ? `Merged ${result.importedCount} profile(s) into your existing profiles!`
          : `Successfully restored ${result.importedCount} profile(s) from backup!`,
        'success'
      );
    } catch (err) {
      showStatus(err.message || 'Failed to import backup file.', 'error');
    }
  }

  function wireEvents() {
    els.btnPromptPrimary.addEventListener('click', () => closeActionPrompt('primary'));
    els.btnPromptSecondary.addEventListener('click', () => closeActionPrompt('secondary'));
    els.btnPromptCancel.addEventListener('click', () => closeActionPrompt('cancel'));
    els.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        closeActionPrompt('primary');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeActionPrompt('cancel');
      }
    });
    els.profileSwitcher.addEventListener('change', async () => {
      hideStatus();
      try {
        await window.TJFStorage.setActiveProfile(els.profileSwitcher.value);
        const state = await window.TJFStorage.getState();
        renderProfileList(state);
      } catch (err) {
        showStatus(`Could not switch profile: ${err.message}`, 'error');
      }
    });

    els.btnAutofill.addEventListener('click', handleAutofill);
    els.btnOpenOptions.addEventListener('click', () => openOptions(''));
    els.btnExport.addEventListener('click', handleExport);

    els.btnImport.addEventListener('click', () => {
      els.importDrawer.classList.toggle('hidden');
    });

    els.btnCloseImport.addEventListener('click', () => {
      els.importDrawer.classList.add('hidden');
    });

    els.btnBrowseInTab.addEventListener('click', () => {
      openOptions('?action=import');
    });

    els.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.dropZone.classList.add('drag-over');
    });

    els.dropZone.addEventListener('dragleave', () => {
      els.dropZone.classList.remove('drag-over');
    });

    els.dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      els.dropZone.classList.remove('drag-over');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        await processImportedFile(file);
      }
    });
  }

  async function init() {
    wireEvents();
    await detectActiveTab();
    try {
      const state = await window.TJFStorage.getState();
      renderProfileList(state);
    } catch (err) {
      showStatus(`Failed to load saved profiles: ${err.message}`, 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
