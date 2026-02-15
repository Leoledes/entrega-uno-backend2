import BaseRepository from './baseRepository.js';
import passwordResetTokenModel from '../dao/models/passwordResetTokenModel.js';
import crypto from 'crypto';

class PasswordResetTokenRepository extends BaseRepository {
    constructor() {
        super(passwordResetTokenModel);
    }

    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    async createResetToken(userId) {
        try {
            await this.model.deleteMany({ userId, used: false });

            const token = this.generateToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            const resetToken = await this.model.create({
                userId,
                token,
                expiresAt,
                used: false
            });

            return resetToken;
        } catch (error) {
            throw new Error(`Error al crear token de recuperación: ${error.message}`);
        }
    }

    async getValidToken(token) {
        try {
            const resetToken = await this.model.findOne({
                token,
                used: false,
                expiresAt: { $gt: new Date() }
            }).populate('userId');

            return resetToken;
        } catch (error) {
            throw new Error(`Error al obtener token: ${error.message}`);
        }
    }

    async markAsUsed(tokenId) {
        try {
            const token = await this.model.findByIdAndUpdate(
                tokenId,
                { used: true },
                { new: true }
            );
            return token;
        } catch (error) {
            throw new Error(`Error al marcar token como usado: ${error.message}`);
        }
    }

    async deleteExpiredTokens(userId) {
        try {
            await this.model.deleteMany({
                userId,
                $or: [
                    { expiresAt: { $lt: new Date() } },
                    { used: true }
                ]
            });
        } catch (error) {
            throw new Error(`Error al eliminar tokens expirados: ${error.message}`);
        }
    }
}

export default new PasswordResetTokenRepository();