// import { lucia } from '$lib/server/auth';
import { read_user } from '$lib/server/read_cookie';

export const handle = async ({ event, resolve }) => {
	// const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!event.locals.user) {
		const ext_cookie = event.cookies.get(process.env.COOKIE_NAME);
		if (ext_cookie) {
			let user = read_user(ext_cookie);
			if (user) {
				event.locals.user = user;
				return resolve(event);
			}
		}
	}
	// if (!sessionId) {
	// 	event.locals.user = null;
	// 	event.locals.session = null;
	// 	return resolve(event);
	// }
	//
	// const { session, user } = await lucia.validateSession(sessionId);
	// if (session && session.fresh) {
	// 	const sessionCookie = lucia.createSessionCookie(session.id);
	// 	event.cookies.set(sessionCookie.name, sessionCookie.value, {
	// 		path: '.',
	// 		...sessionCookie.attributes
	// 	});
	// }
	// if (!session) {
	// 	const sessionCookie = lucia.createBlankSessionCookie();
	// 	event.cookies.set(sessionCookie.name, sessionCookie.value, {
	// 		path: '.',
	// 		...sessionCookie.attributes
	// 	});
	// }
	// event.locals.user = user;
	// event.locals.session = session;
	return resolve(event);
};
