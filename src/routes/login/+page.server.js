import {redirect} from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};
