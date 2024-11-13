import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { todos } from '$lib/server/db/schema.ts';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const arr = await event.request.json();
	for (let a of arr) {
		db.insert(todos)
			.values(a)
			.onConflictDoUpdate({
				target: todos.id,
				set: {
					text: a.text,
					done: a.done,
					deleted: a.deleted
				}
			});
	}

	return json({ message: 'success' });
}
