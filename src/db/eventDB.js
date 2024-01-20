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

// src/db/eventDB.ts
var eventDB_exports = {};
__export(eventDB_exports, {
  eventDB: () => eventDB
});
module.exports = __toCommonJS(eventDB_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  eventDB
});
