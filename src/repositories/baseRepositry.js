class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const document = await this.model.create(data);
            return document;
        } catch (error) {
            throw new Error(`Error al crear documento: ${error.message}`);
        }
    }

    async getAll(query = {}, options = {}) {
        try {
            const { limit, skip, sort, populate } = options;
            
            let queryBuilder = this.model.find(query);
            
            if (limit) queryBuilder = queryBuilder.limit(limit);
            if (skip) queryBuilder = queryBuilder.skip(skip);
            if (sort) queryBuilder = queryBuilder.sort(sort);
            if (populate) queryBuilder = queryBuilder.populate(populate);
            
            const documents = await queryBuilder;
            return documents;
        } catch (error) {
            throw new Error(`Error al obtener documentos: ${error.message}`);
        }
    }

    async getById(id, populate = null) {
        try {
            let query = this.model.findById(id);
            
            if (populate) {
                query = query.populate(populate);
            }
            
            const document = await query;
            return document;
        } catch (error) {
            throw new Error(`Error al obtener documento por ID: ${error.message}`);
        }
    }

    async getOne(query, populate = null) {
        try {
            let queryBuilder = this.model.findOne(query);
            
            if (populate) {
                queryBuilder = queryBuilder.populate(populate);
            }
            
            const document = await queryBuilder;
            return document;
        } catch (error) {
            throw new Error(`Error al obtener documento: ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            const document = await this.model.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );
            return document;
        } catch (error) {
            throw new Error(`Error al actualizar documento: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const document = await this.model.findByIdAndDelete(id);
            return document;
        } catch (error) {
            throw new Error(`Error al eliminar documento: ${error.message}`);
        }
    }

    async count(query = {}) {
        try {
            const count = await this.model.countDocuments(query);
            return count;
        } catch (error) {
            throw new Error(`Error al contar documentos: ${error.message}`);
        }
    }

    async exists(query) {
        try {
            const document = await this.model.findOne(query);
            return !!document;
        } catch (error) {
            throw new Error(`Error al verificar existencia: ${error.message}`);
        }
    }
}

export default BaseRepository;