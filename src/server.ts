import express from 'express';
const server = express();
import { port } from '../config.json';
import { routes } from './routes';
import dotenv from 'dotenv';
import cors from 'cors';
import { authMiddleware } from './routes/controllers/middlewares/authMiddleware';
import { name, version } from '../package.json';

dotenv.config();
const PORT = process.env.PORT ?? port;

server.use(cors())
server.use(express.json());
server.use('/authorized/', authMiddleware);
server.use(routes);
server.listen(PORT);

// https://patorjk.com/software/taag/#p=testall&f=Bloody&t=ls
console.log(`

▄█          ▄████████ 
███         ███    ███ 
███         ███    █▀  
███         ███        
███       ▀███████████ 
███                ███ 
███▌    ▄    ▄█    ███ 
█████▄▄██  ▄████████▀  
▀                      

${name} v${version}

Server running on port ${PORT}
`);