/* Does it mount at all, and does every gallery view render? */
const H = require("./env");
const { w, act, errors, dsErrors, root } = H.boot();

let fails = 0;
function check(name, fn) {
  try {
    const r = fn();
    if (r === false) throw new Error("returned false");
    console.log("  ok   " + name);
  } catch (e) {
    console.log("  FAIL " + name + " :: " + e.message);
    fails++;
  }
}

console.log("design-system bundle errors:", dsErrors.length ? dsErrors : "none");

const ReactDOMClient = require("react-dom/client");
const r = ReactDOMClient.createRoot(root);
act(() => { r.render(w.React.createElement(w.eval("App"))); });

console.log("\n-- mount --");
check("root has content", () => root.innerHTML.length > 2000);
check("wordmark renders", () => H.has(root, "YouDO"));
/* q1 is in progress, so it is correctly absent from a feed of open quests. */
check("browse feed renders open quests", () => H.has(root, "Assemble a wardrobe"));
check("feed excludes quests that aren't open", () => !H.has(root, "Walk Biscuit"));
check("preview rail renders", () => H.has(root, "Viewing as"));
check("tab bar renders", () => !!H.byLabel(root, "My quests"));

console.log("\n-- gallery views --");
for (const view of ["Flows", "Components", "Tokens", "States", "Prototype"]) {
  check("view: " + view, () => {
    const tab = H.byText(root, view);
    if (!tab) throw new Error("tab not found");
    act(() => { tab.click(); });
    return root.innerHTML.length > 1000;
  });
}

const real = errors.filter((e) => !/not wrapped in act|useLayoutEffect does nothing on the server/.test(e));
console.log("\nconsole.error during run:", real.length ? "\n  " + real.join("\n  ") : "none");
console.log(fails || real.length ? "\nRESULT: problems found" : "\nRESULT: clean");
process.exit(fails || real.length ? 1 : 0);
