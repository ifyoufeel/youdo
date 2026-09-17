/* Boots the published preview inside jsdom so the prototype can be driven the
   way a reviewer drives it: by clicking things. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const DIR = process.env.YOUDO_DIR || path.join(__dirname, "..", "preview");

function boot() {
  const dom = new JSDOM(
    "<!doctype html><html><head></head><body><div id='root'></div></body></html>",
    { runScripts: "outside-only", pretendToBeVisual: true, url: "https://example.test/" }
  );
  const w = dom.window;

  global.window = w;
  global.document = w.document;
  global.navigator = w.navigator;
  global.HTMLElement = w.HTMLElement;
  global.Element = w.Element;
  global.Node = w.Node;
  global.getComputedStyle = w.getComputedStyle;
  global.requestAnimationFrame = w.requestAnimationFrame || ((cb) => setTimeout(cb, 0));
  global.cancelAnimationFrame = w.cancelAnimationFrame || clearTimeout;
  global.IS_REACT_ACT_ENVIRONMENT = true;

  const React = require("react");
  const ReactDOMClient = require("react-dom/client");
  const act = React.act || require("react-dom/test-utils").act;

  w.React = React;
  /* app.js mounts itself on load; stub that out so the harness owns the root
     and every update can be wrapped in act(). */
  w.ReactDOM = { createRoot: function () { return { render: function () {}, unmount: function () {} }; } };
  w.IS_REACT_ACT_ENVIRONMENT = true;

  const errors = [];
  const origError = console.error;
  console.error = function (...args) {
    const msg = args.map(String).join(" ");
    errors.push(msg);
    if (process.env.YOUDO_VERBOSE) origError.apply(console, args);
  };

  for (const f of ["ds-bundle.js", "icon-names.js", "data.taiwan.js", "app.js"]) {
    w.eval(fs.readFileSync(path.join(DIR, f), "utf8"));
  }

  const dsErrors = (w.YouDODesignSystem_ea424c && w.YouDODesignSystem_ea424c.__errors) || [];
  return { w, act, errors, dsErrors, root: w.document.getElementById("root") };
}

/* ---- querying helpers: find things the way a person would ---- */
const text = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();

function all(root, sel) {
  return Array.from(root.querySelectorAll(sel));
}
function buttons(root) {
  return all(root, "button, [role=button], [role=tab]");
}
function byText(root, label, sel) {
  const want = String(label).toLowerCase();
  return buttons(root)
    .filter((b) => (sel ? b.matches(sel) : true))
    .find((b) => text(b).toLowerCase() === want);
}
function containingText(root, label) {
  const want = String(label).toLowerCase();
  return buttons(root).find((b) => text(b).toLowerCase().includes(want));
}
function byLabel(root, label) {
  return all(root, "[aria-label]").find(
    (b) => (b.getAttribute("aria-label") || "").toLowerCase() === String(label).toLowerCase()
  );
}
/* Not everything clickable is a <button> — a quest card is a Card with an
   onClick. React listens at the root, so clicking the deepest element carrying
   the text bubbles to whatever handler owns it, which is what a tap does. */
function deepest(root, snippet) {
  const want = String(snippet).toLowerCase();
  const hits = all(root, "*").filter((e) => text(e).toLowerCase().includes(want));
  return hits.length ? hits[hits.length - 1] : null;
}

function has(root, snippet) {
  return text(root).toLowerCase().includes(String(snippet).toLowerCase());
}

/* React installs its own value setter on inputs, so a plain .value assignment
   is invisible to it — go through the prototype setter and fire the event. */
function type(el, value) {
  const proto = el.tagName === "TEXTAREA"
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
}
function choose(el, value) {
  Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(el, value);
  el.dispatchEvent(new window.Event("change", { bubbles: true }));
}
/* Fields are found by their visible label, the way a person finds them. */
function field(root, label) {
  const want = String(label).toLowerCase();
  for (const wrap of all(root, "div")) {
    const lab = wrap.querySelector(":scope > label, :scope > span");
    if (!lab) continue;
    if (text(lab).toLowerCase().startsWith(want)) {
      const input = wrap.querySelector("input, textarea, select");
      if (input) return input;
    }
  }
  const byPlaceholder = all(root, "input, textarea").find(
    (i) => (i.getAttribute("placeholder") || "").toLowerCase().includes(want));
  return byPlaceholder || null;
}

module.exports = { boot, text, all, buttons, byText, containingText, byLabel, has, type, choose, field, deepest };
