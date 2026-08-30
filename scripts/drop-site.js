(function () {
  "use strict";

  var SITE = {
    name: "Nexa FLY",
    mint: "9NcUwy9JVekfsY4UA62ZaTprn4TDnJZwp5B6vMAAtkzt",
    usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    nusd: "711P4haqL2hzDA1KrfWST5QFdigDRymQoLxDGfMGqcDx",
    sol: "So11111111111111111111111111111111111111112",
    wallet: "bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT",
    rna: "W131019858",
    siren: "101736536",
    email: "contact@nexafly.org",
    jupiter: "https://jup.ag/swap?sell=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&buy=9NcUwy9JVekfsY4UA62ZaTprn4TDnJZwp5B6vMAAtkzt",
    jupiterSol: "https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=9NcUwy9JVekfsY4UA62ZaTprn4TDnJZwp5B6vMAAtkzt",
    titan: "https://titan.exchange/swap?EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v-9NcUwy9JVekfsY4UA62ZaTprn4TDnJZwp5B6vMAAtkzt",
    titanSol: "https://titan.exchange/swap?So11111111111111111111111111111111111111112-9NcUwy9JVekfsY4UA62ZaTprn4TDnJZwp5B6vMAAtkzt",
    solscanWallet: "https://solscan.io/account/bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT",
    dexscreener: "https://api.dexscreener.com/latest/dex/tokens/9NcUwy9JVekfsY4UA62ZaTprn4TDnJZwp5B6vMAAtkzt",
  };

  var T = {
    fr: {
      connect: "Connecter",
      disconnect: "Déconnecter",
      donate: "Faire un don",
      copied: "Copié",
      copy: "Copier",
      copyAddr: "Copier l’adresse",
      none: "Aucun wallet d’extension détecté. Installez Phantom ou Solflare, ou ouvrez Jupiter / Titan depuis mobile.",
      detected: "Détecté — cliquer pour connecter",
      install: "Installer",
      connected: "Wallet connecté",
      pay: "Vous payez",
      receive: "Vous recevez",
      rate: "Cours",
      loading: "Cours…",
      error: "Cours indisponible pour le moment.",
      jup: "Swap sur Jupiter",
      titan: "Swap sur Titan",
      donateTitle: "Faire un don",
      donateLead: "Choisissez le rail. Dans tous les cas, le wallet associatif reste public.",
      onchain: "Don on-chain",
      onchainBody: "Envoyez SOL, USDC ou FLY vers le wallet de transparence.",
      euro: "Don en euros",
      euroBody: "Écrivez-nous. On vous indique le virement et le suivi.",
    },
    en: {
      connect: "Connect",
      disconnect: "Disconnect",
      donate: "Donate",
      copied: "Copied",
      copy: "Copy",
      copyAddr: "Copy address",
      none: "No extension wallet detected. Install Phantom or Solflare, or open Jupiter / Titan on mobile.",
      detected: "Detected — tap to connect",
      install: "Install",
      connected: "Wallet connected",
      pay: "You pay",
      receive: "You receive",
      rate: "Rate",
      loading: "Quote…",
      error: "Quote unavailable right now.",
      jup: "Swap on Jupiter",
      titan: "Swap on Titan",
      donateTitle: "Donate",
      donateLead: "Pick a rail. The association wallet stays public either way.",
      onchain: "On-chain gift",
      onchainBody: "Send SOL, USDC or FLY to the transparency wallet.",
      euro: "Euro gift",
      euroBody: "Write to us. We’ll share the transfer details.",
    },
  };

  function lang() {
    return localStorage.getItem("nexa-lang") === "en" ? "en" : "fr";
  }
  function t() { return T[lang()]; }

  function applyLang() {
    var L = lang();
    document.documentElement.lang = L;
    document.querySelectorAll("[data-fr]").forEach(function (el) {
      var v = el.getAttribute("data-" + L);
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-fr-html]").forEach(function (el) {
      var v = el.getAttribute("data-" + L + "-html");
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === L ? "true" : "false");
    });
    refreshConnectLabel();
  }

  function setLang(next) {
    localStorage.setItem("nexa-lang", next);
    applyLang();
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = t().copied;
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1600);
    });
  }

  function shortAddr(a) {
    if (!a) return "";
    return a.slice(0, 6) + "…" + a.slice(-4);
  }

  /* Header */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  var menuBtn = document.getElementById("menuToggle");
  var mobile = document.getElementById("navMobile");
  if (menuBtn && mobile) {
    menuBtn.addEventListener("click", function () {
      mobile.classList.toggle("open");
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobile.classList.remove("open"); });
    });
  }
  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () { copyText(btn.getAttribute("data-copy"), btn); });
  });

  /* Wallet */
  var walletState = { address: localStorage.getItem("nexa-wallet") || "" };

  function provider() {
    if (window.solana && window.solana.isPhantom) return window.solana;
    if (window.solflare) return window.solflare;
    if (window.solana) return window.solana;
    return null;
  }

  function refreshConnectLabel() {
    document.querySelectorAll("[data-connect-label]").forEach(function (el) {
      el.textContent = walletState.address ? shortAddr(walletState.address) : t().connect;
    });
    document.querySelectorAll("[data-connected]").forEach(function (el) {
      el.hidden = !walletState.address;
      if (walletState.address) el.textContent = t().connected + " · " + shortAddr(walletState.address);
    });
  }

  async function connectWallet() {
    var p = provider();
    if (!p) {
      openDialog("picker");
      return;
    }
    try {
      var res = await p.connect();
      var addr = (res && res.publicKey && res.publicKey.toString()) || (p.publicKey && p.publicKey.toString());
      if (addr) {
        walletState.address = addr;
        localStorage.setItem("nexa-wallet", addr);
        refreshConnectLabel();
        closeDialog("picker");
      }
    } catch (e) { /* user rejected */ }
  }

  function disconnectWallet() {
    walletState.address = "";
    localStorage.removeItem("nexa-wallet");
    var p = provider();
    if (p && p.disconnect) try { p.disconnect(); } catch (e) {}
    refreshConnectLabel();
  }

  document.querySelectorAll("[data-connect]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (walletState.address) openDialog("picker");
      else connectWallet();
    });
  });

  /* Dialogs */
  function openDialog(id) {
    var d = document.getElementById(id);
    var o = document.getElementById(id + "Overlay");
    if (d) d.classList.add("open");
    if (o) o.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDialog(id) {
    var d = document.getElementById(id);
    var o = document.getElementById(id + "Overlay");
    if (d) d.classList.remove("open");
    if (o) o.classList.remove("open");
    if (!document.querySelector(".dialog.open")) document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open]").forEach(function (el) {
    el.addEventListener("click", function () { openDialog(el.getAttribute("data-open")); });
  });
  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () { closeDialog(el.getAttribute("data-close")); });
  });
  document.querySelectorAll(".overlay").forEach(function (o) {
    o.addEventListener("click", function () { closeDialog(o.id.replace(/Overlay$/, "")); });
  });

  var phantomBtn = document.getElementById("connectPhantom");
  if (phantomBtn) phantomBtn.addEventListener("click", connectWallet);
  var disc = document.getElementById("disconnectWallet");
  if (disc) disc.addEventListener("click", function () { disconnectWallet(); closeDialog("picker"); });

  /* Swap */
  var priceUsd = 0.0516;
  var priceNative = null;
  var amountEl = document.getElementById("swapAmount");
  var fromEl = document.getElementById("swapFrom");
  var outEl = document.getElementById("swapOut");
  var metaEl = document.getElementById("swapMeta");
  var jupLink = document.getElementById("swapJup");
  var titanLink = document.getElementById("swapTitan");

  function fmt(n) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString(lang() === "en" ? "en-US" : "fr-FR", { maximumFractionDigits: 2 });
  }

  function estimate(amount, from) {
    var n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (from === "USDC" && priceUsd) return n / priceUsd;
    if (from === "SOL" && priceNative) return n / priceNative;
    return null;
  }

  async function fetchQuote() {
    if (!amountEl || !fromEl) return;
    var amount = amountEl.value || "10";
    var from = fromEl.value || "USDC";
    if (jupLink) jupLink.href = from === "SOL" ? SITE.jupiterSol : SITE.jupiter;
    if (titanLink) titanLink.href = from === "SOL" ? SITE.titanSol : SITE.titan;
    if (metaEl) metaEl.textContent = t().loading;
    var n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      if (outEl) outEl.textContent = "—";
      return;
    }
    var inputMint = from === "SOL" ? SITE.sol : SITE.usdc;
    var decimals = from === "SOL" ? 9 : 6;
    var rawIn = Math.round(n * Math.pow(10, decimals));
    try {
      var url = "https://lite-api.jup.ag/swap/v1/quote?inputMint=" + inputMint +
        "&outputMint=" + SITE.mint + "&amount=" + rawIn + "&slippageBps=50";
      var res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) {
        var json = await res.json();
        var out = Number(json.outAmount || 0) / 1e6;
        if (out > 0) {
          if (outEl) outEl.textContent = fmt(out) + " FLY";
          if (metaEl) metaEl.textContent = t().rate + " · Jupiter";
          return;
        }
      }
    } catch (e) {}
    var est = estimate(amount, from);
    if (est) {
      if (outEl) outEl.textContent = fmt(est) + " FLY";
      if (metaEl) metaEl.textContent = t().rate + " · Raydium";
    } else if (metaEl) {
      metaEl.textContent = t().error;
    }
  }

  async function loadMarket() {
    try {
      var res = await fetch(SITE.dexscreener);
      var json = await res.json();
      var pair = (json.pairs || []).find(function (p) { return p.chainId === "solana" && Number(p.priceUsd) > 0; });
      if (!pair) { fetchQuote(); return; }
      priceUsd = Number(pair.priceUsd);
      if (pair.priceNative) priceNative = Number(pair.priceNative);
      var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      set("mPrice", "$" + Number(pair.priceUsd).toPrecision(4));
      set("mLiq", pair.liquidity && pair.liquidity.usd ? "$" + Math.round(pair.liquidity.usd).toLocaleString() : "—");
      set("mVol", pair.volume && pair.volume.h24 ? "$" + Math.round(pair.volume.h24).toLocaleString() : "—");
      var ch = pair.priceChange && pair.priceChange.h24;
      if (ch != null) set("mChg", (ch > 0 ? "+" : "") + Number(ch).toFixed(2) + "%");
      fetchQuote();
    } catch (e) {}
  }

  if (amountEl) {
    var timer;
    var kick = function () { clearTimeout(timer); timer = setTimeout(fetchQuote, 280); };
    amountEl.addEventListener("input", kick);
    fromEl.addEventListener("change", kick);
  }

  /* Supply */
  fetch("/api/info.json").then(function (r) { return r.json(); }).then(function (d) {
    var fmtN = function (n) { return Math.round(n).toLocaleString(lang() === "en" ? "en-US" : "fr-FR") + " FLY"; };
    var circ = document.getElementById("circSupply");
    var tot = document.getElementById("totSupply");
    if (circ && d.circulatingSupply) circ.textContent = fmtN(d.circulatingSupply);
    if (tot && d.totalSupply) tot.textContent = fmtN(d.totalSupply);
  }).catch(function () {});

  /* Associations filter */
  var chips = document.querySelectorAll("[data-filter]");
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        document.querySelectorAll("[data-org]").forEach(function (card) {
          var region = card.getAttribute("data-region");
          var cat = card.getAttribute("data-cat");
          var show = f === "all" || f === region || f === cat;
          card.hidden = !show;
        });
      });
    });
  }

  /* Contact mailto */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var email = (form.querySelector("[name=email]") || {}).value || "";
      var msg = (form.querySelector("[name=message]") || {}).value || "";
      var body = encodeURIComponent("Nom : " + name + "\nEmail : " + email + "\n\n" + msg);
      window.location.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent("Nexa FLY") + "&body=" + body;
    });
  }

  applyLang();
  refreshConnectLabel();
  if (amountEl) fetchQuote();
  loadMarket();
  window.Nexa = { SITE: SITE, copyText: copyText, connectWallet: connectWallet, openDialog: openDialog };
})();
