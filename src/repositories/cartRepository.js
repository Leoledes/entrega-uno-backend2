import BaseRepository from './baseRepository.js';
import cartModel from '../dao/models/cartModel.js';

class CartRepository extends BaseRepository {
    constructor() {
        super(cartModel);
    }

    async getCartWithProducts(cartId) {
        try {
            const cart = await this.model
                .findById(cartId)
                .populate('products.product');
            return cart;
        } catch (error) {
            throw new Error(`Error al obtener carrito con productos: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await this.model.findById(cartId);
            
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            const existingProductIndex = cart.products.findIndex(
                item => item.product.toString() === productId.toString()
            );

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al agregar producto al carrito: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await this.model.findById(cartId);
            
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId.toString()
            );

            if (productIndex === -1) {
                throw new Error('Producto no encontrado en el carrito');
            }

            if (quantity <= 0) {
                cart.products.splice(productIndex, 1);
            } else {
                cart.products[productIndex].quantity = quantity;
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al actualizar cantidad: ${error.message}`);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await this.model.findById(cartId);
            
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            cart.products = cart.products.filter(
                item => item.product.toString() !== productId.toString()
            );

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await this.model.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            );
            return cart;
        } catch (error) {
            throw new Error(`Error al vaciar carrito: ${error.message}`);
        }
    }

    async calculateCartTotal(cartId) {
        try {
            const cart = await this.getCartWithProducts(cartId);
            
            if (!cart) {
                return { total: 0, items: 0 };
            }

            let total = 0;
            let items = 0;

            cart.products.forEach(item => {
                if (item.product && item.product.price) {
                    total += item.product.price * item.quantity;
                    items += item.quantity;
                }
            });

            return { total, items };
        } catch (error) {
            throw new Error(`Error al calcular total del carrito: ${error.message}`);
        }
    }

    async isProductInCart(cartId, productId) {
        try {
            const cart = await this.model.findById(cartId);
            
            if (!cart) {
                return false;
            }

            return cart.products.some(
                item => item.product.toString() === productId.toString()
            );
        } catch (error) {
            throw new Error(`Error al verificar producto en carrito: ${error.message}`);
        }
    }
}

export default new CartRepository();