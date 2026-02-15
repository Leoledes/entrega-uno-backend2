import BaseRepository from './baseRepository.js';
import userModel from '../dao/models/userModel.js';

class UserRepository extends BaseRepository {
    constructor() {
        super(userModel);
    }

    async getUserByEmail(email) {
        try {
            const user = await this.model.findOne({ email }).populate('cart');
            return user;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    async createUserWithCart(userData, cartId = null) {
        try {
            const newUser = await this.model.create({
                ...userData,
                cart: cartId
            });
            return newUser;
        } catch (error) {
            throw new Error(`Error al crear usuario con carrito: ${error.message}`);
        }
    }

    async emailExists(email) {
        try {
            return await this.exists({ email });
        } catch (error) {
            throw new Error(`Error al verificar email: ${error.message}`);
        }
    }

    async getUserWithCart(userId) {
        try {
            const user = await this.model
                .findById(userId)
                .populate({
                    path: 'cart',
                    populate: {
                        path: 'products.product'
                    }
                });
            return user;
        } catch (error) {
            throw new Error(`Error al obtener usuario con carrito: ${error.message}`);
        }
    }

    async updateUserCart(userId, cartId) {
        try {
            const user = await this.model.findByIdAndUpdate(
                userId,
                { cart: cartId },
                { new: true }
            );
            return user;
        } catch (error) {
            throw new Error(`Error al actualizar carrito del usuario: ${error.message}`);
        }
    }

    async getUsersByRole(role) {
        try {
            const users = await this.model.find({ role });
            return users;
        } catch (error) {
            throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
        }
    }

    async updatePassword(userId, hashedPassword) {
        try {
            const user = await this.model.findByIdAndUpdate(
                userId,
                { password: hashedPassword },
                { new: true }
            );
            return user;
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }
}

export default new UserRepository();