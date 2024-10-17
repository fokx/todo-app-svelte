import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import { db } from './db-lucia';
import { GitHub } from 'arctic';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URL } from '$env/static/private';

const adapter = new BetterSqlite3Adapter(db, {
	user: 'user',
	session: 'session'
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			githubId: attributes.github_id
		};
	}
});

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URL);
