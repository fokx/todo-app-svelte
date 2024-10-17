import * as dotenv from 'dotenv';
import type {Config} from 'drizzle-kit';

dotenv.config();

export default {
    schema: './src/lib/server/dbDexie/schema.js',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DB_URL
    },
    out: './src/lib/server/dbDexie/migrations'
};
satisfies;
Config;
