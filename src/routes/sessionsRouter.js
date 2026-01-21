import { Router } from 'express';
import userModel from '../dao/models/userModel.js';
import cartModel from '../dao/models/cartModel.js'; 
import { createHash, isValidPassword } from '../utils.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { JWT_SECRET } from '../config/passportConfig.js';

const router = Router();

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) return res.status(400).send({ error: "User already exists" });

        const newCart = await cartModel.create({});

        const user = await userModel.create({
            first_name, last_name, email, age,
            password: createHash(password),
            cart: newCart._id,
            role: 'user'
        });

        res.send({ status: "success", message: "User registered" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user || !isValidPassword(user, password)) {
        return res.status(401).send({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('coderCookieToken', token, { httpOnly: true })
       .send({ status: "success", message: "Logged in" });
});

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
    res.send({ status: "success", payload: req.user });
});

export default router;