import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { todos } from '$lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const cookies = event.cookies;
	const user = event.locals.user;
	const arr = await event.request.json();
	if (user) {
		for (const a of arr) {
			let existing = await db.select().from(todos).where(eq(todos.id, a.id));
			if (existing.length === 0) {
				await db.insert(todos).values(a);
				return json({ message: 'insert successfully' }, { status: 200 });
			} else {
				existing = existing[0];
				if (existing.user_id !== user.id) {
					return json(
						{ message: 'you are not authorized to modify todo not belonged to you' },
						{ status: 403 }
					);
				} else {
					await db.update(todos).set(a).where(eq(todos.id, a.id));
					return json({ message: 'update successfully' }, { status: 200 });
				}
			}
		}
	}
}
