import { Router } from 'express';
import purchaseService from '../services/purchaseService.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/',
    isAuthenticated,
    async (req, res) => {
        try {
            const tickets = await purchaseService.getUserTickets(req.user.email);

            res.json({
                status: 'success',
                tickets,
                count: tickets.length
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.get('/:tid',
    isAuthenticated,
    async (req, res) => {
        try {
            const ticket = await purchaseService.getTicketById(req.params.tid);

            if (req.user.role !== ROLES.ADMIN && ticket.purchaser !== req.user.email) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver este ticket'
                });
            }

            res.json({
                status: 'success',
                ticket
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.get('/code/:code',
    isAuthenticated,
    async (req, res) => {
        try {
            const ticket = await purchaseService.getTicketByCode(req.params.code);
            if (req.user.role !== ROLES.ADMIN && ticket.purchaser !== req.user.email) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permisos para ver este ticket'
                });
            }

            res.json({
                status: 'success',
                ticket
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.get('/stats/sales',
    isAuthenticated,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const stats = await purchaseService.getSalesStatistics(
                startDate,
                endDate
            );

            res.json({
                status: 'success',
                statistics: stats,
                period: {
                    startDate: startDate || 'Desde el inicio',
                    endDate: endDate || 'Hasta ahora'
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

export default router;