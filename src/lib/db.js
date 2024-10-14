import Dexie from 'dexie';

export const db = new Dexie('todo_app');
db.version(1).stores({
	todos: '++id, text, done, deleted'
});
