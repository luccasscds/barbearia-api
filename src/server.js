"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_express2 = __toESM(require("express"));

// config.json
var port = 3e3;

// src/routes/index.ts
var import_express = __toESM(require("express"));

// src/db/clientDB.ts
var import_zod = require("zod");

// src/db/createConnection.ts
var import_promise = __toESM(require("mysql2/promise"));
async function createConnection() {
  if (!process.env.DATABASE_URL) {
    const message = "n\xE3o est\xE1 configurado a vari\xE1vel DATABASE_URL.";
    console.error(message);
    throw message;
  }
  ;
  return await import_promise.default.createConnection(process.env.DATABASE_URL);
}

// src/db/clientDB.ts
var clientDB = {
  async getAll() {
    try {
      const db = await createConnection();
      const sql = `select codClient, nameClient, emailClient, numberPhone
                        from Client where isADM = false;`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
  },
  async get(id) {
    try {
      const db = await createConnection();
      const sql = `   select codClient, nameClient, emailClient, numberPhone
                            from Client where codClient = ?;`;
      const [result] = await db.query(sql, [id]);
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
  },
  async getByEmail(email) {
    try {
      const EmailSchema = import_zod.z.string({
        required_error: "Campo Email n\xE3o pode ser vazio"
      }).email("Email inv\xE1lido");
      EmailSchema.parse(email);
      const db = await createConnection();
      const sql = `select codClient, nameClient, passwordClient, isADM
                            from Client where emailClient = ?;`;
      const [result] = await db.query(sql, [email]);
      db.end();
      return result.length ? result[0] : null;
    } catch (error) {
      const errorZod = error;
      if (errorZod?.issues.length)
        error = errorZod.issues[0];
      throw error;
    }
  },
  async new(newClient) {
    try {
      const { email, name, password, isADM, numberPhone } = newClient;
      const db = await createConnection();
      const sql = `INSERT INTO Client 
                            (nameClient, emailClient, passwordClient, isADM, numberPhone) 
                        VALUES 
                            (?, ?, ?, ?, ?);
            `;
      const [result] = await db.query(sql, [name, email, password ?? "", isADM ?? false, numberPhone ?? ""]);
      db.commit();
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
    ;
  },
  async update(id, name, email) {
    try {
      const db = await createConnection();
      const sql = `   UPDATE Client SET 
                            nameClient = ?,
                            emailClient = ?
                            WHERE codClient = ?;`;
      const [result] = await db.query(sql, [name, email, id]);
      db.commit();
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
    ;
  },
  async delete(id) {
    try {
      const db = await createConnection();
      const sql = `DELETE FROM Client WHERE codClient = ?;`;
      const [result] = await db.query(sql, [id]);
      db.commit();
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
    ;
  }
};

// src/routes/controllers/clientController/client.controller.ts
var clientController = {
  async getAll(req, res) {
    const response = await clientDB.getAll();
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async get(req, res) {
    const { id } = req.params;
    const response = await clientDB.get(Number(id));
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async create(req, res) {
    const { name, email, numberPhone } = req.body;
    const response = await clientDB.new({
      name,
      email,
      numberPhone
    });
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(201).json({
      id: response.insertId,
      message: "Registro criado"
    });
  },
  async update(req, res) {
    const { id, name, email } = req.body;
    const response = await clientDB.update(id, name, email);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
  },
  async delete(req, res) {
    const { id } = req.params;
    const response = await clientDB.delete(Number(id));
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
  }
};

// src/db/eventDB.ts
var eventDB = {
  async getEvent(date) {
    try {
      const db = await createConnection();
      const sql = `select 
                            distinct vl.dateVirtual, vl.startTime, vl.endTime, vl.codStatus,
                            (select name from Status where codStatus = vl.codStatus) status,
                            (
                                select GROUP_CONCAT(v.codVirtual) from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                                and v.endTime = vl.endTime
                            ) codVirtual,
                            (select c.codClient from Client c where c.codClient = vl.codClient) codClient,
                            (select c.nameClient from Client c where c.codClient = vl.codClient) nameClient,
                            (select c.numberPhone from Client c where c.codClient = vl.codClient) numberPhone,
                            (
                                select GROUP_CONCAT(codService) from Service where codService in (
                                    select v.codService
                                    from VirtualLine v
                                    where v.codClient = vl.codClient
                                    and v.dateVirtual = vl.dateVirtual
                                    and v.startTime = vl.startTime
                                )
                            ) codServices,
                            (
                                select GROUP_CONCAT(nameService) from Service where codService in (
                                    select v.codService
                                    from VirtualLine v
                                    where v.codClient = vl.codClient
                                    and v.dateVirtual = vl.dateVirtual
                                    and v.startTime = vl.startTime
                                )
                            ) nameServices,
                            (
                                select sum(price) from Service where codService in (
                                    select v.codService
                                    from VirtualLine v
                                    where v.codClient = vl.codClient
                                    and v.dateVirtual = vl.dateVirtual
                                    and v.startTime = vl.startTime
                                )
                            ) total
                        from VirtualLine vl
                        where vl.dateVirtual = ?;`;
      const [result] = await db.query(sql, [date]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async getEventByClient(codClient) {
    try {
      const db = await createConnection();
      const sql = `select 
                        distinct vl.dateVirtual, vl.startTime, vl.endTime,
                        (
                            select GROUP_CONCAT(codService) from Service where codService in (
                                select v.codService
                                from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                            )
                        ) codServices,
                        (
                            select GROUP_CONCAT(nameService) from Service where codService in (
                                select v.codService
                                from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                            )
                        ) nameServices,
                        (
                            select sum(price) from Service where codService in (
                                select v.codService
                                from VirtualLine v
                                where v.codClient = vl.codClient
                                and v.dateVirtual = vl.dateVirtual
                                and v.startTime = vl.startTime
                            )
                        ) total
                    from VirtualLine vl
                    where vl.codClient = ?
                    order by vl.dateVirtual desc, vl.startTime desc;`;
      const [result] = await db.query(sql, [codClient]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async getEventByMonth(id) {
    try {
      const db = await createConnection();
      const sql = `select distinct dateVirtual from VirtualLine where month(dateVirtual) = ?;`;
      const [result] = await db.query(sql, [id]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async createEvent(codClient, codService, dateVirtual, startTime, endTime) {
    try {
      const db = await createConnection();
      const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, status, dateVirtual, startTime, endTime)
                        VALUES 
                            (?, ?, 'Tempo estimado', ?, ?, ?);`;
      const [result] = await db.query(sql, [codClient, codService, dateVirtual, startTime, endTime]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async updateEvent(codClient, codService, dateVirtual, startTime, endTime, codVirtual) {
    try {
      const db = await createConnection();
      const sql = `UPDATE VirtualLine SET
                            codClient = ?,
                            codService = ?,
                            dateVirtual = ?,
                            startTime = ?,
                            endTime = ?
                        WHERE codVirtual = ?;`;
      const [result] = await db.query(sql, [codClient, codService, dateVirtual, startTime, endTime, codVirtual]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async deleteEvent(codClient, dateVirtual, startTime) {
    try {
      const db = await createConnection();
      const sql = `DELETE FROM VirtualLine 
                        WHERE codClient = ?
                        and dateVirtual = ?
                        and startTime = ?;`;
      const [result] = await db.query(sql, [codClient, dateVirtual, startTime]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async deleteIn(codVirtual) {
    try {
      const db = await createConnection();
      const sql = `DELETE FROM VirtualLine 
                        WHERE codVirtual in(${codVirtual});`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  }
};

// src/routes/controllers/eventController/event.controller.ts
var eventController = {
  async get(req, res) {
    const { date } = req.params;
    const response = await eventDB.getEvent(date);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async getEventByClient(req, res) {
    const { id } = req.params;
    const response = await eventDB.getEventByClient(Number(id));
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async getEventByMonth(req, res) {
    const { id } = req.params;
    const response = await eventDB.getEventByMonth(Number(id));
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async create(req, res) {
    const { codClient, codService, dateVirtual, startTime, endTime } = req.body;
    const response = await eventDB.createEvent(codClient, codService, dateVirtual, startTime, endTime);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
  },
  async update(req, res) {
    const { codClient, codService, dateVirtual, startTime, endTime, codVirtual } = req.body;
    const response = await eventDB.updateEvent(codClient, codService, dateVirtual, startTime, endTime, codVirtual);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `Registro atualizado ID: ${response.affectedRows}` });
  },
  async delete(req, res) {
    const { codClient, dateVirtual, startTime } = req.body;
    const response = await eventDB.deleteEvent(codClient, dateVirtual, startTime);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
  },
  async deleteIn(req, res) {
    const { codVirtual } = req.body;
    const response = await eventDB.deleteIn(codVirtual);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
  }
};

// src/db/serviceDB.ts
var serviceDB = {
  async getAll() {
    try {
      const db = await createConnection();
      const sql = `select 
                            codService, nameService, price, durationMin, active
                        from Service where active = true;`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async get(codServices) {
    try {
      const db = await createConnection();
      const sql = `select 
                            codService, nameService, price, durationMin, active
                        from Service
                        where codService in( ${codServices.replace(/\s/g, "")} );`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async update(codService, nameService, price, durationMin, active) {
    try {
      const db = await createConnection();
      const sql = `UPDATE Service SET
                            nameService = ?,
                            price = ?,
                            durationMin = ?,
                            active = ?
                        WHERE codService = ?`;
      const [result] = await db.query(sql, [nameService, price, durationMin, active, codService]);
      db.commit();
      db.end();
      return result;
    } catch (error) {
      return error;
    }
    ;
  },
  async create(nameService, price, durationMin) {
    try {
      const db = await createConnection();
      const sql = `INSERT INTO Service (nameService, price, durationMin, active) VALUES 
                        (?, ?, ?, true);`;
      const [result] = await db.query(sql, [nameService, price, durationMin]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
    ;
  },
  async delete(codService) {
    try {
      const db = await createConnection();
      const sql = `DELETE FROM Service 
                        WHERE codService = ?;`;
      const [result] = await db.query(sql, [codService]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
    ;
  }
};

// src/routes/controllers/serviceController/service.controller.ts
var serviceController = {
  async getAll(req, res) {
    const response = await serviceDB.getAll();
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async get(req, res) {
    const { id } = req.params;
    const response = await serviceDB.get(id);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async create(req, res) {
    const { nameService, price, durationMin } = req.body;
    const response = await serviceDB.create(nameService, price, durationMin);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
  },
  async update(req, res) {
    const { codService, nameService, price, durationMin, active } = req.body;
    const response = await serviceDB.update(codService, nameService, price, durationMin, active);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
  },
  async delete(req, res) {
    const { id } = req.params;
    const response = await serviceDB.delete(Number(id));
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
  }
};

// src/db/timetableDB.ts
var timetableDB = {
  async getAll() {
    try {
      const db = await createConnection();
      const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from Timetable;`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async get(codTime) {
    try {
      const db = await createConnection();
      const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from Timetable where codTime = ?;`;
      const [result] = await db.query(sql, [codTime]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async updateTimetable(codTime, active, time01, time02, time03, time04) {
    try {
      const db = await createConnection();
      const sql = `   UPDATE Timetable SET
                                active = ?,
                                time01 = ?,
                                time02 = ?,
                                time03 = ?,
                                time04 = ?
                            WHERE codTime = ?;`;
      const [result] = await db.query(sql, [active, time01, time02, time03, time04, codTime]);
      db.commit();
      db.end();
      return result;
    } catch (error) {
      return error;
    }
    ;
  }
};

// src/routes/controllers/timetableController/timetable.controller.ts
var timetableController = {
  async getAll(req, res) {
    const response = await timetableDB.getAll();
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async get(req, res) {
    const { id } = req.params;
    const response = await timetableDB.get(Number(id));
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async update(req, res) {
    const { codTime, active, time01, time02, time03, time04 } = req.body;
    const response = await timetableDB.updateTimetable(codTime, active, time01, time02, time03, time04);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
  }
};

// src/routes/controllers/authController/index.ts
var import_zod2 = require("zod");

// src/tools/index.ts
var import_crypto_js = __toESM(require("crypto-js"));
var jose = __toESM(require("jose"));
var secret = new TextEncoder().encode(process.env.SECRET);
var tools = {
  encrypt(message) {
    return import_crypto_js.default.AES.encrypt(message, process.env.SECRET).toString();
  },
  decrypt(messageEncrypt) {
    const byte = import_crypto_js.default.AES.decrypt(messageEncrypt, process.env.SECRET);
    const decryptedData = byte.toString(import_crypto_js.default.enc.Utf8);
    return decryptedData;
  },
  async generateToken() {
    const alg = "HS256";
    const jwt = await new jose.SignJWT({ "urn:example:claim": true }).setProtectedHeader({ alg }).setIssuedAt().setIssuer("urn:example:issuer").setAudience("urn:example:audience").setExpirationTime("12h").sign(secret);
    return jwt;
  },
  async verifyToken(token) {
    const { payload, protectedHeader } = await jose.jwtVerify(token, secret, {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience"
    });
    return { payload, protectedHeader };
  }
};

// src/routes/controllers/authController/index.ts
var import_moment = __toESM(require("moment"));
var authController = {
  async signIn(req, res) {
    try {
      const { email, password } = req.body;
      const EmailOrPasswdMessageError = "Email ou Senha est\xE3o incorretos";
      const selectedClient = await clientDB.getByEmail(email);
      if (!selectedClient || !selectedClient?.passwordClient)
        throw EmailOrPasswdMessageError;
      const decryptPassword = tools.decrypt(selectedClient.passwordClient);
      if (password !== decryptPassword)
        throw EmailOrPasswdMessageError;
      const newToken = await tools.generateToken();
      selectedClient.passwordClient = void 0;
      selectedClient.isADM = !!selectedClient.isADM;
      const client = {
        ...selectedClient,
        expirationTimeInMinute: 60,
        // minute
        dateCreated: (0, import_moment.default)().toJSON()
      };
      const encryptClient = await tools.encrypt(JSON.stringify(client));
      res.json({ token: newToken, client: encryptClient });
    } catch (error) {
      res.json({ error });
    }
  },
  async signUp(req, res) {
    try {
      const { name, email, password } = req.body;
      const UserSchema = import_zod2.z.object({
        name: import_zod2.z.string().min(1, "O campo Nome deve conter pelo menos 1 caractere(s)"),
        email: import_zod2.z.string().email("Email inv\xE1lido"),
        password: import_zod2.z.string().min(1, "O campo Senha deve conter pelo menos 1 caractere(s)")
      });
      UserSchema.parse({ name, email, password });
      const newPassword = tools.encrypt(password);
      await clientDB.new({
        name,
        email,
        password: newPassword
      });
      res.json({ status: true });
    } catch (error) {
      res.json({ error });
    }
    ;
  }
};

// src/db/tagsDB.ts
var tagsDB = {
  async getAll() {
    try {
      const db = await createConnection();
      const sql = `select codStatus, name from Status;
            `;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
  }
};

// src/routes/controllers/tagsController/tagsController.ts
var tagsController = {
  async getAll(req, res) {
    const response = await tagsDB.getAll();
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  }
};

// src/routes/index.ts
var routes = import_express.default.Router();
routes.get("/", async (_, res) => res.send("Bem vindo :)"));
routes.post("/signIn", authController.signIn);
routes.post("/signUp", authController.signUp);
routes.get("/authorized/client/list", clientController.getAll);
routes.get("/authorized/client/:id", clientController.get);
routes.post("/authorized/client", clientController.create);
routes.put("/authorized/client", clientController.update);
routes.delete("/authorized/client/:id", clientController.delete);
routes.get("/authorized/event/:date", eventController.get);
routes.get("/authorized/event/client/:id", eventController.getEventByClient);
routes.get("/authorized/event/date/month/:id", eventController.getEventByMonth);
routes.post("/authorized/event", eventController.create);
routes.put("/authorized/event", eventController.update);
routes.delete("/authorized/event", eventController.delete);
routes.delete("/authorized/event/in", eventController.deleteIn);
routes.get("/authorized/service/list", serviceController.getAll);
routes.get("/authorized/service/:id", serviceController.get);
routes.post("/authorized/service", serviceController.create);
routes.put("/authorized/service", serviceController.update);
routes.delete("/authorized/service/:id", serviceController.delete);
routes.get("/authorized/timetable/list", timetableController.getAll);
routes.get("/authorized/timetable/:id", timetableController.get);
routes.put("/authorized/timetable", timetableController.update);
routes.get("/authorized/tag/list", tagsController.getAll);

// src/server.ts
var import_dotenv = __toESM(require("dotenv"));
var import_cors = __toESM(require("cors"));

// src/routes/controllers/middlewares/authMiddleware.ts
async function authMiddleware(req, res, next) {
  try {
    const { token } = req.headers;
    if (!token) {
      res.json({ error: "Sem token" });
      return;
    }
    ;
    const parts = token.split(".");
    if (parts.length < 3) {
      res.json({ error: "Token error" });
      return;
    }
    ;
    await tools.verifyToken(token);
    next();
  } catch (error) {
    res.json({ error });
  }
  ;
}

// src/server.ts
var server = (0, import_express2.default)();
import_dotenv.default.config();
var PORT = process.env.PORT ?? port;
server.use((0, import_cors.default)());
server.use(import_express2.default.json());
server.use("/authorized/", authMiddleware);
server.use(routes);
server.listen(PORT);
console.log(`Server running on port ${PORT}`);