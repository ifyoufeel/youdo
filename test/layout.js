/* Layout check. The jsdom suites drive behaviour and copy but do no layout, so
   they cannot see a button pushed off the edge of its slab — which is exactly
   what review caught twice. This one runs the real page in Chromium and
   measures, so the next one fails here instead.

   Needs a server on the preview folder and a Chromium binary:
     cd preview && python3 -m http.server 8732
     YOUDO_URL=http://127.0.0.1:8732/index.html node layout.js
   Point CHROMIUM at a binary if Playwright's own download is missing. */
const path = require("path");

const URL = process.env.YOUDO_URL || "http://127.0.0.1:8732/index.html";
const EXE = process.env.CHROMIUM || "/opt/pw-browsers/chromium";

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (cond) console.log("  ok   " + name);
  else { console.log("  FAIL " + name + (extra ? " :: " + extra : "")); fails++; }
}

(async () => {
  const { chromium } = require("playwright");
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({
    executablePath: EXE,
    proxy: proxy ? { server: proxy, bypass: "127.0.0.1,localhost" } : undefined,
    args: ["--ignore-certificate-errors"]
  });
  /* Wide viewport so the frame renders at its real 390px phone width rather
     than going full-bleed under the 620px media query. */
  const page = await browser.newPage({ viewport: { width: 1180, height: 1150 }, ignoreHTTPSErrors: true });
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  /* Anything laid out in a row inside the phone: does any child cross the
     right edge of its parent's content box? */
  async function overflows() {
    return page.evaluate(() => {
      const frame = document.querySelector(".frame");
      if (!frame) return [{ why: "no frame" }];
      const bad = [];
      for (const parent of frame.querySelectorAll("*")) {
        const cs = getComputedStyle(parent);
        if (cs.display !== "flex" || cs.flexDirection === "column") continue;
        if (cs.overflowX === "auto" || cs.overflowX === "scroll") continue;
        const pr = parent.getBoundingClientRect();
        const padR = parseFloat(cs.paddingRight) || 0;
        const padL = parseFloat(cs.paddingLeft) || 0;
        const limitR = pr.right - padR + 1;
        const limitL = pr.left + padL - 1;
        for (const child of parent.children) {
          const ccs = getComputedStyle(child);
          /* Badges and the like are positioned deliberately outside their
             parent's box; only in-flow children can be "pushed off". A
             transform (the rating star's tilt) likewise moves the painted box
             on purpose and is not a layout overflow. */
          if (ccs.position === "absolute" || ccs.position === "fixed") continue;
          if (ccs.transform && ccs.transform !== "none") continue;
          const cr = child.getBoundingClientRect();
          if (cr.width === 0) continue;
          if (cr.right > limitR || cr.left < limitL) {
            bad.push({
              text: (child.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
              over: +Math.max(cr.right - limitR, limitL - cr.left).toFixed(2),
              child: child.tagName + (child.className ? "." + String(child.className).split(" ")[0] : ""),
              parent: parent.tagName + (parent.className ? "." + String(parent.className).split(" ")[0] : ""),
              childStyle: (child.getAttribute("style") || "").slice(0, 120)
            });
          }
        }
      }
      return bad;
    });
  }
  async function check(name) {
    await page.waitForTimeout(350);
    const bad = await overflows();
    ok(name, bad.length === 0,
       bad.map((b) => `${b.child} in ${b.parent} over by ${b.over}px — "${b.text}" [${b.childStyle}]`).join("\n         "));
  }
  const tap = async (sel) => { await page.locator(sel).first().click({ force: true }); await page.waitForTimeout(350); };
  const tapText = async (t, exact) => {
    await page.getByText(t, { exact: !!exact }).first().click({ force: true });
    await page.waitForTimeout(350);
  };
  const tapBtn = async (n) => {
    await page.getByRole("button", { name: n, exact: true }).first().click({ force: true });
    await page.waitForTimeout(350);
  };

  console.log("== screens ==");
  await check("browse feed");
  await tapText("Help carry a sofa");
  await check("quest detail — visitor, two-button slab");
  await tapBtn("Take this quest");
  await check("offer sheet");
  await tapBtn("Cancel");
  await tap("[aria-label='My quests']");
  await check("my quests");
  await tapText("Water my plants");
  await check("quest detail — poster, confirm window");
  await tapBtn("Issue");
  await check("dispute sheet");
  await tapBtn("Back");
  await tap("[aria-label='Back']");
  await tap("[aria-label='My quests']");
  await tapText("Drop two bags");
  await check("quest detail — poster, open");
  await tapText("Review 3 offers");
  await check("offer inbox");
  await tapBtn("Accept offer");
  await check("accept sheet");
  await tapBtn("Back");
  await tap("[aria-label='Post']");
  await check("wizard — step 1");
  await page.getByPlaceholder("Walk my dog for an hour").fill("Clear a storage unit");
  await tapBtn("Keep going");
  await check("wizard — step 2");
  await tap("[aria-label='Profile']");
  await check("profile");
  await tapBtn("Add money");
  await check("deposit sheet");
  await tapBtn("Cancel");
  await tap("[aria-label='Settings']");
  await check("settings sheet");
  await tapBtn("Done");
  await tap("[aria-label='Chats']");
  await check("chats");

  console.log("\nbrowser errors:", errs.length ? errs.join("; ") : "none");
  console.log("\n" + checks + " checks, " + fails + " failed");
  await browser.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
