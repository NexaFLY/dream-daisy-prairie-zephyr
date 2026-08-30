import { chromium } from "playwright";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const src = "/workspace/scripts/whitepaper-print.html";
const out = "/workspace/public/nexa_whitepaper.pdf";
const exe =
  "/opt/pw-browsers/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell";

const browser = await chromium.launch({
  executablePath: exe,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.goto(`file://${src}`, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 800));
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});
await browser.close();

const copies = [
  "/workspace/attachments/nexa_whitepaper.pdf",
  "/workspace/artifacts/nexa-fly-drop/nexa_whitepaper.pdf",
];
for (const dest of copies) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(out, dest);
  console.log("copied", dest);
}
console.log("wrote", out);
