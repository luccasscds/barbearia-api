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

// src/db/timetableDB.ts
var timetableDB_exports = {};
__export(timetableDB_exports, {
  timetableDB: () => timetableDB
});
module.exports = __toCommonJS(timetableDB_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  timetableDB
});
