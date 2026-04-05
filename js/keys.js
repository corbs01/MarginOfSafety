// ── API Key Management ────────────────────────────────────────────────────────
// Handles FMP key storage in localStorage and exposes window.getFMPKey()
// for use by the React app and all fetch helpers.

(function () {
  const fmpInput = document.getElementById('fmp-key-input');
  const keyStatus = document.getElementById('api-key-status');
  const keySave   = document.getElementById('api-key-save');

  function loadKeys() {
    const stored = localStorage.getItem('fmp_api_key');
    if (stored) {
      fmpInput.value       = stored;
      keyStatus.textContent = 'Key loaded ✓';
      keyStatus.className   = 'ok';
    }
  }

  keySave.addEventListener('click', function () {
    const f = fmpInput.value.trim();
    if (f) {
      localStorage.setItem('fmp_api_key', f);
      keyStatus.textContent = 'Saved ✓';
      keyStatus.className   = 'ok';
    } else {
      keyStatus.textContent = 'Enter your FMP key';
      keyStatus.className   = '';
    }
  });

  window.getFMPKey = function () {
    return localStorage.getItem('fmp_api_key') || fmpInput.value.trim();
  };

  loadKeys();
})();
