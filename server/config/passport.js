import passport from 'passport';
import {Stratergy as GoogleStrategy} from 'passport-google-oauth20';
import User from '../models/User.js';

const  configurePassport = ()=>  {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_REDIRECT_URI,
            },
            // verifying callback function
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const googleId = profile.id;
                    const name = profile.displayName;
                    const email = profile.emails[0].value;
                    const photo = profile.photos[0].value;

                    let user = await User.findOne({googleId});

                    if (!user) {
                        // create new user
                        user = await User.create({
                            googleId,
                            name,
                            email,
                            photo,
                        });
                    }
                    return done(null, user); // user found or created
                }
                catch (error) {
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
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // serializeUser determines which data of the user object should be stored in the session.
    // deserializeUser is used to retrieve the user object from the session data.
    return passport;
}

export default configurePassport;

/*
    request send to Google to exchange authorization code for access token
    POST https://oauth2.googleapis.com/token
        -     code=ABC123
        -     client_id=...
        -     client_secret=...
        -     redirect_uri=...
        -     grant_type=authorization_code

    Google responds with access token
    {
        "access_token": "ya29.A0AR...",
        "refresh_token": "1//0gunRZ...",
        "token_type": "Bearer",
        "expires_in": 3600,
        "scope": "profile email"
    }
    verifying callback function
    This function is called after obtaining the access token
    It retrieves user profile information from Google
    and either creates a new user in our database or retrieves an existing one

    structure of 'profile' object:
    {
        id: '117654987654321098765',
        displayName: 'Prashant Maini',
        name: { familyName: 'Maini', givenName: 'Prashant' },
        emails: [
            { value: 'mainiprashant3@gmail.com', verified: true }
        ],
        photos: [
            { value: 'https://lh3.googleusercontent.com/a/XYZ123456=s96-c' }
        ],
        provider: 'google',
        _raw: '{ ...raw JSON from Google... }',
        _json: {
            sub: '117654987654321098765',
            name: 'Prashant Maini',
            given_name: 'Prashant',
            family_name: 'Maini',
            picture: 'https://lh3.googleusercontent.com/a/XYZ123456=s96-c',
            email: 'mainiprashant3@gmail.com',
            email_verified: true,
            locale: 'en'
        }
    }
*/