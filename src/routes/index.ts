import express from 'express';
import { clientController } from './controllers/clientController/client.controller';
import { eventController } from './controllers/eventController/event.controller';
import { serviceController } from './controllers/serviceController/service.controller';
import { timetableController } from './controllers/timetableController/timetable.controller';
import { authController } from './controllers/authController';

const routes = express.Router();

routes.get("/", async (_, res) => res.send('Bem vindo :)') );

routes.post("/signIn", authController.signIn);
routes.post("/signUp", authController.signUp);

// routes authorized

routes.get("/authorized/client/list", clientController.getAll);
routes.get("/authorized/client/:id", clientController.get);
routes.post("/authorized/client", clientController.create);
routes.put("/authorized/client", clientController.update);
routes.delete("/authorized/client/:id", clientController.delete);

routes.get("/authorized/event/:date", eventController.get);
routes.get("/authorized/event/client/:id", eventController.getEventByClient);
routes.get("/authorized/event/date/month/:id", eventController.getEventByMonth);
routes.post("/authorized/event", eventController.create);
routes.delete("/authorized/event", eventController.delete);

routes.get("/authorized/service/list", serviceController.getAll);
routes.get("/authorized/service/:id", serviceController.get);
routes.post("/authorized/service", serviceController.create);
routes.put("/authorized/service", serviceController.update);
routes.delete("/authorized/service/:id", serviceController.delete);

routes.get("/authorized/timetable/list", timetableController.getAll);
routes.get("/authorized/timetable/:id", timetableController.get);
routes.put("/authorized/timetable", timetableController.update);

export { routes };