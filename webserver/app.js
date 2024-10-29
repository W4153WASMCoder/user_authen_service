"use strict";
// Import necessary modules with types
var dotenv_1 = require("dotenv");
var express_1 = require("express");
var http_1 = require("http");
var router_js_1 = require("./routes/router.js");
// Load environment variables from .env file
dotenv_1.default.config();
// Express app instantiation
var app = (0, express_1.default)();
// Instantiate handlers for http and https
var httpServer = http_1.default.createServer(app);
//const httpsServer = https.createServer(credentials, app);
//Middleware Definition 
app.use(express_1.default.static('../'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
(0, router_js_1.generate_router)(app);
//End Middleware definition
//Start Server
console.log("Starting up server on ports: " + process.env.PORT + ", " + process.env.PORTSSL);
httpServer.listen(process.env.PORT, function () { return console.log('Server started listening on port: ' + process.env.PORT); });
//httpsServer.listen(process.env.PORTSSL,() => console.log('Server started listening on port: '+process.env.PORTSSL)); 
