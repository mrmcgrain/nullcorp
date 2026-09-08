const root = document.documentElement;
const year = document.querySelector("#year");
const header = document.querySelector("#site-header");
const themeToggle = document.querySelector(".theme-toggle");
const mobileNav = document.querySelector(".mobile-nav");

if (year) year.textContent = new Date().getFullYear();

function applyTheme(theme, persist = false) {
  root.dataset.theme = theme;
  if (persist) {
    try { localStorage.setItem("nullcorp-theme", theme); } catch {}
  }
  if (!themeToggle) return;
  const isLight = theme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", "Switch to " + (isLight ? "dark" : "light") + " mode");
  const icon = themeToggle.querySelector(".theme-icon");
  if (icon) icon.textContent = isLight ? "☀" : "◐";
}

applyTheme(root.dataset.theme || "dark");
themeToggle?.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "light" ? "dark" : "light", true);
});

if (header) {
  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 16);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => { mobileNav.open = false; });
});

const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -45px" });
  revealItems.forEach((item) => observer.observe(item));
}

const form = document.querySelector("#intake-form");
const success = document.querySelector("#intake-success");

function clearError(field) {
  field.removeAttribute("aria-invalid");
  const error = field.parentElement.querySelector(".field-error-msg");
  if (error) error.remove();
}

function showError(field, message) {
  clearError(field);
  field.setAttribute("aria-invalid", "true");
  const error = document.createElement("span");
  error.className = "field-error-msg";
  error.setAttribute("role", "alert");
  error.textContent = message;
  field.parentElement.appendChild(error);
}

form?.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => clearError(field));
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nameField = form.querySelector("#intake-name");
  const companyField = form.querySelector("#intake-company");
  const emailField = form.querySelector("#intake-email");
  const volumeField = form.querySelector("#intake-volume");
  const priorityField = form.querySelector("#intake-priority");
  const problemField = form.querySelector("#intake-problem");
  const button = form.querySelector(".form-submit");

  const name = nameField.value.trim();
  const company = companyField.value.trim();
  const email = emailField.value.trim();
  const problem = problemField.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let invalid = false;

  [nameField, companyField, emailField, problemField].forEach(clearError);
  if (!name) { showError(nameField, "Please enter your name."); invalid = true; }
  if (!emailPattern.test(email)) { showError(emailField, "Please enter a valid work email."); invalid = true; }
  if (!problem) { showError(problemField, "Tell us what a typical call should accomplish."); invalid = true; }
  if (invalid) {
    form.querySelector("[aria-invalid='true']")?.focus();
    return;
  }

  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = "Opening email";

  const subject = "Frontdesk setup for " + (company || name);
  const body = [
    "Name: " + name,
    "Business: " + (company || "Not provided"),
    "Email: " + email,
    "Monthly calls: " + volumeField.value,
    "First priority: " + priorityField.value,
    "",
    "Typical call flow:",
    problem
  ].join("\n");

  window.location.href = "mailto:hello@nullcorp.dev?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  form.hidden = true;
  success.hidden = false;
  success.focus();
});
