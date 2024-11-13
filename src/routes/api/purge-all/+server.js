import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { todos } from '$lib/server/db/schema.ts';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const req = await event.request;
	console.log(req);
	return json({ message: 'success' });
}
