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

// src/tools/index.ts
var tools_exports = {};
__export(tools_exports, {
  tools: () => tools
});
module.exports = __toCommonJS(tools_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  tools
});
