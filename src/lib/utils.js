import { generateId } from 'lucia';
import { PUBLIC_DEXIE_ID_LENGTH } from '$env/static/public';

export function gen_todo_id() {
	return generateId(PUBLIC_DEXIE_ID_LENGTH);
}
