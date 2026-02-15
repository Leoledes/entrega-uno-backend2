import BaseRepository from './baseRepository.js';
import ticketModel from '../dao/models/ticketModel.js';

class TicketRepository extends BaseRepository {
    constructor() {
        super(ticketModel);
    }

    generateTicketCode() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `TICKET-${timestamp}-${random}`;
    }

    async createPurchaseTicket(purchaserEmail, products, amount) {
        try {
            const code = this.generateTicketCode();
            
            const ticket = await this.model.create({
                code,
                purchaser: purchaserEmail,
                products,
                amount,
                purchase_datetime: new Date()
            });

            return ticket;
        } catch (error) {
            throw new Error(`Error al crear ticket: ${error.message}`);
        }
    }

    async getTicketsByPurchaser(email) {
        try {
            const tickets = await this.model
                .find({ purchaser: email })
                .populate('products.product')
                .sort({ purchase_datetime: -1 });
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets por comprador: ${error.message}`);
        }
    }

    async getTicketByCode(code) {
        try {
            const ticket = await this.model
                .findOne({ code })
                .populate('products.product');
            return ticket;
        } catch (error) {
            throw new Error(`Error al obtener ticket por código: ${error.message}`);
        }
    }

    async getTicketsByDateRange(startDate, endDate) {
        try {
            const tickets = await this.model
                .find({
                    purchase_datetime: {
                        $gte: startDate,
                        $lte: endDate
                    }
                })
                .populate('products.product');
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets por rango de fechas: ${error.message}`);
        }
    }

    async calculateTotalSales(query = {}) {
        try {
            const result = await this.model.aggregate([
                { $match: query },
                { 
                    $group: { 
                        _id: null, 
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    } 
                }
            ]);

            return result.length > 0 
                ? { total: result[0].total, count: result[0].count }
                : { total: 0, count: 0 };
        } catch (error) {
            throw new Error(`Error al calcular total de ventas: ${error.message}`);
        }
    }
}

export default new TicketRepository();