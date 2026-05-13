// Theme initialization script
// Reads authentication state from <html> data attribute and sets theme accordingly
(function () {
  var defaultTheme = 'traditional';
  var isAuthenticated = document.documentElement.dataset.authenticated === 'true';
  if (!isAuthenticated) {
    document.documentElement.dataset.theme = defaultTheme;
  } else {
    // Optionally, you can still check localStorage or user preference here
    var t = localStorage.getItem('ttt.defaultTheme');
    var allowed = ['robot', 'fantasy', 'traditional', 'flowers'];
    var resolved = (t && allowed.indexOf(t) !== -1) ? t : defaultTheme;
    document.documentElement.dataset.theme = resolved;
  }
})();