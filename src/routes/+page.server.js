import { db } from '$lib/server/db/client.js';
import { todos } from '$lib/server/db/schema.ts';
import { eq, not } from 'drizzle-orm';

export const actions = {
	createpost: async function ({ locals, request }) {
		let user = locals.user;
		const formData = await request.formData();
		if (user) {
			try {
				await db.insert(todos).values({
					id: formData.get('id'),
					user_id: user.id,
					text: formData.get('content'),
					done: false,
					deleted: false,
					synced: true,
					user_agent: request.headers['user-agent']
				});
			} catch (e) {
				console.log('error when creating post', e);
			}
		}
	},
	deleteTodo: async function ({ locals, request }) {
		let user = locals.user;
		const formData = await request.formData();
		if (user) {
			// soft delete
			await db
				.update(todos)
				.set({ deleted: true })
				.where(eq(todos.id, formData.get('id')));
			// await db.delete(todos).where(eq(todos.id, formData.get('id')));
		}
	},
	deleteAllCompleted: async function ({ locals, request }) {
		let user = locals.user;
		const formData = await request.formData();
		if (user) {
			// soft delete
			await db.update(todos).set({ deleted: true }).where(eq(todos.done, true));
		}
	},
	editTodo: async function ({ locals, request }) {
		let user = locals.user;
		const formData = await request.formData();
		if (user && formData.get('new_text')) {
			await db
				.update(todos)
				.set({ text: formData.get('new_text') })
				.where(eq(todos.id, formData.get('id')));
		}
	},
	toggleTodo: async function ({ locals, request }) {
		let user = locals.user;
		const formData = await request.formData();
		// const isChecked = formData.get('myCheckbox') === 'on';
		// let prev_done = formData.get('prev_done');
		if (user) {
			await db
				.update(todos)
				.set({
					done: not(todos.done)
				})
				.where(eq(todos.id, formData.get('id')));
		}
	}
};
