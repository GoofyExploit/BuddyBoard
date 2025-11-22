import jwt from 'jsonwebtoken';

// accesstoken generation
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id : user._id,
            name : user.name,
            email : user.email
        },
        process.env.JWT_SECRET,
        {expiresIn: '1h'} // access token valid for 1 hour

    );
};

// refreshtoken generation
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id : user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {expiresIn: '7d'} // refresh token valid for 7 days

    );
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
        /**
         * return payload
         * { 
         *   id : user._id,
         *   name : user.name,
         *   email : user.email
         * }
         */
    } catch (error) {
        return null;
    }
};

const verifyRefreshToken = (token) => { 
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        /**
         * return payload
         * { 
         *   id : user._id,
         * }
         */
    } catch (error) {
        return null;
    }
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};

/**
 * jwt  = header.payload.signature
 * header = {alg: "HS256", typ: "JWT"}
 * payload = {id: user._id, name: user.name, email: user.email}
 * signature = HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
 */
