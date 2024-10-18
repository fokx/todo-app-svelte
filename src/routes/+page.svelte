<script>
	import { onMount } from 'svelte';
	import { dbDexie } from '$lib/db-dexie.js';
	import { enhance } from '$app/forms';
	import Todo from '$lib/components/todo-list.svelte';
	import { derived } from 'svelte/store';

	/** @type {import('./$types').PageData} */
	let { data } = $props();
	let user = $derived(data.user);
	let todoList = $derived(data.cloud_posts);
	let logging_out = $state(false);
	let logging_in = $state(false);
	let newItem = $state('');
	// let todoList = liveQuery(() =>
	// 		dbDexie.todos.toArray()
	// async () => {return await dbDexie.todos.where("deleted").equals('false').toArray()} // where({'deleted': 'false'})
	// );
	// let todoListNotDeleted = $state();
	// let todoListNotDeletedUncompletedCount = $state();
	// let todoListNotDeletedCount = $state();
	// todoList.subscribe((todos) => {
	let todoListNotDeleted = $derived(todoList?.filter(t => !t.deleted));
	let todoListNotDeletedUncompletedCount = $derived(todoList?.filter(t => !t.deleted).filter(t => !t.done).length);
	let todoListNotDeletedCount = $derived(todoList?.filter(t => !t.deleted).length);
	// });

	function handleKeydown(e) {
		if (newItem && e.key === 'Enter') {
			addToList();
		}
	}

	async function addToList() {
		let synced = false;
		if (user !== null) {
			synced = true;
		}
		const id = dbDexie.todos.add({
			text: newItem,
			done: false,
			deleted: false,
			synced: synced
		});

		newItem = '';
	}

	function deleteCompleted() {
		if (window.confirm('Do you really want to delete all completed TODOs?')) {
			todoListNotDeleted.forEach(todo => {
				if (todo.done) {
					dbDexie.todos.filter(t => t.id === todo.id).modify({ deleted: true });
				}
			});
		}
	}


	let todo_s_text = $derived('TODO' + (todoListNotDeletedCount > 1 ? 's' : ''));
	let count_status = $derived((
		(todoListNotDeletedCount > 0 ?
			(todoListNotDeletedUncompletedCount > 0 ?
				`${todoListNotDeletedUncompletedCount} out of ${todoListNotDeletedCount} ${todo_s_text} unfinished`
				: (todoListNotDeletedCount === 1 ? 'The only' : 'All') + ` ${todoListNotDeletedCount} ${todo_s_text} finished`) : '')

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
				// user = null;
			};
		}}>
				<button aria-label="Sign out">Sign out</button>
			</form>
			{#if logging_out}
				<span class="logging-in-out">logging you out...</span>
			{/if}
		{:else}
			<h2>My TODO List</h2>
			<nav data-sveltekit-reload>
				<form method="post" action="?/login" use:enhance={() => {
			logging_in = true;
			return async ({ update }) => {
				await update();
			};
		}}>
					<button aria-label="Sign in">Sign in</button>
				</form>
			</nav>
			{#if logging_in}
				<span class="logging-in-out">signing you in...</span>
			{/if}
		{/if}
	</div>

	<p>{count_status}</p>
	<form method="post" action="?/createpost" use:enhance>
		<label>
			<input bind:value={newItem} name="content" placeholder="new todo item.." type="text" required />
			<!-- on:keydown={handleKeydown} -->
		</label>
		<button aria-label="Add" disabled={!newItem}>Add</button>
		<!--		<button aria-label="Add" disabled={!newItem} onclick={addToList}>Add</button>-->
	</form>

	<br />
	<Todo todos={todoListNotDeleted} />
	<button aria-label="View deleted TODOs" onclick={() => location.href='/deleted'} type="button">View deleted</button>
	<button aria-label="Remove all completed TODOs"
					disabled={!(todoListNotDeletedCount-todoListNotDeletedUncompletedCount)}
					onclick={deleteCompleted}>Remove all completed
	</button>

	{#if user === null}
		<p>Note: Your TODOs are stored in your browser's local storage and will get <strong>lost</strong> when you clear
			browsing data.</p>
		<p><a href="/login/github">Sign in</a> to save data in the cloud and sync data between browsers / devices.</p>
	{/if}

</div>

