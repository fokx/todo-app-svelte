import sqlite from 'better-sqlite3';

// export const db = sqlite(":memory:");
export const db = sqlite('lucia.db');

// language=SQL format=false
db.exec(`CREATE TABLE IF NOT EXISTS user (
                                             id TEXT NOT NULL PRIMARY KEY,
                                             user_id INTEGER NOT NULL UNIQUE,
                                             username TEXT NOT NULL
         )`);

// language=SQL format=false
db.exec(`CREATE TABLE IF NOT EXISTS session (
                                                id TEXT NOT NULL PRIMARY KEY,
                                                expires_at INTEGER NOT NULL,
                                                user_id TEXT NOT NULL,
                                                FOREIGN KEY (user_id) REFERENCES user(id)
    )`);
//
// export interface DatabaseUser {
// 	id: string;
// 	username: string;
// 	user_id: number;
// }
