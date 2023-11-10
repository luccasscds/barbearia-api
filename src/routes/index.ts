import express from 'express';
import { clientController } from './controllers/clientController/client.controller';

const routes = express.Router();

routes.get("/", async (_, res) => res.send('Bem vindo :)') );

routes.get("/client/:id", clientController.get);
routes.post("/client", clientController.create);
routes.put("/client", clientController.update);
routes.delete("/client/:id", clientController.delete);

export { routes };