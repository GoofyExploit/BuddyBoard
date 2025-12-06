import User from '../models/User.js';
import { verifyAccessToken } from '../config/jwt.js';

const requireAuth = async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        // format of req.headers.authorization
        // Bearer <token>
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = verifyAccessToken(token);
        /**
         * decoded = { id: user._id, name: user.name, email: user.email }
         */
        if (!decoded) {
            // decoded is null if token is invalid or expired
            return res.status(401).json({message :"Invalid Token"});
        }

        const user = await User.findById(decoded.id).select('-refreshTokens');
        // exclude refreshToken from user info
        if (!user) {
            return res.status(401).json({message : "User Not Found"});
        }

        req.user = user;
        next();

    }
    catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export { requireAuth };

// access token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjE2MjNlNjEzMTc2ZmE2NTExNWZhMSIsIm5hbWUiOiJQcmFzaGFudCBNYWluaSIsImVtYWlsIjoicHJhc2hhbnRtYWluaTdAZ21haWwuY29tIiwiaWF0IjoxNzY1MDA0MTU2LCJleHAiOjE3NjUwMDc3NTZ9.oke5_44QQUGnZ6ucyqsHVq2n13jxdSmERAABhNWQJAA
// refresh token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjE2MjNlNjEzMTc2ZmE2NTExNWZhMSIsIm5hbWUiOiJQcmFzaGFudCBNYWluaSIsImVtYWlsIjoicHJhc2hhbnRtYWluaTdAZ21haWwuY29tIiwiaWF0IjoxNzY1MDA0MTU2LCJleHAiOjE3NjUwMDc3NTZ9.oke5_44QQUGnZ6ucyqsHVq2n13jxdSmERAABhNWQJAA