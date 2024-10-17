<script>
	import { onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import { dbDexie } from '$lib/db-dexie.js';
	import { enhance } from '$app/forms';
	import Todo from '$lib/components/todo-list.svelte';

	/** @type {import('./$types').PageData} */
	let data = $props();
	let user = $state(data.data.user);
	let logging_out = $state(false);
	let logging_in = $state(false);
	let newItem = $state('');

	let todoListNotDeleted = liveQuery(() =>
			dbDexie.todos.where({ 'deleted': 'false' }).toArray()
		// async () => {return await dbDexie.todos.where("deleted").equals('false').toArray()}
	);

	function handleKeydown(e) {
		if (newItem && e.key === 'Enter') {
			addToList();
		}
	}

	async function addToList() {
		const id = dbDexie.todos.add({
			text: newItem,
			done: 'false',
			deleted: 'false'
		});
		newItem = '';
	}

	function deleteCompleted() {
		if (window.confirm('Do you really want to delete all completed TODOs?')) {
			dbDexie.todos.where({ 'deleted': 'false' }).filter(t => t.done === 'true').modify({ deleted: 'true' });
		}
	}


	let uncompletedCount = liveQuery(
		() => dbDexie.todos.where({ 'deleted': 'false', 'done': 'false' }).count()
	);

	let todoListNotDeletedCount = liveQuery(
		() => dbDexie.todos.where({ 'deleted': 'false' }).count()
	);

	let todo_s_text = $derived('TODO' + ($todoListNotDeletedCount > 1 ? 's' : ''));
	let status = $derived((
		($todoListNotDeletedCount > 0 ?
			($uncompletedCount > 0 ?
				`${$uncompletedCount} out of ${$todoListNotDeletedCount} ${todo_s_text} unfinished`
				: ($todoListNotDeletedCount === 1 ? 'The only' : 'All') + ` ${$todoListNotDeletedCount} ${todo_s_text} finished`) : '')

	));

	onMount(() => {
		if (!window.indexedDB) {
			alert('Unsupported Browser: Indexed DB is not supported!');
		}
	});

</script>

<style>
    @import '$lib/styles.css';
</style>


<div class="centered">

	<div class="header-login">
		{#if user != null}
			<h2>{user.username}'s TODO List</h2>
			<form method="post" action="?/logout" use:enhance={() => {
			logging_out = true;
			return async ({ update }) => {
				await update();
				logging_out = false;
				user = null;
			};
		}}>
				<button aria-label="Sign out">Sign out</button>
			</form>
			{#if logging_out}
				<span class="logging-in-out">logging you out...</span>
			{/if}
		{:else}
			<h2>My TODO List</h2>
			<form method="post" action="?/login" use:enhance={() => {
			logging_in = true;
			return async ({ update }) => {
				await update();
			};
		}}>
				<button aria-label="Sign in">Sign in</button>
			</form>
			{#if logging_in}
				<span class="logging-in-out">signing you in...</span>
			{/if}
		{/if}
	</div>


	<p>{status}</p>
	<input bind:value={newItem} onkeydown={handleKeydown} placeholder="new todo item.." type="text" />
	<button aria-label="Add" disabled={!newItem} onclick={addToList}>Add</button>

	<br />
	<Todo bind:todos={$todoListNotDeleted} />

	<button onclick={() => location.href='/deleted'} type="button">View deleted</button>

	<button aria-label="Remove all completed" disabled={!($todoListNotDeletedCount-$uncompletedCount)}
					onclick={deleteCompleted}>Remove all completed
	</button>
</div>

