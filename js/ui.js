/**
 * UI helpers - theme, navbar, footer (MediCio-style)
 * Primary: #1977cc
 */
var THEME = { primary: '#1977cc', primaryLight: '#e8f2fc' };

function renderNavbar(options) {
  var current = options && options.current;
  var showLogin = options && options.showLogin !== false;
  var showSignup = options && options.showSignup !== false;
  var isPatient = options && options.isPatient;
  var isDoctor = options && options.isDoctor;
  var userName = options && options.userName;
  var html = '<nav class="bg-white shadow-md sticky top-0 z-40 border-b border-slate-100">';
  html += '<div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">';
  html += '<a href="index.html" class="text-xl font-bold text-[#1977cc]">MediBook</a>';
  html += '<div class="flex items-center gap-4">';
  html += '<a href="index.html" class="text-slate-600 hover:text-[#1977cc] transition ' + (current === 'home' ? 'font-semibold text-[#1977cc]' : '') + '">Home</a>';
  if (isPatient) {
    html += '<a href="patient-dashboard.html" class="text-slate-600 hover:text-[#1977cc] transition ' + (current === 'doctors' ? 'font-semibold text-[#1977cc]' : '') + '">Doctors</a>';
    html += '<a href="patient-dashboard.html#my-appointments" class="text-slate-600 hover:text-[#1977cc] transition ' + (current === 'appointments' ? 'font-semibold text-[#1977cc]' : '') + '">My Appointments</a>';
  }
  if (userName) {
    html += '<span class="text-slate-600 text-sm">' + escapeHtml(userName) + '</span>';
    html += '<a href="index.html" onclick="clearSession()" class="text-red-600 hover:underline text-sm">Logout</a>';
  } else if (showLogin || showSignup) {
    if (showLogin) html += '<a href="login.html" class="text-slate-600 hover:text-[#1977cc] transition">Login</a>';
    if (showSignup) html += '<a href="signup.html" class="px-4 py-2 bg-[#1977cc] text-white rounded-lg hover:opacity-90 transition text-sm font-medium">Sign Up</a>';
  }
  html += '</div></div></nav>';
  return html;
}

function renderFooter() {
  var html = '<footer class="bg-slate-800 text-slate-300 py-8 mt-12">';
  html += '<div class="max-w-6xl mx-auto px-4 text-center text-sm">';
  html += '<p class="text-[#1977cc] font-semibold mb-2">MediBook</p>';
  html += '<p>Doctor Appointment Booking System</p>';
  html += '</div></footer>';
  return html;
}
