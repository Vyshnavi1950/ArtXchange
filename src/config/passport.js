// src/config/passport.js
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const photo = profile.photos?.[0]?.value;

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email,
            avatar: photo,
            password: "", // social login
          });
          await user.save();
        }

        done(null, user); // this becomes req.user
      } catch (err) {
        done(err, null);
      }
    }
  )
);
