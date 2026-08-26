// Entry point for cPanel's Passenger Node.js app manager, which sets
// process.env.PORT and expects a plain Node script (not an npm script) to
// listen on it. `next start` alone doesn't work under Passenger's model.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

// The reverse proxy in front of this process (Apache's mod_rewrite) lowercases
// percent-encoded escapes (%5B -> %5b) while relaying the request, but Next's
// static asset manifest for bracketed dynamic-route chunks (e.g.
// app/(dashboard)/customers/[id]/page-*.js) is keyed on the uppercase form the
// browser originally generated. Re-uppercase escapes before Next ever sees the
// URL so lookups match regardless of what the proxy did to the casing.
function normalizeEscapeCasing(url) {
  return url.replace(/%[0-9a-fA-F]{2}/g, (m) => m.toUpperCase());
}

app.prepare().then(() => {
  createServer((req, res) => {
    req.url = normalizeEscapeCasing(req.url);
    handle(req, res);
  }).listen(port, () => {
    console.log(`Paxbook admin panel listening on port ${port}`);
  });
});
