import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from 'lucia';
const common_timestamps = {
	created_at: integer({ mode: 'timestamp' })
		.$defaultFn(() => new Date()),
	deleted_at: integer({ mode: 'timestamp' })
		.$defaultFn(() => new Date()),
	updated_at: integer({ mode: 'timestamp' })
		.$defaultFn(() => new Date()),
};

const todo_extra_timestamps = {
	done_at: integer({ mode: 'timestamp' })
		.$defaultFn(() => new Date()),
	syncedAt: integer({ mode: 'timestamp' })
		.$defaultFn(() => new Date())
};

export const todos = sqliteTable('todos', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => generateId(64)),
	username: text({ length: 65535 }).notNull(),
	email: text({ length: 65535 }),
	text: text( { length: 65535 }).notNull(),
	done: integer({ mode: 'boolean' }),
	deleted: integer({ mode: 'boolean' }),
	synced: integer({ mode: 'boolean' }),
	user_agent: text({ length: 65535 }),
	...common_timestamps,
	...todo_extra_timestamps
});
