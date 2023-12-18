import crypto from "crypto-js";
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.SECRET!);

export const tools = {
    encrypt(message: string) {
        return crypto.AES.encrypt(message, process.env.SECRET!).toString();
    },

    decrypt(messageEncrypt: string) {
        const byte = crypto.AES.decrypt(messageEncrypt, process.env.SECRET!);
        const decryptedData = byte.toString(crypto.enc.Utf8);
        return decryptedData;
    },

    async generateToken() {
        const alg = 'HS256'

        const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer('urn:example:issuer')
        .setAudience('urn:example:audience')
        .setExpirationTime('12h')
        .sign(secret);

        return jwt;
    },

    async verifyToken(token: string) {
        const { payload, protectedHeader } = await jose.jwtVerify(token, secret, {
            issuer: 'urn:example:issuer',
            audience: 'urn:example:audience',
        });

        return { payload, protectedHeader };
    },
}