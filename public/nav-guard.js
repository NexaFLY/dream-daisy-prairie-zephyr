(function () {
  if (window.__nexaNavGuard) return;
  window.__nexaNavGuard = true;

  function stale(msg) {
    return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
      String(msg || ""),
    );
  }

  function reloadOnce() {
    try {
      var key = "nexa-stale-reload";
      var last = Number(sessionStorage.getItem(key) || "0");
      if (Date.now() - last < 5000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch (e) {}
    location.reload();
  }

  window.addEventListener("unhandledrejection", function (e) {
    var msg = (e.reason && e.reason.message) || e.reason || "";
    if (stale(msg)) {
      e.preventDefault();
      reloadOnce();
    }
  });

  window.addEventListener("error", function (e) {
    if (stale(e.message)) reloadOnce();
  });
})();
