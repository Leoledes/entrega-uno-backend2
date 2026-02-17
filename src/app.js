import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import config from './config/envConfig.js';
import initializePassport from './config/passportConfig.js';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionRouter from './routes/sessionRouter.js';
import ticketRouter from './routes/ticketRouter.js';

const app = express();

mongoose.connect(config.mongodb.uri)
    .then(() => console.log("✅ Conectado con éxito a MongoDB Atlas"))
    .catch(error => console.error("❌ Error al conectar a la base de datos:", error));

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser(config.cookies.secret));

initializePassport();
app.use(passport.initialize());

app.use('/api/sessions', sessionRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/tickets', ticketRouter);
app.use('/', viewsRouter);

const PORT = config.server.port;
const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    console.log(`🌍 Ambiente: ${config.server.env}`);
});

const io = new Server(httpServer);
websocket(io);