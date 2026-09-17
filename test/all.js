const { execFileSync } = require("child_process");
let bad = 0;
for (const t of ["smoke", "lifecycle", "screens", "rules", "ledger"]) {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [t + ".js"], { cwd: __dirname, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = 1; }
  const m = out.match(/(\d+) checks, (\d+) failed/);
  const summary = m ? m[1] + " checks, " + m[2] + " failed" :
    /no violations found/.test(out) ? "no violations" : "see output";
  console.log((code ? "FAIL " : "PASS ") + t.padEnd(10) + " " + summary);
  if (code) { bad++; console.log(out.split("\n").filter((l) => /FAIL|\[/.test(l)).slice(0, 10).map((l) => "     " + l).join("\n")); }
}
process.exit(bad ? 1 : 0);
