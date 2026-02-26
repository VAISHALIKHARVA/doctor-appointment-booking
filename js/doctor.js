/**
 * Doctor dashboard – today's patients, slot limits + enable/disable, mark completed, view details (string IDs)
 */
function showPatientDetailModal(data) {
  var content = document.getElementById('patientDetailContent');
  var modal = document.getElementById('patientDetailModal');
  if (!content || !modal) return;
  var statusClass = data.status === 'completed' ? 'text-green-700' : data.status === 'cancelled' ? 'text-red-700' : 'text-amber-700';
  content.innerHTML =
    '<p><strong>Name:</strong> ' + escapeHtml(data.patientName) + '</p>' +
    '<p><strong>Phone:</strong> ' + escapeHtml(data.patientPhone) + '</p>' +
    '<p><strong>Date:</strong> ' + escapeHtml(data.date) + '</p>' +
    '<p><strong>Slot:</strong> ' + escapeHtml(data.slot) + '</p>' +
    '<p><strong>Token:</strong> ' + formatToken(data.tokenNumber) + '</p>' +
    '<p><strong>Status:</strong> <span class="' + statusClass + ' font-medium">' + escapeHtml(data.status) + '</span></p>';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closePatientDetailModal() {
  var modal = document.getElementById('patientDetailModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function getDoctorByUserId(doctors, userId) {
  var id = userId != null ? String(userId) : '';
  return (Array.isArray(doctors) ? doctors : []).find(function (d) { return String(d.userId) === id; });
}

function loadDoctorDashboard(doctorId, date) {
  doctorId = String(doctorId);
  var welcomeEl = document.getElementById('welcomeName');
  var totalEl = document.getElementById('totalPatients');
  var waitingEl = document.getElementById('waitingCount');
  var completedEl = document.getElementById('completedCount');
  var currentTokenEl = document.getElementById('currentToken');
  var morningEl = document.getElementById('morningCount');
  var afternoonEl = document.getElementById('afternoonCount');
  var eveningEl = document.getElementById('eveningCount');
  var tableBody = document.getElementById('patientsTableBody');
  var slotSection = document.getElementById('slotSection');

  var d = date || getToday();

  if (typeof console !== 'undefined' && console.log) {
    console.log('Doctor ID:', doctorId, 'Date:', d);
  }
  Promise.all([
    api.getAppointments({}).then(function (allList) {
      return (allList || []).filter(function (a) {
        return String(a.doctorId) === String(doctorId) && a.date === d;
      });
    }),
    api.getDoctor(doctorId),
  ]).then(function (res) {
    var appointments = res[0] || [];
    var doctor = res[1];
    if (typeof console !== 'undefined' && console.log) {
      console.log('Doctor Appointments:', appointments.length, appointments);
    }
    var waiting = appointments.filter(function (a) { return a.status === 'waiting'; });
    var completed = appointments.filter(function (a) { return a.status === 'completed'; });
    var cancelled = appointments.filter(function (a) { return a.status === 'cancelled'; });
    var currentToken = waiting.length ? Math.min.apply(null, waiting.map(function (a) { return a.tokenNumber; })) : 0;
    var morning = appointments.filter(function (a) { return a.slot === 'morning'; }).length;
    var afternoon = appointments.filter(function (a) { return a.slot === 'afternoon'; }).length;
    var evening = appointments.filter(function (a) { return a.slot === 'evening'; }).length;

    if (welcomeEl) welcomeEl.textContent = welcomeEl.textContent || 'Welcome, Doctor';
    if (totalEl) totalEl.textContent = appointments.length;
    if (waitingEl) waitingEl.textContent = waiting.length;
    if (completedEl) completedEl.textContent = completed.length;
    if (currentTokenEl) currentTokenEl.textContent = currentToken ? formatToken(currentToken) : '–';
    if (morningEl) morningEl.textContent = morning;
    if (afternoonEl) afternoonEl.textContent = afternoon;
    if (eveningEl) eveningEl.textContent = evening;

    var allForTable = waiting.concat(completed).concat(cancelled).sort(function (a, b) { return a.tokenNumber - b.tokenNumber; });
    if (tableBody) {
      tableBody.innerHTML = allForTable.map(function (a) {
        var statusClass = a.status === 'completed' ? 'bg-green-100 text-green-800' : a.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';
        return (
          '<tr class="border-b border-slate-200 hover:bg-slate-50">' +
          '<td class="py-3 px-4">' + formatToken(a.tokenNumber) + '</td>' +
          '<td class="py-3 px-4">' + escapeHtml(a.patientName) + '</td>' +
          '<td class="py-3 px-4">' + escapeHtml(a.patientPhone || '') + '</td>' +
          '<td class="py-3 px-4">' + escapeHtml(a.slot) + '</td>' +
          '<td class="py-3 px-4"><span class="px-2 py-1 rounded text-xs font-medium ' + statusClass + '">' + escapeHtml(a.status) + '</span></td>' +
          '<td class="py-3 px-4 flex flex-wrap gap-2">' +
          (a.status === 'waiting'
            ? '<button type="button" class="mark-complete px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700" data-id="' + escapeHtml(String(a.id)) + '">Complete</button>'
            : '') +
          '</td></tr>'
        );
      }).join('');
      tableBody.querySelectorAll('.mark-complete').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = this.getAttribute('data-id');
          api.updateAppointment(id, { status: 'completed' }).then(function () {
            showToast('Marked as completed.');
            loadDoctorDashboard(doctorId, d);
          }).catch(function () { showToast('Update failed.', 'error'); });
        });
      });
    }

    if (slotSection && doctor && doctor.slots) {
      var slots = doctor.slots;
      var slotKeys = ['morning', 'afternoon', 'evening'];
      var rows = slotKeys.map(function (key) {
        var s = slots[key] || {};
        var enabled = s.enabled !== false;
        var limit = s.limit != null ? s.limit : 5;
        return (
          '<div class="bg-white rounded-lg border border-slate-200 p-4">' +
          '<p class="font-medium text-slate-800 capitalize">' + key + '</p>' +
          '<p class="text-sm text-slate-500">' + (s.start || '') + ' – ' + (s.end || '') + '</p>' +
          '<label class="flex items-center gap-2 mt-2 cursor-pointer">' +
          '<input type="checkbox" class="slot-enabled rounded border-slate-300 text-[#1977cc]" data-slot="' + key + '" ' + (enabled ? 'checked' : '') + '> Enable' +
          '</label>' +
          '<div class="mt-2"><label class="block text-xs text-slate-500 mb-1">Limit</label>' +
          '<input type="number" min="0" max="20" class="slot-limit w-20 px-2 py-1 border border-slate-300 rounded" data-slot="' + key + '" value="' + limit + '">' +
          '</div></div>'
        );
      }).join('');
      slotSection.innerHTML =
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">' + rows + '</div>' +
        '<button type="button" id="saveSlotsBtn" class="px-4 py-2 bg-[#1977cc] text-white rounded-lg hover:opacity-90">Save slot availability</button>';
      var saveBtn = document.getElementById('saveSlotsBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          var newSlots = {};
          slotKeys.forEach(function (key) {
            var en = slotSection.querySelector('.slot-enabled[data-slot="' + key + '"]');
            var lim = slotSection.querySelector('.slot-limit[data-slot="' + key + '"]');
            var prev = slots[key] || {};
            var start = prev.start || (key === 'morning' ? '09:00' : key === 'afternoon' ? '13:00' : '17:00');
            var end = prev.end || (key === 'morning' ? '12:00' : key === 'afternoon' ? '16:00' : '20:00');
            newSlots[key] = {
              start: start,
              end: end,
              limit: lim ? parseInt(lim.value, 10) || 5 : 5,
              enabled: en ? en.checked : true,
            };
          });
          api.updateDoctor(doctorId, { slots: newSlots }).then(function () {
            showToast('Slots saved.');
            loadDoctorDashboard(doctorId, d);
          }).catch(function () { showToast('Update failed.', 'error'); });
        });
      }
    }
  }).catch(function (err) {
    if (typeof console !== 'undefined' && console.error) console.error('Dashboard load error:', err);
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-500">Failed to load. Is JSON Server running at ' + (window.API_BASE || 'http://localhost:3000') + '?</td></tr>';
  });
}
