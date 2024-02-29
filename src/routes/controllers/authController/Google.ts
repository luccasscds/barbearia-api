import { google } from "googleapis";

export const Google = {
    async OAuth2() {
        try {
            const oAuth2Client = new google.auth.OAuth2({
                clientId: process.env.GOOGLE_GMAIL_CLIENT_ID,
                clientSecret: process.env.GOOGLE_GMAIL_CLIENT_SECRET,
                redirectUri: process.env.GOOGLE_GMAIL_REDIRECT_URIS,
            });
    
            oAuth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_GMAIL_REFRESH_TOKEN,
            });
    
            return oAuth2Client;
        } catch (error) {
            throw error;
        }
    },

    async getAccessToken() {
        try {
            const oAuth2Client = await Google.OAuth2();
    
            const accessToken: string | null | undefined = await new Promise((resolve, reject) => {
                oAuth2Client.getAccessToken((err, token) => {
                    if(err) reject(err);
                    // if(err) reject('Failed to create access token');
                    resolve(token);
                });
            });
            if(!accessToken) throw 'Error Google, sem token';
            console.log('accessToken', accessToken);
            return accessToken;
        } catch (error) {
            throw error;
        }
    },
}