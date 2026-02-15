import cartRepository from '../repositories/cartRepository.js';
import productRepository from '../repositories/productRepository.js';
import ticketRepository from '../repositories/ticketRepository.js';
import userRepository from '../repositories/userRepository.js';
import { createTicketDTO } from '../dto/ticketDTO.js';
import { createProductDTO } from '../dto/productDTO.js';

class PurchaseService {

    async processPurchase(cartId, userId) {
        try {
            const cart = await cartRepository.getCartWithProducts(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            if (!cart.products || cart.products.length === 0) {
                throw new Error('El carrito está vacío');
            }

            const user = await userRepository.getById(userId);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const { available, unavailable } = await this.verifyStockForPurchase(cart.products);

            if (available.length === 0) {
                return {
                    success: false,
                    message: 'No hay productos disponibles para comprar',
                    unavailableProducts: unavailable.map(item => ({
                        product: createProductDTO(item.product),
                        requestedQuantity: item.requestedQuantity,
                        availableStock: item.availableStock
                    }))
                };
            }

            const totalAmount = available.reduce((sum, item) => {
                return sum + (item.product.price * item.quantity);
            }, 0);

            const productsForTicket = available.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            }));

            const ticket = await ticketRepository.createPurchaseTicket(
                user.email,
                productsForTicket,
                totalAmount
            );

            await this.updateStockAfterPurchase(available);

            await this.removeProductsFromCart(cartId, available);

            const fullTicket = await ticketRepository.getById(ticket._id, 'products.product');

            return {
                success: true,
                message: unavailable.length > 0 
                    ? 'Compra procesada parcialmente. Algunos productos no tenían stock suficiente.'
                    : 'Compra procesada exitosamente',
                ticket: createTicketDTO(fullTicket),
                purchasedProducts: available.map(item => ({
                    product: createProductDTO(item.product),
                    quantity: item.quantity,
                    price: item.product.price,
                    subtotal: item.product.price * item.quantity
                })),
                unavailableProducts: unavailable.map(item => ({
                    product: createProductDTO(item.product),
                    requestedQuantity: item.requestedQuantity,
                    availableStock: item.availableStock
                })),
                totalAmount,
                totalItems: available.reduce((sum, item) => sum + item.quantity, 0)
            };

        } catch (error) {
            throw new Error(`Error al procesar compra: ${error.message}`);
        }
    }

    async verifyStockForPurchase(cartProducts) {
        const available = [];
        const unavailable = [];

        for (const item of cartProducts) {
            const product = item.product;
            const requestedQuantity = item.quantity;

            const stockCheck = await productRepository.checkStock(
                product._id,
                requestedQuantity
            );

            if (stockCheck.available) {
                available.push({
                    product: product,
                    quantity: requestedQuantity
                });
            } else {
                unavailable.push({
                    product: product,
                    requestedQuantity: requestedQuantity,
                    availableStock: stockCheck.currentStock
                });
            }
        }

        return { available, unavailable };
    }

    async updateStockAfterPurchase(purchasedProducts) {
        try {
            const updatePromises = purchasedProducts.map(item => {
                return productRepository.updateStock(
                    item.product._id,
                    -item.quantity
                );
            });

            await Promise.all(updatePromises);
        } catch (error) {
            throw new Error(`Error al actualizar stock: ${error.message}`);
        }
    }

    async removeProductsFromCart(cartId, purchasedProducts) {
        try {
            for (const item of purchasedProducts) {
                await cartRepository.removeProductFromCart(
                    cartId,
                    item.product._id
                );
            }
        } catch (error) {
            throw new Error(`Error al actualizar carrito: ${error.message}`);
        }
    }

    async getUserTickets(email) {
        try {
            const tickets = await ticketRepository.getTicketsByPurchaser(email);
            return tickets.map(ticket => createTicketDTO(ticket));
        } catch (error) {
            throw new Error(`Error al obtener tickets: ${error.message}`);
        }
    }

    async getTicketByCode(code) {
        try {
            const ticket = await ticketRepository.getTicketByCode(code);
            if (!ticket) {
                throw new Error('Ticket no encontrado');
            }
            return createTicketDTO(ticket);
        } catch (error) {
            throw new Error(`Error al obtener ticket: ${error.message}`);
        }
    }

    async getTicketById(ticketId) {
        try {
            const ticket = await ticketRepository.getById(ticketId, 'products.product');
            if (!ticket) {
                throw new Error('Ticket no encontrado');
            }
            return createTicketDTO(ticket);
        } catch (error) {
            throw new Error(`Error al obtener ticket: ${error.message}`);
        }
    }

    async getSalesStatistics(startDate = null, endDate = null) {
        try {
            let query = {};

            if (startDate && endDate) {
                query.purchase_datetime = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const stats = await ticketRepository.calculateTotalSales(query);

            return {
                totalSales: stats.total,
                totalOrders: stats.count,
                averageOrderValue: stats.count > 0 ? stats.total / stats.count : 0
            };
        } catch (error) {
            throw new Error(`Error al calcular estadísticas: ${error.message}`);
        }
    }
}

export default new PurchaseService();