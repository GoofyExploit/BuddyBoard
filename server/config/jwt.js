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
    } catch (error) {
        return null;
    }
};

const verifyRefreshToken = (token) => { 
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
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
