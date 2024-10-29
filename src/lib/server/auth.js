import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import { db } from './db-lucia';
import { GitHub } from 'arctic';
import { SSO_CLIENT_ID, SSO_CLIENT_SECRET, SSO_REDIRECT_URL } from '$env/static/private';
// import { OAuth2Client } from "oslo/oauth2";
import { MySsoApp } from '$lib/server/my-sso-app.js';

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
			user_id: attributes.user_id,
			id: attributes.id,
		};
	}
});



// export const oauth2Client = new OAuth2Client(SSO_CLIENT_ID, authorizeEndpoint, tokenEndpoint, {
// 	redirectURI: SSO_REDIRECT_URL
// });

export const oauth2Client = new MySsoApp(SSO_CLIENT_ID, SSO_CLIENT_SECRET, SSO_REDIRECT_URL);
