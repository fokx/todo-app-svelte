import * as dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client.js';
import config from './drizzle.config.js';

dotenv.config();

migrate(db, {
	migrationsFolder: config.out
});
