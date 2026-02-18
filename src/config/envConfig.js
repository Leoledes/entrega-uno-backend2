import dotenv from 'dotenv';

dotenv.config();

const config = {
    server: {
        port: process.env.PORT || 8080,
        env: process.env.NODE_ENV || 'development'
    },

    mongodb: {
        uri: process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/entrega-final'
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'defaultSecretKey',
        expiration: process.env.JWT_EXPIRATION || '24h'
    },

    cookies: {
        secret: process.env.COOKIE_SECRET || 'defaultCookieSecret'
    },

    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'noreply@ecommerce.com'
    },

    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:8080'
    },

    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
    }
};

const requiredVars = ['JWT_SECRET', 'MONGO_URI', 'MONGO_URL'];
const missing = requiredVars.filter(v => !process.env[v]);

if (!process.env.MONGO_URI && !process.env.MONGO_URL) {
    console.warn('⚠️  Falta variable de base de datos: MONGO_URI o MONGO_URL');
}

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  Falta variable: JWT_SECRET - usando valor por defecto');
}

export default config;