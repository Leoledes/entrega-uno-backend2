import BaseRepository from './baseRepository.js';
import productModel from '../dao/models/productModel.js';

class ProductRepository extends BaseRepository {
    constructor() {
        super(productModel);
    }

    async getProductsPaginated(page = 1, limit = 10, query = {}, sort = {}) {
        try {
            const skip = (page - 1) * limit;
            
            const products = await this.model
                .find(query)
                .limit(limit)
                .skip(skip)
                .sort(sort);
            
            const total = await this.model.countDocuments(query);
            
            return {
                products,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalProducts: total
            };
        } catch (error) {
            throw new Error(`Error al obtener productos paginados: ${error.message}`);
        }
    }

    async getProductByCode(code) {
        try {
            const product = await this.model.findOne({ code });
            return product;
        } catch (error) {
            throw new Error(`Error al buscar producto por código: ${error.message}`);
        }
    }

    async codeExists(code) {
        try {
            return await this.exists({ code });
        } catch (error) {
            throw new Error(`Error al verificar código: ${error.message}`);
        }
    }

    async getProductsByCategory(category, options = {}) {
        try {
            const products = await this.getAll({ category }, options);
            return products;
        } catch (error) {
            throw new Error(`Error al obtener productos por categoría: ${error.message}`);
        }
    }

    async getProductsInStock(minStock = 1) {
        try {
            const products = await this.model.find({ 
                stock: { $gte: minStock },
                status: true
            });
            return products;
        } catch (error) {
            throw new Error(`Error al obtener productos en stock: ${error.message}`);
        }
    }

    async updateStock(productId, quantity) {
        try {
            const product = await this.model.findByIdAndUpdate(
                productId,
                { $inc: { stock: quantity } },
                { new: true }
            );
            return product;
        } catch (error) {
            throw new Error(`Error al actualizar stock: ${error.message}`);
        }
    }

    async checkStock(productId, quantity) {
        try {
            const product = await this.model.findById(productId);
            if (!product) {
                return { available: false, message: 'Producto no encontrado' };
            }
            
            if (product.stock >= quantity) {
                return { available: true, currentStock: product.stock };
            }
            
            return { 
                available: false, 
                currentStock: product.stock,
                message: `Stock insuficiente. Disponible: ${product.stock}` 
            };
        } catch (error) {
            throw new Error(`Error al verificar stock: ${error.message}`);
        }
    }

    async getProductsByOwner(ownerId) {
        try {
            const products = await this.model.find({ owner: ownerId });
            return products;
        } catch (error) {
            throw new Error(`Error al obtener productos por owner: ${error.message}`);
        }
    }
}

export default new ProductRepository();