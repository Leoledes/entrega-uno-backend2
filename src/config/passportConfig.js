import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userModel from '../dao/models/userModel.js';

const JWT_SECRET = 'coderSecretKey123';

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['coderCookieToken'];
    }
    return token;
};

const initializePassport = () => {
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: JWT_SECRET
    };

    passport.use('current', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = await userModel.findById(jwt_payload.id).populate('cart');
            
            if (!user) return done(null, false);

            const userDTO = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                cart: user.cart
            };
            
            return done(null, userDTO);
        } catch (error) {
            return done(error, false);
        }
    }));
};

export default initializePassport;
export { JWT_SECRET };