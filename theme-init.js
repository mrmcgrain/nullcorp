// Apply the initial theme before styles load without requiring inline script.
try {
  const savedTheme = localStorage.getItem('nullcorp-theme');
  document.documentElement.dataset.theme = savedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
} catch {
  document.documentElement.dataset.theme = 'dark';
}
