const fs = require("fs");
const path = require("path");
const skip = new Set([".git", "dist", "node_modules", "copy-dist.cjs"]);
function copy(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dest, f));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}
fs.mkdirSync("dist", { recursive: true });
for (const f of fs.readdirSync(".")) {
  if (skip.has(f)) continue;
  copy(f, path.join("dist", f));
}
console.log("copied to dist/");
