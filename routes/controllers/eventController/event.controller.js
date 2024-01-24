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

// src/routes/controllers/eventController/event.controller.ts
var event_controller_exports = {};
__export(event_controller_exports, {
  eventController: () => eventController
});
module.exports = __toCommonJS(event_controller_exports);

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
  async createEvent(newEvent) {
    try {
      const { codClient, codService, codStatus, dateVirtual, startTime, endTime } = newEvent;
      const db = await createConnection();
      const sql = `INSERT INTO VirtualLine 
                            (codClient, codService, codStatus, dateVirtual, startTime, endTime)
                        VALUES 
                            (?, ?, ?, ?, ?, ?);`;
      const [result] = await db.query(sql, [codClient, codService, codStatus ?? 1, dateVirtual, startTime, endTime]);
      db.end();
      return result;
    } catch (error) {
      return error;
    }
  },
  async updateEvent(newEvent) {
    try {
      const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codVirtual } = newEvent;
      const db = await createConnection();
      const sql = `UPDATE VirtualLine SET
                            codClient = ?,
                            codService = ?,
                            codStatus = ?,
                            dateVirtual = ?,
                            startTime = ?,
                            endTime = ?
                        WHERE codVirtual = ?;`;
      const [result] = await db.query(sql, [codClient, codService, codStatus, dateVirtual, startTime, endTime, codVirtual]);
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
    const { codClient, codService, codStatus, dateVirtual, startTime, endTime } = req.body;
    const response = await eventDB.createEvent({
      codClient,
      codService,
      codStatus,
      dateVirtual,
      startTime,
      endTime
    });
    if (response.errno) {
      res.json({ error: response });
      return;
    }
    ;
    res.status(201).json({ message: `Registro criado ID: ${response.insertId}` });
  },
  async update(req, res) {
    const { codClient, codService, codStatus, dateVirtual, startTime, endTime, codVirtual } = req.body;
    const response = await eventDB.updateEvent({
      codClient,
      codService,
      codStatus,
      dateVirtual,
      startTime,
      endTime,
      codVirtual
    });
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  eventController
});
