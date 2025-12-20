export const showToast = (msg, bg = 'success') => {
  const id = `t${Date.now()}`;
  const html = `<div id="${id}" class="toast show align-items-center text-white bg-${bg} border-0 position-fixed bottom-0 end-0 m-3" role="alert" style="z-index:9999"><div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(() => document.getElementById(id)?.remove(), 3000);
};