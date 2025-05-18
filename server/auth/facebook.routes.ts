import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Replace with your Facebook App credentials and callback URL
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID";
const FACEBOOK_APP_SECRET =
  process.env.FACEBOOK_APP_SECRET || "YOUR_FACEBOOK_APP_SECRET";
const FACEBOOK_CALLBACK_URL =
  process.env.FACEBOOK_CALLBACK_URL ||
  "http://localhost:3001/api/auth/facebook/callback";

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user in your DB
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Facebook profile"));
        }
        let user = await storage.getUserByEmail(email);
        if (!user) {
          user = await storage.createUser({
            username: email.split("@")[0],
            email,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            role: "creator",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect or respond as needed
    res.redirect("/");
  }
);

export default router;
