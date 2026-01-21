import { Router } from 'express';
import userModel from '../dao/models/userModel.js';
import cartModel from '../dao/models/cartModel.js';
import { createHash } from '../utils.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        const exists = await userModel.findOne({ email });
        if (exists) return res.status(400).send({ status: "error", error: "El correo ya está registrado" });

        const newCart = await cartModel.create({});

        const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: newCart._id,
            role: 'user'
        };

        const result = await userModel.create(newUser);
        
        res.status(201).send({ status: "success", message: "Usuario creado exitosamente", payload: result._id });

    } catch (error) {
        res.status(500).send({ status: "error", error: "Error al registrar usuario: " + error.message });
    }
});

export default router;