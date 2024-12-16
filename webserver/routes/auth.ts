import { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiates Google OAuth flow
 *     tags:
 *       - Authentication
 *     security:
 *       - googleOAuth: []
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth login page.
 */
router.get(
    "/google",
    (req, res, next) => {
        console.log("Generated Google OAuth URL:", req.originalUrl);
        next();
    },
    passport.authenticate("google", {
        scope: ["email", "profile"],
        prompt: "select_account",
    }),
);
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handles Google OAuth callback
 *     tags:
 *       - Authentication
 *     security:
 *       - googleOAuth: []
 *     responses:
 *       302:
 *         description: Redirects to the home page upon successful login.
 *       401:
 *         description: Unauthorized if login fails.
 */
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        console.log("Authenticated user:", req.user);
        res.redirect(process.env.REACT_APP_PROJECT_FILES_ENDPOINT || "/");
    },
);

export default router;
