import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import msgTranslation from "./routes/msgTranslation.js";
import passport from 'passport';
import session from "express-session";
import { User } from './models/userModel.js';
import { accessTokenOptions, generateAccessAndRefreshTokens, refreshTokenOptions } from './controllers/userControllers.js';
import pkg from "passport-google-oauth20";

dotenv.config({ path: './.env' });

export const app = express();



const { Strategy: GoogleStrategy } = pkg;

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({extended: true}));


const allowedOrigins = ['http://localhost:5173', 'http://localhost:8000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/', (req, res) => {
  res.send('Chat application MERN and Socket.io');
});

app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/group', groupRoutes);
app.use('/translate', msgTranslation);



app.set('trust proxy', 1);
app.use(
  session({
    secret: "chatappMern-backend-session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, 
      sameSite: "none", 
      httpOnly: true, // Helps prevent cross-site scripting attacks
    },
    proxy: true, // Required for cookies to work behind proxies like Vercel
  })
);

// Passport middleware setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        console.log("user from google", user);

        if (!user) {
          user = new User({
            firstname: profile.displayName,
            email: profile.emails[0].value,
          });

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        req.user._id
      );

      console.log("req user at tokens", req.user);
      // Set cookies
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);
      res.cookie("accessToken", accessToken, accessTokenOptions);

      res.redirect("http://localhost:5173");
    } catch (error) {
      console.error("Error generating tokens:", error);
      res.status(500).send("Failed to generate tokens.");
    }
  }
);

