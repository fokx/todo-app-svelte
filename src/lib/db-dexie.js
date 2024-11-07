import Dexie from 'dexie';
// import dexieCloud from 'dexie-cloud-addon';
// import { PUBLIC_DEXIE_DB_URL } from '$env/static/public';

export const dbDexie = new Dexie('todo_app', );
// export const dbDexie = new Dexie('todo_app', { addons: [dexieCloud] });

// if (PUBLIC_DEXIE_DB_URL === '') {
// 	dbDexie.version(1).stores({
// 		todos: '++id, text, done, deleted, synced, user_agent, id_cloud' // '++' = auto-incremented ID
// 	});
// } else {
dbDexie.version(1).stores({
	todos: '&id, user_id, user_name, email, text, done, deleted, synced, user_agent, id_cloud, created_at, deleted_at, updated_at, done_at, synced_at'
});

// dbDexie.cloud.configure({
// 	databaseUrl: PUBLIC_DEXIE_DB_URL,
// 	// requireAuth: false,
// });
// // }
