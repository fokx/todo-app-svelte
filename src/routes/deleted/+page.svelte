<script>
	import Todo from '$lib/components/todo-list.svelte';
	import { derived } from 'svelte/store';
	import { liveQuery } from 'dexie';
	import { dbDexie } from '$lib/db-dexie.js';
	import { SyncStatus } from '$lib/utils.js';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	let user = $derived(data.user);
	let todoListLocal = liveQuery(() =>
		dbDexie.todos.orderBy('id').desc().toArray()
	);

	let todoListDeletedLocal = $state();
	todoListLocal.subscribe((todos) => {
		todoListDeletedLocal = todos.filter(t => t.deleted);
	});
	let sync_status = $state(SyncStatus.undefined);

	// let todoListDeleted = $derived(data.cloud_posts?.filter(t => t.deleted));
</script>

<style>
    @import '$lib/styles.css';
</style>

<div class="centered">

	<h2>Deleted todos:</h2>
	<a href="/">Return to Main Page</a>
	<hr>
	<Todo isDeletedListPage={true} todoList={todoListDeletedLocal} user={user} sync_status={sync_status} />

</div>
