import * as dotenv from 'dotenv';
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig ({
    schema: './src/lib/server/db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DB_URL
    },
    out: './src/lib/server/db/migrations'
});
