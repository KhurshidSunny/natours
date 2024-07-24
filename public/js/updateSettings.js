/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */

// type is either 'password' or 'data'

async function updateSettings(data, type) {
  try {
    const url =
      type === 'data'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMe'
        : 'http://127.0.0.1:3000/api/v1/users/updateMyPassword';
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      showAlert('success', `${type.toUpperCase()} successfully updated`);
    }

    if (!res.ok)
      throw new Error(
        type === 'data'
          ? 'incorrect email or passwordd'
          : 'current password is wrong',
      );
  } catch (err) {
    showAlert('error', err);
  }
}

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });

// password update event
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn-save--password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password',
    );

    document.querySelector('.btn-save--password').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });