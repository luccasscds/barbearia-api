import { createTransport } from "nodemailer";
import { tools } from "../../../tools";
import moment from "moment";
import { IResponseClientByEmail } from "../../../db/clientDB";
import { tokenCache } from "../../../token/tokenCache";

export const Email = {
    async send(options: IParamsSendEmail) {
        try {
            const transport = createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.GOOGLE_GMAIL_EMAIL,
                    accessToken: options.accessToken,
                    clientId: process.env.GOOGLE_GMAIL_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_GMAIL_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_GMAIL_REFRESH_TOKEN,
                },
                // tls: {
                //     rejectUnauthorized: false,
                // },

                // Para Teste
                // host: 'smtp.ethereal.email',
                // port: 587,
                // auth: {
                //     user: 'kody56@ethereal.email',
                //     pass: 'ZaN82eKSdnZMvnS3xZ'
                // }
            });

            const timeInMinute = 1 * 60;
            const token = await tools.token.generate(timeInMinute, true);
            const encryptData = JSON.stringify({
                token,
                client: options.client,
            });

            const link = `${process.env.FRONTEND_URL}?token=${await tools.encrypt(encryptData)}`;

            await transport.sendMail({
                from: process.env.GOOGLE_GMAIL_EMAIL,
                to: options.client.emailClient,
                subject: `Redefinição de Senha 🔑`,
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                </head>
                <body>
                    <p>Olá ${options.client.nameClient}!</p>
                    <p>Recebemos sua solicitação para criar uma senha. Para isso, basta clica no link abaixo.</p>
                    <div style="text-align: center; padding: 1rem 0;">
                        <a href="${link}" style="background: #dfdfdf; padding: 1rem; text-decoration: none; border-radius: 1rem;">
                            Redefinir Senha
                        </a>
                    </div>
                    <p>
                        <strong>Importante: </strong>
                        Este link será válido até ${moment().add(timeInMinute, 'minute').format('DD/MM/YYYY HH:mm')}. Caso ultrapasse esse tempo, será necessário solicitar um novo.
                    </p>
                    <p>Caso o link não funcione, copie o enderenço abaixo e cole no seu navegador</p>
                    <p>${link}</p>
                    <p>Em caso de dúvidas entre em contato conosco.</p>
                    <strong>Equipe AgendeSeuCorte</strong>
                </body>
                </html>
                `,
            });

            await tokenCache.clearTokensExpired();
            console.log('email enviado!');
        } catch (error) {
            throw error;
        }
    },
};

interface IParamsSendEmail {
    accessToken: string,
    client: IResponseClientByEmail,
};