import crypto from "crypto-js";
import * as jose from 'jose';
// import fs from 'node:fs';

export const tools = {
    expirationTimeInMinute: 12 * 60, // minute

    encrypt(message: string) {
        return crypto.AES.encrypt(message, process.env.SECRET!).toString();
    },

    decrypt(messageEncrypt: string) {
        const byte = crypto.AES.decrypt(messageEncrypt, process.env.SECRET!);
        const decryptedData = byte.toString(crypto.enc.Utf8);
        return decryptedData;
    },

    token: {
        async generate(expirationTimeInMinute?: number) {
            expirationTimeInMinute = expirationTimeInMinute || tools.expirationTimeInMinute;
            const secret = new TextEncoder().encode(process.env.SECRET!);

            const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer('urn:example:issuer')
            .setAudience('urn:example:audience')
            .setExpirationTime(`${expirationTimeInMinute}m`)
            .sign(secret);

            return jwt;
        },
    
        async verify(token: string, options?: jose.JWTVerifyOptions) {
            try {
                const secret = new TextEncoder().encode(process.env.SECRET!);
                const { payload, protectedHeader } = await jose.jwtVerify(token, secret, {
                    issuer: 'urn:example:issuer',
                    audience: 'urn:example:audience',
                    ...options,
                });
                
                return { payload, protectedHeader };
            } catch (error) {
                throw error;
            };
        },

        // async createPublicAndPrivateKey() {
        //     const { publicKey, privateKey } = await jose.generateKeyPair('PS256');
        //     return {
        //         publicKey: await jose.exportSPKI(publicKey),
        //         privateKey: await jose.exportPKCS8(privateKey),
        //     };
        // },

        // async encrypt(text: string) {
        //     const publicKey = await jose.importSPKI(await fs.readFileSync('.//certs//public.pub', {encoding: 'utf8'}), 'PS256');
        //     const jwe = await new jose.CompactEncrypt(
        //       new TextEncoder().encode(text),
        //     )
        //       .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
        //       .encrypt(publicKey)
            
        //     return jwe;
        // },

        // async decrypt(jwe: any) {
        //     const privateKey = await jose.importPKCS8(await fs.readFileSync('.//certs//key.pem', {encoding: 'utf8'}), 'PS256');
        //     const { plaintext } = await jose.compactDecrypt(jwe, privateKey)
            
        //     return new TextDecoder().decode(plaintext);
        // },
    },

    /**
     * Gera números aleatório de 4 dígitos
     * Ex: '0101' 
     * @returns 
     */
    randomNumber() {
        const max = Math.max(9999);
        const min = Math.min(1);
        let handleRandom = '';
    
        const random = Math.floor(Math.random() * max + min);
        switch (random.toString().length) {
            case 1:
                handleRandom = `000${random}`;
                break;
            case 2:
                handleRandom = `00${random}`;
                break;
            case 3:
                handleRandom = `0${random}`;
                break;
            default:
                handleRandom = `${random}`;
                break;
        }
        return handleRandom;
    }
}