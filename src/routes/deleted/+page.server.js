import { db } from '$lib/server/db/client.js';
import { todos } from '$lib/server/db/schema.ts';
import { eq } from 'drizzle-orm';

export const actions = {
	editTodo: async function ({ locals, request }) {
		let user = locals.user;
		const formData = await request.formData();
		if (user) {
			await db
				.update(todos)
				.set({ text: formData.get('new_text') })
				.where(eq(todos.id, formData.get('id')));
		}
	}
};
