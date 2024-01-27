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

// src/routes/controllers/authController/index.ts
var authController_exports = {};
__export(authController_exports, {
  authController: () => authController
});
module.exports = __toCommonJS(authController_exports);
var import_zod2 = require("zod");

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
      const UserSchema = import_zod2.z.object({
        email: import_zod2.z.string().email("Email inv\xE1lido"),
        password: import_zod2.z.string().min(1, "O campo Senha deve conter pelo menos 1 caractere(s)")
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
      const UserSchema = import_zod2.z.object({
        name: import_zod2.z.string().min(1, "O campo Nome deve conter pelo menos 1 caractere(s)"),
        email: import_zod2.z.string().email("Email inv\xE1lido"),
        numberPhone: import_zod2.z.string().min(11, "O campo Telefone deve conter pelo menos 11 caractere(s)").max(11, "O campo Telefone deve conter no m\xE1ximo 11 caractere(s)"),
        password: import_zod2.z.string().min(1, "O campo Senha deve conter pelo menos 1 caractere(s)")
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authController
});
