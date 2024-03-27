import { z } from "zod"

export const handleZod = {
    params(fieldName: string, type: string) {
        return {
            invalid_type_error: `O campo ${fieldName} precisa ser ${type}`,
            required_error: `O campo ${fieldName} é obrigatório`,
            // errorMap: z.ZodErrorMap | undefined,
            // description: '',
        }
    },
    email() {
        return z.string(params('Email', 'tipo email')).email('Email inválido');
    },
    date() {
        return z.string(params('Data', 'tipo data')).regex(/^\d{4}-\d{2}-\d{2}$/g, 'O formato Data esperado é YYYY-MM-DD');
    },
    time(fieldName: string) {
        return z.string(params(fieldName, 'no formato 00:00 ou 00:00:00')).regex(/^(\d{2}:\d{2}:\d{2})|(\d{2}:\d{2})$/, 'O formato Hora esperado é HH:mm ou HH:mm:ss')
    },

    // genérico
    string(name: string, options?: { max?: number, min?: number }) {
        let zod = z.string(params(name, 'texto'));
        if(options?.max) {
            zod = zod.max(options.max, paramsMax(name, options.max));
        };
        if(options?.min) {
            zod = zod.min(options.min, paramsMin(name, options.min));
        };
        return zod;
    },
    number(name: string) {
        return z.number(params(name, 'número'));
    },
    boolean(name: string) {
        return z.boolean(params(name, 'boolean'));
    },
    bigint(name: string) {
        return z.bigint(params(name, 'número grande'));
    },
}

function params(fieldName: string, type: string) {
    return {
        invalid_type_error: `O campo ${fieldName} precisa ser ${type}`,
        required_error: `O campo ${fieldName} é obrigatório`,
        // errorMap: z.ZodErrorMap | undefined,
        // description: '',
    }
};

function paramsMin(name: string, value: number) {
    return { message: `O campo ${name} deve conter pelo menos ${value} caractere(s)` }
};

function paramsMax(name: string, value: number) {
    return { message: `O campo ${name} deve conter máximo ${value} caractere(s)` }
};