import * as dotenv from 'dotenv';

dotenv.config();

export default {
    schema: './src/lib/server/dbDexie/schema.js',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DB_URL
    },
    out: './src/lib/server/dbDexie/migrations'
};
