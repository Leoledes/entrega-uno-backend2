import { createProductDTO } from './productDTO.js';

class TicketDTO {
    constructor(ticket) {
        this.id = ticket._id;
        this.code = ticket.code;
        this.purchaseDateTime = ticket.purchase_datetime;
        this.amount = ticket.amount;
        this.purchaser = ticket.purchaser;

        this.products = ticket.products ? ticket.products.map(item => {
            return {
                product: item.product ? createProductDTO(item.product) : null,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            };
        }) : [];

        this.totalItems = this.products.reduce((sum, item) => sum + item.quantity, 0);
        this.createdAt = ticket.createdAt;
    }
}

export const createTicketDTO = (ticket) => {
    if (!ticket) return null;
    return new TicketDTO(ticket);
};

export const createTicketDTOArray = (tickets) => {
    if (!tickets || !Array.isArray(tickets)) return [];
    return tickets.map(ticket => new TicketDTO(ticket));
};

export default TicketDTO;