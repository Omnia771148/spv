export const showToast = (msg, bg = 'success') => {
  // Remove existing toasts to prevent stacking
  document.querySelectorAll('.toast-pill').forEach(el => el.remove());

  const id = `t${Date.now()}`;
  const isError = bg === 'danger' || msg.toLowerCase().includes('already exist');
  const isSuccess = !isError && (bg === 'success' || msg.toLowerCase().includes('added'));

  // Colors
  const successColor = 'green';
  const errorColor = 'red'; // Bright red for error
  const bgColor = isError ? errorColor : successColor;
  const iconColor = isError ? errorColor : successColor;

  // Icon
  let iconHtml = '';
  if (isSuccess) {
    iconHtml = `<div class="toast-icon" style="color: ${iconColor};"><i class="fa-solid fa-check"></i></div>`;
  } else if (isError) {
    iconHtml = `<div class="toast-icon" style="color: ${iconColor};"><i class="fa-solid fa-xmark"></i></div>`;
  }

  // Styles
  const html = `
    <div id="${id}" class="toast-pill" style="position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background-color: ${bgColor}; z-index: 9999; justify-content: center; align-items: center; min-width: 80%;">
      ${iconHtml}
      <span style="font-weight: 600; padding-top: 2px;">${msg.toUpperCase()}</span>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(() => document.getElementById(id)?.remove(), 1000);
};