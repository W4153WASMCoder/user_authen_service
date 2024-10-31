// Import necessary modules with types
// Common Express libs
import * as dotenv from "dotenv";
import express from "express";
import type { Application } from "express";
import http, { Server as HttpServer } from "http";
import fs from "fs";

// for users microservice
import users_router from "./routes/users.js";
import user_tokens_router from "./routes/user_tokens.js";

// For OpenAPI
import swagger from "./swagger.js";
import type { Express } from "express";

// Middleware
import { log_init, log_close } from "./middleware/logger.js";

// Load environment variables from .env file
dotenv.config();

// Express app instantiation
const app: Application = express();

// Instantiate handlers for http and https
const httpServer: HttpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

//Middleware Definition
app.use(log_init);
app.use(express.static("./static"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// for users microservice
app.use("/users", users_router);
app.use("/user_tokens", user_tokens_router);
swagger(app as Express);
app.use(log_close);
//End Middleware definition

//Start Server
console.log(
    "Starting up server on ports: " +
        process.env.PORT +
        ", " +
        process.env.PORTSSL,
);
httpServer.listen(process.env.PORT, () =>
    console.log("Server started listening on port: " + process.env.PORT),
);
//httpsServer.listen(process.env.PORTSSL,() => console.log('Server started listening on port: '+process.env.PORTSSL));
