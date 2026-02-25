/**
 * Patient dashboard & booking – doctors list, my appointments, book (string IDs)
 */
var MINUTES_PER_PATIENT = 10;

function getDoctorsWithSlots(doctorsWithUser, appointments, date) {
  var dayAppointments = (appointments || []).filter(function (a) { return a.date === date; });
  return (doctorsWithUser || []).map(function (doc) {
    var docAppointments = dayAppointments.filter(function (a) { return String(a.doctorId) === String(doc.id); });
    var morning = (doc.slots.morning && doc.slots.morning.enabled !== false)
      ? Math.max(0, (doc.slots.morning.limit || 5) - docAppointments.filter(function (a) { return a.slot === 'morning'; }).length)
      : 0;
    var afternoon = (doc.slots.afternoon && doc.slots.afternoon.enabled !== false)
      ? Math.max(0, (doc.slots.afternoon.limit || 5) - docAppointments.filter(function (a) { return a.slot === 'afternoon'; }).length)
      : 0;
    var evening = (doc.slots.evening && doc.slots.evening.enabled !== false)
      ? Math.max(0, (doc.slots.evening.limit || 5) - docAppointments.filter(function (a) { return a.slot === 'evening'; }).length)
      : 0;
    return Object.assign({}, doc, {
      available: { morning: morning, afternoon: afternoon, evening: evening },
    });
  });
}

function renderDoctorCards(container, doctorsWithSlots, selectedDate) {
  if (!container) return;
  var date = selectedDate || getToday();
  container.innerHTML = doctorsWithSlots.map(function (doc) {
    var name = doc.name || 'Dr. ' + (doc.specialist || 'Doctor');
    var m = doc.available.morning;
    var a = doc.available.afternoon;
    var e = doc.available.evening;
    var morningText = m > 0 ? m + ' Available' : 'Full';
    var afternoonText = a > 0 ? a + ' Available' : 'Full';
    var eveningText = e > 0 ? e + ' Available' : 'Full';
    var hasSlots = m > 0 || a > 0 || e > 0;
    return (
      '<div class="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 border border-slate-100">' +
      '<h3 class="text-lg font-semibold text-slate-800">' + escapeHtml(name) + '</h3>' +
      '<p class="text-slate-500 text-sm mt-1">' + escapeHtml(doc.specialist || '') + '</p>' +
      '<ul class="mt-4 space-y-1 text-sm text-slate-600">' +
      '<li>Morning Slots: ' + morningText + '</li><li>Afternoon Slots: ' + afternoonText + '</li><li>Evening Slots: ' + eveningText + '</li>' +
      '</ul>' +
      '<a href="booking.html?doctorId=' + encodeURIComponent(String(doc.id)) + '&date=' + encodeURIComponent(date) + '" class="mt-4 block w-full py-2 text-center rounded-lg font-medium transition ' +
      (hasSlots ? 'bg-[#1977cc] text-white hover:opacity-90' : 'bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none') + '">' +
      (hasSlots ? 'Book Appointment' : 'No slots') + '</a></div>'
    );
  }).join('');
}

var DOCTOR_LIST_PAGE_SIZE = 6;

