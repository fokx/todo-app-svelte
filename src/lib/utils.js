import { generateId } from 'lucia';
import { PUBLIC_DEXIE_ID_LENGTH } from '$env/static/public';

export function gen_todo_id() {
	return generateId(PUBLIC_DEXIE_ID_LENGTH);
}
export function make_enum(arr){
	let obj = Object.create(null);
	for (let val of arr){
		obj[val] = Symbol(val);
	}
	return Object.freeze(obj);
}
export const SyncStatus = make_enum(['local', 'divergent', 'syncing', 'synced', 'undefined', 'empty','error']);
export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms ?? 200));
}