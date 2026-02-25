/**
 * Shared utilities
 */
function getToday() {
  var d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatToken(tokenNum) {
  return 'A' + String(tokenNum).padStart(2, '0');
}

function estimatedWaitMinutes(yourToken, currentToken, minutesPerPatient) {
  minutesPerPatient = minutesPerPatient || 10;
  if (currentToken >= yourToken) return 0;
  return (yourToken - currentToken) * minutesPerPatient;
}

function showToast(message, type) {
  type = type || 'info';
  var toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 text-white text-sm font-medium transition-opacity ' +
    (type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-[#1977cc]');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = '0';
    setTimeout(function () { toast.remove(); }, 300);
  }, 3000);
}

function showLoading(container) {
  var el = document.createElement('div');
  el.className = 'flex justify-center items-center py-12';
  el.innerHTML = '<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1977cc]"></div>';
  el.dataset.loading = 'true';
  container.appendChild(el);
  return el;
}

function hideLoading(container) {
  var el = container ? container.querySelector('[data-loading="true"]') : null;
  if (el) el.remove();
}

function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
