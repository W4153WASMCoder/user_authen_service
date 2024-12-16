import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "./models/user_models.js";

import dotenv from "dotenv";
dotenv.config();

// declare global {
//     namespace Express {
//         interface User extends AppUser {} // Extend Express.User with your User class
//     }
// }

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_REDIRECT_URI!,
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log("Access Token:", accessToken);
            console.log("Refresh Token:", refreshToken);
            console.log("Profile Data:", profile);
            try {
                const user = await User.findOrCreateByGoogleId(
                    profile.id,
                    profile,
                );
                console.log("User returned from findOrCreateByGoogleId:", user); // Debugging line
                done(null, user);
            } catch (error) {
                console.error("Error in Google Strategy:", error);
                done(error, undefined);
            }
        },
    ),
);

passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user); // Debugging line
    if (!user.UserID) {
        return done(new Error("UserID is null"), null);
    }
    done(null, user.UserID);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await User.findById(id);
        console.log("Deserializing user:", user); // Debugging line
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
