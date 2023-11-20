import express from 'express';
const server = express();
import { port } from '../config.json';
import { routes } from './routes';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const PORT = process.env.PORT ?? port;

server.use(cors())
server.use(express.json());
server.use(routes);
server.listen(PORT);

console.log(`Server running on port ${PORT}`);