import { Router } from 'express';
import cartService from '../services/cartService.js';
import purchaseService from '../services/purchaseService.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const cart = await cartService.createCart();

        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente',
            cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

router.get('/:cid', 
    isAuthenticated,
    async (req, res) => {
        try {
            const cart = await cartService.getCartById(req.params.cid);

            res.json({
                status: 'success',
                cart
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.post('/:cid/products/:pid',
    isAuthenticated,
    authorize([ROLES.USER, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const { quantity = 1 } = req.body;
            const userCartId = req.user.cart ? req.user.cart.toString() : null;
            if (userCartId !== req.params.cid) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No puedes modificar el carrito de otro usuario'
                });
            }

            const cart = await cartService.addProductToCart(
                req.params.cid,
                req.params.pid,
                quantity
            );

            res.json({
                status: 'success',
                message: 'Producto agregado al carrito',
                cart
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.put('/:cid/products/:pid',
    isAuthenticated,
    authorize([ROLES.USER, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const { quantity } = req.body;

            if (quantity === undefined || quantity < 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'La cantidad debe ser un número positivo'
                });
            }

            const userCartId = req.user.cart ? req.user.cart.toString() : null;
            if (userCartId !== req.params.cid) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No puedes modificar el carrito de otro usuario'
                });
            }

            const cart = await cartService.updateProductQuantity(
                req.params.cid,
                req.params.pid,
                quantity
            );

            res.json({
                status: 'success',
                message: 'Cantidad actualizada',
                cart
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.delete('/:cid/products/:pid',
    isAuthenticated,
    authorize([ROLES.USER, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const userCartId = req.user.cart ? req.user.cart.toString() : null;
            if (userCartId !== req.params.cid) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No puedes modificar el carrito de otro usuario'
                });
            }

            const cart = await cartService.removeProductFromCart(
                req.params.cid,
                req.params.pid
            );

            res.json({
                status: 'success',
                message: 'Producto eliminado del carrito',
                cart
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.delete('/:cid',
    isAuthenticated,
    authorize([ROLES.USER, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const userCartId = req.user.cart ? req.user.cart.toString() : null;
            if (userCartId !== req.params.cid) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No puedes modificar el carrito de otro usuario'
                });
            }

            const cart = await cartService.clearCart(req.params.cid);

            res.json({
                status: 'success',
                message: 'Carrito vaciado',
                cart
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.post('/:cid/purchase',
    isAuthenticated,
    authorize([ROLES.USER, ROLES.PREMIUM]),
    async (req, res) => {
        try {
            const userCartId = req.user.cart ? req.user.cart.toString() : null;
            if (userCartId !== req.params.cid) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No puedes finalizar la compra de un carrito que no te pertenece'
                });
            }

            const result = await purchaseService.processPurchase(
                req.params.cid,
                req.user._id
            );

            if (!result.success) {
                return res.status(400).json({
                    status: 'error',
                    message: result.message,
                    unavailableProducts: result.unavailableProducts
                });
            }
            const statusCode = result.unavailableProducts.length > 0 ? 207 : 200;
            
            res.status(statusCode).json({
                status: 'success',
                message: result.message,
                ticket: result.ticket,
                purchasedProducts: result.purchasedProducts,
                unavailableProducts: result.unavailableProducts,
                summary: {
                    totalAmount: result.totalAmount,
                    totalItems: result.totalItems,
                    purchasedCount: result.purchasedProducts.length,
                    unavailableCount: result.unavailableProducts.length
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