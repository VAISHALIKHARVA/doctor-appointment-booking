/**
 * Auth - login, signup, session (localStorage)
 */
const AUTH_KEY = 'appointment_user';

function getSession() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setSession(user) {
  try {
    var safe = {
      id: user && user.id != null ? String(user.id) : '',
      role: (user && user.role != null ? String(user.role) : '').toLowerCase().trim(),
      name: user && user.name != null ? String(user.name) : '',
      email: user && user.email != null ? String(user.email) : '',
      phone: user && user.phone != null ? String(user.phone) : '',
    };
    if (user && user.specialist != null) safe.specialist = String(user.specialist);
    localStorage.setItem(AUTH_KEY, JSON.stringify(safe));
  } catch (err) {
    if (typeof console !== 'undefined' && console.error) console.error('setSession failed', err);
  }
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

function requireAuth(allowedRoles) {
  allowedRoles = allowedRoles || [];
  var user = getSession();
  if (!user || typeof user !== 'object') {
    window.location.replace('login.html');
    return null;
  }
  var role = (user.role != null ? String(user.role) : '').toLowerCase().trim();
  if (allowedRoles.length && !allowedRoles.includes(role)) {
    window.location.replace(role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html');
    return null;
  }
  user.role = role;
  if (user.id != null) user.id = String(user.id);
  return user;
}

function handleLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  var form = e && e.target && e.target.tagName === 'FORM' ? e.target : document.getElementById('loginForm');
  if (!form) return false;
  const email = (form.querySelector('[name="email"]') || {}).value?.trim();
  const password = (form.querySelector('[name="password"]') || {}).value;
  const role = (form.querySelector('[name="role"]:checked') || {}).value;

  var emailErr = getEmailValidationError(email);
  if (emailErr) {
    showToast(emailErr, 'error');
    return false;
  }
  var pwErr = getPasswordValidationError(password);
  if (pwErr) {
    showToast(pwErr, 'error');
    return false;
  }
  if (!role) {
    showToast('Please select Doctor or Patient.', 'error');
    return false;
  }

  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Signing in...';
  }

  var loginDone = false;
  api.getUsers()
    .then((users) => {
      if (loginDone) return;
      const roleNorm = (role || '').toLowerCase().trim();
      const user = (users || []).find((u) => {
        const uRole = (u.role || '').toLowerCase().trim();
        return u.email === email && u.password === password && uRole === roleNorm;
      });
      if (!user) {
        showToast('Invalid email, password or role.', 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Login';
        }
        return;
      }
      loginDone = true;
      const { password: _, ...rest } = user;
      setSession(rest);
      showToast('Login successful.', 'success');
      var redirectRole = (rest.role != null ? String(rest.role) : '').toLowerCase().trim();
      var target = redirectRole === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
      window.location.replace(target);
    })
    .catch(() => {
      showToast('Server error. Is JSON Server running on port 3000?', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    });
  return false;
}

function handleSignup(e) {
  const form = e && e.target ? e.target : document.getElementById('signupForm');
  if (!form) return;
  const role = (form.querySelector('[name="role"]:checked') || {}).value;
  const name = (form.querySelector('[name="name"]') || {}).value?.trim();
  const email = (form.querySelector('[name="email"]') || {}).value?.trim();
  const phone = (form.querySelector('[name="phone"]') || {}).value?.trim();
  const password = (form.querySelector('[name="password"]') || {}).value;
  const confirm = (form.querySelector('[name="confirmPassword"]') || {}).value;
  const specialist = form.querySelector('[name="specialist"]');
  const specialistVal = specialist ? specialist.value?.trim() : '';

  var nameErr = getNameValidationError(name);
  if (nameErr) {
    showToast(nameErr, 'error');
    return;
  }
  var emailErr = getEmailValidationError(email);
  if (emailErr) {
    showToast(emailErr, 'error');
    return;
  }
  if (!phone) {
    showToast('Phone is required.', 'error');
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    showToast('Phone must be exactly 10 digits.', 'error');
    return;
  }
  var pwErr = getPasswordValidationError(password);
  if (pwErr) {
    showToast(pwErr, 'error');
    return;
  }
  var confirmErr = getPasswordValidationError(confirm, 'Confirm password');
  if (confirmErr) {
    showToast(confirmErr, 'error');
    return;
  }
  if (password !== confirm) {
    showToast('Passwords do not match.', 'error');
    return;
  }
  if (role === 'doctor') {
    var specErr = getSpecialistValidationError(specialistVal);
    if (specErr) {
      showToast(specErr, 'error');
      return;
    }
  }
  if (!role) {
    showToast('Please select Doctor or Patient.', 'error');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Creating account...';
  }

  api.getUsers()
    .then((users) => {
      if (users.some((u) => u.email === email)) {
        showToast('Email already registered.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
        return null;
      }
      const userPayload = {
        role,
        name,
        email,
        phone,
        password,
        ...(role === 'doctor' && { specialist: specialistVal }),
      };
      return api.createUser(userPayload).then(async (created) => {
        if (role === 'doctor') {
          const base = window.API_BASE || 'http://localhost:3000';
          await fetch(base + '/doctors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: String(created.id),
              specialist: specialistVal,
              slots: {
                morning: { start: '09:00', end: '12:00', limit: 5, enabled: true },
                afternoon: { start: '13:00', end: '16:00', limit: 5, enabled: true },
                evening: { start: '17:00', end: '20:00', limit: 5, enabled: true },
              },
            }),
          });
        }
        return created;
      });
    })
    .then((created) => {
      if (!created) return;
      const { password: _, ...rest } = created;
      setSession(rest);
      showToast('Account created.', 'success');
      if (created.role === 'doctor') window.location.href = 'doctor-dashboard.html';
      else window.location.href = 'patient-dashboard.html';
    })
    .catch((err) => {
      console.error(err);
      showToast('Sign up failed. Check console.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
    });
}
