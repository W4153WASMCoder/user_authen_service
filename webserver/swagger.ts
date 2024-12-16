// swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Users API",
            version: "0.0.1",
            description: "API documentation for User and Active Token models",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                description: "Development server",
            },
            {
                url: `https://localhost:${process.env.PORT}`,
                description: "Secure development server",
            },
        ],
        // components: {
        //     securitySchemes: {
        //         googleOAuth: {
        //             type: "oauth2",
        //             flows: {
        //                 authorizationCode: {
        //                     authorizationUrl: `https://accounts.google.com/o/oauth2/auth`,
        //                     tokenUrl: `https://oauth2.googleapis.com/token`,
        //                     scopes: {
        //                         "https://www.googleapis.com/auth/userinfo.profile":
        //                             "Access your profile",
        //                         "https://www.googleapis.com/auth/userinfo.email":
        //                             "Access your email",
        //                     },
        //                 },
        //             },
        //         },
        //     },
        // },
        // security: [
        //     {
        //         googleOAuth: [],
        //     },
        // ],
    },
    apis: ["./routes/*.ts"], // Path to your route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
