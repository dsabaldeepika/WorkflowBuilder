import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Router } from "express";
import { storage } from "../storage";

const router = Router();

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET";
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3001/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
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
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

export default router;
