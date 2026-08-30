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

  document.addEventListener(
    "click",
    function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var node = e.target;
      if (!node || !node.closest) return;
      var a = node.closest("a");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      var href = a.getAttribute("href");
      if (!href || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (href.charAt(0) === "#") return;
      var abs = href.indexOf("http") === 0 ? href : new URL(href, location.origin).href;
      if (abs.indexOf(location.origin) !== 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      location.assign(abs);
    },
    true,
  );

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
