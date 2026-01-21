import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { userModel } from '../models/userModel.js';

const JWT_SECRET = 'coderSecretKey123'; 

const initializePassport = () => {
    
    const cookieExtractor = (req) => {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['coderCookieToken']; 
        }
        return token;
    };

    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: JWT_SECRET
    };

    passport.use('jwt', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = await userModel.findById(jwt_payload.id); 
            
            if (!user) {
                return done(null, false);
            }

            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }));

    passport.use('current', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = await userModel.findById(jwt_payload.id).populate('cart');
            
            if (!user) {
                return done(null, false);
            }

            const userDTO = {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                cart: user.cart,
                role: user.role
            };
            
            return done(null, userDTO);
            
        } catch (error) {
            return done(error, false);
        }
    }));
};

export default initializePassport;