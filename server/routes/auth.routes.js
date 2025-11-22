import express from 'express';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../config/jwt.js';
import User from '../models/User.js';

const router = express.Router();

// step 1: initiate Google OAuth2 login

router.get("/google",
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

// step 2: handle Google OAuth2 callback

router.get(
    "/google/callback",
    passport.authenticate('google', {failureRedirect: process.env.FRONTEND_URL}),
    async (req, res) => {
        try {
            const user = req.user;
            // generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // store refreshToken in DB
            user.refreshToken.push(refreshToken);
            await user.save();

            // send token as http-only cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure : false,
                sameSite: 'Lax', // lax means cookie sent on same site and cross-site top-level navigation
            });
            
        }
    }
)