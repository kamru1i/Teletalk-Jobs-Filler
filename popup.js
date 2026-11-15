(function () {
  'use strict';

  const els = {
    siteBadge: document.getElementById('siteBadge'),
    profileSwitcher: document.getElementById('profileSwitcher'),
    fieldCountBadge: document.getElementById('fieldCountBadge'),
    profileSummary: document.getElementById('profileSummary'),
    statusBanner: document.getElementById('statusBanner'),
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

  function showStatus(message, type = 'info') {
    els.statusBanner.textContent = message;
    els.statusBanner.className = `status-banner ${type}`;
  }

  function hideStatus() {
    els.statusBanner.className = 'status-banner hidden';
    els.statusBanner.textContent = '';
  }

  function isTeletalkUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'teletalk.com.bd' || parsed.hostname.endsWith('.teletalk.com.bd');
    } catch (_err) {
      return false;
    }
  }

  function isRestrictedUrl(url) {
    if (!url) return true;
    return (
      url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url.startsWith('view-source:') ||
      url.includes('chromewebstore.google.com')
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

      if (isTeletalkUrl(tab.url)) {
        els.siteBadge.textContent = 'Teletalk Ready';
        els.siteBadge.className = 'site-badge badge-teletalk';
      } else if (isRestrictedUrl(tab.url)) {
        els.siteBadge.textContent = 'Browser Page';
        els.siteBadge.className = 'site-badge badge-warn';
      } else {
        els.siteBadge.textContent = 'Form Ready';
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
    els.profileSwitcher.innerHTML = '';

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

    els.profileSummary.innerHTML = '';
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

    els.btnAutofill.disabled = true;
    els.btnAutofill.querySelector('span:last-child').textContent = 'Filling Form...';

    try {
      let response = null;
      try {
        // Always re-inject latest filler engine first so already-open tabs never stay stuck on stale scripts
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['filler.js']
        });
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
      } catch (_execErr) {
        response = await sendAutofillMessage(tab.id, active);
      }

      if (!response) {
        response = await sendAutofillMessage(tab.id, active);
      }

      if (response && response.ok) {
        const filled = response.filledCount || 0;
        const warnings = response.warningCount || 0;
        const missingJob = Boolean(response.missingJobProfileData);
        if (filled === 0) {
          showStatus('No matching application fields were found on this page. Make sure the application form is open.', 'warn');
        } else if (missingJob) {
          showStatus(
            `Autofilled ${filled} fields, but Job Experiences "If Applicable" is checked with no job data in "${active.profileName}". Open Edit / Manage Saved Data to add it.`,
            'warn'
          );
        } else {
          const reviewNote = warnings > 0 ? ` • ${warnings} field(s) highlighted in yellow to review.` : '. Please review & enter Captcha.';
          showStatus(`Autofilled ${filled} fields using "${active.profileName}"${reviewNote}`, 'success');
        }
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
      const jsonText = await window.TJFStorage.exportBackupJson();
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);

      const link = document.createElement('a');
      link.href = url;
      link.download = `teletalk-jobs-filler-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showStatus('Backup JSON downloaded! Keep it safe to transfer across devices.', 'success');
    } catch (err) {
      showStatus(`Export failed: ${err.message}`, 'error');
    }
  }

  async function processImportedFile(file) {
    if (!file) return;
    hideStatus();
    try {
      const text = await file.text();
      const result = await window.TJFStorage.importBackupJson(text, 'replace');
      renderProfileList(result.state);
      els.importDrawer.classList.add('hidden');
      showStatus(`Successfully restored ${result.importedCount} profile(s) from backup!`, 'success');
    } catch (err) {
      showStatus(err.message || 'Failed to import backup file.', 'error');
    }
  }

  function wireEvents() {
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