function loadPatientDashboard(containerId, searchId, dateId, page) {
  page = page || 1;
  var container = document.getElementById(containerId);
  var searchEl = document.getElementById(searchId);
  var dateEl = document.getElementById(dateId);
  var paginationEl = document.getElementById('doctorPagination');
  if (!container) return;

  var selectedDate = (dateEl && dateEl.value) || getToday();
  showLoading(container);
  if (paginationEl) paginationEl.innerHTML = '';

  api.getDoctorsWithUser().then(function (doctorsWithUser) {
    return api.getAppointments({ date: selectedDate }).then(function (appointments) {
      hideLoading(container);
      var doctorsWithSlots = getDoctorsWithSlots(doctorsWithUser, appointments, selectedDate);
      var query = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : '';
      if (query) {
        doctorsWithSlots = doctorsWithSlots.filter(function (d) {
          var name = (d.name || '').toLowerCase();
          var spec = (d.specialist || '').toLowerCase();
          return spec.indexOf(query) !== -1 || name.indexOf(query) !== -1;
        });
      }
      var total = doctorsWithSlots.length;
      var totalPages = Math.max(1, Math.ceil(total / DOCTOR_LIST_PAGE_SIZE));
      var pageNum = Math.max(1, Math.min(page, totalPages));
      var slice = doctorsWithSlots.slice((pageNum - 1) * DOCTOR_LIST_PAGE_SIZE, pageNum * DOCTOR_LIST_PAGE_SIZE);
      renderDoctorCards(container, slice, selectedDate);

      if (paginationEl && totalPages > 1) {
        paginationEl.innerHTML =
          '<button type="button" id="doctorPrevPage" class="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed" ' + (pageNum <= 1 ? 'disabled' : '') + '>Previous</button>' +
          '<span class="text-sm text-slate-600">Page ' + pageNum + ' of ' + totalPages + '</span>' +
          '<button type="button" id="doctorNextPage" class="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed" ' + (pageNum >= totalPages ? 'disabled' : '') + '>Next</button>';
        var prevBtn = document.getElementById('doctorPrevPage');
        var nextBtn = document.getElementById('doctorNextPage');
        if (prevBtn) prevBtn.addEventListener('click', function () { loadPatientDashboard(containerId, searchId, dateId, pageNum - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { loadPatientDashboard(containerId, searchId, dateId, pageNum + 1); });
      }
    });
  }).catch(function () {
    hideLoading(container);
    container.innerHTML = '<p class="text-red-500">Failed to load doctors. Is JSON Server running on port 3000?</p>';
  });
}

function loadMyAppointments(containerId, patientId, dateId) {
  var container = document.getElementById(containerId);
  var dateEl = document.getElementById(dateId);
  if (!container || !patientId) return;

  var selectedDate = (dateEl && dateEl.value) || getToday();
  showLoading(container);

  api.getAppointments({ patientId: String(patientId), date: selectedDate }).then(function (list) {
    hideLoading(container);
    if (!list || list.length === 0) {
      container.innerHTML = '<p class="text-slate-500 py-6 text-center">No appointments for this date.</p>';
      return;
    }
    api.getDoctorsWithUser().then(function (doctors) {
      container.innerHTML = list.map(function (a) {
        var doc = (doctors || []).find(function (d) { return String(d.id) === String(a.doctorId); });
        var docName = (doc && doc.name) ? doc.name : 'Doctor';
        var statusClass = a.status === 'completed' ? 'bg-green-100 text-green-800' : a.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';
        var cancelBtn = (a.status === 'waiting')
          ? '<button type="button" class="cancel-appt px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" data-id="' + escapeHtml(String(a.id)) + '">Cancel</button>'
          : '';
        return (
          '<div class="bg-white rounded-xl shadow p-4 border border-slate-100 flex flex-wrap justify-between items-center gap-2">' +
          '<div><p class="font-medium text-slate-800">' + escapeHtml(docName) + '</p>' +
          '<p class="text-sm text-slate-500">' + escapeHtml(a.date) + ' · ' + escapeHtml(a.slot) + ' · Token ' + formatToken(a.tokenNumber) + '</p></div>' +
          '<div class="flex items-center gap-2">' +
          '<span class="px-2 py-1 rounded text-xs font-medium ' + statusClass + '">' + escapeHtml(a.status) + '</span>' +
          cancelBtn +
          '</div></div>'
        );
      }).join('');
      container.querySelectorAll('.cancel-appt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm('Cancel this appointment?')) return;
          var id = this.getAttribute('data-id');
          var el = this;
          el.disabled = true;
          el.textContent = 'Cancelling...';
          api.updateAppointment(id, { status: 'cancelled' }).then(function () {
            showToast('Appointment cancelled.', 'success');
            loadMyAppointments(containerId, patientId, dateId);
          }).catch(function () {
            showToast('Failed to cancel.', 'error');
            el.disabled = false;
            el.textContent = 'Cancel';
          });
        });
      });
    });
  }).catch(function () {
    hideLoading(container);
    container.innerHTML = '<p class="text-red-500">Failed to load appointments.</p>';
  });
}

