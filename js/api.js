/**
 * API module - fetch wrappers for JSON Server
 * Load js/api-config.js before this file to set window.API_BASE, or it auto-detects.
 */
(function resolveApiBase() {
  if (typeof window.API_BASE === 'string' && window.API_BASE.length > 0) return;
  var h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '' || h === '[::1]') {
    window.API_BASE = 'http://localhost:3000';
  } else {
    window.API_BASE = 'http://' + h + ':3000';
  }
})();
var API_BASE = window.API_BASE;

async function request(path, options) {
  options = options || {};
  var url = path.indexOf('http') === 0 ? path : API_BASE + path;
  var res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(res.statusText || 'Request failed');
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function ensureString(val) {
  return val == null ? '' : String(val);
}

const api = {
  getUsers: () => request('/users'),
  createUser: (body) => request('/users', { method: 'POST', body: JSON.stringify(body) }),
  getDoctors: () => request('/doctors'),
  getDoctor: (id) => request('/doctors/' + encodeURIComponent(ensureString(id))),
  updateDoctor: (id, body) => request('/doctors/' + encodeURIComponent(ensureString(id)), { method: 'PATCH', body: JSON.stringify(body) }),
  getAppointments: (params) => {
    var q = new URLSearchParams();
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] != null && params[k] !== '') q.set(k, ensureString(params[k]));
    });
    var query = q.toString();
    var path = '/appointments' + (query ? '?' + query : '');
    var fullUrl = API_BASE + path;
    if (typeof console !== 'undefined' && console.log) console.log('GET', fullUrl);
    return request(path);
  },
  createAppointment: (body) => request('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  updateAppointment: (id, body) => request('/appointments/' + encodeURIComponent(ensureString(id)), { method: 'PATCH', body: JSON.stringify(body) }),

  /** Fetch doctors merged with user names (never Dr. Unknown) */
  getDoctorsWithUser: function () {
    return Promise.all([api.getDoctors(), api.getUsers()]).then(function (res) {
      var doctors = res[0];
      var users = res[1];
      return (doctors || []).map(function (doc) {
        var user = (users || []).find(function (u) { return String(u.id) === String(doc.userId); });
        return Object.assign({}, doc, { name: (user && user.name) ? user.name : 'Dr. ' + (doc.specialist || 'Doctor') });
      });
    });
  },
};
