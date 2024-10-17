import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/login");
	}
	console.log("event.locals.user", event.locals.user);
	return {
		user: event.locals.user
	};
};

export const actions = {
	default: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
		return redirect(302, "/login");
	}
};
