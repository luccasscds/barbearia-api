"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/index.ts
var routes_exports = {};
__export(routes_exports, {
  routes: () => routes
});
module.exports = __toCommonJS(routes_exports);
var import_express = __toESM(require("express"));
var import_multer = __toESM(require("multer"));

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
                            ) total,
                            vl.codPayment,
                            (select name from PaymentMethod where codPay = vl.codPayment) desPayment
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
      const defaultDay = 15;
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
                    and vl.dateVirtual >= DATE_SUB(current_date, INTERVAL ? DAY)
                    order by vl.dateVirtual desc, vl.startTime desc;`;
      const [result] = await db.query(sql, [codClient, defaultDay]);
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
  async createEvent(newEvent) {
    try {
      const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment } = newEvent;
      const db = await createConnection();
      const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?);`;
      const [result] = await db.query(sql, [codClient, codService, codStatus ?? 1, dateVirtual, startTime, endTime, codPayment]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async updateEvent(newEvent) {
    try {
      const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual } = newEvent;
      const db = await createConnection();
      const sql = `UPDATE VirtualLine SET
                            codClient = ?,
                            codService = ?,
                            codStatus = ?,
                            dateVirtual = ?,
                            startTime = ?,
                            endTime = ?,
                            codPayment = ?
                        WHERE codVirtual = ?;`;
      const [result] = await db.query(sql, [codClient, codService, codStatus, dateVirtual, startTime, endTime, codPayment, codVirtual]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async deleteEvent(newEvent) {
    try {
      const { codClient, dateVirtual, startTime } = newEvent;
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
var import_zod2 = require("zod");
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
    try {
      const EventSchema = import_zod2.z.object({
        codClient: import_zod2.z.number(),
        codService: import_zod2.z.number(),
        codStatus: import_zod2.z.number(),
        dateVirtual: import_zod2.z.string().regex(/^\d{4}-\d{2}-\d{2}$/g, "O formato Data esperado \xE9 YYYY-MM-DD"),
        startTime: import_zod2.z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, "O formato Hora esperado \xE9 HH:mm ou HH:mm:ss"),
        endTime: import_zod2.z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, "O formato Hora esperado \xE9 HH:mm ou HH:mm:ss"),
        codPayment: import_zod2.z.number()
      });
      EventSchema.parse(req.body);
      const response = await eventDB.createEvent(req.body);
      if (response.errno) {
        res.json({ error: response });
        return;
      }
      ;
      res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
    } catch (error) {
      if (error?.issues)
        error = error.issues[0];
      res.json({ error });
    }
  },
  async update(req, res) {
    try {
      const EventSchema = import_zod2.z.object({
        codClient: import_zod2.z.number(),
        codService: import_zod2.z.number(),
        codStatus: import_zod2.z.number(),
        dateVirtual: import_zod2.z.string().regex(/^\d{4}-\d{2}-\d{2}$/g, "O formato Data esperado \xE9 YYYY-MM-DD"),
        startTime: import_zod2.z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, "O formato Hora esperado \xE9 HH:mm ou HH:mm:ss"),
        endTime: import_zod2.z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, "O formato Hora esperado \xE9 HH:mm ou HH:mm:ss"),
        codVirtual: import_zod2.z.number(),
        codPayment: import_zod2.z.number()
      });
      EventSchema.parse(req.body);
      const response = await eventDB.updateEvent(req.body);
      if (response.errno) {
        res.json({ error: response });
        return;
      }
      ;
      res.status(200).json({ message: `Registro atualizado ID: ${response.affectedRows}` });
    } catch (error) {
      if (error?.issues)
        error = error.issues[0];
      res.json({ error });
    }
  },
  async delete(req, res) {
    try {
      const EventSchema = import_zod2.z.object({
        codClient: import_zod2.z.number(),
        dateVirtual: import_zod2.z.string().regex(/^\d{4}-\d{2}-\d{2}$/g, "O formato Data esperado \xE9 YYYY-MM-DD"),
        startTime: import_zod2.z.string().regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, "O formato Hora esperado \xE9 HH:mm ou HH:mm:ss")
      });
      EventSchema.parse(req.body);
      const response = await eventDB.deleteEvent(req.body);
      if (response.errno) {
        res.json({ error: response });
        return;
      }
      ;
      res.status(200).json({ message: `${response.affectedRows} registro(s) deletado(s)` });
    } catch (error) {
      if (error?.issues)
        error = error.issues[0];
      res.json({ error });
    }
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
                        from Service;`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async getAllActive() {
    try {
      const db = await createConnection();
      const sql = `select 
                            codService, nameService, price, durationMin
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
  async getAllActive(req, res) {
    const response = await serviceDB.getAllActive();
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
  async getActiveOrInactive(active) {
    try {
      const db = await createConnection();
      const sql = `select 
                            codTime, day, active, time01, time02, time03, time04
                        from Timetable where active = ?;`;
      const [result] = await db.query(sql, [active]);
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
  async getActiveOrInactive(req, res) {
    const { id } = req.params;
    const response = await timetableDB.getActiveOrInactive(id.toLowerCase() === "true");
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
var import_zod3 = require("zod");

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
      const UserSchema = import_zod3.z.object({
        email: import_zod3.z.string().email("Email inv\xE1lido"),
        password: import_zod3.z.string().min(1, "O campo Senha deve conter pelo menos 1 caractere(s)")
      });
      UserSchema.parse({ email, password });
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
      if (error?.issues)
        error = error.issues[0];
      res.json({ error });
    }
  },
  async signUp(req, res) {
    try {
      const { name, email, password, numberPhone } = req.body;
      const UserSchema = import_zod3.z.object({
        name: import_zod3.z.string().min(1, "O campo Nome deve conter pelo menos 1 caractere(s)"),
        email: import_zod3.z.string().email("Email inv\xE1lido"),
        numberPhone: import_zod3.z.string().min(11, "O campo Telefone deve conter pelo menos 11 caractere(s)").max(11, "O campo Telefone deve conter no m\xE1ximo 11 caractere(s)"),
        password: import_zod3.z.string().min(1, "O campo Senha deve conter pelo menos 1 caractere(s)")
      });
      UserSchema.parse({ name, email, password, numberPhone });
      const newPassword = tools.encrypt(password);
      await clientDB.new({
        name,
        email,
        password: newPassword,
        numberPhone
      });
      res.json({ status: true });
    } catch (error) {
      if (error?.issues)
        error = error.issues[0];
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
      const sql = `select codStatus, name from Status;`;
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

// src/db/configAgendaDB.ts
var configAgendaDB = {
  async getAll() {
    try {
      const db = await createConnection();
      const sql = `select keyConfig, valueConfig from ConfigSchedule;`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
  },
  async get(keys) {
    try {
      const db = await createConnection();
      const sql = `select keyConfig, valueConfig from ConfigSchedule
                        where keyConfig in(${keys});`;
      const [result] = await db.query(sql);
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
  },
  async update(keyConfig, valueConfig) {
    try {
      const db = await createConnection();
      const sql = `   UPDATE ConfigSchedule SET 
                            valueConfig = ?
                            WHERE keyConfig = ?;`;
      const [result] = await db.query(sql, [valueConfig, keyConfig]);
      db.commit();
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
    ;
  }
};

// src/routes/controllers/configAgendaController/configAgendaController.ts
var configAgendaController = {
  async getAll(req, res) {
    const response = await configAgendaDB.getAll();
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async get(req, res) {
    const { id } = req.params;
    const newValue = id.replace(/\s/g, "").split(",").map((key) => `"${key}"`);
    const response = await configAgendaDB.get(newValue.join(","));
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async update(req, res) {
    const { keyConfig, valueConfig } = req.body;
    const response = await configAgendaDB.update(keyConfig, valueConfig);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
  }
};

// src/db/companyDB.ts
var companyDB = {
  async get(id) {
    try {
      const db = await createConnection();
      const sql = `select codCompany, name, photo, numberWhatsApp, nameInstagram, address from Company
                        where codCompany = ?;`;
      const [result] = await db.query(sql, [id]);
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
  },
  async update(newCompany) {
    try {
      const { name, photo, numberWhatsApp, nameInstagram, address, codCompany } = newCompany;
      const db = await createConnection();
      const sql = `   UPDATE Company SET 
                            name = ?,
                            photo = ?,
                            numberWhatsApp = ?,
                            nameInstagram = ?,
                            address = ?
                            WHERE codCompany = ?;`;
      const [result] = await db.query(sql, [name, photo, numberWhatsApp, nameInstagram, address, codCompany]);
      db.commit();
      db.end();
      return result;
    } catch (error) {
      throw error;
    }
    ;
  }
};

// src/routes/controllers/companyController/companyController.ts
var companyController = {
  async get(req, res) {
    const { id } = req.params;
    const response = await companyDB.get(id);
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.json(response);
  },
  async update(req, res) {
    try {
      const { name, photo, numberWhatsApp, nameInstagram, address, codCompany } = req.body;
      const response = await companyDB.update({ name, photo, numberWhatsApp, nameInstagram, address, codCompany });
      if (response.errno) {
        res.json({ error: response });
        return;
      }
      ;
      res.status(200).json({ message: `${response.affectedRows} registro(s) atualizado(s)` });
    } catch (error) {
      res.json({ error });
    }
  }
};

// src/db/paymentMethodDB.ts
var paymentMethodDB = {
  async getAll() {
    try {
      const db = await createConnection();
      const sql = `select codPay, name from PaymentMethod;`;
      const [result] = await db.query(sql, []);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  }
};

// src/routes/controllers/paymentMethodController/paymentMethodController.ts
var paymentMethodController = {
  async getALl(req, res) {
    try {
      const response = await paymentMethodDB.getAll();
      if (response.errno) {
        res.json({ error: response });
        return;
      }
      ;
      res.json(response);
    } catch (error) {
      if (error?.issues)
        error = error.issues[0];
      res.json({ error });
    }
  }
};

// src/routes/index.ts
var upload = (0, import_multer.default)({ dest: "uploads/" });
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
routes.get("/authorized/service/list/active", serviceController.getAllActive);
routes.get("/authorized/service/:id", serviceController.get);
routes.post("/authorized/service", serviceController.create);
routes.put("/authorized/service", serviceController.update);
routes.delete("/authorized/service/:id", serviceController.delete);
routes.get("/authorized/timetable/list", timetableController.getAll);
routes.get("/authorized/timetable/:id", timetableController.get);
routes.get("/authorized/timetable/active/:id", timetableController.getActiveOrInactive);
routes.put("/authorized/timetable", timetableController.update);
routes.get("/authorized/tag/list", tagsController.getAll);
routes.get("/authorized/config/agenda", configAgendaController.getAll);
routes.get("/authorized/config/agenda/:id", configAgendaController.get);
routes.put("/authorized/config/agenda", configAgendaController.update);
routes.get("/authorized/company/:id", companyController.get);
routes.put("/authorized/company", upload.single("photo"), companyController.update);
routes.get("/authorized/paymentMethod/list", paymentMethodController.getALl);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  routes
});