function initBookingPage() {
  var params = new URLSearchParams(window.location.search);
  var doctorId = params.get('doctorId');
  var dateParam = params.get('date') || getToday();
  var user = requireAuth(['patient']);
  if (!user || !doctorId) {
    if (!user) return;
    window.location.href = 'patient-dashboard.html';
    return;
  }
  doctorId = String(doctorId);

  var dateEl = document.getElementById('bookingDate');
  var slotSection = document.getElementById('slotSection');
  var resultSection = document.getElementById('bookingResult');

  if (dateEl) dateEl.value = dateParam;

  function showResult(html) {
    if (resultSection) {
      resultSection.innerHTML = html;
      resultSection.classList.remove('hidden');
    }
    if (slotSection) slotSection.classList.add('hidden');
  }

  function showSlots(html) {
    if (slotSection) {
      slotSection.innerHTML = html;
      slotSection.classList.remove('hidden');
    }
    if (resultSection) resultSection.classList.add('hidden');
  }

  function renderSlotChoice(doctor, available, selectedDate) {
    var options = [];
    if (available.morning > 0) options.push({ value: 'morning', label: 'Morning (9AM–12PM)' });
    if (available.afternoon > 0) options.push({ value: 'afternoon', label: 'Afternoon (1PM–4PM)' });
    if (available.evening > 0) options.push({ value: 'evening', label: 'Evening (5PM–8PM)' });
    if (options.length === 0) {
      showResult('<p class="text-amber-600">No slots available for this date.</p>');
      return;
    }
    var optsHtml = options.map(function (o) { return '<option value="' + o.value + '">' + escapeHtml(o.label) + '</option>'; }).join('');
    showSlots(
      '<label class="block text-sm font-medium text-slate-700 mb-2">Choose slot</label>' +
      '<select id="slotSelect" class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1977cc] mb-4">' + optsHtml + '</select>' +
      '<button type="button" id="bookBtn" class="w-full py-3 bg-[#1977cc] text-white font-medium rounded-lg hover:opacity-90 transition">Book</button>'
    );
    var sel = document.getElementById('slotSelect');
    var btn = document.getElementById('bookBtn');
    if (btn && sel) {
      btn.addEventListener('click', function () { doBook(doctorId, sel.value, selectedDate, user, showResult, showSlots); });
    }
  }

  api.getDoctor(doctorId).then(function (doctor) {
    return api.getAppointments({ doctorId: doctorId, date: dateParam }).then(function (appointments) {
      var doctorsWithSlots = getDoctorsWithSlots([Object.assign({}, doctor, { name: doctor.name })], appointments, dateParam);
      var doc = doctorsWithSlots[0];
      if (!doc) return;
      var existing = (appointments || []).find(function (a) { return String(a.patientId) === String(user.id); });
      if (existing) {
        function renderExisting(currentToken) {
          var waitMin = estimatedWaitMinutes(existing.tokenNumber, currentToken, MINUTES_PER_PATIENT);
          return (
            '<div class="rounded-lg border border-amber-200 bg-amber-50 p-4" data-queue-refresh="1">' +
            '<p class="font-medium text-slate-800">You already have an appointment</p>' +
            '<p class="mt-2 text-slate-600">Date: ' + escapeHtml(dateParam) + ' | Slot: ' + escapeHtml(existing.slot) + '</p>' +
            '<p class="mt-1"><strong>Your Token:</strong> ' + formatToken(existing.tokenNumber) + '</p>' +
            '<p class="mt-1"><strong>Current Token:</strong> ' + formatToken(currentToken) + '</p>' +
            '<p class="mt-1"><strong>Queue ahead:</strong> ' + Math.max(0, existing.tokenNumber - currentToken) + '</p>' +
            '<p class="mt-1"><strong>Estimated Wait Time:</strong> ' + waitMin + ' min</p>' +
            '<button type="button" id="cancelBookingPageBtn" class="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700" data-appointment-id="' + escapeHtml(String(existing.id)) + '">Cancel appointment</button></div>'
          );
        }
        function bindCancelOnBookingPage() {
          var btn = document.getElementById('cancelBookingPageBtn');
          if (!btn) return;
          btn.onclick = function () {
            if (!confirm('Cancel this appointment? You can book again after.')) return;
            var id = this.getAttribute('data-appointment-id');
            if (!id) return;
            btn.disabled = true;
            api.updateAppointment(id, { status: 'cancelled' }).then(function () {
              if (window._queueRefresh) clearInterval(window._queueRefresh);
              showToast('Appointment cancelled.', 'success');
              api.getAppointments({ doctorId: doctorId, date: dateParam }).then(function (appointments) {
                var doctorsWithSlots = getDoctorsWithSlots([Object.assign({}, doctor, { name: doctor.name })], appointments, dateParam);
                var doc = doctorsWithSlots[0];
                if (doc) renderSlotChoice(doctor, doc.available, dateParam);
              });
            }).catch(function () { showToast('Failed to cancel.', 'error'); btn.disabled = false; });
          };
        }
        getCurrentTokenForDoctorDate(doctorId, dateParam).then(function (currentToken) {
          showResult(renderExisting(currentToken));
          bindCancelOnBookingPage();
          window._queueRefresh = setInterval(function () {
            getCurrentTokenForDoctorDate(doctorId, dateParam).then(function (cur) {
              var r = document.getElementById('bookingResult');
              if (r && r.querySelector('[data-queue-refresh]')) r.innerHTML = renderExisting(cur);
              bindCancelOnBookingPage();
            });
          }, 10000);
        });
        return;
      }
      renderSlotChoice(doctor, doc.available, dateParam);
    });
  }).catch(function () {
    showResult('<p class="text-red-500">Doctor not found.</p>');
  });
}

