// Server lokal sederhana untuk menjalankan website dan endpoint API.
const http = require("http");
const fs = require("fs");
const path = require("path");
const searchHandler = require("./api/search");

const root = __dirname;
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript; charset=utf-8",".json":"application/json; charset=utf-8"};

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/search") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try { req.body = JSON.parse(body || "{}"); }
      catch { req.body = {}; }
      res.status = code => { res.statusCode = code; return res; };
      res.json = data => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); };
      await searchHandler(req, res);
    });
    return;
  }

  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(root, requested);
  if (!filePath.startsWith(root + path.sep)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, {"Content-Type": mime[path.extname(filePath)] || "application/octet-stream"});
    res.end(data);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`NEXURA berjalan di http://localhost:${port}`));
