import { Router } from 'express';
import passport from 'passport';
import authService from '../services/authService.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const user = await authService.register(req.body);
        
        res.status(201).json({ 
            status: 'success', 
            message: 'Usuario registrado exitosamente',
            user
        });
    } catch (error) {
        res.status(400).json({ 
            status: 'error', 
            message: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        res.cookie('token', result.token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ 
            status: 'success', 
            message: 'Login exitoso',
            user: result.user,
            token: result.token
        });
    } catch (error) {
        res.status(401).json({ 
            status: 'error', 
            message: error.message
        });
    }
});

router.get('/current', 
    passport.authenticate('current', { session: false }), 
    (req, res) => {
        res.json({ 
            status: 'success', 
            user: req.user 
        });
    }
);

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ 
        status: 'success', 
        message: 'Logout exitoso' 
    });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'El email es requerido'
            });
        }

        const result = await authService.requestPasswordReset(email);

        res.json({
            status: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const result = await authService.verifyResetToken(token);

        if (!result.valid) {
            return res.status(400).json({
                status: 'error',
                message: result.message
            });
        }

        res.json({
            status: 'success',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Token y nueva contraseña son requeridos'
            });
        }

        if (newPassword.length < 4) {
            return res.status(400).json({
                status: 'error',
                message: 'La contraseña debe tener al menos 4 caracteres'
            });
        }

        const result = await authService.resetPassword(token, newPassword);

        res.json({
            status: 'success',
            ...result
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

export default router;