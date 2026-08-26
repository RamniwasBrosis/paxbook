// Entry point cPanel's Passenger Node.js app manager expects by convention
// (it looks for app.js in the application root). The real bootstrap logic
// lives in dist/main.js, built by `nest build`.
require("./dist/main.js");
