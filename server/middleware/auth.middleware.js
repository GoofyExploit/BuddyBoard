import User from '../models/user.model.js';
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

export default requireAuth;