import { generateId } from 'lucia';

export function gen_todo_id() {
	return generateId(64);
}