import { github } from '$lib/server/auth';
import { generateState } from 'arctic';
import { redirect } from '@sveltejs/kit';

export async function GET(event) {
	const state = generateState();
	const scopes = ['read:user']; // "user:email", "repo"

	const url = github.createAuthorizationURL(state, scopes);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	return redirect(302, url.toString());
}
