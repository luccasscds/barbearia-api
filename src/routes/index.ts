import express from 'express';
import { clientController } from './controllers/clientController/client.controller';
import { eventController } from './controllers/eventController/event.controller';
import { serviceController } from './controllers/serviceController/service.controller';
import { timetableController } from './controllers/timetableController/timetable.controller';

const routes = express.Router();

routes.get("/", async (_, res) => res.send('Bem vindo :)') );

routes.get("/client/list", clientController.getAll);
routes.get("/client/:id", clientController.get);
routes.post("/client", clientController.create);
routes.put("/client", clientController.update);
routes.delete("/client/:id", clientController.delete);

routes.get("/event/:date", eventController.get);
routes.post("/event", eventController.create);
routes.delete("/event", eventController.delete);

routes.get("/service/list", serviceController.getAll);
routes.get("/service/:id", serviceController.get);
routes.post("/service", serviceController.create);
routes.put("/service", serviceController.update);
routes.delete("/service/:id", serviceController.delete);

routes.get("/timetable/list", timetableController.getAll);
routes.put("/timetable", timetableController.update);

export { routes };