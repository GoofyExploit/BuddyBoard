import express from 'express';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../config/jwt.js';
import User from '../models/User.js';

const router = express.Router();

// initiate Google OAuth2 login

router.get("/google",
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        session: false
    })
);

// handle Google OAuth2 callback

router.get(
    "/google/callback",
    passport.authenticate('google', {failureRedirect: process.env.FRONTEND_URL, session: false}),
    async (req, res) => {
        try {
            const user = req.user;
            // generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // store refreshToken in DB
            user.refreshTokens = user.refreshTokens || [];
            user.refreshTokens.push(refreshToken);
            await user.save();

            // send token as http-only cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure : false,
                sameSite: 'Lax', // lax means cookie sent on same site and cross-site top-level navigation
            });
            res.cookie('refreshToken', refreshToken , {
                httpOnly: true,
                secure : false,
                sameSite: 'Lax',
            })

            res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
            
        }
        catch (error) {
            console.error("Error during Google OAuth callback:", error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
        }
    }
);

/**
 * Route to get current logged in user's info
 */

router.get("/me", async(req,res)=>{
    try {
        const token = req.cookies.accessToken;
        // if empty token
        if (!token) {
            return res.status(401).json({message: "Unauthorized"});
        }
        const decoded = verifyAccessToken(token);
        /**
         * decoded = { id: user._id, name: user.name, email: user.email }
         */
        if (!decoded) {
            // invalid token
            return res.status(401).json({message: "Unauthorized"});
        }

        const user = await User.findById(decoded.id).select('-refreshTokens');
        // exclude refreshToken from user info
        return res.status(200).json(user);
    }
    catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).json({message: "Server error"});
    }
});

// route to handle token refresh
router.post("/refresh", async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({message: "Unauthorized"});
        }

        const decoded = verifyRefreshToken(refreshToken);
        /**
         * decoded = { id: user._id }
         */
        if (!decoded) {
            return res.status(401).json({message: "Unauthorized"});
        }
        const user = await User.findOne(
            {
                _id: decoded.id,
                refreshTokens: refreshToken
                
            }
            // check for existence of refreshToken in user's refreshTokens array
        );

        if (!user) {
            return res.status(401).json({message: "refresh token not authorized"});
        }

        // generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshTokens = user.refreshTokens.filter((token) => {
            return token !== refreshToken
        });
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        // send new tokens as http-only cookies
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure : false,
            sameSite: 'Lax',
        });
        res.cookie('refreshToken', newRefreshToken , {
            httpOnly: true,
            secure : false,
            sameSite: 'Lax',
        });

        return res.status(200).json({message: "Tokens refreshed successfully"});

    }
    catch (error) {
        console.error("Error refreshing tokens:", error);
        return res.status(500).json({message: "Server error"});
    }

});

router.post("/logout", async(req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({message: "Bad Request"});
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(400).json({message: "Bad Request"});
        }

        await User.updateOne({
            _id : decoded.id,
            refreshTokens : refreshToken
        },
        {
            $pull: { refreshTokens: refreshToken }
            // remove the refreshToken from user's refreshTokens array
        });

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({message: "Logged out successfully"});
    }
    catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({message: "Server error"});
    }
});

export default router;