import axios from "axios";
import moment from "moment";

export const holidaysDB = {
    async get(): Promise<IResponseGet[]> {
        try {
            const year = moment().year();
            const countryCode = 'BR'
            const { data } = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);

            return data;
        } catch (error) {
            throw error as any;
        }
    },
};

interface IResponseGet {
    date: string,
    localName: string,
    name: string,
    countryCode: string,
    fixed: boolean,
    global: boolean,
    counties?: string,
    launchYear?: string,
    types: string[],
};