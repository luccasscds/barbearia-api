import express from 'express';
import { clientController } from './controllers/clientController/client.controller';

const routes = express.Router();

// get
routes.get("/", async (_, res) => res.send('Bem vindo :)') );
routes.get("/client/:id", clientController.get);

// insert
routes.post("/new/client", clientController.create);

// update
routes.put("/update/client", clientController.update);

// delete
routes.delete("/delete/client/:id", clientController.delete);

export { routes };