function getCurrentTokenForDoctorDate(doctorId, date) {
  return new Promise(function (resolve) {
    api.getAppointments({ doctorId: String(doctorId), date: date, status: 'waiting' })
      .then(function (list) {
        if (!list || list.length === 0) resolve(0);
        else resolve(Math.min.apply(null, list.map(function (a) { return a.tokenNumber; })));
      })
      .catch(function () { resolve(0); });
  });
}

function doBook(doctorId, slot, date, user, showResult, showSlots) {
  var btn = document.getElementById('bookBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Booking...'; }
  doctorId = String(doctorId);
  var patientIdStr = String(user.id);

  api.getAppointments({ doctorId: doctorId, date: date }).then(function (appointments) {
    var existing = (appointments || []).find(function (a) { return String(a.patientId) === patientIdStr; });
    if (existing) {
      showResult('<p class="text-amber-600">You already have an appointment for this date.</p>');
      if (btn) { btn.disabled = false; btn.textContent = 'Book'; }
      return;
    }
    var slotAppointments = (appointments || []).filter(function (a) { return a.slot === slot; });
    var nextToken = slotAppointments.length === 0 ? 1 : Math.max.apply(null, slotAppointments.map(function (a) { return a.tokenNumber; })) + 1;
    return api.createAppointment({
      doctorId: doctorId,
      patientId: patientIdStr,
      patientName: user.name || '',
      patientPhone: user.phone || '',
      date: date,
      slot: slot,
      tokenNumber: nextToken,
      status: 'waiting',
    }).then(function (app) {
        return api.getAppointments({ doctorId: doctorId, date: date, status: 'waiting' }).then(function (waitingList) {
          var currentToken = (waitingList && waitingList.length) ? Math.min.apply(null, waitingList.map(function (a) { return a.tokenNumber; })) : nextToken;
          var waitMin = estimatedWaitMinutes(nextToken, currentToken, MINUTES_PER_PATIENT);
          function renderBooked(cur) {
            var w = estimatedWaitMinutes(app.tokenNumber, cur, MINUTES_PER_PATIENT);
            return (
              '<div class="rounded-lg border border-green-200 bg-green-50 p-4" data-queue-refresh="1">' +
              '<p class="font-medium text-green-800">Appointment booked</p>' +
              '<p class="mt-2 text-slate-600">Your Token: <strong>' + formatToken(app.tokenNumber) + '</strong></p>' +
              '<p class="mt-1">Current Token: ' + formatToken(cur) + '</p>' +
              '<p class="mt-1">Estimated Wait Time: ' + w + ' min</p></div>'
            );
          }
          showResult(renderBooked(currentToken));
          window._queueRefresh = setInterval(function () {
            getCurrentTokenForDoctorDate(doctorId, date).then(function (cur) {
              var r = document.getElementById('bookingResult');
              if (r && r.querySelector('[data-queue-refresh]')) r.innerHTML = renderBooked(cur);
            });
          }, 10000);
          if (btn) { btn.disabled = false; btn.textContent = 'Book'; }
        });
    });
  }).catch(function () {
    showToast('Booking failed.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Book'; }
  });
}
