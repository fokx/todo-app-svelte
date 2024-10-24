import {  oauth2Client } from '$lib/server/auth';
// import { generateState } from 'arctic';
import { redirect } from '@sveltejs/kit';
import { generateState, generateCodeVerifier } from "oslo/oauth2";

export async function GET(event) {
	const state = generateState();
	const scopes = ['openid', 'profile', 'email']; // "user:email", "repo", 'read:user'
	// const codeVerifier = generateCodeVerifier(); // for PKCE flow

	const url = oauth2Client.createAuthorizationURL(state, scopes);

	event.cookies.set('sso_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	return redirect(302, url.toString());
}
