/* Theme toggle */
(function () {
  var btn = document.getElementById('theme-toggle');

  function getTheme() {
    return localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    if (btn) btn.textContent = t === 'dark' ? 'light' : 'dark';
  }

  applyTheme(getTheme());

  if (btn) {
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
})();

/* Sidebar folder toggle */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.nav-folder-header').forEach(function (header) {
    header.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') return;
      header.parentElement.classList.toggle('open');
    });
  });
});
