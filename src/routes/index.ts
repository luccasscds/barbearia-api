import express from 'express';
import multer from 'multer';
import { clientController } from './controllers/clientController/client.controller';
import { eventController } from './controllers/eventController/event.controller';
import { serviceController } from './controllers/serviceController/service.controller';
import { timetableController } from './controllers/timetableController/timetable.controller';
import { authController } from './controllers/authController';
import { tagsController } from './controllers/tagsController/tagsController';
import { configAgendaController } from './controllers/configAgendaController/configAgendaController';
import { companyController } from './controllers/companyController/companyController';
import { paymentMethodController } from './controllers/paymentMethodController/paymentMethodController';
import { financeController } from './controllers/financeController/financeController';
import { categoryController } from './controllers/categoryController/categoryController';
import { holidaysController } from './controllers/holidaysController/holidaysController';
import { employeeController } from './controllers/employeeController/employeeController';

const upload = multer({ dest: 'uploads/' });
const routes = express.Router();

// routes no authorized

routes.get("/", async (_, res) => res.send('Bem vindo :)') );

routes.post("/signIn", authController.clientSignIn);
routes.post("/signUp", authController.clientSignUp);
routes.post("/googleSignIn", authController.googleSignIn);
routes.post("/company/signIn", authController.companySignIn);
routes.post("/company/signUp", authController.companySignUp);

routes.post("/forgotPassword", authController.forgotPassword);
routes.post("/createPassword", authController.createPassword);


// routes authorized

// Client
routes.get("/authorized/client/list/:id", clientController.getAll);
routes.post("/authorized/client/list/blocked", clientController.getBlockedOrNo);
routes.get("/authorized/client/:id", clientController.get);
routes.post("/authorized/client", clientController.create);
routes.put("/authorized/client", clientController.update);
routes.delete("/authorized/client", clientController.delete);
routes.post("/authorized/client/missing", clientController.missing);
routes.post("/authorized/client/birthday", clientController.birthday);

// Event
routes.post("/authorized/event/date", eventController.get);
routes.post("/authorized/event/client", eventController.getEventByClient);
routes.post("/authorized/event/date/month", eventController.getEventByMonth);
routes.post("/authorized/event", eventController.create);
routes.put("/authorized/event", eventController.update);
routes.delete("/authorized/event/in", eventController.deleteIn);

// Service
routes.get("/authorized/service/list/:id", serviceController.getAll);
routes.get("/authorized/service/list/active/:id", serviceController.getAllActive);
routes.post("/authorized/service/get", serviceController.get);
routes.post("/authorized/service", serviceController.create);
routes.put("/authorized/service", serviceController.update);
routes.delete("/authorized/service", serviceController.delete);

// Category
routes.get("/authorized/category/list/:id", categoryController.getAll);
routes.post("/authorized/category", categoryController.create);
routes.put("/authorized/category", categoryController.update);
routes.delete("/authorized/category", categoryController.delete);

// timetable
routes.get("/authorized/timetable/list/:id", timetableController.getAll);
routes.post("/authorized/timetable", timetableController.get);
routes.post("/authorized/timetable/create", timetableController.create);
routes.put("/authorized/timetable", timetableController.update);
routes.post("/authorized/timetable/employee", timetableController.getTimetableEmployee);
routes.post("/authorized/timetable/employee/active", timetableController.getActiveOrInactive);
routes.post("/authorized/timetable/employee/day", timetableController.getByDayTimetableEmployee);
routes.post("/authorized/timetable/employee/create", timetableController.createTimetableEmployee);
routes.put("/authorized/timetable/employee", timetableController.updateTimetableEmployee);

// Tags
routes.get("/authorized/tag/list", tagsController.getAll);

// ConfigAgenda
routes.get("/authorized/config/agenda/list/:id", configAgendaController.getAll);
routes.post("/authorized/config/agenda/get", configAgendaController.get);
routes.put("/authorized/config/agenda", configAgendaController.update);
routes.post("/authorized/config/agenda", configAgendaController.create);

// Company
routes.get("/authorized/company/:id", companyController.get);
routes.put("/authorized/company", upload.single('photo'), companyController.update);

// Payment Method
routes.get("/authorized/paymentMethod/list", paymentMethodController.getALl);

// Finances
routes.post("/authorized/finance/performance", financeController.performance);
routes.post("/authorized/finance/resume", financeController.resume);
routes.post("/authorized/finance/cashFlow", financeController.cashFlow);
routes.post("/authorized/finance/cashFlow/details", financeController.detailsCashFlow);
routes.post("/authorized/finance/revenue", financeController.revenue);
routes.post("/authorized/finance/best/clients", financeController.bestClients);

// holidays
routes.get("/authorized/holidays", holidaysController.get);

// Employee
routes.post("/authorized/employee/get", employeeController.get);
routes.post("/authorized/employee/get/company", employeeController.getByCompany);
routes.post("/authorized/employee/get/permissions/default", employeeController.getPermissionsByDefault);
routes.post("/authorized/employee/get/permissions", employeeController.getPermissions);
routes.post("/authorized/employee", employeeController.create);
routes.put("/authorized/employee", employeeController.update);
routes.delete("/authorized/employee", employeeController.delete);
routes.post("/authorized/employee/get/service", employeeController.getService);
routes.post("/authorized/employee/service", employeeController.createService);

export { routes };