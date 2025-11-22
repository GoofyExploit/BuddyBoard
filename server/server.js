import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import configurePassport from './config/passport.js';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';


dotenv.config();
const app = express();
configurePassport(passport);
connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());


app.use('/api/auth', authRoutes);
app.use(express.json());


app.get("/", (req, res) => {
  res.send("BuddyBoard API is running");
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

