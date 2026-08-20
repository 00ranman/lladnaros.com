const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2"
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let file = path.join(root, urlPath);

  if (!file.startsWith(root)) {
    res.writeHead(403);
    return res.end("forbidden");
  }

  const ext = path.extname(file);
  if (!ext || urlPath.endsWith("/")) {
    file = path.join(root, "index.html");
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      return fs.readFile(path.join(root, "index.html"), (err2, html) => {
        if (err2) {
          res.writeHead(404);
          return res.end("not found");
        }
        res.writeHead(200, { "Content-Type": types[".html"] });
        res.end(html);
      });
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log("lladnaros carnival on", port);
});
