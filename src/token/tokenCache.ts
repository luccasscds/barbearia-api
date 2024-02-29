import fs from 'node:fs/promises';
import { tools } from '../tools';

const pathFile = '.\\src\\token\\list-token-allowed.json';
export const tokenCache = {
    // Token
    async check(token: string) {
        try {
            const file = await getFile();
    
            const isExist = file.some((t) => t.token === token);
            if(isExist) {
                return token;
            };
        } catch (error) {
            throw error;
        }
    },

    async save(token: string) {
        try {
            const file = await getFile();
    
            const isExist = file.some((t) => t.token === token);
            if(!isExist) {
                file.push({ token });
                await saveFile(file);
            };
        } catch (error) {
            throw error;
        }
    },
    async delete(token?: string) {
        try {
            if(!token) return;

            const file = await getFile();
    
            const indexToken = file.findIndex((t) => t.token === token);
            if(indexToken > -1) {
                file.splice(indexToken, 1);
                await saveFile(file);
            };
        } catch (error) {
            throw error;
        }
    },
    async clearTokensExpired() {
        try {
            const file = await getFile();
            for(const obj of file) {
                try {
                    await tools.token.verify(obj.token);
                } catch (error) {
                    await tokenCache.delete(obj.token);
                };
            };
        } catch (error) {
            throw error;
        }
    },
}

// Files
export async function getFile(): Promise<{token: string}[]> {
    try {
        const file = JSON.parse(await fs.readFile(pathFile, { encoding: 'utf8' }) ?? '{}');
        return file;
    } catch (error) {
        if((error as any).errno === -4058) {
            await createFile();
            const file = JSON.parse(await fs.readFile(pathFile, { encoding: 'utf8' }) ?? '{}');
            return file;
        } else {
            throw error;
        }
    }
};

async function saveFile(content: any) {
    try {
        await fs.writeFile(pathFile, JSON.stringify(content, null, 3));
    } catch (error) {
        throw error;
    }
};

async function createFile() {
    try {
        await fs.appendFile(pathFile, '[]');
    } catch (error) {
        throw error;
    }
};