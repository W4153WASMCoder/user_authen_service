// Common Express libs
import * as dotenv from "dotenv";
import express from "express";
import type { Application } from "express";
import session from "express-session";
import http, { Server as HttpServer } from "http";
import fs from "fs";
import cors from "cors";

// for users microservice
import users_router from "./routes/users.js";
import user_tokens_router from "./routes/user_tokens.js";
import auth_router from "./routes/auth.js";

// For OpenAPI
import swagger from "./swagger.js";
import type { Express } from "express";

// Middleware
import { log_init, log_close } from "./middleware/logger.js";

// Passport
import passport from "./passport.js";

// Load environment variables from .env file
dotenv.config();

// Express app instantiation
const app: Application = express();

// Instantiate handlers for http and https
const httpServer: HttpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

declare module "express-serve-static-core" {
    interface Request {
        uid?: string;
    }
}

//Middleware Definition
app.use(log_init);
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: "*",
    }),
);
app.use(express.static("./static"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// session support
app.use(
    session({
        secret: process.env.SESSION_SECRET || "defaultSecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Set to true in production (requires HTTPS)
            maxAge: 1000 * 60 * 60, // 1 hour
        },
    }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// for users microservice
app.use("/users", users_router);
app.use("/user_tokens", user_tokens_router);
app.use("/auth", auth_router);
swagger(app as Express);
app.use(log_close);
// End Middleware definition

// Start Server
console.log(
    "Starting up server on ports: " +
    process.env.PORT +
    ", " +
    process.env.PORTSSL,
);
httpServer.listen(process.env.PORT, () =>
    console.log("Server started listening on port: " + process.env.PORT),
);
// httpsServer.listen(process.env.PORTSSL,() => console.log('Server started listening on port: '+process.env.PORTSSL));
