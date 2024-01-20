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

// src/db/serviceDB.ts
var serviceDB_exports = {};
__export(serviceDB_exports, {
  serviceDB: () => serviceDB
});
module.exports = __toCommonJS(serviceDB_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  serviceDB
});
