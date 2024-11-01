<script>
	import { onMount } from 'svelte';
	import { dbDexie } from '$lib/db-dexie.js';
	import { enhance } from '$app/forms';
	import Todo from '$lib/components/todo-list.svelte';
	import { derived } from 'svelte/store';
	// import { source } from 'sveltekit-sse';
	import { liveQuery } from 'dexie';
	import { gen_todo_id } from '$lib/utils.js';
	//
	// const connection = source('/custom-event', {
	// 	close({ connect }) {
	// 		console.log('reconnecting...');
	// 		connect();
	// 	}
	// });
	// const server_event_value = connection.select('message');
	// server_event_value.subscribe((value) => {
	// 	console.log('server_event_value:', value);
	// });
	// setTimeout(function run() {
	// 	connection.close();
	// }, 3000);

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let user = $derived(data.user);
	let todoList = $derived(data.cloud_posts);
	let logging_out = $state(false);
	let logging_in = $state(false);
	let newItem = $state('');

	let todoListNotDeleted = $derived(todoList?.filter(t => !t.deleted));
	let todoListNotDeletedUncompletedCount = $derived(todoList?.filter(t => !t.deleted).filter(t => !t.done).length);
	let todoListNotDeletedCount = $derived(todoList?.filter(t => !t.deleted).length);

	let todoListLocal = liveQuery(() =>
			dbDexie.todos.orderBy('id').desc().toArray()
		// async () => {return await dbDexie.todos.where("deleted").equals('false').toArray()} // where({'deleted': 'false'})
	);

	let todoListNotDeletedLocal = $state();
	let todoListNotDeletedUncompletedCountLocal = $state();
	let todoListNotDeletedCountLocal = $state();
	todoListLocal.subscribe((todos) => {
		todoListNotDeletedLocal = todos.filter(t => !t.deleted);
		todoListNotDeletedUncompletedCountLocal = todos.filter(t => !t.deleted).filter(t => !t.done).length;
		todoListNotDeletedCountLocal = todos.filter(t => !t.deleted).length;
	});

	function addToListhandleKeydown(e) {
		if (e.target.form.key === 'Enter') {
			if (user) {
				// e.target.form.requestSubmit();
			} else {
				if (newItem) {
					addToList(e.target.form);
				}
			}
		}
	}

	async function addToList(form) {
		if (user) {
			// form.requestSubmit();
		} else {
			const id = dbDexie.todos.add({
				id: gen_todo_id(),
				text: newItem,
				done: false,
				deleted: false,
				synced: false
			});
			newItem = '';
		}
	}

	function deleteCompleted(form) {
		if (user) {
			// form.requestSubmit();
		} else {
			if (window.confirm('Do you really want to delete all completed TODOs?')) {
				todoListNotDeletedLocal.forEach(todo => {
					if (todo.done) {
						dbDexie.todos.filter(t => t.id === todo.id).modify({ deleted: true });
					}
				});
			}
		}
	}

	let todo_s_text = $derived('TODO' + (todoListNotDeletedCount > 1 ? 's' : ''));
	let count_status = $derived((
		(todoListNotDeletedCount > 0 ?
			(todoListNotDeletedUncompletedCount > 0 ?
				`${todoListNotDeletedUncompletedCount} out of ${todoListNotDeletedCount} ${todo_s_text} unfinished`
				: (todoListNotDeletedCount === 1 ? 'The only' : 'All') + ` ${todoListNotDeletedCount} ${todo_s_text} finished`) : '')

	));
	let todo_s_text_local = $derived('TODO' + (todoListNotDeletedCountLocal > 1 ? 's' : ''));
	let count_status_local = $derived((
		(todoListNotDeletedCountLocal > 0 ?
			(todoListNotDeletedUncompletedCountLocal > 0 ?
				`${todoListNotDeletedUncompletedCountLocal} out of ${todoListNotDeletedCountLocal} ${todo_s_text_local} unfinished`
				: (todoListNotDeletedCountLocal === 1 ? 'The only' : 'All') + ` ${todoListNotDeletedCountLocal} ${todo_s_text_local} finished`) : '')

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
	<!--<p>{$server_event_value}</p>-->
	<div class="header-login">
		{#if user}
			<h2>{user.username}'s TODO List</h2>
			<!--			<form method="post" action="?/logout" use:enhance={() => {-->
			<!--			logging_out = true;-->
			<!--			return async ({ update }) => {-->
			<!--				await update();-->
			<!--				logging_out = false;-->
			<!--			};-->
			<!--		}}>-->
			<!--				<button aria-label="Sign out">Sign out</button>-->
			<!--			</form>-->
			<!--			{#if logging_out}-->
			<!--				<span class="logging-in-out">logging you out...</span>-->
			<!--			{/if}-->
		{:else}
			<h2>My TODO List</h2>
			<!--			<nav data-sveltekit-reload>-->
			<!--				<form method="post" action="?/login" use:enhance={() => {-->
			<!--			logging_in = true;-->
			<!--			return async ({ update }) => {-->
			<!--				await update();-->
			<!--			};-->
			<!--		}}>-->
			<!--					<button aria-label="Sign in">Sign in</button>-->
			<!--				</form>-->
			<!--			</nav>-->
			<!--			{#if logging_in}-->
			<!--				<span class="logging-in-out">signing you in...</span>-->
			<!--			{/if}-->
		{/if}

	</div>

	{#if user}
		<p>{count_status}</p>
	{:else}
		<p>{count_status_local}</p>
	{/if}

	<form method="post" action="?/createpost" use:enhance class="input-form">
		<input bind:value={newItem} name="content" placeholder="new todo item.." type="text" required
					 onkeydown={(e) => addToListhandleKeydown(e)} />
		<button aria-label="Add" disabled={!newItem} onclick={(e) => addToList(e.target.form)}>Add</button>
	</form>

	<br />
	{#if user}
		<Todo todoList={todoListNotDeleted} user={user} />
	{:else}
		<Todo todoList={todoListNotDeletedLocal} user={null} />
	{/if}
	<div class="footer-buttons">
		<button aria-label="View deleted TODOs" onclick={() => location.href='/deleted'} type="button">View deleted</button>
		<form method="post" action="?/deleteAllCompleted" use:enhance={({formData, cancel}) => {
		if (user) {
			if (!window.confirm('Do you really want to delete all completed TODOs?')) {
			cancel();
			}
			return async ({ update }) => {
				await update();
			};
		}
		}}>
			<button aria-label="Remove all completed TODOs"
							disabled={user?(!(todoListNotDeletedCount-todoListNotDeletedUncompletedCount)):(!(todoListNotDeletedCountLocal-todoListNotDeletedUncompletedCountLocal))}
							onclick={(e) => deleteCompleted(e.target.form)}
			>Remove all completed
			</button>
		</form>
	</div>

	{#if user}
		<p>Currently, to view changes to your TODOs on another browser/device, you have to refresh the webpage.</p>
		<p>In a future version, we plan to sync displayed todos automatically.</p>
	{:else}
		<p>⚠️ Your TODOs are stored in your <a
			href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API">browser</a>
			and will get <strong>lost</strong> when you clear browsing data.</p>
		<p><a href="/login/sso">Sign in</a> to store data in the cloud and get synced between browsers / devices.</p>
	{/if}

</div>


