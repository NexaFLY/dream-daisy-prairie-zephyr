#!/usr/bin/env python3
"""Build a static HTML folder for Cloudflare Pages Direct Upload."""
from __future__ import annotations

import re
import shutil
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path("/workspace")
PUB = ROOT / "public"
OUT = ROOT / "artifacts" / "nexa-static"
ZIP_PATH = ROOT / "artifacts" / "nexa-static.zip"

WALLET = "bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT"
MINT = "9NcUwy9JVekfsY4UA62ZaTprn4TDnJZwp5B6vMAAtkzt"
NUSD = "711P4haqL2hzDA1KrfWST5QFdigDRymQoLxDGfMGqcDx"


def copy_file(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(src.read_bytes())


ORGS: list[tuple[str, str, str, str, str, str]] = []
row_re = re.compile(
    r"'seed:([^']+)','([^']+)','((?:\\'|[^'])*)','((?:\\'|[^'])*)','((?:\\'|[^'])*)','((?:\\'|[^'])*)','((?:\\'|[^'])*)','((?:\\'|[^'])*)'"
)
sql = (ROOT / "migrations" / "0003_hosted_directory.sql").read_text(encoding="utf-8")
for m in row_re.finditer(sql):
    slug, _s, name, tagline, desc, city, country, website = m.groups()
    ORGS.append((slug, name, tagline, desc, city, country))

HEAD = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0b0906">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="index.html"><img src="logo.png" alt=""><span>NEXA <em>FLY</em></span></a>
    <nav class="nav-desktop">
      <a href="associations.html">Associations</a>
      <a href="index.html#swap">Swap</a>
      <a href="nusd.html">nUSD</a>
      <a href="whitepaper.html">Whitepaper</a>
    </nav>
    <div class="header-actions">
      <div class="lang-toggle" role="group">
        <button type="button" data-lang="fr" aria-pressed="true">FR</button>
        <button type="button" data-lang="en" aria-pressed="false">EN</button>
      </div>
      <a class="btn btn-sm" href="index.html#swap" data-fr="Faire un don" data-en="Donate">Faire un don</a>
      <button type="button" class="icon-btn menu-toggle" id="menuToggle" aria-label="Menu">☰</button>
    </div>
  </div>
  <div class="nav-mobile" id="navMobile">
    <a href="associations.html">Associations</a>
    <a href="index.html#swap">Swap</a>
    <a href="nusd.html">nUSD</a>
    <a href="whitepaper.html">Whitepaper</a>
  </div>
</header>
"""

FOOT = """
<footer class="site-footer">
  <div class="wrap">
    <p data-fr="Association loi 1901. Dons transparents, on-chain." data-en="French Law 1901 association. Transparent on-chain gifts.">Association loi 1901. Dons transparents, on-chain.</p>
    <p>contact@nexafly.org · RNA W131019858 · SIREN 101736536</p>
    <p class="small">© Nexa FLY · 175 Cours Gimon, 13300 Salon-de-Provence</p>
    <p class="doc-links">
      <a href="legal/nexafly-association-registration.pdf" target="_blank">Récépissé</a>
      <a href="legal/siren.pdf" target="_blank">SIREN</a>
      <a href="legal/joafe.pdf" target="_blank">JOAFE</a>
      <a href="nexa_whitepaper.pdf" target="_blank">Whitepaper PDF</a>
    </p>
  </div>
</footer>
<script src="app.js"></script>
</body></html>
"""


def page(title: str, desc: str, body: str) -> str:
    return HEAD.format(title=title, desc=desc) + body + FOOT


def logo_for(slug: str) -> str:
    png = PUB / "orgs" / f"{slug}.png"
    if png.exists():
        return f"orgs/{slug}.png"
    return f"orgs/{slug}.svg"


def cards(n: int | None = None) -> str:
    items = ORGS[: n or len(ORGS)]
    html = ['<div class="grid-3">']
    for slug, name, tagline, _d, city, country in items:
        html.append(
            f'<a class="card" href="associations/{slug}.html">'
            f'<img src="{logo_for(slug)}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover">'
            f"<h3>{name}</h3><p>{tagline}</p>"
            f'<p class="small">{city} · {country}</p></a>'
        )
    html.append("</div>")
    return "\n".join(html)


def index() -> str:
    return page(
        "Nexa FLY — dons crypto transparents",
        "Association loi 1901. Dons visibles on-chain sur Solana.",
        f"""
<section class="hero">
  <div class="hero-media">
    <img src="hero.jpg" alt="">
    <div class="hero-shade"></div>
  </div>
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow"><span data-fr="Association loi 1901 · Solana" data-en="Law 1901 association · Solana">Association loi 1901 · Solana</span></p>
      <h1 class="display" data-fr="Chaque don, visible. Pour toujours." data-en="Every gift, visible. Forever.">Chaque don, visible. Pour toujours.</h1>
      <p class="lead">Nexa FLY construit l’infrastructure pour que les dons caritatifs soient traçables, publics, et accessibles partout — sans intermédiaire opaque.</p>
      <div class="cta-row">
        <a class="btn" href="#swap">Faire un don</a>
        <a class="btn btn-ghost" href="associations.html">Associations</a>
      </div>
    </div>
  </div>
</section>
<section class="wrap" id="swap" style="padding:3rem 0">
  <span class="tag">Swap</span>
  <h2 class="display">Acheter FLY, ici.</h2>
  <p class="lead">USDC ou SOL vers FLY. Jupiter ou Titan.</p>
  <div class="cta-row" style="margin-top:1rem">
    <a class="btn" href="https://jup.ag/swap?sell=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&buy={MINT}" target="_blank" rel="noreferrer">Jupiter</a>
    <a class="btn btn-ghost" href="https://titan.exchange/swap?EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v-{MINT}" target="_blank" rel="noreferrer">Titan</a>
  </div>
  <div class="panel" style="margin-top:1.25rem">
    <p class="tag">Wallet de transparence</p>
    <p class="wallet-addr">{WALLET}</p>
    <div class="cta-row">
      <button type="button" class="btn btn-sm" data-copy="{WALLET}">Copier l’adresse</button>
      <a class="btn btn-ghost btn-sm" href="https://solscan.io/account/{WALLET}" target="_blank" rel="noreferrer">Solscan</a>
    </div>
  </div>
</section>
<section class="wrap" style="padding:0 0 4rem">
  <span class="tag">Associations</span>
  <h2 class="display">Les associations du rail.</h2>
  {cards(6)}
  <p style="margin-top:1.25rem"><a class="btn btn-ghost" href="associations.html">Tout le répertoire</a></p>
</section>
""",
    )


def associations() -> str:
    return page(
        "Associations — Nexa FLY",
        "Répertoire des associations hébergées par Nexa FLY.",
        f"""
<section class="page-hero wrap">
  <span class="tag">Répertoire</span>
  <h1 class="display">Les associations du rail.</h1>
  <p class="lead">Tant qu’une association n’a pas revendiqué son wallet, les dons transitent par la trésorerie Nexa FLY.</p>
  {cards()}
</section>
""",
    )


def org_page(slug: str, name: str, tagline: str, desc: str, city: str, country: str) -> str:
    logo = "../" + logo_for(slug)
    body = f"""
<section class="page-hero wrap">
  <img src="{logo}" alt="" style="width:72px;height:72px;border-radius:12px;object-fit:cover">
  <p class="small">{city} · {country}</p>
  <h1 class="display">{name}</h1>
  <p class="lead">{tagline}</p>
  <p class="lead">{desc}</p>
  <div class="panel" style="margin-top:1.25rem">
    <p class="tag">Wallet Nexa FLY</p>
    <p class="wallet-addr">{WALLET}</p>
    <div class="cta-row">
      <button type="button" class="btn btn-sm" data-copy="{WALLET}">Copier</button>
      <a class="btn" href="https://jup.ag/swap?sell=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&buy={MINT}" target="_blank" rel="noreferrer">Swap USDC → FLY</a>
    </div>
  </div>
  <p style="margin-top:1.5rem"><a href="../associations.html">← Répertoire</a></p>
</section>
"""
    html = page(f"{name} — Nexa FLY", tagline, body)
    return (
        html.replace('href="styles.css"', 'href="../styles.css"')
        .replace('href="favicon.svg"', 'href="../favicon.svg"')
        .replace('href="index.html"', 'href="../index.html"')
        .replace('src="logo.png"', 'src="../logo.png"')
        .replace('href="associations.html"', 'href="../associations.html"')
        .replace('href="nusd.html"', 'href="../nusd.html"')
        .replace('href="whitepaper.html"', 'href="../whitepaper.html"')
        .replace('src="app.js"', 'src="../app.js"')
        .replace('href="legal/', 'href="../legal/')
        .replace('href="nexa_whitepaper.pdf"', 'href="../nexa_whitepaper.pdf"')
    )


def nusd() -> str:
    return page(
        "nUSD — Nexa FLY",
        "Nexa USD, stable interne adossé 1:1 à l’USDC.",
        f"""
<section class="page-hero wrap">
  <span class="tag">Stable interne · 1:1 USDC</span>
  <h1 class="display">nUSD, le dollar du rail FLY.</h1>
  <p class="lead">Nexa USD est le jeton stable interne. Dons, pools, trésorerie — parité visée 1:1 avec l’USDC.</p>
  <img src="nusd.png" alt="nUSD" style="width:140px;height:140px;border-radius:50%;margin:1.25rem 0">
  <div class="grid-3">
    <div class="card"><h3>Parité</h3><p>1 nUSD ≈ 1 USDC</p></div>
    <div class="card"><h3>Réseau</h3><p>Solana SPL</p></div>
    <div class="card"><h3>Émetteur</h3><p>Nexa FLY</p></div>
  </div>
  <div class="panel" style="margin-top:1rem">
    <p class="tag">Contrat</p>
    <p class="wallet-addr">{NUSD}</p>
    <div class="cta-row">
      <button type="button" class="btn btn-sm" data-copy="{NUSD}">Copier</button>
      <a class="btn" href="https://jup.ag/swap?sell=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&buy={NUSD}" target="_blank" rel="noreferrer">Swap USDC → nUSD</a>
      <a class="btn btn-ghost" href="https://solscan.io/token/{NUSD}" target="_blank" rel="noreferrer">Solscan</a>
    </div>
  </div>
</section>
""",
    )


def whitepaper() -> str:
    return page(
        "Whitepaper — Nexa FLY",
        "Document fondateur de l’association Nexa FLY.",
        """
<section class="page-hero wrap">
  <span class="tag">Document fondateur</span>
  <h1 class="display">Whitepaper Nexa (FLY)</h1>
  <p class="lead">Mission, utilité du token, nUSD, tokenomics, feuille de route.</p>
  <a class="btn" href="nexa_whitepaper.pdf" download="nexa_whitepaper.pdf">Télécharger le PDF</a>
</section>
""",
    )


def espace() -> str:
    return page(
        "Espace association — Nexa FLY",
        "Ouvrir l’espace de votre organisation.",
        f"""
<section class="page-hero wrap">
  <span class="tag">Espace association</span>
  <h1 class="display">Ouvrir l’espace de votre organisation.</h1>
  <p class="lead">Un nom, une ville, un wallet. En attendant, les dons arrivent sur le wallet Nexa FLY.</p>
  <div class="panel">
    <p class="tag">Wallet actuel</p>
    <p class="wallet-addr">{WALLET}</p>
  </div>
  <p style="margin-top:1rem"><a href="mailto:contact@nexafly.org">contact@nexafly.org</a></p>
</section>
""",
    )


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT, ignore_errors=True)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "associations").mkdir()
    (OUT / "legal").mkdir()
    (OUT / "orgs").mkdir()

    copy_file(ROOT / "scripts" / "drop-site.css", OUT / "styles.css")
    copy_file(ROOT / "scripts" / "drop-site.js", OUT / "app.js")

    for name in (
        "logo.png",
        "nusd.png",
        "favicon.svg",
        "og.jpg",
        "hero.jpg",
        "hero.mp4",
        "glass.jpg",
        "nexa_whitepaper.pdf",
    ):
        src = PUB / name
        if src.exists():
            copy_file(src, OUT / name)

    legal = PUB / "legal"
    if legal.exists():
        for f in legal.iterdir():
            if f.is_file():
                copy_file(f, OUT / "legal" / f.name)

    orgs = PUB / "orgs"
    if orgs.exists():
        for f in orgs.iterdir():
            if f.suffix.lower() in {".png", ".svg", ".jpg", ".webp"}:
                copy_file(f, OUT / "orgs" / f.name)

    (OUT / "index.html").write_text(index(), encoding="utf-8")
    (OUT / "associations.html").write_text(associations(), encoding="utf-8")
    (OUT / "nusd.html").write_text(nusd(), encoding="utf-8")
    (OUT / "whitepaper.html").write_text(whitepaper(), encoding="utf-8")
    (OUT / "espace.html").write_text(espace(), encoding="utf-8")
    for slug, name, tagline, desc, city, country in ORGS:
        (OUT / "associations" / f"{slug}.html").write_text(
            org_page(slug, name, tagline, desc, city, country), encoding="utf-8"
        )

    (OUT / "_redirects").write_text(
        "/nusd            /nusd.html            200\n"
        "/whitepaper      /whitepaper.html      200\n"
        "/associations    /associations.html    200\n"
        "/espace          /espace.html          200\n"
        "/whitepaper.pdf  /nexa_whitepaper.pdf  200\n",
        encoding="utf-8",
    )
    (OUT / "_headers").write_text(
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n",
        encoding="utf-8",
    )
    (OUT / "LIREZ-MOI.txt").write_text(
        "Nexa FLY — dossier Cloudflare Pages\n"
        "===================================\n\n"
        "1. Decompressez ce zip.\n"
        "2. Ouvrez le dossier nexa-static : vous devez voir index.html.\n"
        "3. Cloudflare → Workers & Pages → Create → Pages → Upload assets.\n"
        "4. Glissez CE dossier (celui qui contient index.html).\n"
        "   Pas le projet complet. Pas src, pas package.json.\n\n"
        "Si Cloudflare dit « TypeScript files were found »,\n"
        "vous n’avez pas glissé le bon dossier.\n",
        encoding="utf-8",
    )

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with ZipFile(ZIP_PATH, "w", ZIP_DEFLATED) as z:
        for f in OUT.rglob("*"):
            if f.is_file():
                z.write(f, f.relative_to(OUT.parent))
    names = ZipFile(ZIP_PATH).namelist()
    print("zip files", len(names))
    print("css", any(n.endswith("styles.css") for n in names))
    print("js", any(n.endswith("app.js") for n in names))
    print("logo", any(n.endswith("logo.png") for n in names))
    print("index", any(n.endswith("index.html") for n in names))
    print("size", ZIP_PATH.stat().st_size)


if __name__ == "__main__":
    main()
