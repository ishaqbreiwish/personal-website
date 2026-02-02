// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function getTheme() {
  return (
    localStorage.getItem("theme") || (prefersDark.matches ? "dark" : "light")
  );
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "light" : "dark";
  }
}

// Initialize theme
setTheme(getTheme());

// Toggle on click
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });
}

// Folder toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const folders = document.querySelectorAll(".folder-header");

  folders.forEach((folder) => {
    folder.addEventListener("click", (e) => {
      if (e.target.tagName === "A") return;

      const parent = folder.parentElement;
      parent.classList.toggle("open");
    });
  });
});
