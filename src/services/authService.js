import jwt from 'jsonwebtoken';
import { createHash, isValidPassword } from '../utils/hashPassword.js';
import userRepository from '../repositories/userRepository.js';
import cartRepository from '../repositories/cartRepository.js';
import passwordResetTokenRepository from '../repositories/passwordResetTokenRepository.js';
import emailService from './emailService.js';
import { createUserDTO } from '../dto/userDTO.js';
import config from '../config/envConfig.js';

class AuthService {
    async register(userData) {
        try {
            const { first_name, last_name, email, age, password } = userData;

            if (!first_name || !last_name || !email || !age || !password) {
                throw new Error('Todos los campos son requeridos');
            }

            const emailExists = await userRepository.emailExists(email);
            if (emailExists) {
                throw new Error('El email ya está registrado');
            }

            const newCart = await cartRepository.create({ products: [] });

            const newUser = await userRepository.create({
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: newCart._id,
                role: 'user'
            });

            return createUserDTO(newUser);
        } catch (error) {
            throw new Error(`Error en registro: ${error.message}`);
        }
    }

    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }

            const user = await userRepository.getUserByEmail(email);
            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            const isPasswordValid = isValidPassword(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Credenciales inválidas');
            }

            const token = this.generateToken({
                userId: user._id,
                email: user.email,
                role: user.role
            });

            return {
                user: createUserDTO(user),
                token
            };
        } catch (error) {
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    generateToken(payload) {
        try {
            const token = jwt.sign(
                payload,
                config.jwt.secret,
                { expiresIn: config.jwt.expiration }
            );
            return token;
        } catch (error) {
            throw new Error(`Error al generar token: ${error.message}`);
        }
    }

    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            return decoded;
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    async getCurrentUser(userId) {
        try {
            const user = await userRepository.getUserWithCart(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return createUserDTO(user);
        } catch (error) {
            throw new Error(`Error al obtener usuario actual: ${error.message}`);
        }
    }

    async requestPasswordReset(email) {
        try {
            const user = await userRepository.getUserByEmail(email);
            if (!user) {
                return {
                    message: 'Si el email existe, recibirás un correo de recuperación'
                };
            }

            const resetToken = await passwordResetTokenRepository.createResetToken(user._id);

            await emailService.sendPasswordResetEmail(
                user.email,
                resetToken.token,
                user.first_name
            );

            return {
                message: 'Si el email existe, recibirás un correo de recuperación'
            };
        } catch (error) {
            throw new Error(`Error al solicitar recuperación: ${error.message}`);
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const resetToken = await passwordResetTokenRepository.getValidToken(token);
            
            if (!resetToken) {
                throw new Error('Token inválido o expirado');
            }

            const user = resetToken.userId;

            if (isValidPassword(newPassword, user.password)) {
                throw new Error('La nueva contraseña no puede ser igual a la anterior');
            }

            const hashedPassword = createHash(newPassword);
            await userRepository.updatePassword(user._id, hashedPassword);

            await passwordResetTokenRepository.markAsUsed(resetToken._id);

            await emailService.sendPasswordChangedEmail(
                user.email,
                user.first_name
            );

            return {
                message: 'Contraseña actualizada exitosamente'
            };
        } catch (error) {
            throw new Error(`Error al restablecer contraseña: ${error.message}`);
        }
    }

    async verifyResetToken(token) {
        try {
            const resetToken = await passwordResetTokenRepository.getValidToken(token);
            
            if (!resetToken) {
                return { valid: false, message: 'Token inválido o expirado' };
            }

            return { 
                valid: true, 
                email: resetToken.userId.email,
                expiresAt: resetToken.expiresAt
            };
        } catch (error) {
            throw new Error(`Error al verificar token: ${error.message}`);
        }
    }
}

export default new AuthService();