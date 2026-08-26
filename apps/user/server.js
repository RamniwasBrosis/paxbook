// Entry point for cPanel's Passenger Node.js app manager, which sets
// process.env.PORT and expects a plain Node script (not an npm script) to
// listen on it. `next start` alone doesn't work under Passenger's model.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3001;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Paxbook user site listening on port ${port}`);
  });
});
