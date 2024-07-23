/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */

function hideAlert() {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

function showAlert(type, msg) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
}

async function login(email, password) {
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/v1/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (res.statusText === 'OK') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else if (res.statusText === 'Unauthorized') {
      throw new Error('incorrect password or email');
    }
  } catch (err) {
    // console.log(err.response.data.message);
    showAlert('error', err.message);
  }
}

const loginForm = document.querySelector('.form');

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });

// LOGOUT FUNCTION
async function logout() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/v1/users/logout', {
      method: 'GET',
      credentials: 'include', // Ensure cookies are sent
    });

    if (res.ok) {
      location.reload(true);
    } else {
      const errorData = await res.json();
      console.error('Logout failed:', errorData);
      showAlert('error', 'Error logging out! Please try again');
    }
  } catch (err) {
    console.error('Network error:', err);
    showAlert('error', 'Error logging out! Please try again');
  }
}

const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn)
  logoutBtn.addEventListener('click', () => {
    logout();
  });
