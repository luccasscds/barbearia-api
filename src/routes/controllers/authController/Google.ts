import axios from "axios";
import { google } from "googleapis";
import moment from "moment";

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
            return accessToken;
        } catch (error) {
            throw error;
        }
    },

    async getUserInfo(token: string): Promise<IResponseGetUserInfoGoogle> {
        try {
            if (!token) throw 'Token de Autorização vazio';
            const { data } = await axios.get("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { data: anotherData } = await axios.get("https://content-people.googleapis.com/v1/people/me", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    personFields: 'birthdays,phoneNumbers',
                    key: process.env.GOOGLE_LOGIN_KEY,
                    prettyPrint: true,
                },
            });
            
            let birthday;
            let phoneNumber;
            if(anotherData) {
                if(anotherData.birthdays && anotherData.birthdays.length > 0) {
                    const { day, month, year } = anotherData.birthdays[0].date;
                    birthday = moment(`${day}/${month}/${year}`, 'DD/MM/YYYY').format('YYYY-MM-DD');
                };
                if(anotherData.phoneNumbers && anotherData.phoneNumbers.length > 0) {
                    phoneNumber = anotherData.phoneNumbers[0].canonicalForm;
                };
            };
    
            if(!data) throw 'Houve algum problema que não foi possível obter as informações necessárias para o Login'
            return Object.assign(data, {
                birthday,
                phoneNumber,
            });
        } catch (error) {
            throw error;
        }
    },
}

interface IResponseGetUserInfoGoogle {
    email: string,
    family_name: string,
    given_name: string
    id: string,
    locale: string
    name: string
    picture: string
    verified_email: boolean,
    birthday?: string,
    phoneNumber?: string,
}