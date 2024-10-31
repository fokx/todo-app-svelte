import { oauth2Client, lucia } from '$lib/server/auth';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import { dbLucia } from '$lib/server/db-lucia';
import {  SSO_CLIENT_SECRET } from '$env/static/private';

export async function GET(event) {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('sso_oauth_state') ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await oauth2Client.validateAuthorizationCode(code, {credentials: SSO_CLIENT_SECRET});
		const ssoUserResponse = await fetch(process.env.SSO_USER_RESPONSE_URL, {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});
		const ssoUser = await ssoUserResponse.json();
		const existingUser = dbLucia.prepare('SELECT * FROM user WHERE user_id = ?').get(ssoUser.sub);

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateId(15);
			dbLucia.prepare('INSERT INTO user (id, user_id, username) VALUES (?, ?, ?)').run(
				userId,
				ssoUser.sub, // id
				ssoUser.preferred_username // login
			);
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === 'bad_verification_code') {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}
