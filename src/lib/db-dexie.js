import Dexie from 'dexie';

export const dbDexie = new Dexie('todo_app');
dbDexie.version(1).stores({
	todos: '++id, text, done, deleted, synced, user_agent, id_cloud'
});
