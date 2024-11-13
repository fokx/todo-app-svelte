import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { todos } from '$lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const user = event.locals.user;
	const arr = await event.request.json();
	try {
		if (user) {
			for (const a of arr) {
				let existing = await db.select().from(todos).where(eq(todos.id, a.id));
				if (existing.length === 0) {
					await db.insert(todos).values({
						id: a.id,
						user_id: user.id,
						text: a.text,
						done: a.done,
						deleted: a.deleted,
						synced: true
					});
				} else {
					existing = existing[0];
					if (existing.user_id !== user.id) {
						throw new Error('you are not authorized to modify todo not belonged to you');
					} else {
						await db
							.update(todos)
							.set({ text: a.text, done: a.done, delete: a.deleted })
							.where(eq(todos.id, a.id));
					}
				}
			}
		}
		return json({ message: 'success' }, { status: 200 });
	} catch (e) {
		return json({ message: e.message }, { status: 500 });
	}
}
